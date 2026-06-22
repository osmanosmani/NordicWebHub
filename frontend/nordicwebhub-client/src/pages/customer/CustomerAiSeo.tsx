import {
  ArrowRight,
  BrainCircuit,
  Building2,
  Check,
  Layers3,
  Search,
} from 'lucide-react'
import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import {
  generateAiServiceRecommendation,
  getMyAiServiceRecommendations,
} from '../../api/aiSeoApi'
import { Alert } from '../../components/ui/Alert'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorMessage } from '../../components/ui/ErrorMessage'
import { Input } from '../../components/ui/Input'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { PageHeader } from '../../components/ui/PageHeader'
import { Select } from '../../components/ui/Select'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { TextArea } from '../../components/ui/TextArea'
import type {
  AiServiceRecommendationInput,
  AiServiceRecommendationRequestResult,
  AiServiceRecommendationResult,
} from '../../types/aiSeo'
import { getErrorMessage } from '../../utils/getErrorMessage'

const serviceOptions = [
  'Website',
  'Website redesign',
  'E-commerce',
  'Local SEO',
  'Content',
  'Hosting',
  'Maintenance',
  'Support',
]

const emptyForm: AiServiceRecommendationInput = {
  businessName: '',
  industry: '',
  city: '',
  currentWebsiteUrl: '',
  businessGoal: '',
  targetCustomers: '',
  neededServices: [],
  budgetRange: '',
  preferredTimeline: '',
  notes: '',
}

