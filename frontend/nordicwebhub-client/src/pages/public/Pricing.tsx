import {
  ArrowRight,
  Check,
  ChevronDown,
  ClipboardList,
  FolderKanban,
  Headphones,
  ReceiptText,
  Search,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { useEffect, useState, type ComponentType } from 'react'
import { getPackages } from '../../api/packagesApi'
import { ButtonLink } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorMessage } from '../../components/ui/ErrorMessage'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { useAuth } from '../../context/useAuth'
import { useLanguage } from '../../context/useLanguage'
import type { ServicePackage } from '../../types/servicePackage'
import { getDefaultRouteForUser } from '../../utils/authRoutes'
import { cn } from '../../utils/cn'
import { getErrorMessage } from '../../utils/getErrorMessage'

type Icon = ComponentType<{ className?: string }>
type PricingCopyLanguage = 'en' | 'sv'

const sekFormatter = new Intl.NumberFormat('sv-SE', {
  currency: 'SEK',
  maximumFractionDigits: 0,
  style: 'currency',
})

const packageBenefits = [
  'Request and delivery history in one place',
  'Support and status updates through the portal',
  'Clear monthly and setup cost visibility',
  'Demo-friendly service order workflow',
]

const workflowSteps: Array<{
  title: string
  description: string
  icon: Icon
}> = [
  {
    title: 'Choose package',
    description: 'Compare practical starting points for website, SEO, support, and hosting work.',
    icon: ClipboardList,
  },
  {
    title: 'Send request',
    description: 'Create a structured request from the customer portal with context and budget.',
    icon: ReceiptText,
  },
  {
    title: 'Track delivery',
    description: 'Follow project status, support tickets, reports, and service orders in one workspace.',
    icon: FolderKanban,
  },
]

const includedFeatures = [
  {
    feature: 'Customer request portal',
    note: 'Structured intake instead of scattered email threads',
  },
  {
    feature: 'Project and ticket visibility',
    note: 'Progress, priorities, deadlines, and replies stay connected',
  },
  {
    feature: 'SEO and hosting overview',
    note: 'Reports, health status, and maintenance activity are visible',
  },
  {
    feature: 'Admin management workspace',
    note: 'The agency can manage packages, customers, requests, and orders',
  },
]

const faqs = [
  {
    question: 'How do I know which package is right for my business?',
    answer:
      'Start with the package that matches your most important goal. Choose a website package if you need a stronger online presence, SEO if visibility is the priority, or hosting and maintenance if you already have a website that needs ongoing care.',
  },
  {
    question: 'What happens after I request a package?',
    answer:
      'Your request is saved in the client portal so the agency can review the scope, ask follow-up questions, and turn approved work into a project, support case, service order, or report.',
  },
  {
    question: 'Can I start small and add more services later?',
    answer:
      'Yes. NordicWebHub is designed around a long-term client relationship. You can begin with one package and keep adding requests, support tickets, SEO reports, maintenance work, and service orders as your business grows.',
  },
  {
    question: 'How do I follow progress after the work starts?',
    answer:
      'The customer portal keeps project status, deadlines, support messages, maintenance logs, hosting checks, and SEO reports in one place, so you do not need to search through separate email threads.',
  },
  {
    question: 'Do I need technical knowledge to use the portal?',
    answer:
      'No. The portal is built for business owners and teams who want clear communication. You submit requests in plain language, and the agency can handle the technical planning and delivery workflow.',
  },
  {
    question: 'How are orders and payment status handled?',
    answer:
      'Service orders can show approval and payment status in the portal, which makes it easier to understand what has been requested, approved, or completed. For this version, payment tracking is informational and does not process real card payments.',
  },
]

