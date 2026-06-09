import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { getPackages } from '../../api/packagesApi'
import {
  createProjectRequest,
  getMyProjectRequests,
} from '../../api/projectRequestsApi'
import { Button } from '../../components/ui/Button'
import { PageHeader } from '../../components/ui/PageHeader'
import { TextInput } from '../../components/ui/TextInput'
import type { ServicePackage } from '../../types/servicePackage'
import type {
  CreateProjectRequestDto,
  ProjectRequest,
  ProjectRequestStatus,
} from '../../types/projectRequest'
import { getErrorMessage } from '../../utils/getErrorMessage'

type RequestFormState = {
  servicePackageId: string
  title: string
  description: string
  budgetRange: string
}

const emptyForm: RequestFormState = {
  servicePackageId: '',
  title: '',
  description: '',
  budgetRange: '',
}

const sekFormatter = new Intl.NumberFormat('sv-SE', {
  currency: 'SEK',
  maximumFractionDigits: 0,
  style: 'currency',
})

export function CustomerRequests() {
  const [requests, setRequests] = useState<ProjectRequest[]>([])
  const [packages, setPackages] = useState<ServicePackage[]>([])
  const [form, setForm] = useState<RequestFormState>(emptyForm)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const selectedPackage = useMemo(
    () =>
      packages.find(
        (servicePackage) => String(servicePackage.id) === form.servicePackageId,
      ) ?? null,
    [form.servicePackageId, packages],
  )

  useEffect(() => {
    let isMounted = true

    async function loadPageData() {
      setIsLoading(true)
      setError('')

      try {
        const [loadedRequests, loadedPackages] = await Promise.all([
          getMyProjectRequests(),
          getPackages(),
        ])

        if (isMounted) {
          setRequests(loadedRequests)
          setPackages(loadedPackages)
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

    void loadPageData()

    return () => {
      isMounted = false
    }
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSaving(true)
    setError('')
    setSuccessMessage('')

    try {
      await createProjectRequest(toPayload(form))
      setSuccessMessage('Project request submitted.')
      setForm(emptyForm)
      setRequests(await getMyProjectRequests())
    } catch (saveError) {
      setError(
        getErrorMessage(
          saveError,
          'Could not submit the project request. Please try again.',
        ),
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section>
      <PageHeader
        description="Send new project requests and track their review status."
        eyebrow="Customer"
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

      <div className="mt-8 grid gap-6 xl:grid-cols-[390px_1fr]">
        <form
          className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
          onSubmit={handleSubmit}
        >
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-slate-950">
              New request
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Select a package and describe what you need.
            </p>
          </div>

          <div className="grid gap-4">
            <label className="grid gap-2" htmlFor="servicePackageId">
              <span className="form-label">Package</span>
              <select
                className="form-input"
                disabled={packages.length === 0}
                id="servicePackageId"
                onChange={(event) =>
                  setForm({ ...form, servicePackageId: event.target.value })
                }
                required
                value={form.servicePackageId}
              >
                <option value="">Choose a package</option>
                {packages.map((servicePackage) => (
                  <option key={servicePackage.id} value={servicePackage.id}>
                    {servicePackage.name}
                  </option>
                ))}
              </select>
            </label>

            {selectedPackage ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                <p className="font-semibold text-slate-950">
                  {selectedPackage.category}
                </p>
                <p className="mt-1">{selectedPackage.description}</p>
                <p className="mt-3 font-medium text-slate-800">
                  {sekFormatter.format(selectedPackage.monthlyPrice)} monthly,
                  {' '}
                  {sekFormatter.format(selectedPackage.setupFee)} setup
                </p>
              </div>
            ) : null}

            <TextInput
              id="title"
              label="Title"
              maxLength={200}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              required
              value={form.title}
            />

            <label className="grid gap-2" htmlFor="description">
              <span className="form-label">Description</span>
              <textarea
                className="min-h-32 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                id="description"
                maxLength={2000}
                onChange={(event) =>
                  setForm({ ...form, description: event.target.value })
                }
                required
                value={form.description}
              />
            </label>

            <TextInput
              id="budgetRange"
              label="Budget range"
              maxLength={100}
              onChange={(event) =>
                setForm({ ...form, budgetRange: event.target.value })
              }
              placeholder="Example: 20 000 - 40 000 SEK"
              value={form.budgetRange}
            />
          </div>

          <div className="mt-6">
            <Button disabled={isSaving || packages.length === 0} type="submit">
              {isSaving ? 'Submitting' : 'Submit request'}
            </Button>
          </div>
        </form>

        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-lg font-semibold text-slate-950">My requests</h2>
            <p className="mt-1 text-sm text-slate-500">
              New requests are reviewed by the NordicWebHub team.
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
            <div className="divide-y divide-slate-200">
              {requests.map((request) => (
                <article className="p-5" key={request.id}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-slate-950">
                        {request.title}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {request.servicePackageName}
                      </p>
                    </div>
                    <StatusBadge status={request.status} />
                  </div>

                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {request.description}
                  </p>

                  <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                    <RequestDetail
                      label="Budget"
                      value={request.budgetRange || 'Not specified'}
                    />
                    <RequestDetail
                      label="Created"
                      value={formatDate(request.createdAt)}
                    />
                  </dl>
                </article>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}

function StatusBadge({ status }: { status: ProjectRequestStatus }) {
  const classes: Record<ProjectRequestStatus, string> = {
    Approved: 'bg-emerald-50 text-emerald-700',
    New: 'bg-blue-50 text-blue-700',
    Rejected: 'bg-red-50 text-red-700',
    Reviewed: 'bg-amber-50 text-amber-700',
  }

  return (
    <span
      className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-semibold ${classes[status]}`}
    >
      {status}
    </span>
  )
}

function RequestDetail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-slate-500">{label}</dt>
      <dd className="mt-1 font-semibold text-slate-950">{value}</dd>
    </div>
  )
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('sv-SE', {
    dateStyle: 'medium',
  }).format(new Date(value))
}

function toPayload(form: RequestFormState): CreateProjectRequestDto {
  return {
    servicePackageId: Number(form.servicePackageId),
    title: form.title.trim(),
    description: form.description.trim(),
    budgetRange: form.budgetRange.trim(),
  }
}
