import { useEffect, type ComponentType } from 'react'
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  CreditCard,
  FileText,
  FolderKanban,
  Globe2,
  Headphones,
  LayoutDashboard,
  MessageSquareText,
  MonitorCheck,
  PackageCheck,
  Search,
  Server,
  ShieldCheck,
  Sparkles,
  TicketCheck,
  Users,
} from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { ButtonLink } from '../../components/ui/Button'
import { useAuth } from '../../context/useAuth'
import { getDefaultRouteForUser } from '../../utils/authRoutes'
import { cn } from '../../utils/cn'

type Icon = ComponentType<{ className?: string }>

const capabilityChips = [
  'Web Development',
  'SEO Reports',
  'Hosting Status',
  'Support Tickets',
  'Service Orders',
  'AI Assistant',
]

const portalWorkflowHighlights: Array<{
  title: string
  description: string
  icon: Icon
}> = [
  {
    title: 'Package choice',
    description: 'Start from a clear service package instead of a vague email.',
    icon: PackageCheck,
  },
  {
    title: 'Structured request',
    description: 'Collect goals, scope, budget, and timeline in one place.',
    icon: ClipboardCheck,
  },
  {
    title: 'Visible delivery',
    description: 'Turn approved work into projects, tickets, orders, and reports.',
    icon: FolderKanban,
  },
  {
    title: 'Ongoing support',
    description: 'Keep support, hosting status, and maintenance history connected.',
    icon: Headphones,
  },
]

const floatingSignals: Array<{
  title: string
  description: string
  icon: Icon
  tone: 'cyan' | 'blue' | 'emerald' | 'violet'
}> = [
  {
    title: 'Service order active',
    description: 'Business Website package',
    icon: CreditCard,
    tone: 'cyan',
  },
  {
    title: 'AI recommendation ready',
    description: 'Local SEO next steps',
    icon: Sparkles,
    tone: 'violet',
  },
  {
    title: 'Support ticket in progress',
    description: 'Priority and replies visible',
    icon: TicketCheck,
    tone: 'blue',
  },
  {
    title: 'Hosting status online',
    description: 'Last check successful',
    icon: MonitorCheck,
    tone: 'emerald',
  },
]

const problemCards: Array<{
  title: string
  description: string
  icon: Icon
}> = [
  {
    title: 'Scattered communication',
    description:
      'Requests, feedback, files, and support replies get spread across email and chat.',
    icon: MessageSquareText,
  },
  {
    title: 'Unclear service status',
    description:
      'Customers have to ask for updates instead of seeing project and support progress.',
    icon: ClipboardList,
  },
  {
    title: 'Manual follow-ups',
    description:
      'Packages, orders, reports, tickets, and maintenance history are hard to keep connected.',
    icon: FileText,
  },
]

const solutionCards: Array<{
  title: string
  description: string
  icon: Icon
}> = [
  {
    title: 'One client workspace',
    description:
      'Customers request services, follow delivery, and manage support from one portal.',
    icon: LayoutDashboard,
  },
  {
    title: 'Role-based visibility',
    description:
      'Admin users manage the full workflow while customers only see their own company data.',
    icon: ShieldCheck,
  },
  {
    title: 'Connected delivery flow',
    description:
      'Packages, requests, projects, tickets, orders, reports, and AI recommendations stay linked.',
    icon: PackageCheck,
  },
]

