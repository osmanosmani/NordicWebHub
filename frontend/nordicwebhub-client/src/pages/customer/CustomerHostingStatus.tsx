import { useEffect, useState } from 'react'
import { getMyHostingStatuses } from '../../api/websiteCheckApi'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorMessage } from '../../components/ui/ErrorMessage'
import { HostingStatusBadge } from '../../components/ui/HostingStatusBadge'
import { PageHeader } from '../../components/ui/PageHeader'
import type { HostingStatus } from '../../types/hostingStatus'
import { getErrorMessage } from '../../utils/getErrorMessage'

export function CustomerHostingStatus() {
  const [hostingStatuses, setHostingStatuses] = useState<HostingStatus[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let isMounted = true

    async function loadHostingStatuses() {
      setIsLoading(true)
      setError('')

      try {
        const statuses = await getMyHostingStatuses()

        if (isMounted) {
          setHostingStatuses(statuses)
        }
      } catch (loadError) {
        if (isMounted) {
          setError(
            getErrorMessage(
              loadError,
              'Could not load your hosting status. Please try again.',
            ),
          )
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadHostingStatuses()

    return () => {
      isMounted = false
    }
  }, [reloadKey])

  return (
    <section>
      <PageHeader
        description="View the latest availability check and HTTP response recorded for your company website."
        eyebrow="Customer"
        title="Hosting Status"
      />

      {error ? (
        <ErrorMessage
          action={
            <Button
              onClick={() => setReloadKey((current) => current + 1)}
              size="sm"
              variant="secondary"
            >
              Try again
            </Button>
          }
          className="mt-6"
          message={error}
        />
      ) : null}

      {isLoading ? (
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {Array.from({ length: 2 }, (_, index) => (
            <div
              className="h-72 animate-pulse rounded-lg border border-slate-200 bg-white"
              key={index}
            />
          ))}
        </div>
      ) : null}

      {!isLoading && !error && hostingStatuses.length === 0 ? (
        <Card className="mt-8">
          <EmptyState
            description="The latest website health result will appear here after an administrator runs a check."
            title="No hosting status recorded"
          />
        </Card>
      ) : null}

      {!isLoading && hostingStatuses.length > 0 ? (
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {hostingStatuses.map((status) => (
            <Card className="flex flex-col" key={status.id}>
              <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-blue-700">
                    {status.companyName}
                  </p>
                  <h2 className="mt-2 break-all text-lg font-semibold text-slate-950">
                    {status.domainName}
                  </h2>
                </div>
                <HostingStatusBadge
                  isOnline={status.isOnline}
                  statusCode={status.statusCode}
                />
              </div>

              <dl className="grid flex-1 gap-5 p-5 sm:grid-cols-2">
                <StatusDetail
                  label="HTTP status"
                  value={formatStatusCode(status.statusCode)}
                />
                <StatusDetail
                  label="Last checked"
                  value={formatDateTime(status.lastCheckedAt)}
                />
                <StatusDetail
                  className="sm:col-span-2"
                  label="Notes"
                  value={status.notes || 'No notes recorded.'}
                />
              </dl>
            </Card>
          ))}
        </div>
      ) : null}
    </section>
  )
}

function StatusDetail({
  className,
  label,
  value,
}: {
  className?: string
  label: string
  value: string
}) {
  return (
    <div className={className}>
      <dt className="text-xs font-semibold text-slate-500">{label}</dt>
      <dd className="mt-2 break-words text-sm leading-6 text-slate-700">
        {value}
      </dd>
    </div>
  )
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