const pricingSwedishCopy: Record<string, string> = {
  'Request and delivery history in one place':
    'Förfrågningar och leveranshistorik på ett ställe',
  'Support and status updates through the portal':
    'Support och statusuppdateringar via portalen',
  'Clear monthly and setup cost visibility':
    'Tydlig översikt över månadspris och startavgift',
  'Demo-friendly service order workflow':
    'Demovänligt flöde för tjänsteordrar',
  'Choose package': 'Välj paket',
  'Compare practical starting points for website, SEO, support, and hosting work.':
    'Jämför praktiska startpunkter för webb, SEO, support och hosting.',
  'Send request': 'Skicka förfrågan',
  'Create a structured request from the customer portal with context and budget.':
    'Skapa en strukturerad förfrågan från kundportalen med kontext och budget.',
  'Track delivery': 'Följ leveransen',
  'Follow project status, support tickets, reports, and service orders in one workspace.':
    'Följ projektstatus, supportärenden, rapporter och tjänsteordrar i en arbetsyta.',
  'Customer request portal': 'Kundportal för förfrågningar',
  'Structured intake instead of scattered email threads':
    'Strukturerat underlag i stället för spridda mejltrådar',
  'Project and ticket visibility': 'Synlighet för projekt och ärenden',
  'Progress, priorities, deadlines, and replies stay connected':
    'Framsteg, prioriteringar, deadlines och svar hålls ihop',
  'SEO and hosting overview': 'SEO- och hostingöversikt',
  'Reports, health status, and maintenance activity are visible':
    'Rapporter, hälsostatus och underhållsaktivitet är synliga',
  'Admin management workspace': 'Adminarbetsyta',
  'The agency can manage packages, customers, requests, and orders':
    'Byrån kan hantera paket, kunder, förfrågningar och ordrar',
  'The packages are demo-friendly starting points for Swedish companies, organizations, and digital service teams. Each one can become a request, order, project, ticket, or report inside NordicWebHub.':
    'Paketen är demovänliga startpunkter för svenska företag, organisationer och digitala serviceteam. Varje paket kan bli en förfrågan, order, projekt, ärende eller rapport i NordicWebHub.',
  'A quick overview of what the platform keeps connected around each service.':
    'En snabb översikt över vad plattformen håller ihop kring varje tjänst.',
  'Included around every package': 'Ingår kring varje paket',
  'Loading service packages': 'Laddar tjänstepaket',
  'Please check again later or contact NordicWebHub.':
    'Kontrollera igen senare eller kontakta NordicWebHub.',
  'No active packages available': 'Inga aktiva paket tillgängliga',
  'All services stay connected': 'Alla tjänster hålls ihop',
  'A package is only the starting point. The portal keeps the full delivery workflow visible.':
    'Ett paket är bara startpunkten. Portalen håller hela leveransflödet synligt.',
  'Project requests': 'Projektförfrågningar',
  'Service orders': 'Tjänsteordrar',
  'Project tracking': 'Projektuppföljning',
  'Support tickets': 'Supportärenden',
  'SEO visibility': 'SEO-synlighet',
  'Secure role access': 'Säker rollåtkomst',
  'Practical answers for companies and organizations comparing digital services, support, and ongoing website work.':
    'Praktiska svar för företag och organisationer som jämför digitala tjänster, support och löpande webbplatsarbete.',
  'Not sure where to start? Choose the closest package, describe your business goal, and keep the next steps, communication, and delivery history organized in the portal.':
    'Osäker på var du ska börja? Välj det paket som passar bäst, beskriv ditt mål och håll nästa steg, kommunikation och leveranshistorik samlat i portalen.',
  'How do I know which package is right for my business?':
    'Hur vet jag vilket paket som passar min verksamhet?',
  'Start with the package that matches your most important goal. Choose a website package if you need a stronger online presence, SEO if visibility is the priority, or hosting and maintenance if you already have a website that needs ongoing care.':
    'Börja med paketet som matchar ditt viktigaste mål. Välj ett webbpaket om du behöver en starkare närvaro online, SEO om synlighet är viktigast, eller hosting och underhåll om du redan har en webbplats som behöver löpande skötsel.',
  'What happens after I request a package?':
    'Vad händer efter att jag skickar en paketförfrågan?',
  'Your request is saved in the client portal so the agency can review the scope, ask follow-up questions, and turn approved work into a project, support case, service order, or report.':
    'Förfrågan sparas i kundportalen så att byrån kan granska omfattningen, ställa följdfrågor och göra godkänt arbete till projekt, supportärende, tjänsteorder eller rapport.',
  'Can I start small and add more services later?':
    'Kan jag börja enkelt och lägga till fler tjänster senare?',
  'Yes. NordicWebHub is designed around a long-term client relationship. You can begin with one package and keep adding requests, support tickets, SEO reports, maintenance work, and service orders as your business grows.':
    'Ja. NordicWebHub är byggt för långsiktiga kundrelationer. Du kan börja med ett paket och lägga till förfrågningar, supportärenden, SEO-rapporter, underhåll och tjänsteordrar när verksamheten växer.',
  'How do I follow progress after the work starts?':
    'Hur följer jag arbetet när det har startat?',
  'The customer portal keeps project status, deadlines, support messages, maintenance logs, hosting checks, and SEO reports in one place, so you do not need to search through separate email threads.':
    'Kundportalen samlar projektstatus, deadlines, supportmeddelanden, underhållsloggar, hostingkontroller och SEO-rapporter på ett ställe så att du slipper leta i separata mejltrådar.',
  'Do I need technical knowledge to use the portal?':
    'Behöver jag teknisk kunskap för att använda portalen?',
  'No. The portal is built for business owners and teams who want clear communication. You submit requests in plain language, and the agency can handle the technical planning and delivery workflow.':
    'Nej. Portalen är byggd för företagare och team som vill ha tydlig kommunikation. Du beskriver behovet med vanliga ord, och byrån hanterar den tekniska planeringen och leveransen.',
  'How are orders and payment status handled?':
    'Hur hanteras ordrar och betalstatus?',
  'Service orders can show approval and payment status in the portal, which makes it easier to understand what has been requested, approved, or completed. For this version, payment tracking is informational and does not process real card payments.':
    'Tjänsteordrar kan visa godkännande och betalstatus i portalen, vilket gör det enklare att se vad som är begärt, godkänt eller slutfört. I den här versionen är betalstatus informativ och inga riktiga kortbetalningar behandlas.',
  'This is a portfolio demo with fictional Swedish business data, built to show a realistic agency/customer portal workflow.':
    'Detta är en portfoliodemo med fiktiv svensk företagsdata, byggd för att visa ett realistiskt flöde mellan byrå och kundportal.',
}