const services: Array<{
  title: string
  kicker: string
  description: string
  icon: Icon
  highlights: string[]
}> = [
  {
    title: 'Web Development',
    kicker: 'Websites that can become real requests',
    description:
      'Create clear starting points for company websites, campaign pages, and e-commerce setup.',
    icon: Globe2,
    highlights: ['Business websites', 'E-commerce setup', 'Project tracking'],
  },
  {
    title: 'SEO & Reports',
    kicker: 'Visibility with practical next steps',
    description:
      'Keep SEO scores, keywords, technical issues, and recommendations visible to the customer.',
    icon: Search,
    highlights: ['SEO reports', 'Local keywords', 'AI-assisted ideas'],
  },
  {
    title: 'Hosting & Maintenance',
    kicker: 'Operational work with history',
    description:
      'Show hosting status, health checks, fixes, and maintenance logs in a structured way.',
    icon: Server,
    highlights: ['Website checks', 'Maintenance logs', 'Status history'],
  },
  {
    title: 'Support Tickets',
    kicker: 'Clear support instead of inbox threads',
    description:
      'Customers can open tickets, follow priorities, and keep every reply connected.',
    icon: Headphones,
    highlights: ['Priority handling', 'Message thread', 'Admin replies'],
  },
]

const workflowSteps: Array<{
  number: string
  title: string
  description: string
  icon: Icon
  mockTitle: string
  mockRows: string[]
}> = [
  {
    number: '01',
    title: 'Choose a package',
    description:
      'The customer starts from a service package that matches their current business need.',
    icon: PackageCheck,
    mockTitle: 'Selected package',
    mockRows: ['Business Website', 'Setup 12 990 kr', 'Delivery 4-6 weeks'],
  },
  {
    number: '02',
    title: 'Submit a request',
    description:
      'The request captures scope, budget, and context without losing details in email.',
    icon: ClipboardCheck,
    mockTitle: 'Request intake',
    mockRows: ['Goal: new website', 'Budget: medium', 'Status: New'],
  },
  {
    number: '03',
    title: 'Track delivery',
    description:
      'Projects, deadlines, progress, reports, and orders become visible in the portal.',
    icon: FolderKanban,
    mockTitle: 'Project progress',
    mockRows: ['Design approved', 'Development 60%', 'Review next'],
  },
  {
    number: '04',
    title: 'Get support',
    description:
      'Support tickets and maintenance activity stay connected to the customer company.',
    icon: TicketCheck,
    mockTitle: 'Support thread',
    mockRows: ['Priority: Medium', 'Reply from admin', 'Status: In progress'],
  },
]

const platformCards: Array<{
  title: string
  description: string
  icon: Icon
  tone: 'blue' | 'emerald'
  stats: string[]
}> = [
  {
    title: 'Customer Portal',
    description:
      'A focused workspace where customers can see their company, requests, projects, tickets, orders, reports, and AI recommendations.',
    icon: Users,
    tone: 'emerald',
    stats: ['Own company data', 'Requests and orders', 'Support history'],
  },
  {
    title: 'Admin Dashboard',
    description:
      'A management view for packages, companies, project requests, projects, tickets, service orders, maintenance, SEO, and hosting checks.',
    icon: LayoutDashboard,
    tone: 'blue',
    stats: ['All companies', 'Workflow control', 'Status management'],
  },
]

const platformItems: Array<{
  title: string
  description: string
  icon: Icon
}> = [
  {
    title: 'Projects',
    description: 'Follow status, deadline, and delivery progress.',
    icon: FolderKanban,
  },
  {
    title: 'Tickets',
    description: 'Keep questions, priorities, and replies organized.',
    icon: TicketCheck,
  },
  {
    title: 'Orders',
    description: 'Track demo payment and service order status.',
    icon: CreditCard,
  },
  {
    title: 'Reports',
    description: 'Show SEO scores, keywords, issues, and recommendations.',
    icon: BarChart3,
  },
  {
    title: 'AI Assistant',
    description: 'Generate rule-based service recommendations for customers.',
    icon: Sparkles,
  },
  {
    title: 'Hosting status',
    description: 'Display website health checks and availability signals.',
    icon: MonitorCheck,
  },
]

