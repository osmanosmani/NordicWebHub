import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCustomerDashboard } from '../../api/dashboardApi'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { PageHeader } from '../../components/ui/PageHeader'
import { StatusBadge } from '../../components/ui/StatusBadge'
import type {
  CustomerDashboardData,
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

export function CustomerDashboard() {
  const [dashboard, setDashboard] = useState<CustomerDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let isMounted = true

    async function loadDashboard() {
      setIsLoading(true)
      setError('')

      try {
        const data = await getCustomerDashboard()

        if (isMounted) {
          setDashboard(data)
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
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <PageHeader
          description="Review your company, active work, requests, and support in one place."
          eyebrow="Customer"
          title="Dashboard"
        />
        <QuickActions />
      </div>

      {error ? (
        <div className="mt-6 flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between">
          <span>{error}</span>
          <Button
            className="h-9 shrink-0 px-3"
            onClick={() => setReloadKey((current) => current + 1)}
            variant="secondary"
          >
            Try again
          </Button>
        </div>
      ) : null}

      {isLoading ? <CustomerDashboardLoading /> : null}

      {!isLoading && dashboard ? (
        <div className="mt-8 grid gap-6 xl:grid-cols-3">
          <div className="grid content-start gap-6 xl:col-span-2">
            <ActiveProjects projects={dashboard.activeProjects} />
            <RecentRequests requests={dashboard.recentProjectRequests} />
          </div>

          <div className="grid content-start gap-6">
            <CompanyOverview company={dashboard.company} />
            <OpenTickets tickets={dashboard.openTickets} />
          </div>
        </div>
      ) : null}
    </section>
  )
}

function QuickActions() {
  const actions = [
    { label: 'Create Request', to: '/customer/requests' },
    { label: 'Open Ticket', to: '/customer/tickets' },
    { label: 'View Projects', to: '/customer/projects' },
  ]

  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action, index) => (
        <Link
          className={
            index === 0
              ? 'inline-flex h-10 items-center justify-center rounded-lg bg-blue-700 px-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200'
              : 'inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-200'
          }
          key={action.to}
          to={action.to}
        >
          {action.label}
        </Link>
      ))}
    </div>
  )
}

function CompanyOverview({
  company,
}: {
  company: CustomerDashboardData['company']
}) {
  return (
    <Card description="Your account's connected business." title="Company overview">
      {company ? (
        <dl className="grid gap-4 p-5 text-sm sm:grid-cols-2 xl:grid-cols-1">
          <CompanyDetail label="Company" value={company.name} />
          <CompanyDetail label="Org. number" value={company.orgNumber} />
          <CompanyDetail label="Industry" value={company.industry} />
          <CompanyDetail label="Location" value={company.city} />
          <CompanyDetail label="Phone" value={company.phone || 'Not provided'} />
          <CompanyDetail
            label="Website"
            value={company.websiteUrl || 'Not provided'}
          />
        </dl>
      ) : (
        <EmptyState message="No company is connected to this account." />
      )}
    </Card>
  )
}

function ActiveProjects({ projects }: { projects: DashboardProject[] }) {
  return (
    <Card
      action={
        <Link
          className="text-sm font-semibold text-blue-700 hover:text-blue-800"
          to="/customer/projects"
        >
          View all
        </Link>
      }
      description="Current delivery work and upcoming deadlines."
      title="Active projects"
    >
      {projects.length === 0 ? (
        <EmptyState message="You do not have any active projects." />
      ) : (
        <div className="divide-y divide-slate-200">
          {projects.map((project) => (
            <article
              className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between"
              key={project.id}
            >
              <div>
                <h3 className="font-semibold text-slate-950">{project.title}</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Deadline {formatDashboardDate(project.deadline)}
                </p>
              </div>
              <StatusBadge
                label={project.status}
                tone={getDashboardStatusTone(project.status)}
              />
            </article>
          ))}
        </div>
      )}
    </Card>
  )
}

function OpenTickets({ tickets }: { tickets: DashboardSupportTicket[] }) {
  return (
    <Card
      action={
        <Link
          className="text-sm font-semibold text-blue-700 hover:text-blue-800"
          to="/customer/tickets"
        >
          View all
        </Link>
      }
      description="Support items still requiring attention."
      title="Open tickets"
    >
      {tickets.length === 0 ? (
        <EmptyState message="You do not have any open support tickets." />
      ) : (
        <div className="divide-y divide-slate-200">
          {tickets.map((ticket) => (
            <article className="p-5" key={ticket.id}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h3 className="font-semibold text-slate-950">{ticket.title}</h3>
                <StatusBadge
                  label={ticket.priority}
                  tone={getDashboardPriorityTone(ticket.priority)}
                />
              </div>
              <div className="mt-3 flex items-center justify-between gap-3">
                <StatusBadge
                  label={formatDashboardStatus(ticket.status)}
                  tone={getDashboardStatusTone(ticket.status)}
                />
                <span className="text-xs font-medium text-slate-400">
                  {formatDashboardDate(ticket.createdAt)}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </Card>
  )
}

function RecentRequests({
  requests,
}: {
  requests: DashboardProjectRequest[]
}) {
  return (
    <Card
      action={
        <Link
          className="text-sm font-semibold text-blue-700 hover:text-blue-800"
          to="/customer/requests"
        >
          View all
        </Link>
      }
      description="Your most recently submitted project requests."
      title="Recent requests"
    >
      {requests.length === 0 ? (
        <EmptyState message="You have not submitted any project requests." />
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Request</th>
                <th className="px-5 py-3 font-semibold">Package</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {requests.map((request) => (
                <tr key={request.id}>
                  <td className="px-5 py-4 font-semibold text-slate-950">
                    {request.title}
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
          </table>
        </div>
      )}
    </Card>
  )
}

function CompanyDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-slate-500">{label}</dt>
      <dd className="mt-1 break-words font-semibold text-slate-950">{value}</dd>
    </div>
  )
}

function CustomerDashboardLoading() {
  return (
    <div className="mt-8 grid gap-6 xl:grid-cols-3">
      <div className="grid gap-6 xl:col-span-2">
        <div className="h-56 animate-pulse rounded-lg border border-slate-200 bg-white" />
        <div className="h-64 animate-pulse rounded-lg border border-slate-200 bg-white" />
      </div>
      <div className="grid gap-6">
        <div className="h-72 animate-pulse rounded-lg border border-slate-200 bg-white" />
        <div className="h-56 animate-pulse rounded-lg border border-slate-200 bg-white" />
      </div>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return <p className="p-5 text-sm text-slate-600">{message}</p>
}
