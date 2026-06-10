import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { getCompanies } from '../../api/companiesApi'
import {
  createMaintenanceLog,
  deleteMaintenanceLog,
  getMaintenanceLogs,
  updateMaintenanceLog,
} from '../../api/maintenanceLogsApi'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { PageHeader } from '../../components/ui/PageHeader'
import { TextInput } from '../../components/ui/TextInput'
import type { Company } from '../../types/company'
import type {
  CreateMaintenanceLogDto,
  MaintenanceLog,
} from '../../types/maintenanceLog'
import { getErrorMessage } from '../../utils/getErrorMessage'

type MaintenanceLogForm = {
  companyId: string
  title: string
  description: string
  actionTaken: string
  result: string
}

const emptyForm: MaintenanceLogForm = {
  companyId: '',
  title: '',
  description: '',
  actionTaken: '',
  result: '',
}

export function AdminMaintenanceLogs() {
  const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceLog[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [form, setForm] = useState<MaintenanceLogForm>(emptyForm)
  const [editingLogId, setEditingLogId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [deletingLogId, setDeletingLogId] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const editingLog = useMemo(
    () => maintenanceLogs.find((log) => log.id === editingLogId) ?? null,
    [editingLogId, maintenanceLogs],
  )

  useEffect(() => {
    let isMounted = true

    async function loadPageData() {
      setIsLoading(true)
      setError('')

      try {
        const [loadedLogs, loadedCompanies] = await Promise.all([
          getMaintenanceLogs(),
          getCompanies(),
        ])

        if (isMounted) {
          setMaintenanceLogs(loadedLogs)
          setCompanies(loadedCompanies)
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

    void loadPageData()

    return () => {
      isMounted = false
    }
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const payload = toPayload(form)
    if (!payload) {
      setError('Please select a company.')
      return
    }

    setIsSaving(true)
    setError('')
    setSuccessMessage('')

    try {
      if (editingLogId) {
        const updatedLog = await updateMaintenanceLog(editingLogId, payload)
        setMaintenanceLogs((currentLogs) =>
          currentLogs.map((log) =>
            log.id === updatedLog.id ? updatedLog : log,
          ),
        )
        setSuccessMessage('Maintenance log updated.')
      } else {
        const createdLog = await createMaintenanceLog(payload)
        setMaintenanceLogs((currentLogs) => [createdLog, ...currentLogs])
        setSuccessMessage('Maintenance log created.')
      }

      resetForm()
    } catch (saveError) {
      setError(
        getErrorMessage(
          saveError,
          'Could not save the maintenance log. Please try again.',
        ),
      )
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(log: MaintenanceLog) {
    const confirmed = window.confirm(`Delete "${log.title}"?`)

    if (!confirmed) {
      return
    }

    setDeletingLogId(log.id)
    setError('')
    setSuccessMessage('')

    try {
      await deleteMaintenanceLog(log.id)
      setMaintenanceLogs((currentLogs) =>
        currentLogs.filter((currentLog) => currentLog.id !== log.id),
      )

      if (editingLogId === log.id) {
        resetForm()
      }

      setSuccessMessage('Maintenance log deleted.')
    } catch (deleteError) {
      setError(
        getErrorMessage(
          deleteError,
          'Could not delete the maintenance log. Please try again.',
        ),
      )
    } finally {
      setDeletingLogId(null)
    }
  }

  function startEditing(log: MaintenanceLog) {
    setEditingLogId(log.id)
    setError('')
    setSuccessMessage('')
    setForm({
      companyId: String(log.companyId),
      title: log.title,
      description: log.description,
      actionTaken: log.actionTaken,
      result: log.result,
    })
  }

  function resetForm() {
    setEditingLogId(null)
    setForm(emptyForm)
  }

  return (
    <section>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <PageHeader
          description="Document updates, repairs, backups, and other technical work completed for customer websites."
          eyebrow="Admin"
          title="Maintenance Logs"
        />
        <Button onClick={resetForm} variant="secondary">
          New log
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
          className="h-fit rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
          onSubmit={handleSubmit}
        >
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-slate-950">
              {editingLog ? 'Edit maintenance log' : 'Create maintenance log'}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Keep the entry clear enough for the customer to understand.
            </p>
          </div>

          <div className="grid gap-4">
            <label className="grid gap-2" htmlFor="companyId">
              <span className="form-label">Company</span>
              <select
                className="form-input"
                id="companyId"
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
              </select>
            </label>

            <TextInput
              id="title"
              label="Title"
              maxLength={200}
              onChange={(event) =>
                setForm({ ...form, title: event.target.value })
              }
              required
              value={form.title}
            />

            <MaintenanceTextarea
              id="description"
              label="Description"
              maxLength={2000}
              onChange={(value) => setForm({ ...form, description: value })}
              value={form.description}
            />
            <MaintenanceTextarea
              id="actionTaken"
              label="Action taken"
              maxLength={2000}
              onChange={(value) => setForm({ ...form, actionTaken: value })}
              value={form.actionTaken}
            />
            <MaintenanceTextarea
              id="result"
              label="Result"
              maxLength={1000}
              onChange={(value) => setForm({ ...form, result: value })}
              value={form.result}
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button disabled={isSaving || companies.length === 0} type="submit">
              {isSaving
                ? 'Saving'
                : editingLog
                  ? 'Save changes'
                  : 'Create log'}
            </Button>
            {editingLog ? (
              <Button onClick={resetForm} type="button" variant="secondary">
                Cancel
              </Button>
            ) : null}
          </div>
        </form>

        <Card
          description="Newest technical work is shown first."
          title="All maintenance logs"
        >
          {isLoading ? (
            <p className="p-5 text-sm font-medium text-slate-600">
              Loading maintenance logs
            </p>
          ) : null}

          {!isLoading && maintenanceLogs.length === 0 ? (
            <p className="p-5 text-sm text-slate-600">
              No maintenance work has been documented yet.
            </p>
          ) : null}

          {!isLoading && maintenanceLogs.length > 0 ? (
            <div className="divide-y divide-slate-200">
              {maintenanceLogs.map((log) => (
                <MaintenanceLogCard
                  deleting={deletingLogId === log.id}
                  key={log.id}
                  log={log}
                  onDelete={() => void handleDelete(log)}
                  onEdit={() => startEditing(log)}
                />
              ))}
            </div>
          ) : null}
        </Card>
      </div>
    </section>
  )
}

function MaintenanceLogCard({
  deleting,
  log,
  onDelete,
  onEdit,
}: {
  deleting: boolean
  log: MaintenanceLog
  onDelete: () => void
  onEdit: () => void
}) {
  return (
    <article className="p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-blue-700">{log.companyName}</p>
          <h3 className="mt-1 text-base font-semibold text-slate-950">
            {log.title}
          </h3>
          <p className="mt-1 text-xs font-medium text-slate-400">
            {formatDate(log.createdAt)}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
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
        <LogDetail label="Description" value={log.description} />
        <LogDetail label="Action taken" value={log.actionTaken} />
        <LogDetail label="Result" value={log.result} result />
      </dl>
    </article>
  )
}

function MaintenanceTextarea({
  id,
  label,
  maxLength,
  onChange,
  value,
}: {
  id: string
  label: string
  maxLength: number
  onChange: (value: string) => void
  value: string
}) {
  return (
    <label className="grid gap-2" htmlFor={id}>
      <span className="form-label">{label}</span>
      <textarea
        className="min-h-24 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
        id={id}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
        required
        value={value}
      />
    </label>
  )
}

function LogDetail({
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
          ? 'rounded-lg border border-emerald-100 bg-emerald-50 p-3'
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

function toPayload(
  form: MaintenanceLogForm,
): CreateMaintenanceLogDto | null {
  const companyId = Number(form.companyId)

  if (!Number.isInteger(companyId) || companyId <= 0) {
    return null
  }

  return {
    companyId,
    title: form.title.trim(),
    description: form.description.trim(),
    actionTaken: form.actionTaken.trim(),
    result: form.result.trim(),
  }
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('sv-SE', {
    dateStyle: 'medium',
  }).format(new Date(value))
}
