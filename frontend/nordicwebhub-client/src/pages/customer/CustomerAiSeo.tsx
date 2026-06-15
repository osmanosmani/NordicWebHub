import {
  useEffect,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react'
import {
  generateAiSeoResult,
  getMyAiSeoResults,
} from '../../api/aiSeoApi'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorMessage } from '../../components/ui/ErrorMessage'
import { PageHeader } from '../../components/ui/PageHeader'
import { TextInput } from '../../components/ui/TextInput'
import type {
  AiSeoRequestResult,
  AiSeoResult,
} from '../../types/aiSeo'
import { getErrorMessage } from '../../utils/getErrorMessage'

type AiSeoForm = {
  industry: string
  city: string
}

const emptyForm: AiSeoForm = {
  industry: '',
  city: '',
}

export function CustomerAiSeo() {
  const [form, setForm] = useState<AiSeoForm>(emptyForm)
  const [generatedResult, setGeneratedResult] = useState<AiSeoResult | null>(
    null,
  )
  const [previousResults, setPreviousResults] = useState<AiSeoRequestResult[]>(
    [],
  )
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [historyError, setHistoryError] = useState('')
  const [generateError, setGenerateError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let isMounted = true

    async function loadPreviousResults() {
      setIsLoadingHistory(true)
      setHistoryError('')

      try {
        const results = await getMyAiSeoResults()

        if (isMounted) {
          setPreviousResults(results)
        }
      } catch (loadError) {
        if (isMounted) {
          setHistoryError(
            getErrorMessage(
              loadError,
              'Could not load previous AI SEO results. Please try again.',
            ),
          )
        }
      } finally {
        if (isMounted) {
          setIsLoadingHistory(false)
        }
      }
    }

    void loadPreviousResults()

    return () => {
      isMounted = false
    }
  }, [reloadKey])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const industry = form.industry.trim()
    const city = form.city.trim()

    if (!industry || !city) {
      setGenerateError('Please enter both an industry and a city.')
      return
    }

    setIsGenerating(true)
    setGenerateError('')
    setGeneratedResult(null)

    try {
      const result = await generateAiSeoResult({ industry, city })
      setGeneratedResult(result)

      try {
        const refreshedResults = await getMyAiSeoResults()
        setPreviousResults(refreshedResults)
      } catch (refreshError) {
        setHistoryError(
          getErrorMessage(
            refreshError,
            'The plan was generated, but previous results could not be refreshed.',
          ),
        )
      }
    } catch (generationError) {
      setGenerateError(
        getErrorMessage(
          generationError,
          'Could not generate the AI SEO plan. Please try again.',
        ),
      )
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <section>
      <PageHeader
        description="Generate a Swedish local SEO plan with keywords, content ideas, metadata, and practical recommendations."
        eyebrow="Customer"
        title="AI SEO Assistant"
      />

      <div className="mt-8 grid gap-6 xl:grid-cols-[360px_1fr]">
        <form
          className="form-panel"
          onSubmit={handleSubmit}
        >
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-slate-950">
              Generate local SEO plan
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Enter the service industry and target Swedish city.
            </p>
          </div>

          <div className="form-stack">
            <TextInput
              autoComplete="organization-title"
              id="industry"
              label="Industry"
              maxLength={100}
              onChange={(event) =>
                setForm({ ...form, industry: event.target.value })
              }
              placeholder="e.g. Construction"
              required
              value={form.industry}
            />
            <TextInput
              autoComplete="address-level2"
              id="city"
              label="City"
              maxLength={100}
              onChange={(event) =>
                setForm({ ...form, city: event.target.value })
              }
              placeholder="e.g. Stockholm"
              required
              value={form.city}
            />
          </div>

          {generateError ? (
            <ErrorMessage className="mt-5" message={generateError} />
          ) : null}

          <Button
            className="mt-6 w-full"
            isLoading={isGenerating}
            loadingLabel="Generating SEO plan"
            type="submit"
          >
            Generate SEO plan
          </Button>
        </form>

        <div className="min-w-0">
          {isGenerating ? (
            <Card className="p-5">
              <p className="text-sm font-semibold text-slate-950">
                Generating your SEO plan
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                This can take a few moments.
              </p>
              <div className="mt-5 grid gap-3">
                <div className="h-16 animate-pulse rounded-lg bg-slate-100" />
                <div className="h-28 animate-pulse rounded-lg bg-slate-100" />
                <div className="h-20 animate-pulse rounded-lg bg-slate-100" />
              </div>
            </Card>
          ) : null}

          {!isGenerating && generatedResult ? (
            <AiSeoResultView result={generatedResult} title="Generated plan" />
          ) : null}

          {!isGenerating && !generatedResult ? (
            <Card className="p-6">
              <p className="text-sm font-semibold text-slate-950">
                Your generated plan will appear here
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Use a specific service category and local market for more
                focused suggestions.
              </p>
            </Card>
          ) : null}
        </div>
      </div>

      <div className="mt-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">
              Previous results
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Saved SEO plans for your company, newest first.
            </p>
          </div>
          {historyError ? (
            <Button
              className="h-9 shrink-0 px-3"
              onClick={() => setReloadKey((current) => current + 1)}
              variant="secondary"
            >
              Try again
            </Button>
          ) : null}
        </div>

        {historyError ? (
          <ErrorMessage className="mt-5" message={historyError} />
        ) : null}

        {isLoadingHistory ? (
          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            {Array.from({ length: 2 }, (_, index) => (
              <div
                className="h-96 animate-pulse rounded-lg border border-slate-200 bg-white"
                key={index}
              />
            ))}
          </div>
        ) : null}

        {!isLoadingHistory &&
        !historyError &&
        previousResults.length === 0 ? (
          <Card className="mt-5">
            <EmptyState
              compact
              description="Generate your first local SEO plan using the form above."
              title="No AI SEO plans yet"
            />
          </Card>
        ) : null}

        {!isLoadingHistory && previousResults.length > 0 ? (
          <div className="mt-5 grid gap-5 xl:grid-cols-2">
            {previousResults.map((request) => (
              <AiSeoResultView
                context={`${request.industry} · ${request.city}`}
                key={request.id}
                result={request.result}
                subtitle={`${request.companyName} · ${formatDate(
                  request.createdAt,
                )}`}
                title="Local SEO plan"
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}

function AiSeoResultView({
  context,
  result,
  subtitle,
  title,
}: {
  context?: string
  result: AiSeoResult
  subtitle?: string
  title: string
}) {
  return (
    <Card className="h-fit">
      <div className="border-b border-slate-200 px-5 py-4">
        {context ? (
          <p className="text-xs font-semibold text-blue-700">
            {context}
          </p>
        ) : null}
        <h3 className={context ? 'mt-2 text-lg font-semibold text-slate-950' : 'text-lg font-semibold text-slate-950'}>
          {title}
        </h3>
        {subtitle ? (
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        ) : null}
      </div>

      <div className="grid gap-5 p-5">
        <ResultSection title="Local keywords">
          <div className="flex flex-wrap gap-2">
            {result.localKeywords.map((keyword, index) => (
              <span
                className="rounded-lg bg-blue-50 px-2.5 py-1.5 text-sm font-medium text-blue-700"
                key={`${index}-${keyword}`}
              >
                {keyword}
              </span>
            ))}
          </div>
        </ResultSection>

        <ResultSection title="Blog post ideas">
          <div className="grid gap-3">
            {result.blogPostIdeas.map((idea, index) => (
              <article
                className="rounded-lg border border-slate-200 bg-slate-50 p-3"
                key={`${index}-${idea.title}`}
              >
                <h4 className="text-sm font-semibold text-slate-950">
                  {idea.title}
                </h4>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {idea.focus}
                </p>
              </article>
            ))}
          </div>
        </ResultSection>

        <div className="grid gap-4 md:grid-cols-2">
          <ResultSection title="Meta title">
            <p className="text-sm leading-6 text-slate-700">
              {result.metaTitle}
            </p>
          </ResultSection>
          <ResultSection title="Meta description">
            <p className="text-sm leading-6 text-slate-700">
              {result.metaDescription}
            </p>
          </ResultSection>
        </div>

        <ResultSection title="Recommendations">
          <ol className="grid gap-2">
            {result.recommendations.map((recommendation, index) => (
              <li
                className="flex gap-3 text-sm leading-6 text-slate-700"
                key={`${index}-${recommendation}`}
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xs font-semibold text-emerald-700">
                  {index + 1}
                </span>
                <span>{recommendation}</span>
              </li>
            ))}
          </ol>
        </ResultSection>
      </div>
    </Card>
  )
}

function ResultSection({
  children,
  title,
}: {
  children: ReactNode
  title: string
}) {
  return (
    <section>
      <h4 className="text-xs font-semibold text-slate-500">
        {title}
      </h4>
      <div className="mt-2">{children}</div>
    </section>
  )
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('sv-SE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}
