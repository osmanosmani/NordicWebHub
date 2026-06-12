import { useEffect, useState } from 'react'
import {
  getProjectRequests,
  updateProjectRequestStatus,
} from '../../api/projectRequestsApi'
import { Alert } from '../../components/ui/Alert'
import { Card } from '../../components/ui/Card'
import { DataTable } from '../../components/ui/DataTable'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorMessage } from '../../components/ui/ErrorMessage'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { PageHeader } from '../../components/ui/PageHeader'
import { Select } from '../../components/ui/Select'
import { StatusBadge } from '../../components/ui/StatusBadge'
import type {
  ProjectRequest,
  ProjectRequestStatus,
} from '../../types/projectRequest'
import { getErrorMessage } from '../../utils/getErrorMessage'

const statuses: ProjectRequestStatus[] = ['New', 'Reviewed', 'Approved', 'Rejected']

export function AdminRequests() {
  const [requests, setRequests] = useState<ProjectRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [updatingRequestId, setUpdatingRequestId] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadRequests() {
      setIsLoading(true)
      setError('')

      try {
        const loadedRequests = await getProjectRequests()

        if (isMounted) {
          setRequests(loadedRequests)
        }
      } catch (loadError) {
        if (isMounted) {
          setError(
            getErrorMessage(
              loadError,
              'Could not load project requests. Please try again.',
            ),
          )
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadRequests()

    return () => {
      isMounted = false
    }
  }, [])

  async function handleStatusChange(
    request: ProjectRequest,
    status: ProjectRequestStatus,
  ) {
    if (request.status === status) {
      return
    }

    setUpdatingRequestId(request.id)
    setError('')
    setSuccessMessage('')

    try {
      const updatedRequest = await updateProjectRequestStatus(request.id, {
        status,
      })

      setRequests((currentRequests) =>
        currentRequests.map((currentRequest) =>
          currentRequest.id === updatedRequest.id ? updatedRequest : currentRequest,
        ),
      )
      setSuccessMessage('Project request status updated.')
    } catch (updateError) {
      setError(
        getErrorMessage(
          updateError,
          'Could not update project request status. Please try again.',
        ),
      )
    } finally {
      setUpdatingRequestId(null)
    }
  }

  return (
    <section>
      <PageHeader
        description="Review incoming customer requests and move each request through the approval flow."
        eyebrow="Admin"
        title="Project Requests"
      />

      {error ? (
        <ErrorMessage className="mt-6" message={error} />
      ) : null}

      {successMessage ? (
        <Alert className="mt-6" tone="success">
          {successMessage}
        </Alert>
      ) : null}

      <Card
        className="mt-8"
        description="Customer, company, and package details are shown for review."
        title="All requests"
      >
        {isLoading ? (
          <div className="flex items-center gap-3 p-5 text-sm font-medium text-slate-600">
            <LoadingSpinner label="Loading project requests" />
            <span>Loading project requests</span>
          </div>
        ) : null}

        {!isLoading && requests.length === 0 ? (
          <EmptyState
            compact
            description="Customer requests will appear here when submitted."
            title="No project requests yet"
          />
        ) : null}

        {!isLoading && requests.length > 0 ? (
          <>
            <div className="divide-y divide-slate-200 md:hidden">
              {requests.map((request) => (
                <article className="p-5" key={request.id}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-slate-950">
                        {request.title}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {request.servicePackageName || 'No package'}
                      </p>
                    </div>
                    <StatusBadge
                      label={request.status}
                      showDot
                      tone={getRequestStatusTone(request.status)}
                    />
                  </div>
                  <p className="mt-4 text-sm leading-6 text-slate-600">
                    {request.description}
                  </p>
                  <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                    <RequestDetail
                      label="Customer"
                      value={request.customerEmail || 'No email'}
                    />
                    <RequestDetail
                      label="Company"
                      value={request.companyName || 'No company'}
                    />
                    <RequestDetail
                      label="Budget"
                      value={request.budgetRange || 'Not specified'}
                    />
                    <RequestDetail
                      label="Created"
                      value={formatDate(request.createdAt)}
                    />
                  </dl>
                  <Select
                    disabled={updatingRequestId === request.id}
                    id={`mobile-status-${request.id}`}
                    label="Update status"
                    onChange={(event) =>
                      void handleStatusChange(
                        request,
                        event.target.value as ProjectRequestStatus,
                      )
                    }
                    value={request.status}
                    wrapperClassName="mt-5"
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </Select>
                </article>
              ))}
            </div>
            <DataTable
              className="min-w-[900px]"
              scrollLabel="Project requests table"
              showMobileHint={false}
              wrapperClassName="hidden md:block"
            >
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Request</th>
                  <th className="px-5 py-3 font-semibold">Customer</th>
                  <th className="px-5 py-3 font-semibold">Company</th>
                  <th className="px-5 py-3 font-semibold">Package</th>
                  <th className="px-5 py-3 font-semibold">Budget</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {requests.map((request) => (
                <tr
                  className="transition-colors hover:bg-slate-50"
                  key={request.id}
                >
                    <td className="max-w-md px-5 py-4 align-top">
                      <p className="font-semibold text-slate-950">
                        {request.title}
                      </p>
                      <p className="mt-1 line-clamp-2 text-slate-500">
                        {request.description}
                      </p>
                      <p className="mt-2 text-xs font-medium text-slate-400">
                        {formatDate(request.createdAt)}
                      </p>
                    </td>
                    <td className="px-5 py-4 align-top text-slate-700">
                      {request.customerEmail || 'No email'}
                    </td>
                    <td className="px-5 py-4 align-top text-slate-700">
                      {request.companyName || 'No company'}
                    </td>
                    <td className="px-5 py-4 align-top text-slate-700">
                      {request.servicePackageName || 'No package'}
                    </td>
                    <td className="px-5 py-4 align-top text-slate-700">
                      {request.budgetRange || 'Not specified'}
                    </td>
                  <td className="px-5 py-4 align-top">
                      <div className="mb-2">
                        <StatusBadge
                          label={request.status}
                          showDot
                          tone={getRequestStatusTone(request.status)}
                        />
                      </div>
                      <Select
                        className="h-10 min-w-32 font-semibold"
                        disabled={updatingRequestId === request.id}
                        hideLabel
                        id={`status-${request.id}`}
                        label={`Status for ${request.title}`}
                        onChange={(event) =>
                          void handleStatusChange(
                            request,
                            event.target.value as ProjectRequestStatus,
                          )
                        }
                        value={request.status}
                      >
                        {statuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </Select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </DataTable>
          </>
        ) : null}
      </Card>
    </section>
  )
}

function getRequestStatusTone(status: ProjectRequestStatus) {
  const tones: Record<
    ProjectRequestStatus,
    'amber' | 'blue' | 'emerald' | 'red'
  > = {
    Approved: 'emerald',
    New: 'amber',
    Rejected: 'red',
    Reviewed: 'blue',
  }

  return tones[status]
}

function RequestDetail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-slate-500">{label}</dt>
      <dd className="mt-1 break-words font-semibold text-slate-950">{value}</dd>
    </div>
  )
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('sv-SE', {
    dateStyle: 'medium',
  }).format(new Date(value))
}
