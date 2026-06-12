import { ButtonLink } from '../../components/ui/Button'
import { PageHeader } from '../../components/ui/PageHeader'

const portalHighlights = [
  {
    title: 'Projects',
    text: 'Track website, SEO, hosting, and support work in one place.',
  },
  {
    title: 'Requests',
    text: 'Send new service requests with clear status updates.',
  },
  {
    title: 'Support',
    text: 'Manage customer tickets and replies through a secure account.',
  },
]

export function Home() {
  return (
    <section className="page-shell py-12 sm:py-16">
      <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <PageHeader
            description="A focused client portal for digital agency work, built around secure accounts, project visibility, support, hosting, and SEO reporting."
            eyebrow="Client portal"
            title="NordicWebHub"
          />
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <ButtonLink className="w-full sm:w-auto" to="/login">
              Log in
            </ButtonLink>
            <ButtonLink
              className="w-full sm:w-auto"
              to="/pricing"
              variant="secondary"
            >
              View pricing
            </ButtonLink>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <p className="text-sm font-semibold text-slate-950">Portal overview</p>
              <p className="text-sm text-slate-500">Demo foundation</p>
            </div>
            <span className="rounded-lg bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-800">
              Active
            </span>
          </div>

          <div className="grid gap-3">
            {portalHighlights.map((item) => (
              <div
                className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                key={item.title}
              >
                <h2 className="text-sm font-semibold text-slate-950">{item.title}</h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