function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  tone = 'light',
}: {
  eyebrow: string
  title: string
  description: string
  align?: 'left' | 'center'
  tone?: 'light' | 'dark'
}) {
  return (
    <div className={cn('max-w-3xl', align === 'center' && 'mx-auto text-center')}>
      <p
        className={cn(
          'text-sm font-semibold',
          tone === 'dark' ? 'text-cyan-300' : 'text-blue-700',
        )}
      >
        {eyebrow}
      </p>
      <h2
        className={cn(
          'mt-3 text-3xl font-semibold leading-[1.08] tracking-tight sm:text-4xl lg:text-5xl',
          tone === 'dark' ? 'text-white' : 'text-slate-950',
        )}
      >
        {title}
      </h2>
      <p
        className={cn(
          'mt-4 text-base leading-8 sm:text-lg',
          tone === 'dark' ? 'text-slate-300' : 'text-slate-600',
        )}
      >
        {description}
      </p>
    </div>
  )
}

function HeroSignalCard({
  title,
  description,
  icon: IconComponent,
  tone,
}: (typeof floatingSignals)[number]) {
  const toneClasses = {
    blue: 'border-blue-300/20 bg-blue-300/10 text-blue-100',
    cyan: 'border-cyan-300/20 bg-cyan-300/10 text-cyan-100',
    emerald: 'border-emerald-300/20 bg-emerald-300/10 text-emerald-100',
    violet: 'border-violet-300/20 bg-violet-300/10 text-violet-100',
  }

  return (
    <div
      className={cn(
        'rounded-2xl border p-4 shadow-[0_24px_70px_-42px_rgba(14,165,233,0.45)] backdrop-blur',
        toneClasses[tone],
      )}
    >
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/10">
          <IconComponent className="h-4 w-4" />
        </span>
        <div>
          <p className="text-sm font-semibold text-white">{title}</p>
          <p className="mt-1 text-xs leading-5 text-slate-300">{description}</p>
        </div>
      </div>
    </div>
  )
}

