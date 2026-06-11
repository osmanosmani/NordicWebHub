import { useCallback, useEffect, useState } from 'react'
import {
  getHostingStatuses,
  runWebsiteCheck,
} from '../../api/websiteCheckApi'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { HostingStatusBadge } from '../../components/ui/HostingStatusBadge'
import { PageHeader } from '../../components/ui/PageHeader'
import type {
  HostingStatus,
  WebsiteCheckSummary,
} from '../../types/hostingStatus'
import { getErrorMessage } from '../../utils/getErrorMessage'

export function AdminWebsiteCheck() {
  const [hostingStatuses, setHostingStatuses] = useState<HostingStatus[]>([])
  const [summary, setSummary] = useState<WebsiteCheckSummary>({
    checkedCount: 0,
    onlineCount: 0,
    failedCount: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isRunning, setIsRunning] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const loadHostingStatuses = useCallback(async () => {
    const statuses = await getHostingStatuses()
    setHostingStatuses(statuses)
    setSummary(createSummary(statuses))
  }, [])

  useEffect(() => {
    let isMounted = true

    async function loadPage() {
      setIsLoading(true)
      setError('')

      try {
        const statuses = await getHostingStatuses()

        if (isMounted) {
          setHostingStatuses(statuses)
          setSummary(createSummary(statuses))
        }
      } catch (loadError) {
        if (isMounted) {
          setError(
            getErrorMessage(
              loadError,
              'Could not load hosting statuses. Please try again.',
            ),
          )
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadPage()

    return () => {
      isMounted = false
    }
  }, [])

  async function handleRunWebsiteCheck() {
    setIsRunning(true)
    setError('')
    setSuccessMessage('')

    try {
      const result = await runWebsiteCheck()
      await loadHostingStatuses()
      setSummary(result)
      setSuccessMessage(
        `Website check completed for ${result.checkedCount} ${
          result.checkedCount === 1 ? 'website' : 'websites'
        }.`,
      )
    } catch (runError) {
      setError(
        getErrorMessage(
          runError,
          'Could not run the website check. Please try again.',
        ),
      )
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <section>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <PageHeader
          description="Run a manual availability check for every company website and review the latest response details."
          eyebrow="Admin"
          title="Website Health Check"
        />
        <Button
          className="shrink-0"
          disabled={isLoading || isRunning}
          onClick={() => void handleRunWebsiteCheck()}
        >
          {isRunning ? 'Running checks' : 'Run Website Check'}
        </Button>
      </div>

      {error ? (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {successMessage ? (
        <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          {successMessage}
        </div>
      ) : null}

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <SummaryCard
          label="Websites checked"
          loading={isLoading}
          value={summary.checkedCount}
        />
        <SummaryCard
          accent="emerald"
          label="Online"
          loading={isLoading}
          value={summary.onlineCount}
        />
        <SummaryCard
          accent="red"
          label="Failed"
          loading={isLoading}
          value={summary.failedCount}
        />
      </div>

      <Card
        className="mt-6"
        description="The most recent result recorded for each company website."
        title="Hosting statuses"
      >
        {isLoading ? (
          <div className="p-5">
            <div className="h-32 animate-pulse rounded-lg bg-slate-100" />
          </div>
        ) : null}

        {!isLoading && hostingStatuses.length === 0 ? (
          <p className="p-5 text-sm text-slate-600">
            No hosting statuses are available. Run the first website check to
            create them.
          </p>
        ) : null}

        {!isLoading && hostingStatuses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3">Company</th>
                  <th className="px-5 py-3">Domain</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">HTTP</th>
                  <th className="px-5 py-3">Last checked</th>
                  <th className="px-5 py-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {hostingStatuses.map((status) => (
                  <tr key={status.id}>
                    <td className="whitespace-nowrap px-5 py-4 font-medium text-slate-950">
                      {status.companyName}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                      {status.domainName}
                    </td>
                    <td className="px-5 py-4">
                      <HostingStatusBadge
                        isOnline={status.isOnline}
                        statusCode={status.statusCode}
                      />
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                      {formatStatusCode(status.statusCode)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                      {formatDateTime(status.lastCheckedAt)}
                    </td>
                    <td className="min-w-64 px-5 py-4 leading-6 text-slate-600">
                      {status.notes || 'No notes recorded.'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </Card>
    </section>
  )
}

function SummaryCard({
  accent = 'slate',
  label,
  loading,
  value,
}: {
  accent?: 'emerald' | 'red' | 'slate'
  label: string
  loading: boolean
  value: number
}) {
  const valueClass = {
    emerald: 'text-emerald-700',
    red: 'text-red-700',
    slate: 'text-slate-950',
  }[accent]

  return (
    <Card className="p-5">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      {loading ? (
        <div className="mt-3 h-9 w-16 animate-pulse rounded bg-slate-100" />
      ) : (
        <p className={`mt-2 text-3xl font-semibold ${valueClass}`}>{value}</p>
      )}
    </Card>
  )
}

function createSummary(statuses: HostingStatus[]): WebsiteCheckSummary {
  return {
    checkedCount: statuses.length,
    onlineCount: statuses.filter((status) => status.isOnline).length,
    failedCount: statuses.filter((status) => !status.isOnline).length,
  }
}

function formatStatusCode(statusCode: number) {
  return statusCode > 0 ? String(statusCode) : 'No response'
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('sv-SE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}
