import { useEffect, useState } from 'react'
import {
  Activity,
  ArrowRight,
  Building2,
  ClipboardList,
  FolderKanban,
  PackagePlus,
  TicketCheck,
  Users,
} from 'lucide-react'
import { getAdminDashboard } from '../../api/dashboardApi'
import { Button, ButtonLink } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { DataTable } from '../../components/ui/DataTable'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorMessage } from '../../components/ui/ErrorMessage'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { PageHeader } from '../../components/ui/PageHeader'
import { StatCard } from '../../components/ui/StatCard'
import { StatusBadge } from '../../components/ui/StatusBadge'
import type {
  AdminDashboardData,
  DashboardProject,
  DashboardProjectRequest,
  DashboardSupportTicket,
} from '../../types/dashboard'
import {
  formatDashboardDate,
  formatDashboardStatus,
  getDashboardPriorityTone,
  getDashboardStatusTone,
} from '../../utils/dashboardFormatters'
import { getErrorMessage } from '../../utils/getErrorMessage'

const iconClassName = 'h-5 w-5'

export function AdminDashboard() {
  const [dashboard, setDashboard] = useState<AdminDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let isMounted = true

    async function loadDashboard() {
      setIsLoading(true)
      setError('')

      try {
        const data = await getAdminDashboard()

        if (isMounted) {
          setDashboard(data)
        }
      } catch (loadError) {
        if (isMounted) {
          setError(
            getErrorMessage(
              loadError,
              'Could not load the admin dashboard. Please try again.',
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
        description="Monitor customer activity, delivery work, incoming requests, and support."
        eyebrow="Admin"
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

      {isLoading ? <DashboardLoading /> : null}

      {!isLoading && dashboard ? (
        <>
          <div className="mt-8 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-slate-950">
                Business overview
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Current client activity and delivery workload.
              </p>
            </div>
            <p className="hidden text-xs font-medium text-slate-400 sm:block">
              Live portal data
            </p>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <StatCard
              detail="Registered customer accounts"
              icon={<Users className={iconClassName} />}
              label="Customers"
              value={dashboard.totalCustomers}
            />
            <StatCard
              detail="Managed business profiles"
              icon={<Building2 className={iconClassName} />}
              label="Companies"
              tone="slate"
              value={dashboard.totalCompanies}
            />
            <StatCard
              detail={`${dashboard.totalProjectRequests} total requests`}
              icon={<ClipboardList className={iconClassName} />}
              label="Pending Requests"
              tone="amber"
              value={dashboard.pendingProjectRequests}
            />
            <StatCard
              detail="Projects currently in delivery"
              icon={<FolderKanban className={iconClassName} />}
              label="Active Projects"
              tone="emerald"
              value={dashboard.activeProjects}
            />
            <StatCard
              detail="Support items requiring attention"
              icon={<TicketCheck className={iconClassName} />}
              label="Open Tickets"
              tone="amber"
              value={dashboard.openTickets}
            />
          </div>

          <div className="mt-8 grid gap-6">
            <RequestsTable requests={dashboard.recentProjectRequests} />
            <div className="grid gap-6 2xl:grid-cols-2">
              <TicketsTable tickets={dashboard.recentSupportTickets} />
              <ProjectsTable projects={dashboard.recentProjects} />
            </div>
          </div>
        </>
      ) : null}
    </section>
  )
}

function QuickActions() {
  return (
    <Card className="mt-6">
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div>
          <p className="text-sm font-semibold text-slate-950">Quick actions</p>
          <p className="mt-1 text-sm leading-5 text-slate-500">
            Jump directly to common administration tasks.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-end">
          <ButtonLink
            className="w-full sm:w-auto"
            leadingIcon={<PackagePlus className="h-4 w-4" />}
            size="sm"
            to="/admin/packages"
          >
            Add Package
          </ButtonLink>
          <ButtonLink
            className="w-full sm:w-auto"
            size="sm"
            to="/admin/tickets"
            variant="secondary"
          >
            View Tickets
          </ButtonLink>
          <ButtonLink
            className="w-full sm:w-auto"
            size="sm"
            to="/admin/requests"
            variant="secondary"
          >
            View Requests
          </ButtonLink>
          <ButtonLink
            className="col-span-2 w-full sm:w-auto"
            leadingIcon={<Activity className="h-4 w-4" />}
            size="sm"
            to="/admin/website-check"
            variant="secondary"
          >
            Run Website Check
          </ButtonLink>
        </div>
      </div>
    </Card>
  )
}

function RequestsTable({
  requests,
}: {
  requests: DashboardProjectRequest[]
}) {
  return (
    <Card
      action={
        <ButtonLink
          size="sm"
          to="/admin/requests"
          trailingIcon={<ArrowRight className="h-4 w-4" />}
          variant="ghost"
        >
          View all
        </ButtonLink>
      }
      description="The latest customer requests requiring review."
      title="Recent project requests"
    >
      {requests.length === 0 ? (
        <EmptyState
          compact
          description="New customer requests will appear here."
          icon={<ClipboardList className="h-5 w-5" />}
          title="No project requests yet"
        />
      ) : (
        <DataTable>
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="px-5 py-3 font-semibold">Request</th>
              <th className="px-5 py-3 font-semibold">Company</th>
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
                <td className="px-5 py-4">
                  <p className="font-semibold text-slate-950">{request.title}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {request.customerEmail}
                  </p>
                </td>
                <td className="px-5 py-4 text-slate-700">
                  {request.companyName}
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

function TicketsTable({ tickets }: { tickets: DashboardSupportTicket[] }) {
  return (
    <Card
      action={
        <ButtonLink
          size="sm"
          to="/admin/tickets"
          trailingIcon={<ArrowRight className="h-4 w-4" />}
          variant="ghost"
        >
          View all
        </ButtonLink>
      }
      description="Newest conversations across customer accounts."
      title="Recent support tickets"
    >
      {tickets.length === 0 ? (
        <EmptyState
          compact
          description="New support conversations will appear here."
          icon={<TicketCheck className="h-5 w-5" />}
          title="No support tickets yet"
        />
      ) : (
        <DataTable>
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="px-5 py-3 font-semibold">Ticket</th>
              <th className="px-5 py-3 font-semibold">Priority</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {tickets.map((ticket) => (
              <tr
                className="transition-colors hover:bg-slate-50"
                key={ticket.id}
              >
                <td className="px-5 py-4">
                  <p className="font-semibold text-slate-950">{ticket.title}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {ticket.companyName}
                  </p>
                </td>
                <td className="px-5 py-4">
                  <StatusBadge
                    label={ticket.priority}
                    tone={getDashboardPriorityTone(ticket.priority)}
                  />
                </td>
                <td className="px-5 py-4">
                  <StatusBadge
                    label={formatDashboardStatus(ticket.status)}
                    showDot
                    tone={getDashboardStatusTone(ticket.status)}
                  />
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-slate-500">
                  {formatDashboardDate(ticket.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      )}
    </Card>
  )
}

function ProjectsTable({ projects }: { projects: DashboardProject[] }) {
  return (
    <Card
      action={
        <ButtonLink
          size="sm"
          to="/admin/projects"
          trailingIcon={<ArrowRight className="h-4 w-4" />}
          variant="ghost"
        >
          View all
        </ButtonLink>
      }
      description="Recently created work and its delivery stage."
      title="Recent projects"
    >
      {projects.length === 0 ? (
        <EmptyState
          compact
          description="Created projects will appear here."
          icon={<FolderKanban className="h-5 w-5" />}
          title="No projects yet"
        />
      ) : (
        <DataTable>
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="px-5 py-3 font-semibold">Project</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold">Deadline</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {projects.map((project) => (
              <tr
                className="transition-colors hover:bg-slate-50"
                key={project.id}
              >
                <td className="px-5 py-4">
                  <p className="font-semibold text-slate-950">{project.title}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {project.companyName}
                  </p>
                </td>
                <td className="px-5 py-4">
                  <StatusBadge
                    label={project.status}
                    showDot
                    tone={getDashboardStatusTone(project.status)}
                  />
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-slate-500">
                  {formatDashboardDate(project.deadline)}
                </td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      )}
    </Card>
  )
}

function DashboardLoading() {
  return (
    <Card className="mt-6 flex min-h-64 items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-sm font-medium text-slate-500">
        <LoadingSpinner
          className="text-blue-600"
          label="Loading dashboard"
          size="lg"
        />
        <span>Loading dashboard overview</span>
      </div>
    </Card>
  )
}