function HeroDashboardMockup() {
  return (
    <div className="relative mx-auto w-full max-w-2xl lg:max-w-none">
      <div
        aria-hidden="true"
        className="absolute -inset-8 rounded-[2rem] bg-[radial-gradient(circle_at_25%_20%,rgba(34,211,238,0.26),transparent_32%),radial-gradient(circle_at_76%_78%,rgba(99,102,241,0.22),transparent_34%)] blur-2xl"
      />

      <div className="relative rounded-[1.75rem] border border-white/15 bg-slate-900/80 p-2 shadow-[0_34px_120px_-48px_rgba(14,165,233,0.75)] ring-1 ring-cyan-300/10 backdrop-blur">
        <div className="overflow-hidden rounded-[1.35rem] border border-white/10 bg-slate-950">
          <div className="flex h-12 items-center justify-between border-b border-white/10 bg-slate-900/95 px-4">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            </div>
            <span className="text-xs font-semibold text-slate-300">
              NordicWebHub portal workspace
            </span>
            <span className="h-2 w-12 rounded-full bg-cyan-200/20" />
          </div>

          <div className="grid min-h-[320px] sm:min-h-[360px] md:min-h-[420px] md:grid-cols-[178px_1fr]">
            <aside className="hidden border-r border-white/10 bg-slate-950/85 p-4 md:block">
              <div className="mb-6 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 text-xs font-bold text-white">
                  N
                </span>
                <div>
                  <p className="text-xs font-semibold text-white">Portal</p>
                  <p className="text-[11px] text-slate-500">Client workspace</p>
                </div>
              </div>

              <div className="grid gap-2">
                {['Overview', 'Requests', 'Projects', 'Tickets', 'SEO reports'].map(
                  (item, index) => (
                    <div
                      className={cn(
                        'rounded-lg px-3 py-2 text-xs font-medium',
                        index === 0
                          ? 'border border-cyan-300/20 bg-cyan-300/10 text-cyan-100'
                          : 'text-slate-400',
                      )}
                      key={item}
                    >
                      {item}
                    </div>
                  ),
                )}
              </div>
            </aside>

            <div className="bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.16),transparent_36%),linear-gradient(135deg,rgba(15,23,42,0.98),rgba(30,41,59,0.96))] p-4 sm:p-5 lg:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-400">
                    Customer workspace
                  </p>
                  <p className="mt-1 text-lg font-semibold text-white">
                    Nordic Build AB
                  </p>
                </div>
                <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-semibold text-emerald-100">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,0.8)]" />
                  All systems online
                </span>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
                {[
                  { label: 'Active projects', value: '2' },
                  { label: 'Open tickets', value: '1' },
                  { label: 'SEO score', value: '82' },
                ].map((stat) => (
                  <div
                    className="rounded-xl border border-white/10 bg-white/[0.07] p-3"
                    key={stat.label}
                  >
                    <p className="text-2xl font-semibold text-white">
                      {stat.value}
                    </p>
                    <p className="mt-1 truncate text-xs text-slate-300">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-3 grid gap-3 lg:grid-cols-[1.25fr_0.75fr]">
                <div className="rounded-xl border border-white/10 bg-white/[0.07] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-white">
                      Business Website
                    </p>
                    <span className="rounded-full bg-cyan-300/10 px-2.5 py-1 text-xs font-semibold text-cyan-100">
                      Development
                    </span>
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full w-3/5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-300" />
                  </div>
                  <div className="mt-3 flex justify-between text-xs text-slate-300">
                    <span>60% complete</span>
                    <span>Due 28 June</span>
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.07] p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-white">Support</p>
                    <MessageSquareText className="h-4 w-4 text-cyan-200" />
                  </div>
                  <p className="mt-2 text-xs leading-5 text-slate-300">
                    Mobile menu adjustment
                  </p>
                  <span className="mt-3 inline-flex rounded-full bg-amber-300/10 px-2.5 py-1 text-xs font-semibold text-amber-100">
                    In progress
                  </span>
                </div>
              </div>

              <div className="mt-3 hidden gap-3 sm:grid sm:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-white/[0.07] p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white">
                    <Sparkles className="h-4 w-4 text-violet-200" />
                    AI service assistant
                  </div>
                  <p className="mt-2 text-xs leading-5 text-slate-300">
                    Recommended package: SEO Growth
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.07] p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white">
                    <CreditCard className="h-4 w-4 text-emerald-200" />
                    Service order
                  </div>
                  <p className="mt-2 text-xs leading-5 text-slate-300">
                    Payment status: Pending
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none hidden lg:absolute lg:-left-10 lg:top-20 lg:block lg:w-60">
        <HeroSignalCard {...floatingSignals[0]} />
      </div>
      <div className="pointer-events-none hidden lg:absolute lg:-right-8 lg:bottom-16 lg:block lg:w-64">
        <HeroSignalCard {...floatingSignals[1]} />
      </div>
    </div>
  )
}

function ServiceCard({
  title,
  kicker,
  description,
  icon: IconComponent,
  highlights,
}: (typeof services)[number]) {
  return (
    <article className="group relative flex min-h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition duration-300 hover:-translate-y-1.5 hover:border-blue-200 hover:shadow-xl">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-32 bg-gradient-to-br from-blue-50 via-cyan-50 to-white opacity-90"
      />
      <div
        aria-hidden="true"
        className="absolute right-5 top-5 h-16 w-16 rounded-full bg-cyan-200/30 blur-2xl transition duration-300 group-hover:bg-blue-300/30"
      />
      <div className="relative z-10">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-400 text-white shadow-[0_18px_40px_-24px_rgba(37,99,235,0.8)] transition duration-300 group-hover:scale-105">
          <IconComponent className="h-6 w-6" />
        </span>
        <p className="mt-6 text-sm font-semibold text-blue-700">{kicker}</p>
        <h3 className="mt-2 text-xl font-semibold text-slate-950">{title}</h3>
        <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
        <ul className="mt-6 grid gap-2 border-t border-slate-100 pt-4 text-sm text-slate-700">
          {highlights.map((highlight) => (
            <li className="flex items-center gap-2" key={highlight}>
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              {highlight}
            </li>
          ))}
        </ul>
      </div>
    </article>
  )
}

export function Home() {
  const { hash } = useLocation()
  const { user } = useAuth()
  const portalRoute = user ? getDefaultRouteForUser(user) : '/register'
  const portalLabel = user ? 'Open portal' : 'Create Account'

  useEffect(() => {
    if (!hash) {
      return
    }

    const section = document.getElementById(hash.slice(1))
    section?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [hash])

  return (
    <>
      <section className="relative isolate overflow-hidden bg-slate-950 text-white">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              'linear-gradient(rgba(56,189,248,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.18) 1px, transparent 1px)',
            backgroundSize: '58px 58px',
          }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(circle_at_18%_15%,rgba(34,211,238,0.22),transparent_34%),radial-gradient(circle_at_78%_20%,rgba(79,70,229,0.22),transparent_30%),linear-gradient(180deg,rgba(15,23,42,0.28)_0%,rgba(2,6,23,0.88)_76%,rgba(2,6,23,0.98)_100%)]"
        />
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-10 h-72 w-[48rem] -translate-x-1/2 rounded-full bg-cyan-300/15 blur-3xl"
        />

        <div className="page-shell relative z-10 grid gap-10 pb-20 pt-10 sm:gap-12 sm:pb-28 sm:pt-20 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:pb-32 lg:pt-24">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-white/[0.08] px-4 py-2 text-sm font-semibold text-cyan-100 shadow-[0_0_30px_rgba(34,211,238,0.12)] backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_14px_rgba(103,232,249,0.9)]" />
              Built for digital services, delivery and support
            </span>
            <h1 className="mt-7 text-[2.25rem] font-semibold leading-[1.03] tracking-tight text-white sm:text-5xl lg:text-[4.15rem]">
              One portal for websites, SEO, hosting and support.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
              NordicWebHub helps Swedish small businesses choose packages,
              submit requests, track projects, manage support tickets, follow
              service orders, and get AI-assisted recommendations in one
              organized workspace.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <ButtonLink
                className="w-full !border-white !bg-white !px-8 !text-slate-950 hover:!border-slate-200 hover:!bg-slate-100 focus-visible:!ring-white/30 sm:w-auto sm:min-w-52"
                size="lg"
                to={portalRoute}
                trailingIcon={<ArrowRight className="h-4 w-4" />}
              >
                {portalLabel}
              </ButtonLink>
              <ButtonLink
                className="w-full !border-white/25 !bg-transparent !text-white hover:!border-cyan-200/50 hover:!bg-white/10 focus-visible:!ring-cyan-300/20 sm:w-auto sm:min-w-44"
                size="lg"
                to="/pricing"
                variant="secondary"
              >
                View Packages
              </ButtonLink>
            </div>
            <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-300">
              {[
                'Built for Swedish SMEs',
                'Admin and Customer roles',
                'Secure client access',
              ].map((item) => (
                <span className="inline-flex items-center gap-2" key={item}>
                  <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          <HeroDashboardMockup />
        </div>

        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-16 bg-[#f7f3ea]"
          style={{ clipPath: 'polygon(0 72%, 100% 35%, 100% 100%, 0% 100%)' }}
        />
      </section>

      <section className="border-b border-slate-200 bg-[#f7f3ea]">
        <div className="page-shell py-10">
          <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold text-blue-700">
                Portal workflow
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                What the portal connects from day one.
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Instead of showing fake client logos, this section explains the
                real workflow NordicWebHub gives a new customer: package,
                request, delivery, support, and reporting in one place.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {portalWorkflowHighlights.map((item) => {
                const IconComponent = item.icon

                return (
                  <div
                    className="group rounded-2xl border border-slate-200 bg-white/85 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-white hover:shadow-md"
                    key={item.title}
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700 transition group-hover:bg-blue-600 group-hover:text-white">
                      <IconComponent className="h-5 w-5" />
                    </span>
                    <p className="mt-4 text-sm font-semibold text-slate-950">
                      {item.title}
                    </p>
                    <p className="mt-2 text-xs leading-6 text-slate-600">
                      {item.description}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-200/80 pt-5">
            {capabilityChips.map((chip) => (
              <span
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm"
                key={chip}
              >
                {chip}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f7f3ea]">
        <div className="page-shell py-16 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <SectionHeading
              description="NordicWebHub turns digital service delivery into a visible portal workflow where every request, project, ticket, order, and report has a place."
              eyebrow="Problem / Solution"
              title="No more messy emails, scattered updates or unclear service status."
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-4">
                {problemCards.map((card) => {
                  const IconComponent = card.icon

                  return (
                    <article
                      className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
                      key={card.title}
                    >
                      <IconComponent className="h-5 w-5 text-slate-500" />
                      <h3 className="mt-4 font-semibold text-slate-950">
                        {card.title}
                      </h3>
                      <p className="mt-2 text-sm leading-7 text-slate-600">
                        {card.description}
                      </p>
                    </article>
                  )
                })}
              </div>
              <div className="grid gap-4">
                {solutionCards.map((card) => {
                  const IconComponent = card.icon

                  return (
                    <article
                      className="rounded-2xl border border-blue-200 bg-white p-5 shadow-[0_20px_70px_-48px_rgba(37,99,235,0.45)]"
                      key={card.title}
                    >
                      <IconComponent className="h-5 w-5 text-blue-700" />
                      <h3 className="mt-4 font-semibold text-slate-950">
                        {card.title}
                      </h3>
                      <p className="mt-2 text-sm leading-7 text-slate-600">
                        {card.description}
                      </p>
                    </article>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        className="relative scroll-mt-24 overflow-hidden bg-white"
        id="services"
      >
        <div
          aria-hidden="true"
          className="absolute right-0 top-0 h-80 w-80 rounded-full bg-blue-100/50 blur-3xl"
        />
        <div className="page-shell relative z-10 py-16 lg:py-24">
          <SectionHeading
            description="Each service is designed as a clear starting point that can become a request, project, ticket, service order, report, or support flow."
            eyebrow="Services"
            title="Practical digital services with a portal workflow behind them."
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service) => (
              <ServiceCard key={service.title} {...service} />
            ))}
          </div>
        </div>
      </section>

      <section
        className="relative isolate scroll-mt-24 overflow-hidden bg-slate-950 text-white"
        id="how-it-works"
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              'radial-gradient(circle at 15% 12%, rgba(34,211,238,0.25), transparent 32%), radial-gradient(circle at 86% 70%, rgba(37,99,235,0.28), transparent 34%)',
          }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'linear-gradient(rgba(148,163,184,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.18) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />
        <div className="page-shell relative z-10 py-16 lg:py-24">
          <SectionHeading
            align="center"
            description="The workflow is simple enough for a school MVP, but realistic enough to show how a digital agency can organize client delivery."
            eyebrow="How it works"
            title="From service choice to support, every step stays visible."
            tone="dark"
          />

          <div className="relative mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div
              aria-hidden="true"
              className="absolute left-0 right-0 top-12 hidden h-px bg-gradient-to-r from-transparent via-cyan-300/35 to-transparent lg:block"
            />
            {workflowSteps.map((step) => {
              const IconComponent = step.icon

              return (
                <article
                  className="relative rounded-3xl border border-white/10 bg-white/[0.055] p-5 shadow-[0_24px_70px_-46px_rgba(14,165,233,0.55)] backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-cyan-300/30 hover:bg-white/[0.08]"
                  key={step.number}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-300 text-white shadow-[0_0_35px_rgba(34,211,238,0.28)]">
                      <IconComponent className="h-5 w-5" />
                    </span>
                    <span className="text-sm font-semibold text-cyan-200">
                      {step.number}
                    </span>
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-white">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-slate-300">
                    {step.description}
                  </p>
                  <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/55 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-cyan-200">
                      {step.mockTitle}
                    </p>
                    <div className="mt-3 grid gap-2">
                      {step.mockRows.map((row) => (
                        <div
                          className="rounded-lg bg-white/[0.06] px-3 py-2 text-xs text-slate-300"
                          key={row}
                        >
                          {row}
                        </div>
                      ))}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section
        className="relative scroll-mt-24 overflow-hidden bg-gradient-to-b from-white to-slate-50"
        id="platform"
      >
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-0 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-blue-100/70 blur-3xl"
        />
        <div className="page-shell relative z-10 py-16 lg:py-24">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              description="NordicWebHub is not only a marketing page. It connects the public package flow with a working Admin and Customer portal."
              eyebrow="Platform preview"
              title="Two portal roles, one connected delivery system."
            />
            <ButtonLink
              className="w-full sm:w-auto"
              to={portalRoute}
              trailingIcon={<ArrowRight className="h-4 w-4" />}
              variant="secondary"
            >
              Explore the portal
            </ButtonLink>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {platformCards.map((card) => {
              const IconComponent = card.icon

              return (
                <article
                  className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_70px_-54px_rgba(15,23,42,0.48)]"
                  key={card.title}
                >
                  <div
                    className={cn(
                      'border-b p-6',
                      card.tone === 'emerald'
                        ? 'border-emerald-100 bg-emerald-50/65'
                        : 'border-blue-100 bg-blue-50/65',
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <span
                        className={cn(
                          'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-sm',
                          card.tone === 'emerald'
                            ? 'bg-emerald-600'
                            : 'bg-blue-600',
                        )}
                      >
                        <IconComponent className="h-5 w-5" />
                      </span>
                      <div>
                        <h3 className="text-xl font-semibold text-slate-950">
                          {card.title}
                        </h3>
                        <p className="mt-2 text-sm leading-7 text-slate-600">
                          {card.description}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-3 p-6 sm:grid-cols-3">
                    {card.stats.map((stat) => (
                      <div
                        className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700"
                        key={stat}
                      >
                        {stat}
                      </div>
                    ))}
                  </div>
                </article>
              )
            })}
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {platformItems.map((item) => {
              const IconComponent = item.icon

              return (
                <div
                  className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_20px_55px_-42px_rgba(37,99,235,0.45)]"
                  key={item.title}
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-gradient-to-br from-slate-50 to-blue-50 text-blue-700">
                    <IconComponent className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-base font-semibold text-slate-950">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      {item.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(34,211,238,0.18),transparent_34%),radial-gradient(circle_at_85%_70%,rgba(37,99,235,0.22),transparent_36%)]"
        />
        <div className="page-shell relative z-10 py-16 sm:py-20">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_28px_90px_-50px_rgba(14,165,233,0.55)] backdrop-blur sm:p-8 lg:flex lg:items-center lg:justify-between lg:gap-12">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold text-cyan-300">
                Ready to explore the portal?
              </p>
              <h2 className="mt-3 text-3xl font-semibold leading-[1.08] text-white sm:text-4xl">
                Bring your next digital project into one organized portal.
              </h2>
              <p className="mt-5 text-base leading-8 text-slate-300">
                Create an account or compare packages to see how requests,
                delivery, service orders, support, reports, and AI assistance
                can stay connected.
              </p>
            </div>
            <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row lg:mt-0 lg:w-auto">
              <ButtonLink
                className="w-full !border-white !bg-white !text-slate-950 hover:!border-slate-200 hover:!bg-slate-100 focus-visible:!ring-white/30 sm:w-auto sm:min-w-40"
                size="lg"
                to={portalRoute}
              >
                {portalLabel}
              </ButtonLink>
              <ButtonLink
                className="w-full !border-white/25 !bg-transparent !text-white hover:!border-white/45 hover:!bg-white/10 focus-visible:!ring-white/20 sm:w-auto sm:min-w-40"
                size="lg"
                to="/pricing"
                variant="secondary"
              >
                View Packages
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
