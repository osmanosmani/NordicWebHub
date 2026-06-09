import { useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  createCompany,
  deleteCompany,
  getCompanies,
  updateCompany,
} from '../../api/companiesApi'
import { Button } from '../../components/ui/Button'
import { PageHeader } from '../../components/ui/PageHeader'
import { TextInput } from '../../components/ui/TextInput'
import type { Company, CreateCompanyDto } from '../../types/company'
import { getErrorMessage } from '../../utils/getErrorMessage'

type CompanyFormState = {
  name: string
  orgNumber: string
  websiteUrl: string
  city: string
  industry: string
  phone: string
  ownerId: string
}

const emptyForm: CompanyFormState = {
  name: '',
  orgNumber: '',
  websiteUrl: '',
  city: '',
  industry: '',
  phone: '',
  ownerId: '',
}

export function AdminCompanies() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [form, setForm] = useState<CompanyFormState>(emptyForm)
  const [editingCompanyId, setEditingCompanyId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const editingCompany = useMemo(
    () => companies.find((company) => company.id === editingCompanyId) ?? null,
    [companies, editingCompanyId],
  )

  useEffect(() => {
    void loadCompanies()
  }, [])

  async function loadCompanies() {
    setIsLoading(true)
    setError('')

    try {
      setCompanies(await getCompanies())
    } catch (loadError) {
      setError(
        getErrorMessage(loadError, 'Could not load companies. Please try again.'),
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

    try {
      if (editingCompanyId) {
        await updateCompany(editingCompanyId, toPayload(form))
        setSuccessMessage('Company updated.')
      } else {
        await createCompany(toPayload(form))
        setSuccessMessage('Company created.')
      }

      resetForm()
      await loadCompanies()
    } catch (saveError) {
      setError(getErrorMessage(saveError, 'Could not save company. Please try again.'))
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(company: Company) {
    const confirmed = window.confirm(
      `Delete "${company.name}"? Companies with related records cannot be deleted.`,
    )

    if (!confirmed) {
      return
    }

    setError('')
    setSuccessMessage('')

    try {
      await deleteCompany(company.id)
      setSuccessMessage('Company deleted.')
      if (editingCompanyId === company.id) {
        resetForm()
      }
      await loadCompanies()
    } catch (deleteError) {
      setError(
        getErrorMessage(
          deleteError,
          'Could not delete company. It may have related records.',
        ),
      )
    }
  }

  function startEditing(company: Company) {
    setEditingCompanyId(company.id)
    setSuccessMessage('')
    setForm({
      name: company.name,
      orgNumber: company.orgNumber,
      websiteUrl: company.websiteUrl,
      city: company.city,
      industry: company.industry,
      phone: company.phone,
      ownerId: company.ownerId,
    })
  }

  function resetForm() {
    setEditingCompanyId(null)
    setForm(emptyForm)
  }

  return (
    <section>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <PageHeader
          description="Manage customer companies and their assigned portal owners."
          eyebrow="Admin"
          title="Companies"
        />
        <Button onClick={resetForm} variant="secondary">
          New company
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

      <div className="mt-8 grid gap-6 xl:grid-cols-[390px_1fr]">
        <form
          className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
          onSubmit={handleSubmit}
        >
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-slate-950">
              {editingCompany ? 'Edit company' : 'Create company'}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Organization number format: XXXXXX-XXXX.
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
              id="orgNumber"
              label="Org number"
              onChange={(event) =>
                setForm({ ...form, orgNumber: event.target.value })
              }
              pattern="[0-9]{6}-[0-9]{4}"
              placeholder="559000-0000"
              required
              value={form.orgNumber}
            />
            <TextInput
              id="ownerId"
              label="Owner user id"
              onChange={(event) =>
                setForm({ ...form, ownerId: event.target.value })
              }
              required
              value={form.ownerId}
            />
            <TextInput
              id="websiteUrl"
              label="Website URL"
              onChange={(event) =>
                setForm({ ...form, websiteUrl: event.target.value })
              }
              placeholder="https://example.se"
              type="url"
              value={form.websiteUrl}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput
                id="city"
                label="City"
                onChange={(event) => setForm({ ...form, city: event.target.value })}
                required
                value={form.city}
              />
              <TextInput
                id="industry"
                label="Industry"
                onChange={(event) =>
                  setForm({ ...form, industry: event.target.value })
                }
                required
                value={form.industry}
              />
            </div>
            <TextInput
              id="phone"
              label="Phone"
              onChange={(event) => setForm({ ...form, phone: event.target.value })}
              value={form.phone}
            />
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button disabled={isSaving} type="submit">
              {isSaving
                ? 'Saving'
                : editingCompany
                  ? 'Save changes'
                  : 'Create company'}
            </Button>
            {editingCompany ? (
              <Button onClick={resetForm} type="button" variant="secondary">
                Cancel
              </Button>
            ) : null}
          </div>
        </form>

        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-lg font-semibold text-slate-950">All companies</h2>
            <p className="mt-1 text-sm text-slate-500">
              Owner email is shown when connected to a customer account.
            </p>
          </div>

          {isLoading ? (
            <div className="p-5 text-sm font-medium text-slate-600">
              Loading companies
            </div>
          ) : null}

          {!isLoading && companies.length === 0 ? (
            <div className="p-5 text-sm text-slate-600">
              No companies have been created yet.
            </div>
          ) : null}

          {!isLoading && companies.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Company</th>
                    <th className="px-5 py-3 font-semibold">Org number</th>
                    <th className="px-5 py-3 font-semibold">City</th>
                    <th className="px-5 py-3 font-semibold">Owner</th>
                    <th className="px-5 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {companies.map((company) => (
                    <tr key={company.id}>
                      <td className="px-5 py-4 align-top">
                        <p className="font-semibold text-slate-950">{company.name}</p>
                        <p className="mt-1 max-w-xs truncate text-slate-500">
                          {company.industry}
                        </p>
                      </td>
                      <td className="px-5 py-4 align-top text-slate-700">
                        {company.orgNumber}
                      </td>
                      <td className="px-5 py-4 align-top text-slate-700">
                        {company.city}
                      </td>
                      <td className="px-5 py-4 align-top">
                        <p className="font-medium text-slate-800">
                          {company.ownerEmail || 'No email'}
                        </p>
                        <p className="mt-1 max-w-xs truncate text-xs text-slate-500">
                          {company.ownerId}
                        </p>
                      </td>
                      <td className="px-5 py-4 align-top">
                        <div className="flex gap-2">
                          <Button
                            className="h-10 px-3"
                            onClick={() => startEditing(company)}
                            variant="secondary"
                          >
                            Edit
                          </Button>
                          <Button
                            className="h-10 px-3"
                            onClick={() => void handleDelete(company)}
                            variant="ghost"
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}

function toPayload(form: CompanyFormState): CreateCompanyDto {
  return {
    name: form.name.trim(),
    orgNumber: form.orgNumber.trim(),
    websiteUrl: form.websiteUrl.trim(),
    city: form.city.trim(),
    industry: form.industry.trim(),
    phone: form.phone.trim(),
    ownerId: form.ownerId.trim(),
  }
}
