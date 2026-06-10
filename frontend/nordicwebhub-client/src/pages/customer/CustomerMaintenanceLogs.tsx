import { useEffect, useState } from 'react'
import { getMyMaintenanceLogs } from '../../api/maintenanceLogsApi'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { PageHeader } from '../../components/ui/PageHeader'
import type { MaintenanceLog } from '../../types/maintenanceLog'
import { getErrorMessage } from '../../utils/getErrorMessage'

export function CustomerMaintenanceLogs() {
  const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let isMounted = true

    async function loadMaintenanceLogs() {
      setIsLoading(true)
      setError('')

      try {
        const loadedLogs = await getMyMaintenanceLogs()

        if (isMounted) {
          setMaintenanceLogs(loadedLogs)
        }
      } catch (loadError) {
        if (isMounted) {
          setError(
            getErrorMessage(
              loadError,
              'Could not load maintenance logs. Please try again.',
            ),
          )
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadMaintenanceLogs()

    return () => {
      isMounted = false
    }
  }, [reloadKey])

  return (
    <section>
      <PageHeader
        description="Review updates, fixes, backups, and other technical work completed for your company."
        eyebrow="Customer"
        title="Maintenance Logs"
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
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 2 }, (_, index) => (
            <div
              className="h-80 animate-pulse rounded-lg border border-slate-200 bg-white"
              key={index}
            />
          ))}
        </div>
      ) : null}

      {!isLoading && !error && maintenanceLogs.length === 0 ? (
        <Card className="mt-8 p-6">
          <p className="text-sm text-slate-600">
            No maintenance work has been documented for your company yet.
          </p>
        </Card>
      ) : null}

      {!isLoading && maintenanceLogs.length > 0 ? (
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {maintenanceLogs.map((log) => (
            <Card className="flex flex-col" key={log.id}>
              <div className="border-b border-slate-200 px-5 py-4">
                <p className="text-xs font-semibold uppercase text-emerald-700">
                  {log.companyName}
                </p>
                <h2 className="mt-2 text-lg font-semibold text-slate-950">
                  {log.title}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {formatDate(log.createdAt)}
                </p>
              </div>

              <dl className="grid flex-1 gap-5 p-5">
                <LogSection label="Description" value={log.description} />
                <LogSection label="Action taken" value={log.actionTaken} />
                <LogSection label="Result" value={log.result} result />
              </dl>
            </Card>
          ))}
        </div>
      ) : null}
    </section>
  )
}

function LogSection({
  label,
  result = false,
  value,
}: {
  label: string
  result?: boolean
  value: string
}) {
  return (
    <div
      className={
        result
          ? 'rounded-lg border border-emerald-100 bg-emerald-50 p-4'
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
