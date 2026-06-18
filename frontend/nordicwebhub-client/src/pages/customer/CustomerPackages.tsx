import { ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getPackages } from '../../api/packagesApi'
import { ButtonLink } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorMessage } from '../../components/ui/ErrorMessage'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { PageHeader } from '../../components/ui/PageHeader'
import { StatusBadge } from '../../components/ui/StatusBadge'
import type { ServicePackage } from '../../types/servicePackage'
import { getErrorMessage } from '../../utils/getErrorMessage'

const sekFormatter = new Intl.NumberFormat('sv-SE', {
  currency: 'SEK',
  maximumFractionDigits: 0,
  style: 'currency',
})

export function CustomerPackages() {
  const [packages, setPackages] = useState<ServicePackage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    getPackages()
      .then((loadedPackages) => {
        if (isMounted) {
          setPackages(loadedPackages)
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

  return (
    <section>
      <PageHeader
        description="Browse active service packages without leaving the customer portal."
        eyebrow="Customer"
        title="Packages"
      />

      {error ? <ErrorMessage className="mt-6" message={error} /> : null}

      {isLoading ? (
        <Card className="mt-8">
          <div className="flex items-center justify-center gap-3 p-8 text-sm font-medium text-slate-600">
            <LoadingSpinner label="Loading service packages" />
            <span>Loading service packages</span>
          </div>
        </Card>
      ) : null}

      {!isLoading && !error && packages.length === 0 ? (
        <Card className="mt-8">
          <EmptyState
            description="Please check again later or contact NordicWebHub."
            title="No active packages available"
          />
        </Card>
      ) : null}

      {!isLoading && !error && packages.length > 0 ? (
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {packages.map((servicePackage) => (
            <article
              className="flex min-h-full flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_20px_55px_-42px_rgba(37,99,235,0.45)]"
              key={servicePackage.id}
            >
              <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                  <StatusBadge label={servicePackage.category} tone="blue" />
                  <h2 className="mt-3 text-xl font-semibold text-slate-950">
                    {servicePackage.name}
                  </h2>
                </div>
              </div>

              <p className="text-sm leading-7 text-slate-600">
                {servicePackage.description}
              </p>

              <dl className="mt-6 grid gap-3 text-sm">
                <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-3">
                  <dt className="text-slate-500">Monthly price</dt>
                  <dd className="font-semibold text-slate-950">
                    {sekFormatter.format(servicePackage.monthlyPrice)}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-3">
                  <dt className="text-slate-500">Setup fee</dt>
                  <dd className="font-semibold text-slate-950">
                    {sekFormatter.format(servicePackage.setupFee)}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-3">
                  <dt className="text-slate-500">Delivery time</dt>
                  <dd className="font-semibold text-slate-950">
                    {servicePackage.deliveryTime}
                  </dd>
                </div>
              </dl>

              <div className="mt-auto pt-6">
                <ButtonLink
                  className="w-full"
                  to={`/customer/requests?packageId=${servicePackage.id}`}
                  trailingIcon={<ArrowRight className="h-4 w-4" />}
                >
                  Request this package
                </ButtonLink>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  )
}