function pricingCopy(text: string, language: PricingCopyLanguage) {
  return language === 'sv' ? pricingSwedishCopy[text] ?? text : text
}

function isRecommendedPackage(servicePackage: ServicePackage) {
  return /business|growth/i.test(servicePackage.name)
}

function getRequestRoute(servicePackageId: number, user: ReturnType<typeof useAuth>['user']) {
  if (!user) {
    return '/login'
  }

  if (user.role === 'Customer') {
    return `/customer/requests?packageId=${servicePackageId}`
  }

  return getDefaultRouteForUser(user)
}

export function Pricing() {
  const { user } = useAuth()
  const { language, t } = useLanguage()
  const copy = (text: string) => pricingCopy(text, language)
  const [packages, setPackages] = useState<ServicePackage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    getPackages()
      .then((servicePackages) => {
        if (isMounted) {
          setPackages(servicePackages)
          setError('')
        }
      })
      .catch((loadError: unknown) => {
        if (isMounted) {
          setError(
            getErrorMessage(
              loadError,
              'Could not load service packages. Please try again.',
            ),
          )
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  const recommendedPackageId =
    packages.find(isRecommendedPackage)?.id ?? packages[1]?.id

  return (
    <section className="bg-slate-50">
      <div className="relative isolate overflow-hidden border-b border-slate-200 bg-[#f7f3ea]">
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-0 h-72 w-[48rem] -translate-x-1/2 rounded-full bg-blue-200/40 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -right-24 top-36 h-64 w-64 rounded-full bg-emerald-200/30 blur-3xl"
        />
        <div className="page-shell relative z-10 py-14 text-center sm:py-20">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/70 px-4 py-2 text-sm font-semibold text-blue-800 shadow-sm">
            <Sparkles aria-hidden="true" className="h-4 w-4" />
            {t('pricing.badge')}
          </span>
          <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-semibold leading-[1.06] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
            {t('pricing.title')}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-700 sm:text-lg">
            {t('pricing.subtitle')}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <ButtonLink
              className="w-full sm:w-auto"
              size="lg"
              to={user ? getDefaultRouteForUser(user) : '/register'}
              trailingIcon={<ArrowRight className="h-4 w-4" />}
            >
              {user ? t('common.openPortal') : t('common.createAccount')}
            </ButtonLink>
            <ButtonLink
              className="w-full sm:w-auto"
              size="lg"
              to="#packages"
              variant="secondary"
            >
              {t('pricing.compare')}
            </ButtonLink>
          </div>
        </div>
      </div>

      <div className="page-shell py-12 sm:py-16">
        <div className="-mt-20 grid gap-4 md:grid-cols-3">
          {workflowSteps.map((step, index) => {
            const IconComponent = step.icon

            return (
              <article
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_18px_60px_-44px_rgba(15,23,42,0.42)]"
                key={step.title}
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
                    <IconComponent className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-semibold text-slate-400">
                    0{index + 1}
                  </span>
                </div>
                <h2 className="mt-5 text-base font-semibold text-slate-950">
                  {copy(step.title)}
                </h2>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  {copy(step.description)}
                </p>
              </article>
            )
          })}
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
          <div>
            <p className="text-sm font-semibold text-blue-700">
              {t('pricing.packages')}
            </p>
            <h2
              className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl"
              id="packages"
            >
              {t('pricing.choose')}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
              {copy(
                'The packages are demo-friendly starting points for Swedish companies, organizations, and digital service teams. Each one can become a request, order, project, ticket, or report inside NordicWebHub.',
              )}
            </p>
            <ul className="mt-6 grid gap-3 text-sm text-slate-700">
              {packageBenefits.map((benefit) => (
                <li className="flex gap-3" key={benefit}>
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  <span>{copy(benefit)}</span>
                </li>
              ))}
            </ul>
          </div>

          <Card
            className="rounded-2xl shadow-[0_20px_70px_-50px_rgba(15,23,42,0.5)]"
            description={copy(
              'A quick overview of what the platform keeps connected around each service.',
            )}
            title={copy('Included around every package')}
          >
            <div className="divide-y divide-slate-200">
              {includedFeatures.map((item) => (
                <div
                  className="grid gap-2 px-5 py-4 sm:grid-cols-[0.65fr_1fr] sm:gap-5 sm:px-6"
                  key={item.feature}
                >
                  <div className="flex items-center gap-2 font-semibold text-slate-950">
                    <Check
                      aria-hidden="true"
                      className="h-4 w-4 text-emerald-600"
                    />
                    {copy(item.feature)}
                  </div>
                  <p className="text-sm leading-6 text-slate-600">
                    {copy(item.note)}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {isLoading ? (
          <Card className="mt-8">
            <div className="flex items-center justify-center gap-3 p-8 text-sm font-medium text-slate-600">
              <LoadingSpinner label={copy('Loading service packages')} />
              <span>{copy('Loading service packages')}</span>
            </div>
          </Card>
        ) : null}

        {error ? <ErrorMessage className="mt-8" message={error} /> : null}

        {!isLoading && !error && packages.length === 0 ? (
          <Card className="mt-8">
            <EmptyState
              description={copy(
                'Please check again later or contact NordicWebHub.',
              )}
              title={copy('No active packages available')}
            />
          </Card>
        ) : null}

        {!isLoading && !error && packages.length > 0 ? (
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {packages.map((servicePackage) => {
              const isRecommended =
                recommendedPackageId === servicePackage.id

              return (
                <article
                  className={cn(
                    'relative flex min-h-full flex-col rounded-2xl border bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition hover:-translate-y-1 hover:shadow-[0_26px_70px_-46px_rgba(37,99,235,0.48)]',
                    isRecommended
                      ? 'border-blue-300 ring-2 ring-blue-100'
                      : 'border-slate-200 hover:border-blue-200',
                  )}
                  key={servicePackage.id}
                >
                  {isRecommended ? (
                    <span className="absolute right-4 top-4 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                      {t('pricing.recommended')}
                    </span>
                  ) : null}

                  <div className="mb-5 pr-24">
                    <StatusBadge label={servicePackage.category} tone="blue" />
                    <h3 className="mt-3 text-xl font-semibold text-slate-950">
                      {servicePackage.name}
                    </h3>
                  </div>

                  <p className="text-sm leading-7 text-slate-600">
                    {servicePackage.description}
                  </p>

                  <div className="mt-6 rounded-xl bg-slate-50 p-4">
                    <p className="text-3xl font-semibold tracking-tight text-slate-950">
                      {sekFormatter.format(servicePackage.monthlyPrice)}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {t('pricing.perMonth')}
                    </p>
                  </div>

                  <dl className="mt-5 grid gap-3 text-sm">
                    <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-3">
                      <dt className="text-slate-500">
                        {t('pricing.setupFee')}
                      </dt>
                      <dd className="font-semibold text-slate-950">
                        {sekFormatter.format(servicePackage.setupFee)}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-3">
                      <dt className="text-slate-500">
                        {t('pricing.deliveryTime')}
                      </dt>
                      <dd className="font-semibold text-slate-950">
                        {servicePackage.deliveryTime}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-auto pt-6">
                    <ButtonLink
                      className="w-full"
                      to={getRequestRoute(servicePackage.id, user)}
                      trailingIcon={<ArrowRight className="h-4 w-4" />}
                    >
                      {t('pricing.requestPackage')}
                    </ButtonLink>
                  </div>
                </article>
              )
            })}
          </div>
        ) : null}

        <div className="mt-14 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
          <Card
            accent="blue"
            className="rounded-2xl"
            title={copy('All services stay connected')}
            description={copy(
              'A package is only the starting point. The portal keeps the full delivery workflow visible.',
            )}
          >
            <div className="grid gap-3 p-5">
              {[
                { label: 'Project requests', icon: ClipboardList },
                { label: 'Service orders', icon: ReceiptText },
                { label: 'Project tracking', icon: FolderKanban },
                { label: 'Support tickets', icon: Headphones },
                { label: 'SEO visibility', icon: Search },
                { label: 'Secure role access', icon: ShieldCheck },
              ].map((item) => {
                const IconComponent = item.icon

                return (
                  <div
                    className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800"
                    key={item.label}
                  >
                    <IconComponent
                      aria-hidden="true"
                      className="h-4 w-4 text-blue-700"
                    />
                    {copy(item.label)}
                  </div>
                )
              })}
            </div>
          </Card>

          <Card
            className="rounded-2xl shadow-[0_20px_70px_-50px_rgba(15,23,42,0.5)]"
            title={t('pricing.questionsTitle')}
            description={copy(
              'Practical answers for companies and organizations comparing digital services, support, and ongoing website work.',
            )}
          >
            <div className="bg-slate-50/60 px-5 py-4 sm:px-6">
              <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-900">
                {copy(
                  'Not sure where to start? Choose the closest package, describe your business goal, and keep the next steps, communication, and delivery history organized in the portal.',
                )}
              </div>
            </div>
            <div className="divide-y divide-slate-200">
              {faqs.map((faq) => (
                <details
                  className="group px-5 py-5 transition hover:bg-slate-50 sm:px-6"
                  key={faq.question}
                >
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-base font-semibold leading-7 text-slate-950 focus-visible:rounded-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100">
                    <span>{copy(faq.question)}</span>
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition group-open:border-blue-200 group-open:bg-blue-50 group-open:text-blue-700">
                      <ChevronDown
                        aria-hidden="true"
                        className="h-4 w-4 transition group-open:rotate-180"
                      />
                    </span>
                  </summary>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
                    {copy(faq.answer)}
                  </p>
                </details>
              ))}
            </div>
          </Card>
        </div>

        <div className="mt-14 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 p-6 text-white shadow-[0_28px_90px_-55px_rgba(15,23,42,0.9)] sm:p-8 lg:flex lg:items-center lg:justify-between lg:gap-10">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-cyan-300">
              {t('home.finalEyebrow')}
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
              {t('pricing.ctaTitle')}
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              {copy(
                'This is a portfolio demo with fictional Swedish business data, built to show a realistic agency/customer portal workflow.',
              )}
            </p>
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row lg:mt-0">
            <ButtonLink
              className="!border-white !bg-white !text-slate-950 hover:!bg-slate-100"
              to={user ? getDefaultRouteForUser(user) : '/register'}
            >
              {user ? t('common.openPortal') : t('common.createAccount')}
            </ButtonLink>
            <ButtonLink
              className="!border-white/20 !bg-white/[0.06] !text-white hover:!bg-white/[0.12]"
              to="/#platform"
              variant="secondary"
            >
              {t('pricing.seePlatform')}
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  )
}
