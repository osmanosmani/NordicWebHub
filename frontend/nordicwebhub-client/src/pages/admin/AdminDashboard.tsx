import { useEffect, useState } from 'react'
import { getAdminDashboard } from '../../api/dashboardApi'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { DataTable } from '../../components/ui/DataTable'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorMessage } from '../../components/ui/ErrorMessage'
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
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <StatCard label="Customers" value={dashboard.totalCustomers} />
            <StatCard
              label="Companies"
              tone="slate"
              value={dashboard.totalCompanies}
            />
            <StatCard
              detail={`${dashboard.totalProjectRequests} total`}
              label="Pending Requests"
              tone="amber"
              value={dashboard.pendingProjectRequests}
            />
            <StatCard
              label="Active Projects"
              tone="emerald"
              value={dashboard.activeProjects}
            />
            <StatCard
              label="Open Tickets"
              tone="amber"
              value={dashboard.openTickets}
            />
          </div>

          <div className="mt-6 grid gap-6">
            <RequestsTable requests={dashboard.recentProjectRequests} />
            <TicketsTable tickets={dashboard.recentSupportTickets} />
            <ProjectsTable projects={dashboard.recentProjects} />
          </div>
        </>
      ) : null}
    </section>
  )
}

function RequestsTable({
  requests,
}: {
  requests: DashboardProjectRequest[]
}) {
  return (
    <Card
      description="The latest customer requests requiring review."
      title="Recent requests"
    >
      {requests.length === 0 ? (
        <EmptyState
          compact
          description="No project requests have been submitted yet."
        />
      ) : (
        <DataTable>
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
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
                <tr key={request.id}>
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
      description="Newest support conversations across customer accounts."
      title="Recent tickets"
    >
      {tickets.length === 0 ? (
        <EmptyState
          compact
          description="No support tickets have been created yet."
        />
      ) : (
        <DataTable>
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Ticket</th>
                <th className="px-5 py-3 font-semibold">Company</th>
                <th className="px-5 py-3 font-semibold">Priority</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {tickets.map((ticket) => (
                <tr key={ticket.id}>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-950">{ticket.title}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {ticket.customerEmail}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-slate-700">
                    {ticket.companyName}
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
      description="Recently created projects and their current delivery stage."
      title="Recent projects"
    >
      {projects.length === 0 ? (
        <EmptyState compact description="No projects have been created yet." />
      ) : (
        <DataTable>
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Project</th>
                <th className="px-5 py-3 font-semibold">Company</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Deadline</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {projects.map((project) => (
                <tr key={project.id}>
                  <td className="px-5 py-4 font-semibold text-slate-950">
                    {project.title}
                  </td>
                  <td className="px-5 py-4 text-slate-700">
                    {project.companyName}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge
                      label={project.status}
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
    <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {Array.from({ length: 5 }, (_, index) => (
        <div
          className="h-28 animate-pulse rounded-lg border border-slate-200 bg-white"
          key={index}
        />
      ))}
    </div>
  )
}
