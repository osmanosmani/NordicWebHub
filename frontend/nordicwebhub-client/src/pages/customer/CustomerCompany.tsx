import axios from 'axios'
import { useEffect, useState, type FormEvent } from 'react'
import { getMyCompany, updateMyCompany } from '../../api/companiesApi'
import { Alert } from '../../components/ui/Alert'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorMessage } from '../../components/ui/ErrorMessage'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
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
          if (axios.isAxiosError(loadError) && loadError.response?.status === 404) {
            setCompany(null)
            setError('')
            return
          }

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
      const updatedCompany = await updateMyCompany(company.id, {
        websiteUrl: form.websiteUrl.trim(),
        city: form.city.trim(),
        industry: form.industry.trim(),
        phone: form.phone.trim(),
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
        <Card className="mt-8">
          <div className="flex items-center gap-3 p-6 text-sm font-medium text-slate-600">
            <LoadingSpinner label="Loading company profile" />
            <span>Loading company profile</span>
          </div>
        </Card>
      ) : null}

      {error ? (
        <ErrorMessage className="mt-8" message={error} />
      ) : null}

      {!isLoading && !error && !company ? (
        <Card className="mt-8">
          <EmptyState
            description="Contact the administrator to connect a company to your account."
            title="No company connected"
          />
        </Card>
      ) : null}

      {company ? (
        <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-slate-950">
              Company details
            </h2>
            <dl className="mt-5 grid gap-4 text-sm">
              <CompanyDetail label="Name" value={company.name} />
              <CompanyDetail label="Org number" value={company.orgNumber} />
              <CompanyDetail label="Owner email" value={company.ownerEmail} />
              <CompanyDetail label="Created" value={formatDate(company.createdAt)} />
            </dl>
          </Card>

          <form
            className="form-panel"
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
              <Alert className="mb-5" tone="success">
                {successMessage}
              </Alert>
            ) : null}

            <div className="form-stack">
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

            <div className="form-actions">
              <Button
                isLoading={isSaving}
                loadingLabel="Saving"
                type="submit"
              >
                Save changes
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
