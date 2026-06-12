import { useEffect, useState } from 'react'
import { getPackages } from '../../api/packagesApi'
import { ButtonLink } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorMessage } from '../../components/ui/ErrorMessage'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { PageHeader } from '../../components/ui/PageHeader'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { useAuth } from '../../context/useAuth'
import type { ServicePackage } from '../../types/servicePackage'
import { getErrorMessage } from '../../utils/getErrorMessage'

const sekFormatter = new Intl.NumberFormat('sv-SE', {
  currency: 'SEK',
  maximumFractionDigits: 0,
  style: 'currency',
})

export function Pricing() {
  const { isAuthenticated } = useAuth()
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

  return (
    <section className="page-shell py-12 sm:py-16">
      <PageHeader
        description="Choose a digital service package and send a request from the client portal."
        eyebrow="Packages"
        title="Pricing"
      />

      {isLoading ? (
        <Card className="mt-8">
          <div className="flex items-center justify-center gap-3 p-8 text-sm font-medium text-slate-600">
            <LoadingSpinner label="Loading service packages" />
            <span>Loading service packages</span>
          </div>
        </Card>
      ) : null}

      {error ? (
        <ErrorMessage className="mt-8" message={error} />
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
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {packages.map((servicePackage) => (
            <article
              className="flex min-h-full flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              key={servicePackage.id}
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <StatusBadge label={servicePackage.category} tone="blue" />
                  <h2 className="mt-2 text-xl font-semibold text-slate-950">
                    {servicePackage.name}
                  </h2>
                </div>
              </div>

              <p className="text-sm leading-6 text-slate-600">
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
                  to={isAuthenticated ? '/customer/dashboard' : '/login'}
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
