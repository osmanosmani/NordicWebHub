import { useEffect, useState } from 'react'
import { getMySeoReports } from '../../api/seoReportsApi'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { PageHeader } from '../../components/ui/PageHeader'
import { SeoScore } from '../../components/ui/SeoScore'
import type { SeoReport } from '../../types/seoReport'
import { getErrorMessage } from '../../utils/getErrorMessage'

export function CustomerSeoReports() {
  const [seoReports, setSeoReports] = useState<SeoReport[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let isMounted = true

    async function loadSeoReports() {
      setIsLoading(true)
      setError('')

      try {
        const loadedReports = await getMySeoReports()

        if (isMounted) {
          setSeoReports(loadedReports)
        }
      } catch (loadError) {
        if (isMounted) {
          setError(
            getErrorMessage(
              loadError,
              'Could not load SEO reports. Please try again.',
            ),
          )
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadSeoReports()

    return () => {
      isMounted = false
    }
  }, [reloadKey])

  return (
    <section>
      <PageHeader
        description="Track your website's SEO health, keyword opportunities, technical findings, and recommended next steps."
        eyebrow="Customer"
        title="SEO Reports"
      />

      {error ? (
        <div className="mt-6 flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between">
          <span>{error}</span>
          <Button
            className="h-9 shrink-0 px-3"
            onClick={() => setReloadKey((current) => current + 1)}
            variant="secondary"
          >
            Try again
          </Button>
        </div>
      ) : null}

      {isLoading ? (
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {Array.from({ length: 2 }, (_, index) => (
            <div
              className="h-96 animate-pulse rounded-lg border border-slate-200 bg-white"
              key={index}
            />
          ))}
        </div>
      ) : null}

      {!isLoading && !error && seoReports.length === 0 ? (
        <Card className="mt-8 p-6">
          <p className="text-sm text-slate-600">
            No SEO reports have been published for your company yet.
          </p>
        </Card>
      ) : null}

      {!isLoading && seoReports.length > 0 ? (
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {seoReports.map((report) => (
            <Card className="flex flex-col" key={report.id}>
              <div className="border-b border-slate-200 px-5 py-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase text-emerald-700">
                      {report.companyName}
                    </p>
                    <h2 className="mt-2 text-lg font-semibold text-slate-950">
                      SEO performance report
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {formatDate(report.createdAt)}
                    </p>
                  </div>
                  <SeoScore compact score={report.seoScore} />
                </div>
              </div>

              <dl className="grid flex-1 gap-5 p-5">
                <ReportSection
                  label="Top keywords"
                  value={report.topKeywords}
                />
                <ReportSection
                  label="Technical issues"
                  value={report.technicalIssues}
                  warning
                />
                <ReportSection
                  label="Recommendations"
                  positive
                  value={report.recommendations}
                />
              </dl>
            </Card>
          ))}
        </div>
      ) : null}
    </section>
  )
}

function ReportSection({
  label,
  positive = false,
  value,
  warning = false,
}: {
  label: string
  positive?: boolean
  value: string
  warning?: boolean
}) {
  return (
    <div
      className={
        positive
          ? 'rounded-lg border border-emerald-100 bg-emerald-50 p-4'
          : warning
            ? 'rounded-lg border border-amber-100 bg-amber-50 p-4'
            : undefined
      }
    >
      <dt className="text-xs font-semibold uppercase text-slate-500">{label}</dt>
      <dd className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
        {value}
      </dd>
    </div>
  )
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('sv-SE', {
    dateStyle: 'medium',
  }).format(new Date(value))
}
