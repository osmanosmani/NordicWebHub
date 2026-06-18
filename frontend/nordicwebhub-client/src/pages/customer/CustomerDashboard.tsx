import { useEffect, useState, type ReactNode } from 'react'
import {
  ArrowRight,
  Building2,
  ClipboardPlus,
  FileClock,
  FolderKanban,
  Globe2,
  MapPin,
  MessageSquarePlus,
  Phone,
  SearchCheck,
  TicketCheck,
  Wrench,
} from 'lucide-react'
import { getCustomerDashboard } from '../../api/dashboardApi'
import { getMyMaintenanceLogs } from '../../api/maintenanceLogsApi'
import { getMySeoReports } from '../../api/seoReportsApi'
import { Button, ButtonLink } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { DataTable } from '../../components/ui/DataTable'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorMessage } from '../../components/ui/ErrorMessage'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { PageHeader } from '../../components/ui/PageHeader'
import { SeoScore } from '../../components/ui/SeoScore'
import { StatCard } from '../../components/ui/StatCard'
import { StatusBadge } from '../../components/ui/StatusBadge'
import type {
  CustomerDashboardData,
  DashboardProject,
  DashboardProjectRequest,
  DashboardSupportTicket,
} from '../../types/dashboard'
import type { MaintenanceLog } from '../../types/maintenanceLog'
import type { SeoReport } from '../../types/seoReport'
import {
  formatDashboardDate,
  formatDashboardStatus,
  getDashboardPriorityTone,
  getDashboardStatusTone,
} from '../../utils/dashboardFormatters'
import { getErrorMessage } from '../../utils/getErrorMessage'

const projectStatuses = [
  'Planning',
  'Design',
  'Development',
  'Review',
  'Live',
  'Completed',
]

