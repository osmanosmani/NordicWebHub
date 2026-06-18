import { useEffect, useState, type ComponentType } from 'react'
import {
  ArrowRight,
  BarChart3,
  Building2,
  Check,
  CheckCircle2,
  Clock3,
  FolderKanban,
  Globe2,
  Headphones,
  LayoutDashboard,
  MessageSquareText,
  Search,
  Server,
  ShieldCheck,
  Sparkles,
  TicketCheck,
  Users,
  Wrench,
} from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { getPackages } from '../../api/packagesApi'
import { ButtonLink } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { useAuth } from '../../context/useAuth'
import type { ServicePackage } from '../../types/servicePackage'
import { getDefaultRouteForUser } from '../../utils/authRoutes'
import { cn } from '../../utils/cn'
import { getErrorMessage } from '../../utils/getErrorMessage'

type Icon = ComponentType<{ className?: string }>

const services: Array<{
  title: string
  description: string
  icon: Icon
  highlights: string[]
}> = [
  {
    title: 'Web Development',
    description:
      'Clear, responsive websites built around your business goals and customer journey.',
    icon: Globe2,
    highlights: ['Business websites', 'E-commerce setup'],
  },
  {
    title: 'SEO',
    description:
      'Practical local SEO work, technical reports, and recommendations you can follow.',
    icon: Search,
    highlights: ['Local visibility', 'Actionable reports'],
  },
  {
    title: 'Hosting & Maintenance',
    description:
      'Website monitoring, maintenance history, fixes, and hosting status in one place.',
    icon: Server,
    highlights: ['Health monitoring', 'Documented maintenance'],
  },
  {
    title: 'Support Tickets',
    description:
      'A structured support channel with priorities, replies, and visible progress.',
    icon: Headphones,
    highlights: ['Priority handling', 'Complete message history'],
  },
]

const steps = [
  {
    number: '01',
    title: 'Choose a package',
    description: 'Compare clear service packages and select the right starting point.',
  },
  {
    number: '02',
    title: 'Submit a request',
    description: 'Share your goals, requirements, and budget through the client portal.',
  },
  {
    number: '03',
    title: 'Track progress',
    description: 'Follow project status, deadlines, updates, and completed work.',
  },
  {
    number: '04',
    title: 'Get support',
    description: 'Open support tickets and keep every reply connected to your company.',
  },
]

const platformFeatures: Array<{
  title: string
  description: string
  icon: Icon
}> = [
  {
    title: 'Admin dashboard',
    description: 'A complete overview of customers, requests, projects, and support.',
    icon: LayoutDashboard,
  },
  {
    title: 'Customer dashboard',
    description: 'A focused workspace showing only your company and its activity.',
    icon: Users,
  },
  {
    title: 'Project tracking',
    description: 'See project status, progress, start dates, and deadlines.',
    icon: FolderKanban,
  },
  {
    title: 'Support tickets',
    description: 'Keep technical questions, priorities, and replies organized.',
    icon: TicketCheck,
  },
  {
    title: 'SEO reports',
    description: 'Review SEO scores, issues, keywords, and recommended next steps.',
    icon: BarChart3,
  },
  {
    title: 'Website health',
    description: 'See hosting checks, response status, and maintenance activity.',
    icon: ShieldCheck,
  },
]

const heroSignals = [
  {
    label: 'Requests',
    value: '12',
    detail: 'organized in one client workflow',
  },
  {
    label: 'Delivery',
    value: '60%',
    detail: 'visible project progress',
  },
  {
    label: 'Support',
    value: '1',
    detail: 'open ticket with priority',
  },
]

const sekFormatter = new Intl.NumberFormat('sv-SE', {
  currency: 'SEK',
  maximumFractionDigits: 0,
  style: 'currency',
})

