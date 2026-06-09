import { PageHeader } from '../../components/ui/PageHeader'

const packages = [
  {
    name: 'Starter Website',
    price: '499 SEK / month',
    setup: '4 990 SEK setup',
    detail: 'A clean website foundation for small companies.',
  },
  {
    name: 'Business Website',
    price: '999 SEK / month',
    setup: '12 990 SEK setup',
    detail: 'More pages, stronger structure, and lead-focused sections.',
  },
  {
    name: 'SEO Growth',
    price: '3 990 SEK / month',
    setup: '4 990 SEK setup',
    detail: 'Ongoing SEO improvements and monthly reporting.',
  },
]

export function Pricing() {
  return (
    <section className="page-shell py-12 sm:py-16">
      <PageHeader
        description="Simple package examples for the NordicWebHub demo portal."
        eyebrow="Packages"
        title="Pricing"
      />

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {packages.map((servicePackage) => (
          <article
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            key={servicePackage.name}
          >
            <h2 className="text-lg font-semibold text-slate-950">
              {servicePackage.name}
            </h2>
            <p className="mt-4 text-2xl font-semibold text-slate-950">
              {servicePackage.price}
            </p>
            <p className="mt-1 text-sm font-medium text-slate-500">
              {servicePackage.setup}
            </p>
            <p className="mt-5 text-sm leading-6 text-slate-600">
              {servicePackage.detail}
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}
