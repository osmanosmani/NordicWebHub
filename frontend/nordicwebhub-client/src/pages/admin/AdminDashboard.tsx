import { PageHeader } from '../../components/ui/PageHeader'

const adminStats = [
  { label: 'Open requests', value: '4' },
  { label: 'Active projects', value: '6' },
  { label: 'Support tickets', value: '4' },
]

export function AdminDashboard() {
  return (
    <section>
      <PageHeader
        description="Operational overview for demo accounts, customer companies, requests, projects, and support work."
        eyebrow="Admin"
        title="Dashboard"
      />

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {adminStats.map((stat) => (
          <div
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            key={stat.label}
          >
            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">{stat.value}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