function SectionHeading({
  eyebrow,
  title,
  description,
  tone = 'light',
}: {
  eyebrow: string
  title: string
  description: string
  tone?: 'light' | 'dark'
}) {
  return (
    <div className="max-w-3xl">
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
          'mt-3 text-3xl font-semibold leading-[1.08] sm:text-4xl',
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

export function Home() {
  const { hash } = useLocation()
  const { user } = useAuth()
  const [packages, setPackages] = useState<ServicePackage[]>([])
  const [isLoadingPackages, setIsLoadingPackages] = useState(true)
  const [packagesError, setPackagesError] = useState('')

  useEffect(() => {
    if (!hash) {
      return
    }

    const section = document.getElementById(hash.slice(1))
    section?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [hash])

  useEffect(() => {
    let isMounted = true

    getPackages()
      .then((servicePackages) => {
        if (isMounted) {
          setPackages(
            servicePackages.filter((servicePackage) => servicePackage.isActive),
          )
          setPackagesError('')
        }
      })
      .catch((error: unknown) => {
        if (isMounted) {
          setPackagesError(
            getErrorMessage(
              error,
              'Packages are temporarily unavailable. You can still explore the platform.',
            ),
          )
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingPackages(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  const previewPackages = packages.slice(0, 3)
  const recommendedPackageId =
    previewPackages.find((servicePackage) =>
      /business|growth/i.test(servicePackage.name),
    )?.id ?? previewPackages[1]?.id

  return (
    <>
      <section className="relative isolate overflow-hidden bg-slate-950 text-white">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'linear-gradient(rgba(56,189,248,0.16) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.16) 1px, transparent 1px)',
            backgroundSize: '56px 56px',
          }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.1)_0%,rgba(2,6,23,0.82)_74%,rgba(2,6,23,0.96)_100%)]"
        />
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-0 h-72 w-[44rem] -translate-x-1/2 rounded-full bg-cyan-400/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -left-32 top-44 h-72 w-72 rounded-full bg-blue-600/25 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -right-32 top-64 h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl"
        />

        <div className="page-shell relative z-10 pb-24 pt-14 sm:pb-28 sm:pt-20 lg:pb-32 lg:pt-24">
          <div className="mx-auto max-w-5xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-white/[0.08] px-4 py-2 text-sm font-semibold text-cyan-100 shadow-[0_0_30px_rgba(34,211,238,0.12)] backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_14px_rgba(103,232,249,0.9)]" />
              Digital services, delivered with clarity
            </span>
            <h1 className="mx-auto mt-7 max-w-4xl text-4xl font-semibold leading-[1.03] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Your digital agency work, finally in one place
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg sm:leading-8">
              Choose the services your business needs, submit requests, follow
              delivery, and get support through one secure portal for Swedish
              small businesses.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <ButtonLink
                className="w-full !border-white !bg-white !text-slate-950 hover:!border-slate-200 hover:!bg-slate-100 focus-visible:!ring-white/30 sm:w-auto sm:min-w-44"
                size="lg"
                to="/pricing"
                trailingIcon={<ArrowRight className="h-4 w-4" />}
              >
                View packages
              </ButtonLink>
              <ButtonLink
                className="w-full !border-white/25 !bg-white/5 !text-white hover:!border-cyan-200/50 hover:!bg-white/10 focus-visible:!ring-cyan-300/20 sm:w-auto sm:min-w-44"
                size="lg"
                to="/register"
                variant="secondary"
              >
                Create account
              </ButtonLink>
            </div>
            <div className="mt-7 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-slate-300">
              {[
                'Built for Swedish SMBs',
                'Transparent delivery',
                'Secure client access',
              ].map((item) => (
                <span className="inline-flex items-center gap-2" key={item}>
                  <CheckCircle2
                    aria-hidden="true"
                    className="h-4 w-4 text-emerald-300"
                  />
                  {item}
                </span>
              ))}
            </div>

            <div className="mx-auto mt-9 grid max-w-3xl gap-3 sm:grid-cols-3">
              {heroSignals.map((signal) => (
                <div
                  className="rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-3 text-left shadow-[0_18px_60px_-45px_rgba(34,211,238,0.7)] backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-cyan-300/25 hover:bg-white/[0.075]"
                  key={signal.label}
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-cyan-200">
                      {signal.label}
                    </p>
                    <p className="text-xl font-semibold text-white">
                      {signal.value}
                    </p>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-slate-300">
                    {signal.detail}
                  </p>
                </div>
              ))}
            </div>

            <div
              aria-hidden="true"
              className="mx-auto mt-5 flex max-w-2xl items-center justify-center gap-3 text-xs font-medium text-slate-400"
            >
              <span className="h-px flex-1 bg-gradient-to-r from-transparent via-cyan-300/35 to-cyan-300/10" />
              <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-white/[0.04] px-3 py-1.5 text-cyan-100">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,0.8)]" />
                Live portal signals
              </span>
              <span className="h-px flex-1 bg-gradient-to-l from-transparent via-cyan-300/35 to-cyan-300/10" />
            </div>
          </div>

          <div className="relative mx-auto mt-14 max-w-5xl">
            <div
              aria-hidden="true"
              className="absolute -left-10 top-16 hidden w-48 rounded-2xl border border-cyan-300/20 bg-slate-900/85 p-4 shadow-[0_24px_70px_-44px_rgba(14,165,233,0.55)] backdrop-blur lg:block"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-cyan-200">
                Client portal
              </p>
              <p className="mt-2 text-sm font-semibold text-white">
                Requests, delivery and reports stay connected.
              </p>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-blue-500 to-cyan-300" />
              </div>
            </div>

            <div
              aria-hidden="true"
              className="absolute -right-8 bottom-14 hidden w-48 rounded-2xl border border-emerald-300/20 bg-slate-900/85 p-4 shadow-[0_24px_70px_-44px_rgba(16,185,129,0.38)] backdrop-blur lg:block"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-200">
                Secure access
              </p>
              <p className="mt-2 text-sm font-semibold text-white">
                Admin and customer workflows stay separated.
              </p>
              <div className="mt-4 flex gap-1.5">
                <span className="h-2 flex-1 rounded-full bg-emerald-300" />
                <span className="h-2 flex-1 rounded-full bg-cyan-300/70" />
                <span className="h-2 flex-1 rounded-full bg-blue-400/70" />
              </div>
            </div>

            <div className="relative mx-auto max-h-[280px] overflow-hidden rounded-[1.5rem] border border-cyan-300/20 bg-slate-900/80 p-2 shadow-[0_34px_100px_-42px_rgba(14,165,233,0.55)] ring-1 ring-white/10 backdrop-blur sm:max-h-none">
              <div
                aria-hidden="true"
                className="absolute inset-x-12 -top-16 h-32 rounded-full bg-cyan-300/20 blur-3xl"
              />
              <div className="relative overflow-hidden rounded-[1.15rem] border border-white/10 bg-slate-950">
                <div className="flex h-11 items-center justify-between border-b border-white/10 bg-slate-900/95 px-4">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  </div>
                  <span className="text-xs font-medium text-slate-300">
                    NordicWebHub customer portal
                  </span>
                  <span className="h-2 w-10 rounded-full bg-cyan-200/20" />
                </div>

                <div className="grid min-h-[315px] sm:grid-cols-[178px_1fr]">
                  <aside className="hidden border-r border-white/10 bg-slate-950/80 p-4 sm:block">
                    <div className="mb-5 flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 text-xs font-bold text-white">
                        N
                      </span>
                      <span className="text-xs font-semibold text-white">
                        Portal
                      </span>
                    </div>
                    <div className="grid gap-2">
                      {['Overview', 'Projects', 'Tickets', 'SEO reports'].map(
                        (item, index) => (
                          <div
                            className={
                              index === 0
                                ? 'rounded-lg border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-xs font-semibold text-cyan-100'
                                : 'px-3 py-2 text-xs font-medium text-slate-400'
                            }
                            key={item}
                          >
                            {item}
                          </div>
                        ),
                      )}
                    </div>
                  </aside>

                  <div className="bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.16),transparent_35%),linear-gradient(135deg,rgba(15,23,42,0.98),rgba(30,41,59,0.96))] p-4 sm:p-5 lg:p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-medium text-slate-400">
                          Customer workspace
                        </p>
                        <p className="mt-1 text-base font-semibold text-white sm:text-lg">
                          Nordic Build AB
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-semibold text-emerald-100">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
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
                          className="min-w-0 rounded-xl border border-white/10 bg-white/[0.07] p-3 shadow-[0_1px_2px_rgba(2,6,23,0.18)]"
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

                    <div className="mt-3 grid gap-3 lg:grid-cols-[1.4fr_0.6fr]">
                      <div className="rounded-xl border border-white/10 bg-white/[0.07] p-4 shadow-[0_1px_2px_rgba(2,6,23,0.18)]">
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

                      <div className="rounded-xl border border-white/10 bg-white/[0.07] p-4 shadow-[0_1px_2px_rgba(2,6,23,0.18)]">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-white">
                            Support
                          </p>
                          <Wrench
                            aria-hidden="true"
                            className="h-4 w-4 text-cyan-200"
                          />
                        </div>
                        <p className="mt-3 text-xs leading-5 text-slate-300">
                          Mobile menu adjustment
                        </p>
                        <span className="mt-3 inline-flex rounded-full bg-amber-300/15 px-2.5 py-1 text-xs font-semibold text-amber-100">
                          In progress
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-24 bg-slate-50"
          style={{
            clipPath:
              'polygon(0 55%, 18% 44%, 45% 54%, 72% 42%, 100% 24%, 100% 100%, 0 100%)',
          }}
        />
      </section>

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="page-shell py-12 sm:py-16 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
            <div>
              <p className="text-sm font-semibold text-slate-500">
                The problem with traditional agency work
              </p>
              <h2 className="mt-3 text-3xl font-semibold leading-[1.08] text-slate-950 sm:text-4xl">
                Less time searching for updates. More time moving forward.
              </h2>
              <p className="mt-5 text-base leading-8 text-slate-600">
                Project details, support conversations, reports, and deadlines
                should not be spread across inboxes and disconnected documents.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                <MessageSquareText
                  aria-hidden="true"
                  className="h-5 w-5 text-slate-500"
                />
                <h3 className="mt-4 font-semibold text-slate-950">
                  Without a portal
                </h3>
                <ul className="mt-4 grid gap-3 text-sm leading-6 text-slate-600">
                  <li>Updates scattered across email and chat</li>
                  <li>Unclear ownership, status, and next steps</li>
                  <li>Support history difficult to follow</li>
                </ul>
              </div>
              <div className="rounded-2xl border border-blue-200 bg-white p-6 shadow-[0_12px_35px_-28px_rgba(37,99,235,0.45)]">
                <Sparkles
                  aria-hidden="true"
                  className="h-5 w-5 text-blue-700"
                />
                <h3 className="mt-4 font-semibold text-slate-950">
                  With NordicWebHub
                </h3>
                <ul className="mt-4 grid gap-3 text-sm leading-6 text-slate-700">
                  {[
                    'One workspace for requests and delivery',
                    'Visible progress, deadlines, and reports',
                    'Structured support tied to your company',
                  ].map((item) => (
                    <li className="flex items-start gap-2" key={item}>
                      <Check
                        aria-hidden="true"
                        className="mt-1 h-4 w-4 shrink-0 text-emerald-600"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-10 grid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_55px_-42px_rgba(15,23,42,0.38)] sm:grid-cols-3">
            {[
              {
                label: '01',
                title: 'Request intake',
                text: 'Customers describe what they need in one structured flow.',
              },
              {
                label: '02',
                title: 'Delivery workspace',
                text: 'Projects, tickets, reports, and orders stay visible.',
              },
              {
                label: '03',
                title: 'Long-term support',
                text: 'Maintenance and support history remains connected.',
              },
            ].map((item) => (
              <div
                className="border-b border-slate-200 p-5 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0"
                key={item.label}
              >
                <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                  {item.label}
                </span>
                <p className="mt-3 text-sm font-semibold text-slate-950">
                  {item.title}
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        className="relative scroll-mt-24 overflow-hidden bg-white"
        id="services"
      >
        <div
          aria-hidden="true"
          className="absolute right-0 top-0 h-80 w-80 rounded-full bg-blue-100/40 blur-3xl"
        />
        <div className="page-shell relative z-10 py-16 lg:py-20">
          <SectionHeading
            description="Start with the service your business needs today, then keep future work and support connected to the same portal."
            eyebrow="Services"
            title="Digital services with practical delivery"
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service) => {
              const IconComponent = service.icon

              return (
                <article
                  className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_24px_70px_-44px_rgba(37,99,235,0.5)]"
                  key={service.title}
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 text-blue-700 ring-1 ring-blue-100">
                    <IconComponent className="h-5 w-5" />
                  </span>
                  <h3 className="mt-6 text-lg font-semibold text-slate-950">
                    {service.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {service.description}
                  </p>
                  <ul className="mt-6 grid gap-2 border-t border-slate-100 pt-4 text-sm leading-6 text-slate-700">
                    {service.highlights.map((highlight) => (
                      <li className="flex items-center gap-2" key={highlight}>
                        <Check
                          aria-hidden="true"
                          className="h-4 w-4 shrink-0 text-emerald-600"
                        />
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section
        className="relative isolate scroll-mt-24 overflow-hidden bg-slate-950 text-white"
        id="how-it-works"
      >
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-14 bg-white"
          style={{
            clipPath: 'polygon(0 0, 100% 0, 100% 22%, 0 100%)',
          }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 10%, rgba(34,211,238,0.22), transparent 30%), radial-gradient(circle at 80% 80%, rgba(37,99,235,0.28), transparent 34%)',
          }}
        />
        <div className="page-shell relative z-10 py-16 lg:py-20">
          <SectionHeading
            description="A simple workflow keeps expectations, progress, and communication visible from the beginning."
            eyebrow="How it works"
            title="Four steps from service choice to support"
            tone="dark"
          />
          <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <li
                className="relative rounded-2xl border border-white/10 bg-white/[0.05] p-6 shadow-[0_24px_70px_-46px_rgba(14,165,233,0.55)] backdrop-blur transition hover:-translate-y-0.5 hover:border-cyan-300/30 hover:bg-white/[0.08]"
                key={step.number}
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-300 text-xs font-semibold text-white shadow-[0_0_30px_rgba(34,211,238,0.28)]">
                  {step.number}
                </span>
                <h3 className="mt-4 text-base font-semibold text-white">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-7 text-slate-300">
                  {step.description}
                </p>
                {step.number !== '04' ? (
                  <ArrowRight
                    aria-hidden="true"
                    className="absolute right-5 top-7 hidden h-4 w-4 text-cyan-200/60 lg:block"
                  />
                ) : null}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        className="scroll-mt-24 bg-gradient-to-b from-white to-slate-50"
        id="platform"
      >
        <div className="page-shell py-16 lg:py-20">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              description="The portal gives customers the information they need while the agency keeps delivery and communication organized."
              eyebrow="Platform"
              title="Visibility for customers, control for the agency"
            />
            <ButtonLink
              className="w-full sm:w-auto"
              to="/register"
              variant="secondary"
            >
              Explore the client portal
            </ButtonLink>
          </div>
          <div className="mt-10 grid gap-x-8 gap-y-8 md:grid-cols-2 lg:grid-cols-3">
            {platformFeatures.map((feature) => {
              const IconComponent = feature.icon

              return (
                <div
                  className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_20px_55px_-42px_rgba(37,99,235,0.45)]"
                  key={feature.title}
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-gradient-to-br from-slate-50 to-blue-50 text-blue-700">
                    <IconComponent className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-base font-semibold text-slate-950">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      {feature.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="mt-10 grid gap-4 border-t border-slate-200 pt-8 sm:grid-cols-3">
            {[
              {
                icon: Building2,
                label: 'Company-specific',
                text: 'Every customer sees only the information connected to their company.',
              },
              {
                icon: Clock3,
                label: 'Always current',
                text: 'Statuses, deadlines, tickets, and reports stay available between meetings.',
              },
              {
                icon: ShieldCheck,
                label: 'Secure access',
                text: 'Role-based portal access keeps admin and customer workflows separate.',
              },
            ].map((item) => {
              const IconComponent = item.icon

              return (
                <div className="rounded-xl border border-slate-200 bg-white p-4" key={item.label}>
                  <div className="flex gap-3">
                    <IconComponent
                      aria-hidden="true"
                      className="mt-0.5 h-5 w-5 shrink-0 text-blue-700"
                    />
                    <div>
                      <p className="text-sm font-semibold text-slate-950">
                        {item.label}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        {item.text}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-y border-slate-200 bg-slate-50">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.16),transparent_55%)]"
        />
        <div className="page-shell relative z-10 py-16 lg:py-20">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              description="Transparent starting points for websites, SEO, hosting, and digital support."
              eyebrow="Packages"
              title="Choose a service that fits your next step"
            />
            <ButtonLink
              className="w-full sm:w-auto"
              to="/pricing"
              variant="secondary"
            >
              View all packages
            </ButtonLink>
          </div>

          {isLoadingPackages ? (
            <div className="mt-10 flex items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white p-8 text-sm font-medium text-slate-600">
              <LoadingSpinner label="Loading service packages" />
              <span>Loading service packages</span>
            </div>
          ) : null}

          {!isLoadingPackages && packagesError ? (
            <div className="mt-10 rounded-lg border border-amber-200 bg-amber-50 p-5">
              <p className="text-sm font-semibold text-amber-900">
                Package preview unavailable
              </p>
              <p className="mt-1 text-sm leading-6 text-amber-800">
                {packagesError}
              </p>
            </div>
          ) : null}

          {!isLoadingPackages && !packagesError && packages.length === 0 ? (
            <div className="mt-10 rounded-lg border border-slate-200 bg-white p-8 text-center">
              <p className="text-sm font-semibold text-slate-950">
                New service packages are being prepared
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Please check the pricing page again soon.
              </p>
            </div>
          ) : null}

          {!isLoadingPackages && !packagesError && packages.length > 0 ? (
            <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {previewPackages.map((servicePackage) => {
                const isRecommended =
                  servicePackage.id === recommendedPackageId

                return (
                  <Card
                    accent={isRecommended ? 'blue' : undefined}
                    className={
                      isRecommended
                        ? 'flex min-h-full flex-col rounded-2xl border-blue-300 shadow-[0_28px_80px_-46px_rgba(37,99,235,0.62)] ring-2 ring-blue-100'
                        : 'flex min-h-full flex-col rounded-2xl shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition hover:border-slate-300 hover:shadow-[0_18px_45px_-36px_rgba(15,23,42,0.35)]'
                    }
                    key={servicePackage.id}
                  >
                    <div className="flex h-full flex-col p-6 sm:p-7">
                      <div className="flex min-h-6 items-center justify-between gap-3">
                        <StatusBadge
                          label={servicePackage.category}
                          tone={isRecommended ? 'blue' : 'slate'}
                        />
                        {isRecommended ? (
                          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                            Recommended
                          </span>
                        ) : null}
                      </div>
                      <h3 className="mt-5 text-xl font-semibold text-slate-950">
                        {servicePackage.name}
                      </h3>
                      <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-600">
                        {servicePackage.description}
                      </p>
                      <div className="mt-7 border-t border-slate-100 pt-6">
                        <p className="text-3xl font-semibold text-slate-950">
                          {sekFormatter.format(servicePackage.monthlyPrice)}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">per month</p>
                      </div>
                      <dl className="mt-5 grid gap-3 text-sm">
                        <div className="flex justify-between gap-4 rounded-lg bg-slate-50 px-3 py-2">
                          <dt className="text-slate-600">Setup</dt>
                          <dd className="font-semibold text-slate-900">
                            {sekFormatter.format(servicePackage.setupFee)}
                          </dd>
                        </div>
                        <div className="flex justify-between gap-4 rounded-lg bg-slate-50 px-3 py-2">
                          <dt className="text-slate-600">Delivery</dt>
                          <dd className="font-semibold text-slate-900">
                            {servicePackage.deliveryTime}
                          </dd>
                        </div>
                      </dl>
                      <ButtonLink
                        className="mt-7 w-full"
                        to={user ? getDefaultRouteForUser(user) : '/register'}
                        variant={isRecommended ? 'primary' : 'secondary'}
                      >
                        Request this package
                      </ButtonLink>
                    </div>
                  </Card>
                )
              })}
            </div>
          ) : null}
        </div>
      </section>

      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(34,211,238,0.18),transparent_34%),radial-gradient(circle_at_85%_70%,rgba(37,99,235,0.22),transparent_36%)]"
        />
        <div className="page-shell relative z-10 py-16 sm:py-20">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_28px_90px_-50px_rgba(14,165,233,0.55)] backdrop-blur sm:p-8 lg:flex lg:items-center lg:justify-between lg:gap-12">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold text-blue-300">
                Start with what your business needs now
              </p>
              <h2 className="mt-3 text-3xl font-semibold leading-[1.08] text-white sm:text-4xl">
                Turn your next digital project into a clear, trackable workflow
              </h2>
              <p className="mt-5 text-base leading-8 text-slate-300">
                Compare service packages or create an account to keep requests,
                delivery, support, and reports connected from day one.
              </p>
            </div>
            <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row lg:mt-0 lg:w-auto">
              <ButtonLink
                className="w-full !border-white !bg-white !text-slate-950 hover:!border-slate-200 hover:!bg-slate-100 focus-visible:!ring-white/30 sm:w-auto sm:min-w-40"
                size="lg"
                to="/pricing"
              >
                View packages
              </ButtonLink>
              <ButtonLink
                className="w-full !border-white/25 !bg-transparent !text-white hover:!border-white/45 hover:!bg-white/10 focus-visible:!ring-white/20 sm:w-auto sm:min-w-40"
                size="lg"
                to="/register"
                variant="secondary"
              >
                Create account
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