export function CustomerAiSeo() {
  const [form, setForm] =
    useState<AiServiceRecommendationInput>(emptyForm)
  const [generatedRequest, setGeneratedRequest] =
    useState<AiServiceRecommendationRequestResult | null>(null)
  const [previousRequests, setPreviousRequests] = useState<
    AiServiceRecommendationRequestResult[]
  >([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [historyError, setHistoryError] = useState('')
  const [generateError, setGenerateError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let isMounted = true

    async function loadPreviousRequests() {
      setIsLoadingHistory(true)
      setHistoryError('')

      try {
        const requests = await getMyAiServiceRecommendations()

        if (isMounted) {
          setPreviousRequests(requests)
        }
      } catch (loadError) {
        if (isMounted) {
          setHistoryError(
            getErrorMessage(
              loadError,
              'Could not load previous recommendations. Please try again.',
            ),
          )
        }
      } finally {
        if (isMounted) {
          setIsLoadingHistory(false)
        }
      }
    }

    void loadPreviousRequests()

    return () => {
      isMounted = false
    }
  }, [reloadKey])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (form.neededServices.length === 0) {
      setGenerateError('Select at least one service you may need.')
      return
    }

    setIsGenerating(true)
    setGenerateError('')
    setGeneratedRequest(null)

    try {
      const request = await generateAiServiceRecommendation({
        ...form,
        businessName: form.businessName.trim(),
        industry: form.industry.trim(),
        city: form.city.trim(),
        currentWebsiteUrl: form.currentWebsiteUrl?.trim() || undefined,
        businessGoal: form.businessGoal.trim(),
        targetCustomers: form.targetCustomers.trim(),
        notes: form.notes?.trim() || undefined,
      })

      setGeneratedRequest(request)
      setPreviousRequests((current) => [
        request,
        ...current.filter((item) => item.id !== request.id),
      ])
    } catch (generationError) {
      setGenerateError(
        getErrorMessage(
          generationError,
          'Could not generate the service recommendation. Please try again.',
        ),
      )
    } finally {
      setIsGenerating(false)
    }
  }

  function toggleService(service: string) {
    setForm((current) => ({
      ...current,
      neededServices: current.neededServices.includes(service)
        ? current.neededServices.filter((item) => item !== service)
        : [...current.neededServices, service],
    }))
  }

  return (
    <section>
      <PageHeader
        description="Describe your business needs and receive a structured starting point for the right NordicWebHub package, website scope, and next steps."
        eyebrow="Customer"
        title="AI Service Assistant"
      />

      <Alert className="mt-6" title="Safe demo guidance" tone="info">
        This assistant uses transparent rule-based logic, not an external AI
        service. The result is a planning recommendation and should be
        confirmed with the NordicWebHub team.
      </Alert>

      <div className="mt-8 grid items-start gap-6 xl:grid-cols-[minmax(0,480px)_minmax(0,1fr)]">
        <Card
          description="Tell us what you want to improve. Company ownership is taken from your logged-in account."
          title="Business and service needs"
        >
          <form className="grid gap-5 p-5 sm:p-6" onSubmit={handleSubmit}>
            <div className="grid gap-5 sm:grid-cols-2">
              <Input
                autoComplete="organization"
                id="business-name"
                label="Business name"
                maxLength={150}
                onChange={(event) =>
                  setForm({ ...form, businessName: event.target.value })
                }
                placeholder="e.g. Nordic Build AB"
                required
                value={form.businessName}
              />
              <Input
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
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Input
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
              <Input
                autoComplete="url"
                hint="Leave empty if you do not have a website."
                id="current-website"
                label="Current website URL"
                maxLength={250}
                onChange={(event) =>
                  setForm({
                    ...form,
                    currentWebsiteUrl: event.target.value,
                  })
                }
                placeholder="https://example.se"
                type="url"
                value={form.currentWebsiteUrl}
              />
            </div>

            <TextArea
              id="business-goal"
              label="Main business goal"
              maxLength={500}
              onChange={(event) =>
                setForm({ ...form, businessGoal: event.target.value })
              }
              placeholder="e.g. Generate more qualified local leads and explain our services more clearly."
              required
              rows={3}
              value={form.businessGoal}
            />

            <TextArea
              id="target-customers"
              label="Target customers"
              maxLength={500}
              onChange={(event) =>
                setForm({ ...form, targetCustomers: event.target.value })
              }
              placeholder="e.g. Property owners, organizations, and growing companies in the Stockholm region."
              required
              rows={3}
              value={form.targetCustomers}
            />

            <fieldset>
              <legend className="text-sm font-semibold leading-5 text-slate-700">
                Needed services
                <span aria-hidden="true" className="ml-1 text-red-600">
                  *
                </span>
              </legend>
              <p className="mt-1 text-sm leading-5 text-slate-500">
                Select every area that may be relevant.
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {serviceOptions.map((service) => {
                  const isSelected = form.neededServices.includes(service)

                  return (
                    <label
                      className={
                        isSelected
                          ? 'flex cursor-pointer items-center gap-3 rounded-lg border border-blue-300 bg-blue-50 px-3 py-2.5 text-sm font-medium text-blue-900'
                          : 'flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50'
                      }
                      key={service}
                    >
                      <input
                        checked={isSelected}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-200"
                        onChange={() => toggleService(service)}
                        type="checkbox"
                      />
                      <span>{service}</span>
                    </label>
                  )
                })}
              </div>
            </fieldset>

            <div className="grid gap-5 sm:grid-cols-2">
              <Select
                id="budget-range"
                label="Budget range"
                onChange={(event) =>
                  setForm({ ...form, budgetRange: event.target.value })
                }
                required
                value={form.budgetRange}
              >
                <option value="">Select budget</option>
                <option value="Under 15,000 SEK">Under 15,000 SEK</option>
                <option value="15,000-30,000 SEK">15,000-30,000 SEK</option>
                <option value="30,000-50,000 SEK">30,000-50,000 SEK</option>
                <option value="50,000-100,000 SEK">
                  50,000-100,000 SEK
                </option>
                <option value="Over 100,000 SEK">Over 100,000 SEK</option>
              </Select>
              <Select
                id="preferred-timeline"
                label="Preferred timeline"
                onChange={(event) =>
                  setForm({
                    ...form,
                    preferredTimeline: event.target.value,
                  })
                }
                required
                value={form.preferredTimeline}
              >
                <option value="">Select timeline</option>
                <option value="As soon as possible">As soon as possible</option>
                <option value="Within 1 month">Within 1 month</option>
                <option value="Within 1-3 months">Within 1-3 months</option>
                <option value="Within 3-6 months">Within 3-6 months</option>
                <option value="Exploring options">Exploring options</option>
              </Select>
            </div>

            <TextArea
              hint="Optional context, constraints, or features."
              id="notes"
              label="Additional notes"
              maxLength={1000}
              onChange={(event) =>
                setForm({ ...form, notes: event.target.value })
              }
              placeholder="e.g. We need Swedish and English content and want to keep our current visual identity."
              rows={3}
              value={form.notes}
            />

            {generateError ? <ErrorMessage message={generateError} /> : null}

            <Button
              className="w-full sm:w-fit"
              isLoading={isGenerating}
              leadingIcon={<BrainCircuit className="h-4 w-4" />}
              loadingLabel="Generating recommendation"
              type="submit"
            >
              Generate recommendation
            </Button>
          </form>
        </Card>

        <div className="min-w-0">
          {isGenerating ? (
            <Card className="p-8">
              <div className="flex items-center gap-3">
                <LoadingSpinner className="text-blue-600" size="lg" />
                <div>
                  <p className="font-semibold text-slate-950">
                    Building your recommendation
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Matching your goals, services, budget, and timeline.
                  </p>
                </div>
              </div>
            </Card>
          ) : null}

          {!isGenerating && generatedRequest ? (
            <RecommendationView
              result={generatedRequest.result}
              title="Your service recommendation"
            />
          ) : null}

          {!isGenerating && !generatedRequest ? (
            <Card>
              <EmptyState
                description="Complete the form to see a recommended package, service scope, website structure, SEO keywords, priority, and practical next steps."
                icon={<BrainCircuit />}
                title="Your recommendation will appear here"
              />
            </Card>
          ) : null}
        </div>
      </div>

      <section className="mt-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">
              Previous recommendations
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Saved planning results for your company, newest first.
            </p>
          </div>
          {historyError ? (
            <Button
              onClick={() => setReloadKey((current) => current + 1)}
              size="sm"
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
          <div className="mt-5 flex min-h-40 items-center justify-center rounded-lg border border-slate-200 bg-white">
            <LoadingSpinner
              className="text-blue-600"
              label="Loading previous recommendations"
              size="lg"
            />
          </div>
        ) : null}

        {!isLoadingHistory &&
        !historyError &&
        previousRequests.length === 0 ? (
          <Card className="mt-5">
            <EmptyState
              compact
              description="Generate your first recommendation using the form above."
              icon={<Layers3 />}
              title="No saved recommendations yet"
            />
          </Card>
        ) : null}

        {!isLoadingHistory && previousRequests.length > 0 ? (
          <div className="mt-5 grid gap-5 xl:grid-cols-2">
            {previousRequests.map((request) => (
              <RecommendationView
                context={`${request.input.businessName} · ${request.input.industry} · ${request.input.city}`}
                key={request.id}
                result={request.result}
                subtitle={`${request.companyName} · ${formatDate(
                  request.createdAt,
                )}`}
                title={request.result.recommendedPackageName}
              />
            ))}
          </div>
        ) : null}
      </section>
    </section>
  )
}

