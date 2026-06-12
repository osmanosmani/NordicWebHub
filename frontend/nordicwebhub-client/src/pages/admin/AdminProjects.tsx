import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { getCompanies } from '../../api/companiesApi'
import { getProjectRequests } from '../../api/projectRequestsApi'
import {
  createProject,
  createProjectFromRequest,
  deleteProject,
  getProjects,
  updateProject,
  updateProjectStatus,
} from '../../api/projectsApi'
import { Alert } from '../../components/ui/Alert'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { DataTable } from '../../components/ui/DataTable'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorMessage } from '../../components/ui/ErrorMessage'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { PageHeader } from '../../components/ui/PageHeader'
import { Select } from '../../components/ui/Select'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { TextArea } from '../../components/ui/TextArea'
import { TextInput } from '../../components/ui/TextInput'
import type { Company } from '../../types/company'
import type { ProjectRequest } from '../../types/projectRequest'
import type {
  CreateProjectDto,
  Project,
  ProjectStatus,
} from '../../types/project'
import { getErrorMessage } from '../../utils/getErrorMessage'

type ProjectFormMode = 'manual' | 'fromRequest'

type ProjectFormState = {
  mode: ProjectFormMode
  companyId: string
  projectRequestId: string
  title: string
  description: string
  status: ProjectStatus
  startDate: string
  deadline: string
}

const projectStatuses: ProjectStatus[] = [
  'Planning',
  'Design',
  'Development',
  'Review',
  'Live',
  'Completed',
]