export function CustomerDashboard() {
  const [dashboard, setDashboard] = useState<CustomerDashboardData | null>(null)
  const [latestMaintenanceLog, setLatestMaintenanceLog] =
    useState<MaintenanceLog | null>(null)
  const [latestSeoReport, setLatestSeoReport] = useState<SeoReport | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [supplementaryError, setSupplementaryError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let isMounted = true

    async function loadDashboard() {
      setIsLoading(true)
      setError('')
      setSupplementaryError('')

      try {
        const [dashboardResult, maintenanceResult, seoResult] =
          await Promise.allSettled([
            getCustomerDashboard(),
            getMyMaintenanceLogs(),
            getMySeoReports(),
          ])

        if (dashboardResult.status === 'rejected') {
          throw dashboardResult.reason
        }

        if (!isMounted) {
          return
        }

        setDashboard(dashboardResult.value)
        setLatestMaintenanceLog(
          maintenanceResult.status === 'fulfilled'
            ? getLatestByDate(maintenanceResult.value)
            : null,
        )
        setLatestSeoReport(
          seoResult.status === 'fulfilled'
            ? getLatestByDate(seoResult.value)
            : null,
        )

        if (
          maintenanceResult.status === 'rejected' ||
          seoResult.status === 'rejected'
        ) {
          setSupplementaryError(
            'Some recent maintenance or SEO activity could not be loaded.',
          )
        }
      } catch (loadError) {
        if (isMounted) {
          setError(
            getErrorMessage(
              loadError,
              'Could not load your dashboard. Please try again.',
            ),
          )
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadDashboard()

    return () => {
      isMounted = false
    }
  }, [reloadKey])

  return (
    <section>
      <PageHeader
        description="Review your company, active work, requests, and support in one place."
        eyebrow="Customer"
        title="Dashboard"
      />

      <QuickActions />

      {error ? (
        <ErrorMessage
          action={
            <Button
              onClick={() => setReloadKey((current) => current + 1)}
              size="sm"
              variant="secondary"
            >
              Try again
            </Button>
          }
          className="mt-6"
          message={error}
        />
      ) : null}

      {supplementaryError && !error ? (
        <ErrorMessage
          action={
            <Button
              onClick={() => setReloadKey((current) => current + 1)}
              size="sm"
              variant="secondary"
            >
              Retry
            </Button>
          }
          className="mt-6"
          message={supplementaryError}
          title="Some activity is unavailable"
        />
      ) : null}

      {isLoading ? <CustomerDashboardLoading /> : null}

      {!isLoading && dashboard ? (
        <>
          <CustomerOverviewStats dashboard={dashboard} />

          <div className="mt-8 grid gap-6 xl:grid-cols-12">
            <CompanyOverview
              className="xl:col-span-4"
              company={dashboard.company}
            />
            <ActiveProjects
              className="xl:col-span-8"
              projects={dashboard.activeProjects}
            />
            <RecentRequests
              className="xl:col-span-7"
              requests={dashboard.recentProjectRequests}
            />
            <OpenTickets
              className="xl:col-span-5"
              tickets={dashboard.openTickets}
            />
            <LatestMaintenanceActivity
              className="xl:col-span-6"
              log={latestMaintenanceLog}
            />
            <LatestSeoReport
              className="xl:col-span-6"
              report={latestSeoReport}
            />
          </div>
        </>
      ) : null}
    </section>
  )
}

function QuickActions() {
  return (
    <Card className="mt-6 border-blue-100 bg-gradient-to-r from-white to-blue-50/45">
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div>
          <p className="text-sm font-semibold text-slate-950">Quick actions</p>
          <p className="mt-1 text-sm leading-5 text-slate-500">
            Start a request, contact support, or review your active workspace.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-end">
          <ButtonLink
            className="w-full sm:w-auto"
            leadingIcon={<ClipboardPlus className="h-4 w-4" />}
            size="sm"
            to="/customer/requests"
          >
            Create Request
          </ButtonLink>
          <ButtonLink
            className="w-full sm:w-auto"
            leadingIcon={<MessageSquarePlus className="h-4 w-4" />}
            size="sm"
            to="/customer/tickets"
            variant="secondary"
          >
            Open Ticket
          </ButtonLink>
          <ButtonLink
            className="w-full sm:w-auto"
            size="sm"
            to="/customer/projects"
            variant="secondary"
          >
            View Projects
          </ButtonLink>
          <ButtonLink
            className="w-full sm:w-auto"
            size="sm"
            to="/customer/seo-reports"
            variant="secondary"
          >
            SEO Reports
          </ButtonLink>
        </div>
      </div>
    </Card>
  )
}

function CustomerOverviewStats({
  dashboard,
}: {
  dashboard: CustomerDashboardData
}) {
  return (
    <div className="mt-8">
      <div className="rounded-2xl border border-white/70 bg-white/55 px-5 py-4 shadow-[0_18px_60px_-52px_rgba(15,23,42,0.5)]">
        <h2 className="text-base font-semibold text-slate-950">
          Workspace overview
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Current activity, delivery work, and support connected to your company.
        </p>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <StatCard
          detail="Currently in delivery"
          icon={<FolderKanban className="h-5 w-5" />}
          label="Active Projects"
          value={dashboard.activeProjects.length}
        />
        <StatCard
          detail="Support items requiring attention"
          icon={<TicketCheck className="h-5 w-5" />}
          label="Open Tickets"
          tone="amber"
          value={dashboard.openTickets.length}
        />
        <StatCard
          detail="Latest submitted requests"
          icon={<ClipboardPlus className="h-5 w-5" />}
          label="Recent Requests"
          tone="slate"
          value={dashboard.recentProjectRequests.length}
        />
      </div>
    </div>
  )
}

function CompanyOverview({
  className,
  company,
}: {
  className?: string
  company: CustomerDashboardData['company']
}) {
  return (
    <Card
      action={
        <ButtonLink
          size="sm"
          to="/customer/company"
          trailingIcon={<ArrowRight className="h-4 w-4" />}
          variant="ghost"
        >
          Manage
        </ButtonLink>
      }
      className={className}
      description="The business connected to your portal account."
      title="Company overview"
    >
      {company ? (
        <div className="p-5">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-700">
              <Building2 className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate font-semibold text-slate-950">
                {company.name}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Org. {company.orgNumber}
              </p>
            </div>
          </div>
          <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2 xl:grid-cols-1">
            <CompanyDetail
              icon={<Building2 className="h-4 w-4" />}
              label="Industry"
              value={company.industry}
            />
            <CompanyDetail
              icon={<MapPin className="h-4 w-4" />}
              label="Location"
              value={company.city}
            />
            <CompanyDetail
              icon={<Phone className="h-4 w-4" />}
              label="Phone"
              value={company.phone || 'Not provided'}
            />
            <CompanyDetail
              icon={<Globe2 className="h-4 w-4" />}
              label="Website"
              value={company.websiteUrl || 'Not provided'}
            />
          </dl>
        </div>
      ) : (
        <EmptyState
          compact
          description="Contact the administrator to connect your company."
          icon={<Building2 className="h-5 w-5" />}
          title="No company connected"
        />
      )}
    </Card>
  )
}

function ActiveProjects({
  className,
  projects,
}: {
  className?: string
  projects: DashboardProject[]
}) {
  return (
    <Card
      action={
        <ButtonLink
          size="sm"
          to="/customer/projects"
          trailingIcon={<ArrowRight className="h-4 w-4" />}
          variant="ghost"
        >
          View all
        </ButtonLink>
      }
      className={className}
      description="Current delivery work and upcoming deadlines."
      title="Active project progress"
    >
      {projects.length === 0 ? (
        <EmptyState
          action={
            <ButtonLink size="sm" to="/customer/requests">
              Create Request
            </ButtonLink>
          }
          compact
          description="Approved work will appear here once a project starts."
          icon={<FolderKanban className="h-5 w-5" />}
          title="No active projects"
        />
      ) : (
        <div className="divide-y divide-slate-200">
          {projects.map((project) => (
            <article className="p-5 sm:p-6" key={project.id}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <h3 className="font-semibold text-slate-950">
                    {project.title}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Deadline {formatDashboardDate(project.deadline)}
                  </p>
                </div>
                <StatusBadge
                  label={project.status}
                  showDot
                  tone={getDashboardStatusTone(project.status)}
                />
              </div>
              <ProjectProgress status={project.status} />
            </article>
          ))}
        </div>
      )}
    </Card>
  )
}

function ProjectProgress({ status }: { status: string }) {
  const currentIndex = Math.max(projectStatuses.indexOf(status), 0)
  const progress = Math.round(
    ((currentIndex + 1) / projectStatuses.length) * 100,
  )

  return (
    <div className="mt-5">
      <div className="mb-2 flex items-center justify-between gap-3 text-xs font-semibold text-slate-500">
        <span>Delivery progress</span>
        <span>{progress}%</span>
      </div>
      <div
        aria-label={`${status} project progress`}
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={progress}
        className="h-2 overflow-hidden rounded bg-slate-200"
        role="progressbar"
      >
        <div
          className="h-full rounded bg-blue-600"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="mt-2 flex justify-between text-xs text-slate-400">
        <span>Planning</span>
        <span>Completed</span>
      </div>
    </div>
  )
}

function OpenTickets({
  className,
  tickets,
}: {
  className?: string
  tickets: DashboardSupportTicket[]
}) {
  return (
    <Card
      action={
        <ButtonLink
          size="sm"
          to="/customer/tickets"
          trailingIcon={<ArrowRight className="h-4 w-4" />}
          variant="ghost"
        >
          View all
        </ButtonLink>
      }
      className={className}
      description="Support items still requiring attention."
      title="Open tickets"
    >
      {tickets.length === 0 ? (
        <EmptyState
          action={
            <ButtonLink size="sm" to="/customer/tickets">
              Open Ticket
            </ButtonLink>
          }
          compact
          description="You do not have any unresolved support tickets."
          icon={<TicketCheck className="h-5 w-5" />}
          title="All clear"
        />
      ) : (
        <div className="divide-y divide-slate-200">
          {tickets.map((ticket) => (
            <article className="p-5" key={ticket.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-semibold text-slate-950">
                    {ticket.title}
                  </h3>
                  <p className="mt-1 text-xs font-medium text-slate-500">
                    Opened {formatDashboardDate(ticket.createdAt)}
                  </p>
                </div>
                <StatusBadge
                  label={ticket.priority}
                  tone={getDashboardPriorityTone(ticket.priority)}
                />
              </div>
              <div className="mt-4">
                <StatusBadge
                  label={formatDashboardStatus(ticket.status)}
                  showDot
                  tone={getDashboardStatusTone(ticket.status)}
                />
              </div>
            </article>
          ))}
        </div>
      )}
    </Card>
  )
}

function RecentRequests({
  className,
  requests,
}: {
  className?: string
  requests: DashboardProjectRequest[]
}) {
  return (
    <Card
      action={
        <ButtonLink
          size="sm"
          to="/customer/requests"
          trailingIcon={<ArrowRight className="h-4 w-4" />}
          variant="ghost"
        >
          View all
        </ButtonLink>
      }
      className={className}
      description="Your most recently submitted project requests."
      title="Recent requests"
    >
      {requests.length === 0 ? (
        <EmptyState
          action={
            <ButtonLink size="sm" to="/customer/requests">
              Create Request
            </ButtonLink>
          }
          compact
          description="Choose a service package and send your first request."
          icon={<ClipboardPlus className="h-5 w-5" />}
          title="No requests submitted"
        />
      ) : (
        <DataTable>
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="px-5 py-3 font-semibold">Request</th>
              <th className="px-5 py-3 font-semibold">Package</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {requests.map((request) => (
              <tr
                className="transition-colors hover:bg-slate-50"
                key={request.id}
              >
                <td className="px-5 py-4 font-semibold text-slate-950">
                  {request.title}
                </td>
                <td className="px-5 py-4 text-slate-700">
                  {request.servicePackageName}
                </td>
                <td className="px-5 py-4">
                  <StatusBadge
                    label={request.status}
                    showDot
                    tone={getDashboardStatusTone(request.status)}
                  />
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-slate-500">
                  {formatDashboardDate(request.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      )}
    </Card>
  )
}

function LatestMaintenanceActivity({
  className,
  log,
}: {
  className?: string
  log: MaintenanceLog | null
}) {
  return (
    <Card
      action={
        <ButtonLink
          size="sm"
          to="/customer/maintenance-logs"
          trailingIcon={<ArrowRight className="h-4 w-4" />}
          variant="ghost"
        >
          View all
        </ButtonLink>
      }
      className={className}
      description="The latest technical work completed for your company."
      title="Latest maintenance activity"
    >
      {log ? (
        <div className="p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-700">
              <Wrench className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-slate-950">{log.title}</h3>
              <p className="mt-1 text-sm text-slate-500">
                {formatDashboardDate(log.createdAt)}
              </p>
            </div>
          </div>
          <p className="mt-5 text-sm leading-6 text-slate-600">
            {log.description}
          </p>
          <div className="mt-5 rounded-lg border border-emerald-100 bg-emerald-50 p-4">
            <p className="text-xs font-semibold text-emerald-700">
              Result
            </p>
            <p className="mt-2 text-sm leading-6 text-emerald-900">
              {log.result}
            </p>
          </div>
        </div>
      ) : (
        <EmptyState
          compact
          description="Completed maintenance work will be summarized here."
          icon={<FileClock className="h-5 w-5" />}
          title="No maintenance activity yet"
        />
      )}
    </Card>
  )
}

function LatestSeoReport({
  className,
  report,
}: {
  className?: string
  report: SeoReport | null
}) {
  return (
    <Card
      action={
        <ButtonLink
          size="sm"
          to="/customer/seo-reports"
          trailingIcon={<ArrowRight className="h-4 w-4" />}
          variant="ghost"
        >
          View all
        </ButtonLink>
      }
      className={className}
      description="Your latest organic search assessment and next steps."
      title="Latest SEO report"
    >
      {report ? (
        <div className="p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700">
                <SearchCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-950">
                  SEO performance report
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {formatDashboardDate(report.createdAt)}
                </p>
              </div>
            </div>
            <SeoScore compact score={report.seoScore} />
          </div>
          <dl className="mt-5 grid gap-4">
            <div>
              <dt className="text-xs font-semibold text-slate-500">
                Top keywords
              </dt>
              <dd className="mt-2 text-sm leading-6 text-slate-700">
                {report.topKeywords}
              </dd>
            </div>
            <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
              <dt className="text-xs font-semibold text-blue-700">
                Recommended next step
              </dt>
              <dd className="mt-2 text-sm leading-6 text-blue-950">
                {report.recommendations}
              </dd>
            </div>
          </dl>
        </div>
      ) : (
        <EmptyState
          compact
          description="Published SEO assessments will be summarized here."
          icon={<SearchCheck className="h-5 w-5" />}
          title="No SEO report yet"
        />
      )}
    </Card>
  )
}

function CompanyDetail({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <span className="mt-0.5 shrink-0 text-slate-400">{icon}</span>
      <div className="min-w-0">
        <dt className="text-slate-500">{label}</dt>
        <dd className="mt-1 break-words font-semibold text-slate-950">
          {value}
        </dd>
      </div>
    </div>
  )
}

function CustomerDashboardLoading() {
  return (
    <Card className="mt-6 flex min-h-64 items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-sm font-medium text-slate-500">
        <LoadingSpinner
          className="text-blue-600"
          label="Loading dashboard"
          size="lg"
        />
        <span>Loading your workspace</span>
      </div>
    </Card>
  )
}

function getLatestByDate<T extends { createdAt: string }>(items: T[]) {
  if (items.length === 0) {
    return null
  }

  return [...items].sort(
    (first, second) =>
      new Date(second.createdAt).getTime() -
      new Date(first.createdAt).getTime(),
  )[0]
}