function RecommendationView({
  context,
  result,
  subtitle,
  title,
}: {
  context?: string
  result: AiServiceRecommendationResult
  subtitle?: string
  title: string
}) {
  return (
    <Card className="h-fit" accent="blue">
      <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
        {context ? (
          <p className="text-xs font-semibold text-blue-700">{context}</p>
        ) : null}
        <div className="mt-1 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">
              Recommended package
            </p>
            <h3 className="mt-1 text-xl font-semibold text-slate-950">
              {title}
            </h3>
            {subtitle ? (
              <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
            ) : null}
          </div>
          <StatusBadge
            label={`${result.estimatedPriority} priority`}
            showDot
            tone={getPriorityTone(result.estimatedPriority)}
          />
        </div>
      </div>

      <div className="grid gap-6 p-5 sm:p-6">
        <p className="text-sm leading-7 text-slate-700">
          {result.explanation}
        </p>

        <ResultSection icon={<Check />} title="Recommended services">
          <div className="flex flex-wrap gap-2">
            {result.recommendedServices.map((service) => (
              <span
                className="rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-sm font-medium text-blue-800"
                key={service}
              >
                {service}
              </span>
            ))}
          </div>
        </ResultSection>

        <div className="grid gap-6 lg:grid-cols-2">
          <ResultSection icon={<Building2 />} title="Website structure">
            <NumberedList items={result.suggestedWebsiteStructure} />
          </ResultSection>
          <ResultSection icon={<Search />} title="SEO keyword ideas">
            <ul className="grid gap-2">
              {result.suggestedSeoKeywords.map((keyword) => (
                <li
                  className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700"
                  key={keyword}
                >
                  {keyword}
                </li>
              ))}
            </ul>
          </ResultSection>
        </div>

        <ResultSection icon={<ArrowRight />} title="Next steps">
          <NumberedList items={result.nextSteps} />
        </ResultSection>
      </div>
    </Card>
  )
}

function ResultSection({
  children,
  icon,
  title,
}: {
  children: ReactNode
  icon: ReactNode
  title: string
}) {
  return (
    <section>
      <div className="flex items-center gap-2 text-slate-950">
        <span className="text-blue-600 [&>svg]:h-4 [&>svg]:w-4">{icon}</span>
        <h4 className="text-sm font-semibold">{title}</h4>
      </div>
      <div className="mt-3">{children}</div>
    </section>
  )
}

function NumberedList({ items }: { items: string[] }) {
  return (
    <ol className="grid gap-2.5">
      {items.map((item, index) => (
        <li className="flex gap-3 text-sm leading-6 text-slate-700" key={item}>
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
            {index + 1}
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ol>
  )
}

function getPriorityTone(priority: string) {
  if (priority === 'High') {
    return 'red' as const
  }

  if (priority === 'Medium') {
    return 'amber' as const
  }

  return 'emerald' as const
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('sv-SE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}
