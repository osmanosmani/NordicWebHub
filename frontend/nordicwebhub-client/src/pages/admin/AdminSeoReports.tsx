import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { getCompanies } from '../../api/companiesApi'
import {
  createSeoReport,
  deleteSeoReport,
  getSeoReports,
  updateSeoReport,
} from '../../api/seoReportsApi'
import { Alert } from '../../components/ui/Alert'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorMessage } from '../../components/ui/ErrorMessage'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { PageHeader } from '../../components/ui/PageHeader'
import { Select } from '../../components/ui/Select'
import { SeoScore } from '../../components/ui/SeoScore'
import { TextArea } from '../../components/ui/TextArea'
import { TextInput } from '../../components/ui/TextInput'
import type { Company } from '../../types/company'
import type { CreateSeoReportDto, SeoReport } from '../../types/seoReport'
import { getErrorMessage } from '../../utils/getErrorMessage'

type SeoReportForm = {
  companyId: string
  seoScore: string
  topKeywords: string
  technicalIssues: string
  recommendations: string
}

const emptyForm: SeoReportForm = {
  companyId: '',
  seoScore: '',
  topKeywords: '',
  technicalIssues: '',
  recommendations: '',
}

export function AdminSeoReports() {
  const [seoReports, setSeoReports] = useState<SeoReport[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [form, setForm] = useState<SeoReportForm>(emptyForm)
  const [editingReportId, setEditingReportId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [deletingReportId, setDeletingReportId] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const editingReport = useMemo(
    () =>
      seoReports.find((report) => report.id === editingReportId) ?? null,
    [editingReportId, seoReports],
  )

  useEffect(() => {
    let isMounted = true

    async function loadPageData() {
      setIsLoading(true)
      setError('')

      try {
        const [loadedReports, loadedCompanies] = await Promise.all([
          getSeoReports(),
          getCompanies(),
        ])

        if (isMounted) {
          setSeoReports(loadedReports)
          setCompanies(loadedCompanies)
        }
      } catch (loadError) {
        if (isMounted) {
          setError(
            getErrorMessage(
              loadError,
              'Could not load SEO reports. Please try again.',
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

    const payload = toPayload(form)
    if (!payload) {
      setError('Please select a company and enter an SEO score from 0 to 100.')
      return
    }

    setIsSaving(true)
    setError('')
    setSuccessMessage('')

    try {
      if (editingReportId) {
        const updatedReport = await updateSeoReport(editingReportId, payload)
        setSeoReports((currentReports) =>
          currentReports.map((report) =>
            report.id === updatedReport.id ? updatedReport : report,
          ),
        )
        setSuccessMessage('SEO report updated.')
      } else {
        const createdReport = await createSeoReport(payload)
        setSeoReports((currentReports) => [createdReport, ...currentReports])
        setSuccessMessage('SEO report created.')
      }

      resetForm()
    } catch (saveError) {
      setError(
        getErrorMessage(
          saveError,
          'Could not save the SEO report. Please try again.',
        ),
      )
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(report: SeoReport) {
    const confirmed = window.confirm(
      `Delete the SEO report for "${report.companyName}"?`,
    )

    if (!confirmed) {
      return
    }

    setDeletingReportId(report.id)
    setError('')
    setSuccessMessage('')

    try {
      await deleteSeoReport(report.id)
      setSeoReports((currentReports) =>
        currentReports.filter(
          (currentReport) => currentReport.id !== report.id,
        ),
      )

      if (editingReportId === report.id) {
        resetForm()
      }

      setSuccessMessage('SEO report deleted.')
    } catch (deleteError) {
      setError(
        getErrorMessage(
          deleteError,
          'Could not delete the SEO report. Please try again.',
        ),
      )
    } finally {
      setDeletingReportId(null)
    }
  }

  function startEditing(report: SeoReport) {
    setEditingReportId(report.id)
    setError('')
    setSuccessMessage('')
    setForm({
      companyId: String(report.companyId),
      seoScore: String(report.seoScore),
      topKeywords: report.topKeywords,
      technicalIssues: report.technicalIssues,
      recommendations: report.recommendations,
    })
  }

  function resetForm() {
    setEditingReportId(null)
    setForm(emptyForm)
  }

  return (
    <section>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <PageHeader
          description="Create clear SEO assessments with scores, keyword opportunities, technical findings, and recommendations."
          eyebrow="Admin"
          title="SEO Reports"
        />
        <Button onClick={resetForm} variant="secondary">
          New report
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

      <div className="mt-8 grid gap-6 xl:grid-cols-[390px_1fr]">
        <form
          className="h-fit rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
          onSubmit={handleSubmit}
        >
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-slate-950">
              {editingReport ? 'Edit SEO report' : 'Create SEO report'}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Use concise, actionable language suitable for the customer.
            </p>
          </div>

          <div className="grid gap-4">
            <Select
              id="companyId"
              label="Company"
              onChange={(event) =>
                setForm({ ...form, companyId: event.target.value })
              }
              required
              value={form.companyId}
            >
              <option value="">Select company</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </Select>

            <TextInput
              id="seoScore"
              label="SEO score"
              max={100}
              min={0}
              onChange={(event) =>
                setForm({ ...form, seoScore: event.target.value })
              }
              required
              type="number"
              value={form.seoScore}
            />

            <TextArea
              id="topKeywords"
              label="Top keywords"
              maxLength={1000}
              onChange={(event) =>
                setForm({ ...form, topKeywords: event.target.value })
              }
              required
              value={form.topKeywords}
            />
            <TextArea
              id="technicalIssues"
              label="Technical issues"
              maxLength={2000}
              onChange={(event) =>
                setForm({ ...form, technicalIssues: event.target.value })
              }
              required
              value={form.technicalIssues}
            />
            <TextArea
              id="recommendations"
              label="Recommendations"
              maxLength={2000}
              onChange={(event) =>
                setForm({ ...form, recommendations: event.target.value })
              }
              required
              value={form.recommendations}
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              disabled={companies.length === 0}
              isLoading={isSaving}
              loadingLabel="Saving"
              type="submit"
            >
              {editingReport ? 'Save changes' : 'Create report'}
            </Button>
            {editingReport ? (
              <Button onClick={resetForm} type="button" variant="secondary">
                Cancel
              </Button>
            ) : null}
          </div>
        </form>

        <Card
          description="Newest reports are shown first."
          title="All SEO reports"
        >
          {isLoading ? (
            <div className="flex items-center gap-3 p-5 text-sm font-medium text-slate-600">
              <LoadingSpinner label="Loading SEO reports" />
              <span>Loading SEO reports</span>
            </div>
          ) : null}

          {!isLoading && seoReports.length === 0 ? (
            <EmptyState
              compact
              description="Create the first SEO assessment for a customer company."
              title="No SEO reports yet"
            />
          ) : null}

          {!isLoading && seoReports.length > 0 ? (
            <div className="divide-y divide-slate-200">
              {seoReports.map((report) => (
                <SeoReportCard
                  deleting={deletingReportId === report.id}
                  key={report.id}
                  onDelete={() => void handleDelete(report)}
                  onEdit={() => startEditing(report)}
                  report={report}
                />
              ))}
            </div>
          ) : null}
        </Card>
      </div>
    </section>
  )
}

function SeoReportCard({
  deleting,
  onDelete,
  onEdit,
  report,
}: {
  deleting: boolean
  onDelete: () => void
  onEdit: () => void
  report: SeoReport
}) {
  return (
    <article className="p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-slate-950">
            {report.companyName}
          </h3>
          <p className="mt-1 text-xs font-medium text-slate-400">
            {formatDate(report.createdAt)}
          </p>
        </div>
        <div className="flex flex-wrap items-start gap-3">
          <SeoScore compact score={report.seoScore} />
          <Button className="h-9 px-3" onClick={onEdit} variant="secondary">
            Edit
          </Button>
          <Button
            className="h-9 px-3"
            disabled={deleting}
            onClick={onDelete}
            variant="ghost"
          >
            {deleting ? 'Deleting' : 'Delete'}
          </Button>
        </div>
      </div>

      <dl className="mt-5 grid gap-4">
        <ReportDetail label="Top keywords" value={report.topKeywords} />
        <ReportDetail
          label="Technical issues"
          value={report.technicalIssues}
          warning
        />
        <ReportDetail
          label="Recommendations"
          value={report.recommendations}
          positive
        />
      </dl>
    </article>
  )
}

function ReportDetail({
  label,
  positive = false,
  value,
  warning = false,
}: {
  label: string
  positive?: boolean
  value: string
  warning?: boolean
}) {
  return (
    <div
      className={
        positive
          ? 'rounded-lg border border-emerald-100 bg-emerald-50 p-3'
          : warning
            ? 'rounded-lg border border-amber-100 bg-amber-50 p-3'
            : undefined
      }
    >
      <dt className="text-xs font-semibold uppercase text-slate-500">{label}</dt>
      <dd className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-700">
        {value}
      </dd>
    </div>
  )
}

function toPayload(form: SeoReportForm): CreateSeoReportDto | null {
  const companyId = Number(form.companyId)
  const seoScore = Number(form.seoScore)

  if (
    !Number.isInteger(companyId) ||
    companyId <= 0 ||
    !Number.isInteger(seoScore) ||
    seoScore < 0 ||
    seoScore > 100
  ) {
    return null
  }

  return {
    companyId,
    seoScore,
    topKeywords: form.topKeywords.trim(),
    technicalIssues: form.technicalIssues.trim(),
    recommendations: form.recommendations.trim(),
  }
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('sv-SE', {
    dateStyle: 'medium',
  }).format(new Date(value))
}
