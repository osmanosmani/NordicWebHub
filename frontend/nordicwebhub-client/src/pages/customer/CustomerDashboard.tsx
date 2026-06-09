import { PageHeader } from '../../components/ui/PageHeader'

const customerItems = [
  'Project progress',
  'Support tickets',
  'Hosting status',
  'SEO reports',
]

export function CustomerDashboard() {
  return (
    <section>
      <PageHeader
        description="Customer overview for current project work, support, hosting, and SEO reporting."
        eyebrow="Customer"
        title="Dashboard"
      />

      <div className="mt-8 grid gap-3">
        {customerItems.map((item) => (
          <div
            className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
            key={item}
          >
            <span className="text-sm font-semibold text-slate-900">{item}</span>
            <span className="rounded-lg bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
              Ready
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
