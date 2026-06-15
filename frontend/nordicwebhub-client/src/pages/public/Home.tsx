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
import type { ServicePackage } from '../../types/servicePackage'
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

const sekFormatter = new Intl.NumberFormat('sv-SE', {
  currency: 'SEK',
  maximumFractionDigits: 0,
  style: 'currency',
})

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <div className="max-w-2xl">
      <p className="text-sm font-semibold text-blue-700">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 text-base leading-7 text-slate-600">{description}</p>
    </div>
  )
}

export function Home() {
  const { hash } = useLocation()
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
      <section className="overflow-hidden border-b border-slate-200 bg-white">
        <div className="page-shell pb-10 pt-10 sm:pb-14 sm:pt-14">
          <div className="mx-auto max-w-4xl text-center">
            <StatusBadge
              label="Digital services, delivered with clarity"
              showDot
              tone="blue"
            />
            <h1 className="mt-5 text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Your digital agency work, finally in one place
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
              Choose the services your business needs, submit requests, follow
              delivery, and get support through one secure portal for Swedish
              small businesses.
            </p>
            <div className="mt-7 grid grid-cols-2 gap-3 sm:mt-8 sm:flex sm:justify-center">
              <ButtonLink
                className="w-full sm:w-auto"
                size="lg"
                to="/pricing"
                trailingIcon={<ArrowRight className="h-4 w-4" />}
              >
                View Packages
              </ButtonLink>
              <ButtonLink
                className="w-full sm:w-auto"
                size="lg"
                to="/register"
                variant="secondary"
              >
                Create Account
              </ButtonLink>
            </div>
            <div className="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-slate-600 sm:mt-7">
              {[
                'Built for Swedish SMBs',
                'Transparent delivery',
                'Secure client access',
              ].map((item) => (
                <span className="inline-flex items-center gap-2" key={item}>
                  <CheckCircle2
                    aria-hidden="true"
                    className="h-4 w-4 text-emerald-600"
                  />
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="mx-auto mt-10 max-h-[130px] max-w-5xl overflow-hidden rounded-lg border border-slate-200 bg-slate-50 shadow-[0_18px_45px_-28px_rgba(15,23,42,0.35)] sm:max-h-none">
            <div className="flex h-11 items-center justify-between border-b border-slate-200 bg-white px-4">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </div>
              <span className="text-xs font-medium text-slate-500">
                NordicWebHub customer portal
              </span>
              <span className="h-2 w-10 rounded-full bg-slate-200" />
            </div>

            <div className="grid min-h-[290px] sm:grid-cols-[172px_1fr]">
              <aside className="hidden border-r border-slate-200 bg-white p-4 sm:block">
                <div className="mb-5 flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">
                    N
                  </span>
                  <span className="text-xs font-semibold text-slate-900">
                    Portal
                  </span>
                </div>
                <div className="grid gap-2">
                  {['Overview', 'Projects', 'Tickets', 'SEO reports'].map(
                    (item, index) => (
                      <div
                        className={
                          index === 0
                            ? 'rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700'
                            : 'px-3 py-2 text-xs font-medium text-slate-500'
                        }
                        key={item}
                      >
                        {item}
                      </div>
                    ),
                  )}
                </div>
              </aside>

              <div className="p-4 sm:p-5 lg:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium text-slate-500">
                      Customer workspace
                    </p>
                    <p className="mt-1 text-base font-semibold text-slate-950 sm:text-lg">
                      Nordic Build AB
                    </p>
                  </div>
                  <StatusBadge
                    label="All systems online"
                    showDot
                    tone="emerald"
                  />
                </div>

                <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
                  {[
                    { label: 'Active projects', value: '2' },
                    { label: 'Open tickets', value: '1' },
                    { label: 'SEO score', value: '82' },
                  ].map((stat) => (
                    <div
                      className="min-w-0 rounded-lg border border-slate-200 bg-white p-3"
                      key={stat.label}
                    >
                      <p className="text-xl font-semibold text-slate-950">
                        {stat.value}
                      </p>
                      <p className="mt-1 truncate text-xs text-slate-500">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-3 grid gap-3 lg:grid-cols-[1.4fr_0.6fr]">
                  <div className="rounded-lg border border-slate-200 bg-white p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-950">
                        Business Website
                      </p>
                      <StatusBadge label="Development" tone="blue" />
                    </div>
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full w-3/5 rounded-full bg-blue-600" />
                    </div>
                    <div className="mt-3 flex justify-between text-xs text-slate-500">
                      <span>60% complete</span>
                      <span>Due 28 June</span>
                    </div>
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-white p-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-950">
                        Support
                      </p>
                      <Wrench
                        aria-hidden="true"
                        className="h-4 w-4 text-slate-400"
                      />
                    </div>
                    <p className="mt-3 text-xs leading-5 text-slate-600">
                      Mobile menu adjustment
                    </p>
                    <StatusBadge
                      className="mt-3"
                      label="In progress"
                      tone="amber"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="page-shell py-10 sm:py-16 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
            <div>
              <p className="text-sm font-semibold text-slate-500">
                The problem with traditional agency work
              </p>
              <h2 className="mt-2 text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">
                Less time searching for updates. More time moving forward.
              </h2>
              <p className="mt-4 leading-7 text-slate-600">
                Project details, support conversations, reports, and deadlines
                should not be spread across inboxes and disconnected documents.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="border-l-2 border-slate-300 pl-5">
                <MessageSquareText
                  aria-hidden="true"
                  className="h-5 w-5 text-slate-500"
                />
                <h3 className="mt-4 font-semibold text-slate-950">
                  Without a portal
                </h3>
                <ul className="mt-3 grid gap-2 text-sm leading-6 text-slate-600">
                  <li>Updates scattered across email and chat</li>
                  <li>Unclear ownership, status, and next steps</li>
                  <li>Support history difficult to follow</li>
                </ul>
              </div>
              <div className="border-l-2 border-blue-600 pl-5">
                <Sparkles
                  aria-hidden="true"
                  className="h-5 w-5 text-blue-700"
                />
                <h3 className="mt-4 font-semibold text-slate-950">
                  With NordicWebHub
                </h3>
                <ul className="mt-3 grid gap-2 text-sm leading-6 text-slate-700">
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
        </div>
      </section>

      <section className="scroll-mt-24 bg-white" id="services">
        <div className="page-shell py-16 lg:py-20">
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
                  className="flex h-full flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
                  key={service.title}
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                    <IconComponent className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 text-base font-semibold text-slate-950">
                    {service.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {service.description}
                  </p>
                  <ul className="mt-5 grid gap-2 border-t border-slate-100 pt-4 text-sm text-slate-700">
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
        className="scroll-mt-24 border-y border-slate-200 bg-slate-50"
        id="how-it-works"
      >
        <div className="page-shell py-16 lg:py-20">
          <SectionHeading
            description="A simple workflow keeps expectations, progress, and communication visible from the beginning."
            eyebrow="How it works"
            title="Four steps from service choice to support"
          />
          <ol className="mt-10 grid border-y border-slate-200 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <li
                className="relative border-b border-slate-200 py-7 sm:px-6 sm:first:pl-0 lg:border-b-0 lg:border-r lg:last:border-r-0 lg:last:pr-0"
                key={step.number}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-xs font-semibold text-white">
                  {step.number}
                </span>
                <h3 className="mt-3 text-base font-semibold text-slate-950">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {step.description}
                </p>
                {step.number !== '04' ? (
                  <ArrowRight
                    aria-hidden="true"
                    className="absolute right-4 top-8 hidden h-4 w-4 text-slate-300 lg:block"
                  />
                ) : null}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="scroll-mt-24 bg-white" id="platform">
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
                <div className="flex gap-4" key={feature.title}>
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700">
                    <IconComponent className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-base font-semibold text-slate-950">
                      {feature.title}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
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
                <div className="flex gap-3" key={item.label}>
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
              )
            })}
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50">
        <div className="page-shell py-16 lg:py-20">
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
                    className="flex min-h-full flex-col"
                    key={servicePackage.id}
                  >
                    <div className="flex h-full flex-col p-5 sm:p-6">
                      <div className="flex min-h-6 items-center justify-between gap-3">
                        <StatusBadge
                          label={servicePackage.category}
                          tone={isRecommended ? 'blue' : 'slate'}
                        />
                        {isRecommended ? (
                          <span className="text-xs font-semibold text-blue-700">
                            Recommended
                          </span>
                        ) : null}
                      </div>
                    <h3 className="mt-4 text-xl font-semibold text-slate-950">
                      {servicePackage.name}
                    </h3>
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
                      {servicePackage.description}
                    </p>
                    <div className="mt-6 border-t border-slate-100 pt-5">
                      <p className="text-2xl font-semibold text-slate-950">
                        {sekFormatter.format(servicePackage.monthlyPrice)}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">per month</p>
                    </div>
                    <dl className="mt-5 grid gap-2 text-sm">
                      <div className="flex justify-between gap-4">
                        <dt className="text-slate-500">Setup</dt>
                        <dd className="font-medium text-slate-900">
                          {sekFormatter.format(servicePackage.setupFee)}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-slate-500">Delivery</dt>
                        <dd className="font-medium text-slate-900">
                          {servicePackage.deliveryTime}
                        </dd>
                      </div>
                    </dl>
                    <ButtonLink
                      className="mt-6 w-full"
                      to="/register"
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

      <section className="bg-slate-950 text-white">
        <div className="page-shell py-14 sm:py-16">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold text-blue-300">
                Start with what your business needs now
              </p>
              <h2 className="mt-2 text-3xl font-semibold leading-tight sm:text-4xl">
                Turn your next digital project into a clear, trackable workflow
              </h2>
              <p className="mt-4 leading-7 text-slate-300">
                Compare service packages or create an account to keep requests,
                delivery, support, and reports connected from day one.
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <ButtonLink
                className="w-full border-white bg-white text-slate-950 hover:border-slate-200 hover:bg-slate-100 sm:w-auto"
                size="lg"
                to="/register"
              >
                Create Account
              </ButtonLink>
              <ButtonLink
                className="w-full border-slate-600 bg-slate-900 text-white hover:border-slate-500 hover:bg-slate-800 sm:w-auto"
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