export function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [projectRequests, setProjectRequests] = useState<ProjectRequest[]>([])
  const [form, setForm] = useState<ProjectFormState>(createEmptyForm())
  const [editingProjectId, setEditingProjectId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [updatingProjectId, setUpdatingProjectId] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const editingProject = useMemo(
    () => projects.find((project) => project.id === editingProjectId) ?? null,
    [editingProjectId, projects],
  )

  const approvedRequests = useMemo(
    () => projectRequests.filter((request) => request.status === 'Approved'),
    [projectRequests],
  )

  const selectedRequest = useMemo(
    () =>
      approvedRequests.find(
        (request) => String(request.id) === form.projectRequestId,
      ) ?? null,
    [approvedRequests, form.projectRequestId],
  )

  useEffect(() => {
    let isMounted = true

    async function loadPageData() {
      setIsLoading(true)
      setError('')

      try {
        const [loadedProjects, loadedCompanies, loadedRequests] = await Promise.all([
          getProjects(),
          getCompanies(),
          getProjectRequests(),
        ])

        if (isMounted) {
          setProjects(loadedProjects)
          setCompanies(loadedCompanies)
          setProjectRequests(loadedRequests)
        }
      } catch (loadError) {
        if (isMounted) {
          setError(
            getErrorMessage(loadError, 'Could not load projects. Please try again.'),
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

  async function loadProjects() {
    setProjects(await getProjects())
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSaving(true)
    setError('')
    setSuccessMessage('')

    try {
      if (editingProjectId) {
        await updateProject(editingProjectId, {
          companyId: Number(form.companyId),
          projectRequestId: form.projectRequestId
            ? Number(form.projectRequestId)
            : null,
          title: form.title.trim(),
          description: form.description.trim(),
          startDate: toApiDate(form.startDate),
          deadline: toApiDate(form.deadline),
        })
        setSuccessMessage('Project updated.')
      } else if (form.mode === 'fromRequest') {
        await createProjectFromRequest(
          Number(form.projectRequestId),
          toCreatePayload(form),
        )
        setSuccessMessage('Project created from approved request.')
      } else {
        await createProject({
          ...toCreatePayload(form),
          companyId: Number(form.companyId),
        })
        setSuccessMessage('Project created.')
      }

      resetForm()
      await loadProjects()
    } catch (saveError) {
      setError(getErrorMessage(saveError, 'Could not save project. Please try again.'))
    } finally {
      setIsSaving(false)
    }
  }

  async function handleStatusChange(project: Project, status: ProjectStatus) {
    if (project.status === status) {
      return
    }

    setUpdatingProjectId(project.id)
    setError('')
    setSuccessMessage('')

    try {
      const updatedProject = await updateProjectStatus(project.id, { status })

      setProjects((currentProjects) =>
        currentProjects.map((currentProject) =>
          currentProject.id === updatedProject.id ? updatedProject : currentProject,
        ),
      )
      setSuccessMessage('Project status updated.')
    } catch (updateError) {
      setError(
        getErrorMessage(
          updateError,
          'Could not update project status. Please try again.',
        ),
      )
    } finally {
      setUpdatingProjectId(null)
    }
  }

  async function handleDelete(project: Project) {
    const confirmed = window.confirm(`Delete "${project.title}"?`)

    if (!confirmed) {
      return
    }

    setError('')
    setSuccessMessage('')

    try {
      await deleteProject(project.id)
      setSuccessMessage('Project deleted.')
      if (editingProjectId === project.id) {
        resetForm()
      }
      await loadProjects()
    } catch (deleteError) {
      setError(getErrorMessage(deleteError, 'Could not delete project.'))
    }
  }

  function startEditing(project: Project) {
    setEditingProjectId(project.id)
    setSuccessMessage('')
    setForm({
      mode: 'manual',
      companyId: String(project.companyId),
      projectRequestId: project.projectRequestId ? String(project.projectRequestId) : '',
      title: project.title,
      description: project.description,
      status: project.status,
      startDate: toDateInputValue(project.startDate),
      deadline: toDateInputValue(project.deadline),
    })
  }

  function resetForm() {
    setEditingProjectId(null)
    setForm(createEmptyForm())
  }

  function handleRequestSelection(requestId: string) {
    const request = approvedRequests.find(
      (approvedRequest) => String(approvedRequest.id) === requestId,
    )

    setForm({
      ...form,
      companyId: request ? String(request.companyId) : '',
      description:
        request && !form.description.trim() ? request.description : form.description,
      projectRequestId: requestId,
      title: request && !form.title.trim() ? request.title : form.title,
    })
  }

  return (
    <section>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <PageHeader
          description="Create delivery projects, connect approved requests, and manage progress."
          eyebrow="Admin"
          title="Projects"
        />
        <Button onClick={resetForm} variant="secondary">
          New project
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

      <div className="mt-8 grid gap-6 2xl:grid-cols-[410px_minmax(0,1fr)]">
        <form
          className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
          onSubmit={handleSubmit}
        >
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-slate-950">
              {editingProject ? 'Edit project' : 'Create project'}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Projects are connected to a customer company.
            </p>
          </div>

          <div className="grid gap-4">
            {!editingProject ? (
              <Select
                id="projectMode"
                label="Create mode"
                onChange={(event) =>
                  setForm({
                    ...createEmptyForm(),
                    mode: event.target.value as ProjectFormMode,
                  })
                }
                value={form.mode}
              >
                <option value="manual">Manual project</option>
                <option value="fromRequest">From approved request</option>
              </Select>
            ) : null}

            {!editingProject && form.mode === 'fromRequest' ? (
              <>
                <Select
                  disabled={approvedRequests.length === 0}
                  hint={
                    approvedRequests.length === 0
                      ? 'No approved requests are currently available.'
                      : undefined
                  }
                  id="projectRequestId"
                  label="Approved request"
                  onChange={(event) =>
                    handleRequestSelection(event.target.value)
                  }
                  required
                  value={form.projectRequestId}
                >
                  <option value="">Choose a request</option>
                  {approvedRequests.map((request) => (
                    <option key={request.id} value={request.id}>
                      {request.title} - {request.companyName}
                    </option>
                  ))}
                </Select>

                {selectedRequest ? (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                    <p className="font-semibold text-slate-950">
                      {selectedRequest.companyName}
                    </p>
                    <p className="mt-1">{selectedRequest.servicePackageName}</p>
                  </div>
                ) : null}
              </>
            ) : null}

            {(editingProject || form.mode === 'manual') ? (
              <Select
                disabled={Boolean(editingProject?.projectRequestId)}
                id="companyId"
                label="Company"
                onChange={(event) =>
                  setForm({ ...form, companyId: event.target.value })
                }
                required
                value={form.companyId}
              >
                <option value="">Choose a company</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </Select>
            ) : null}

            <TextInput
              id="title"
              label="Title"
              maxLength={200}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              required
              value={form.title}
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

            {!editingProject ? (
              <Select
                id="status"
                label="Status"
                onChange={(event) =>
                  setForm({
                    ...form,
                    status: event.target.value as ProjectStatus,
                  })
                }
                value={form.status}
              >
                {projectStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </Select>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput
                id="startDate"
                label="Start date"
                onChange={(event) =>
                  setForm({ ...form, startDate: event.target.value })
                }
                required
                type="date"
                value={form.startDate}
              />
              <TextInput
                id="deadline"
                label="Deadline"
                onChange={(event) =>
                  setForm({ ...form, deadline: event.target.value })
                }
                required
                type="date"
                value={form.deadline}
              />
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button isLoading={isSaving} loadingLabel="Saving" type="submit">
              {editingProject ? 'Save changes' : 'Create project'}
            </Button>
            {editingProject ? (
              <Button onClick={resetForm} type="button" variant="secondary">
                Cancel
              </Button>
            ) : null}
          </div>
        </form>

        <Card
          description="Status changes update the customer progress view."
          title="All projects"
        >
          {isLoading ? (
            <div className="flex items-center gap-3 p-5 text-sm font-medium text-slate-600">
              <LoadingSpinner label="Loading projects" />
              <span>Loading projects</span>
            </div>
          ) : null}

          {!isLoading && projects.length === 0 ? (
            <EmptyState
              compact
              description="Create a manual project or use an approved request."
              title="No projects yet"
            />
          ) : null}

          {!isLoading && projects.length > 0 ? (
            <>
              <div className="divide-y divide-slate-200 md:hidden">
                {projects.map((project) => (
                  <article className="p-5" key={project.id}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-slate-950">
                          {project.title}
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          {project.companyName}
                        </p>
                      </div>
                      <StatusBadge
                        label={project.status}
                        showDot
                        tone={getProjectStatusTone(project.status)}
                      />
                    </div>
                    <p className="mt-4 text-sm leading-6 text-slate-600">
                      {project.description}
                    </p>
                    <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                      <ProjectListDetail
                        label="Start"
                        value={formatDate(project.startDate)}
                      />
                      <ProjectListDetail
                        label="Deadline"
                        value={formatDate(project.deadline)}
                      />
                      <ProjectListDetail
                        label="Source"
                        value={
                          project.projectRequestTitle || 'Manual project'
                        }
                      />
                    </dl>
                    <Select
                      disabled={updatingProjectId === project.id}
                      id={`mobile-project-status-${project.id}`}
                      label="Update status"
                      onChange={(event) =>
                        void handleStatusChange(
                          project,
                          event.target.value as ProjectStatus,
                        )
                      }
                      value={project.status}
                      wrapperClassName="mt-5"
                    >
                      {projectStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </Select>
                    <div className="mt-5 flex flex-wrap gap-2">
                      <Button
                        onClick={() => startEditing(project)}
                        size="sm"
                        variant="secondary"
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => void handleDelete(project)}
                        size="sm"
                        variant="ghost"
                      >
                        Delete
                      </Button>
                    </div>
                  </article>
                ))}
              </div>
              <DataTable
                className="min-w-[900px]"
                scrollLabel="Projects table"
                showMobileHint={false}
                wrapperClassName="hidden md:block"
              >
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Project</th>
                    <th className="px-5 py-3 font-semibold">Company</th>
                    <th className="px-5 py-3 font-semibold">Timeline</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {projects.map((project) => (
                    <tr
                      className="transition-colors hover:bg-slate-50"
                      key={project.id}
                    >
                      <td className="max-w-md px-5 py-4 align-top">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-slate-950">
                            {project.title}
                          </p>
                          <StatusBadge
                            label={project.status}
                            tone={getProjectStatusTone(project.status)}
                          />
                        </div>
                        <p className="mt-1 line-clamp-2 text-slate-500">
                          {project.description}
                        </p>
                        <p className="mt-2 text-xs font-medium text-slate-400">
                          {project.projectRequestTitle || 'Manual project'}
                        </p>
                      </td>
                      <td className="px-5 py-4 align-top text-slate-700">
                        {project.companyName}
                      </td>
                      <td className="px-5 py-4 align-top text-slate-700">
                        <p>{formatDate(project.startDate)}</p>
                        <p className="mt-1 font-medium text-slate-950">
                          {formatDate(project.deadline)}
                        </p>
                      </td>
                      <td className="px-5 py-4 align-top">
                        <Select
                          className="h-10 min-w-32 font-semibold"
                          disabled={updatingProjectId === project.id}
                          hideLabel
                          id={`project-status-${project.id}`}
                          label={`Status for ${project.title}`}
                          onChange={(event) =>
                            void handleStatusChange(
                              project,
                              event.target.value as ProjectStatus,
                            )
                          }
                          value={project.status}
                        >
                          {projectStatuses.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </Select>
                      </td>
                      <td className="px-5 py-4 align-top">
                        <div className="flex gap-2">
                          <Button
                            className="h-10 px-3"
                            onClick={() => startEditing(project)}
                            variant="secondary"
                          >
                            Edit
                          </Button>
                          <Button
                            className="h-10 px-3"
                            onClick={() => void handleDelete(project)}
                            variant="ghost"
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </DataTable>
            </>
          ) : null}
        </Card>
      </div>
    </section>
  )
}

function createEmptyForm(): ProjectFormState {
  return {
    mode: 'manual',
    companyId: '',
    projectRequestId: '',
    title: '',
    description: '',
    status: 'Planning',
    startDate: toDateInputValue(new Date().toISOString()),
    deadline: toDateInputValue(addDays(new Date(), 30).toISOString()),
  }
}

function toCreatePayload(form: ProjectFormState): CreateProjectDto {
  return {
    projectRequestId: form.projectRequestId ? Number(form.projectRequestId) : null,
    title: form.title.trim(),
    description: form.description.trim(),
    status: form.status,
    startDate: toApiDate(form.startDate),
    deadline: toApiDate(form.deadline),
  }
}

function toDateInputValue(value: string) {
  if (!value) {
    return ''
  }

  return new Date(value).toISOString().slice(0, 10)
}

function toApiDate(value: string) {
  return `${value}T00:00:00Z`
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date)
  nextDate.setDate(nextDate.getDate() + days)

  return nextDate
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('sv-SE', {
    dateStyle: 'medium',
  }).format(new Date(value))
}

function getProjectStatusTone(status: ProjectStatus) {
  const tones: Record<ProjectStatus, 'blue' | 'emerald' | 'amber' | 'slate'> = {
    Completed: 'emerald',
    Design: 'amber',
    Development: 'blue',
    Live: 'emerald',
    Planning: 'slate',
    Review: 'amber',
  }

  return tones[status]
}

function ProjectListDetail({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div>
      <dt className="text-slate-500">{label}</dt>
      <dd className="mt-1 break-words font-semibold text-slate-950">{value}</dd>
    </div>
  )
}
