import { useEffect, useState } from 'react'
import {
  getProjectRequests,
  updateProjectRequestStatus,
} from '../../api/projectRequestsApi'
import { PageHeader } from '../../components/ui/PageHeader'
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
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {successMessage ? (
        <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          {successMessage}
        </div>
      ) : null}

      <div className="mt-8 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-950">All requests</h2>
          <p className="mt-1 text-sm text-slate-500">
            Customer, company, and package details are shown for review.
          </p>
        </div>

        {isLoading ? (
          <div className="p-5 text-sm font-medium text-slate-600">
            Loading project requests
          </div>
        ) : null}

        {!isLoading && requests.length === 0 ? (
          <div className="p-5 text-sm text-slate-600">
            No project requests have been submitted yet.
          </div>
        ) : null}

        {!isLoading && requests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
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
                  <tr key={request.id}>
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
                      <label className="sr-only" htmlFor={`status-${request.id}`}>
                        Status for {request.title}
                      </label>
                      <select
                        className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
                        disabled={updatingRequestId === request.id}
                        id={`status-${request.id}`}
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
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </section>
  )
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('sv-SE', {
    dateStyle: 'medium',
  }).format(new Date(value))
}
