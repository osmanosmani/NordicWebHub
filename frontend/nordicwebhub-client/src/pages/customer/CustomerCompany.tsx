import { useEffect, useState, type FormEvent } from 'react'
import { getMyCompany, updateCompany } from '../../api/companiesApi'
import { Button } from '../../components/ui/Button'
import { PageHeader } from '../../components/ui/PageHeader'
import { TextInput } from '../../components/ui/TextInput'
import type { Company, UpdateMyCompanyDto } from '../../types/company'
import { getErrorMessage } from '../../utils/getErrorMessage'

export function CustomerCompany() {
  const [company, setCompany] = useState<Company | null>(null)
  const [form, setForm] = useState<UpdateMyCompanyDto>({
    websiteUrl: '',
    city: '',
    industry: '',
    phone: '',
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    let isMounted = true

    getMyCompany()
      .then((loadedCompany) => {
        if (isMounted) {
          setCompany(loadedCompany)
          setForm({
            websiteUrl: loadedCompany.websiteUrl,
            city: loadedCompany.city,
            industry: loadedCompany.industry,
            phone: loadedCompany.phone,
          })
        }
      })
      .catch((loadError) => {
        if (isMounted) {
          setError(
            getErrorMessage(loadError, 'Could not load your company profile.'),
          )
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!company) {
      return
    }

    setIsSaving(true)
    setError('')
    setSuccessMessage('')

    try {
      const updatedCompany = await updateCompany(company.id, {
        name: company.name,
        orgNumber: company.orgNumber,
        websiteUrl: form.websiteUrl.trim(),
        city: form.city.trim(),
        industry: form.industry.trim(),
        phone: form.phone.trim(),
        ownerId: company.ownerId,
      })

      setCompany(updatedCompany)
      setForm({
        websiteUrl: updatedCompany.websiteUrl,
        city: updatedCompany.city,
        industry: updatedCompany.industry,
        phone: updatedCompany.phone,
      })
      setSuccessMessage('Company profile updated.')
    } catch (saveError) {
      setError(
        getErrorMessage(saveError, 'Could not update your company profile.'),
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section>
      <PageHeader
        description="Review your company details and keep basic contact information up to date."
        eyebrow="Customer"
        title="My Company"
      />

      {isLoading ? (
        <div className="mt-8 rounded-lg border border-slate-200 bg-white p-6 text-sm font-medium text-slate-600 shadow-sm">
          Loading company profile
        </div>
      ) : null}

      {error ? (
        <div className="mt-8 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {!isLoading && !error && !company ? (
        <div className="mt-8 rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
          No company is connected to your account yet.
        </div>
      ) : null}

      {company ? (
        <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">
              Company details
            </h2>
            <dl className="mt-5 grid gap-4 text-sm">
              <CompanyDetail label="Name" value={company.name} />
              <CompanyDetail label="Org number" value={company.orgNumber} />
              <CompanyDetail label="Owner email" value={company.ownerEmail} />
              <CompanyDetail label="Created" value={formatDate(company.createdAt)} />
            </dl>
          </div>

          <form
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            onSubmit={handleSubmit}
          >
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-slate-950">
                Editable information
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Organization number format is XXXXXX-XXXX and can only be changed by admin.
              </p>
            </div>

            {successMessage ? (
              <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                {successMessage}
              </div>
            ) : null}

            <div className="grid gap-4">
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
                  onChange={(event) =>
                    setForm({ ...form, city: event.target.value })
                  }
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
                onChange={(event) =>
                  setForm({ ...form, phone: event.target.value })
                }
                value={form.phone}
              />
            </div>

            <div className="mt-6">
              <Button disabled={isSaving} type="submit">
                {isSaving ? 'Saving' : 'Save changes'}
              </Button>
            </div>
          </form>
        </div>
      ) : null}
    </section>
  )
}

function CompanyDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t border-slate-100 pt-3 first:border-t-0 first:pt-0">
      <dt className="text-slate-500">{label}</dt>
      <dd className="mt-1 font-semibold text-slate-950">{value || 'Not provided'}</dd>
    </div>
  )
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('sv-SE', {
    dateStyle: 'medium',
  }).format(new Date(value))
}
