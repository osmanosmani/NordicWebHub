import { useEffect, useState } from 'react'
import { getMyProjects } from '../../api/projectsApi'
import { PageHeader } from '../../components/ui/PageHeader'
import { StatusBadge } from '../../components/ui/StatusBadge'
import type { Project, ProjectStatus } from '../../types/project'
import { getErrorMessage } from '../../utils/getErrorMessage'

const projectStatuses: ProjectStatus[] = [
  'Planning',
  'Design',
  'Development',
  'Review',
  'Live',
  'Completed',
]

export function CustomerProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadProjects() {
      setIsLoading(true)
      setError('')

      try {
        const loadedProjects = await getMyProjects()

        if (isMounted) {
          setProjects(loadedProjects)
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

    void loadProjects()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <section>
      <PageHeader
        description="Follow active project work and see where each delivery stands."
        eyebrow="Customer"
        title="Projects"
      />

      {error ? (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="mt-8 rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-950">My projects</h2>
          <p className="mt-1 text-sm text-slate-500">
            Progress is based on the current project status.
          </p>
        </div>

        {isLoading ? (
          <div className="p-5 text-sm font-medium text-slate-600">
            Loading projects
          </div>
        ) : null}

        {!isLoading && projects.length === 0 ? (
          <div className="p-5 text-sm text-slate-600">
            No projects have started yet.
          </div>
        ) : null}

        {!isLoading && projects.length > 0 ? (
          <div className="divide-y divide-slate-200">
            {projects.map((project) => (
              <article className="p-5" key={project.id}>
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-slate-950">
                      {project.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {project.companyName}
                    </p>
                  </div>
                  <StatusBadge
                    label={project.status}
                    tone={getProjectStatusTone(project.status)}
                  />
                </div>

                <p className="mt-4 max-w-4xl text-sm leading-6 text-slate-600">
                  {project.description}
                </p>

                <div className="mt-5">
                  <ProjectProgress status={project.status} />
                </div>

                <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
                  <ProjectDetail label="Start date" value={formatDate(project.startDate)} />
                  <ProjectDetail label="Deadline" value={formatDate(project.deadline)} />
                  <ProjectDetail
                    label="Request"
                    value={project.projectRequestTitle || 'Not linked'}
                  />
                </dl>
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}

function ProjectProgress({ status }: { status: ProjectStatus }) {
  const currentIndex = Math.max(projectStatuses.indexOf(status), 0)

  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-xs font-semibold text-slate-500">
        <span>Progress</span>
        <span>{Math.round(((currentIndex + 1) / projectStatuses.length) * 100)}%</span>
      </div>
      <div className="grid grid-cols-6 gap-1">
        {projectStatuses.map((projectStatus, index) => (
          <div
            className={
              index <= currentIndex
                ? 'h-2 rounded bg-emerald-600'
                : 'h-2 rounded bg-slate-200'
            }
            key={projectStatus}
            title={projectStatus}
          />
        ))}
      </div>
      <div className="mt-2 hidden grid-cols-6 gap-1 text-[11px] font-medium text-slate-500 md:grid">
        {projectStatuses.map((projectStatus) => (
          <span className="truncate" key={projectStatus}>
            {projectStatus}
          </span>
        ))}
      </div>
    </div>
  )
}

function ProjectDetail({ label, value }: { label: string; value: string }) {
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
