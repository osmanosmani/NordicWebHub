import { useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  createPackage,
  deletePackage,
  getPackages,
  updatePackage,
} from '../../api/packagesApi'
import { Alert } from '../../components/ui/Alert'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorMessage } from '../../components/ui/ErrorMessage'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { PageHeader } from '../../components/ui/PageHeader'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { TextArea } from '../../components/ui/TextArea'
import { TextInput } from '../../components/ui/TextInput'
import type {
  CreateServicePackageDto,
  ServicePackage,
} from '../../types/servicePackage'
import { getErrorMessage } from '../../utils/getErrorMessage'

type PackageFormState = {
  name: string
  description: string
  category: string
  monthlyPrice: string
  setupFee: string
  deliveryTime: string
  isActive: boolean
}

const emptyForm: PackageFormState = {
  name: '',
  description: '',
  category: '',
  monthlyPrice: '',
  setupFee: '',
  deliveryTime: '',
  isActive: true,
}

const sekFormatter = new Intl.NumberFormat('sv-SE', {
  currency: 'SEK',
  maximumFractionDigits: 0,
  style: 'currency',
})

export function AdminPackages() {
  const [packages, setPackages] = useState<ServicePackage[]>([])
  const [form, setForm] = useState<PackageFormState>(emptyForm)
  const [editingPackageId, setEditingPackageId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const editingPackage = useMemo(
    () =>
      packages.find((servicePackage) => servicePackage.id === editingPackageId) ??
      null,
    [editingPackageId, packages],
  )

  useEffect(() => {
    void loadPackages()
  }, [])

  async function loadPackages() {
    setIsLoading(true)
    setError('')

    try {
      setPackages(await getPackages())
    } catch (loadError) {
      setError(
        getErrorMessage(loadError, 'Could not load service packages. Please try again.'),
      )
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSaving(true)
    setError('')
    setSuccessMessage('')

    const payload = toPayload(form)

    try {
      if (editingPackageId) {
        await updatePackage(editingPackageId, payload)
        setSuccessMessage('Service package updated.')
      } else {
        await createPackage(payload)
        setSuccessMessage('Service package created.')
      }

      resetForm()
      await loadPackages()
    } catch (saveError) {
      setError(
        getErrorMessage(saveError, 'Could not save the service package. Please try again.'),
      )
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(servicePackage: ServicePackage) {
    const confirmed = window.confirm(
      `Delete "${servicePackage.name}"? Packages used by requests will be deactivated instead.`,
    )

    if (!confirmed) {
      return
    }

    setError('')
    setSuccessMessage('')

    try {
      await deletePackage(servicePackage.id)
      setSuccessMessage('Service package deleted or deactivated.')
      if (editingPackageId === servicePackage.id) {
        resetForm()
      }
      await loadPackages()
    } catch (deleteError) {
      setError(
        getErrorMessage(
          deleteError,
          'Could not delete the service package. Please try again.',
        ),
      )
    }
  }

  function startEditing(servicePackage: ServicePackage) {
    setEditingPackageId(servicePackage.id)
    setSuccessMessage('')
    setForm({
      name: servicePackage.name,
      description: servicePackage.description,
      category: servicePackage.category,
      monthlyPrice: String(servicePackage.monthlyPrice),
      setupFee: String(servicePackage.setupFee),
      deliveryTime: servicePackage.deliveryTime,
      isActive: servicePackage.isActive,
    })
  }

  function resetForm() {
    setEditingPackageId(null)
    setForm(emptyForm)
  }

  return (
    <section>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <PageHeader
          description="Create, edit, deactivate, and remove service packages shown to customers."
          eyebrow="Admin"
          title="Service Packages"
        />
        <Button onClick={resetForm} variant="secondary">
          New package
        </Button>
      </div>

      {error ? (
        <ErrorMessage className="mt-6" message={error} />
      ) : null}

      {successMessage ? (
        <Alert className="mt-6" tone="success">
          {successMessage}
        </Alert>
      ) : null}

      <div className="mt-8 grid gap-6 xl:grid-cols-[380px_1fr]">
        <form
          className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
          onSubmit={handleSubmit}
        >
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-slate-950">
              {editingPackage ? 'Edit package' : 'Create package'}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Required fields are validated by the API.
            </p>
          </div>

          <div className="grid gap-4">
            <TextInput
              id="name"
              label="Name"
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              required
              value={form.name}
            />
            <TextInput
              id="category"
              label="Category"
              onChange={(event) =>
                setForm({ ...form, category: event.target.value })
              }
              required
              value={form.category}
            />
            <TextArea
              id="description"
              label="Description"
              maxLength={2000}
              onChange={(event) =>
                setForm({ ...form, description: event.target.value })
              }
              required
              value={form.description}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput
                id="monthlyPrice"
                label="Monthly price"
                min="0"
                onChange={(event) =>
                  setForm({ ...form, monthlyPrice: event.target.value })
                }
                required
                step="0.01"
                type="number"
                value={form.monthlyPrice}
              />
              <TextInput
                id="setupFee"
                label="Setup fee"
                min="0"
                onChange={(event) =>
                  setForm({ ...form, setupFee: event.target.value })
                }
                required
                step="0.01"
                type="number"
                value={form.setupFee}
              />
            </div>
            <TextInput
              id="deliveryTime"
              label="Delivery time"
              onChange={(event) =>
                setForm({ ...form, deliveryTime: event.target.value })
              }
              required
              value={form.deliveryTime}
            />
            <label className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-medium text-slate-700">
              <input
                checked={form.isActive}
                className="h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-600"
                onChange={(event) =>
                  setForm({ ...form, isActive: event.target.checked })
                }
                type="checkbox"
              />
              Active package
            </label>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button
              isLoading={isSaving}
              loadingLabel="Saving"
              type="submit"
            >
              {editingPackage ? 'Save changes' : 'Create package'}
            </Button>
            {editingPackage ? (
              <Button onClick={resetForm} type="button" variant="secondary">
                Cancel
              </Button>
            ) : null}
          </div>
        </form>

        <Card
          description="Admins can see both active and inactive packages."
          title="All packages"
        >
          {isLoading ? (
            <div className="flex items-center gap-3 p-5 text-sm font-medium text-slate-600">
              <LoadingSpinner label="Loading service packages" />
              <span>Loading service packages</span>
            </div>
          ) : null}

          {!isLoading && packages.length === 0 ? (
            <EmptyState
              compact
              description="Create the first package to make it available to customers."
              title="No service packages yet"
            />
          ) : null}

          {!isLoading && packages.length > 0 ? (
            <div className="divide-y divide-slate-200">
              {packages.map((servicePackage) => (
                <article
                  className="grid gap-4 p-5 lg:grid-cols-[1fr_auto]"
                  key={servicePackage.id}
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold text-slate-950">
                        {servicePackage.name}
                      </h3>
                      <StatusBadge label={servicePackage.category} />
                      <StatusBadge
                        label={servicePackage.isActive ? 'Active' : 'Inactive'}
                        showDot
                        tone={servicePackage.isActive ? 'emerald' : 'slate'}
                      />
                    </div>

                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                      {servicePackage.description}
                    </p>

                    <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                      <div>
                        <dt className="text-slate-500">Monthly</dt>
                        <dd className="font-semibold text-slate-950">
                          {sekFormatter.format(servicePackage.monthlyPrice)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-slate-500">Setup</dt>
                        <dd className="font-semibold text-slate-950">
                          {sekFormatter.format(servicePackage.setupFee)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-slate-500">Delivery</dt>
                        <dd className="font-semibold text-slate-950">
                          {servicePackage.deliveryTime}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div className="flex items-start gap-2 lg:justify-end">
                    <Button
                      className="h-10 px-3"
                      onClick={() => startEditing(servicePackage)}
                      variant="secondary"
                    >
                      Edit
                    </Button>
                    <Button
                      className="h-10 px-3"
                      onClick={() => void handleDelete(servicePackage)}
                      variant="ghost"
                    >
                      Delete
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </Card>
      </div>
    </section>
  )
}

function toPayload(form: PackageFormState): CreateServicePackageDto {
  return {
    name: form.name.trim(),
    description: form.description.trim(),
    category: form.category.trim(),
    monthlyPrice: Number(form.monthlyPrice),
    setupFee: Number(form.setupFee),
    deliveryTime: form.deliveryTime.trim(),
    isActive: form.isActive,
  }
}
