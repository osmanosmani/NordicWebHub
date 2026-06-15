import { ReceiptText } from 'lucide-react'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { getPackages } from '../../api/packagesApi'
import {
  createServiceOrder,
  getMyServiceOrders,
} from '../../api/serviceOrdersApi'
import { Alert } from '../../components/ui/Alert'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorMessage } from '../../components/ui/ErrorMessage'
import { Input } from '../../components/ui/Input'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { PageHeader } from '../../components/ui/PageHeader'
import { Select } from '../../components/ui/Select'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { TextArea } from '../../components/ui/TextArea'
import type { ServiceOrder } from '../../types/serviceOrder'
import type { ServicePackage } from '../../types/servicePackage'
import { getErrorMessage } from '../../utils/getErrorMessage'
import { getServiceOrderStatusTone } from '../../utils/serviceOrderStatus'

type OrderFormState = {
  servicePackageId: string
  title: string
  notes: string
  paymentReference: string
}

const emptyForm: OrderFormState = {
  servicePackageId: '',
  title: '',
  notes: '',
  paymentReference: '',
}

const sekFormatter = new Intl.NumberFormat('sv-SE', {
  currency: 'SEK',
  maximumFractionDigits: 0,
  style: 'currency',
})

export function CustomerOrders() {
  const [orders, setOrders] = useState<ServiceOrder[]>([])
  const [packages, setPackages] = useState<ServicePackage[]>([])
  const [form, setForm] = useState<OrderFormState>(emptyForm)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const selectedPackage = useMemo(
    () =>
      packages.find(
        (servicePackage) => String(servicePackage.id) === form.servicePackageId,
      ) ?? null,
    [form.servicePackageId, packages],
  )

  useEffect(() => {
    let isMounted = true

    async function loadPageData() {
      setIsLoading(true)
      setError('')

      try {
        const [loadedOrders, loadedPackages] = await Promise.all([
          getMyServiceOrders(),
          getPackages(),
        ])

        if (isMounted) {
          setOrders(loadedOrders)
          setPackages(loadedPackages)
        }
      } catch (loadError) {
        if (isMounted) {
          setError(
            getErrorMessage(
              loadError,
              'Could not load service orders. Please try again.',
            ),
          )
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadPageData()

    return () => {
      isMounted = false
    }
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSaving(true)
    setError('')
    setSuccessMessage('')

    try {
      const createdOrder = await createServiceOrder({
        servicePackageId: Number(form.servicePackageId),
        title: form.title.trim(),
        notes: form.notes.trim(),
        paymentReference: form.paymentReference.trim() || undefined,
      })

      setOrders((currentOrders) => [createdOrder, ...currentOrders])
      setForm(emptyForm)
      setSuccessMessage('Service order created.')
    } catch (saveError) {
      setError(
        getErrorMessage(
          saveError,
          'Could not create the service order. Please try again.',
        ),
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section>
      <PageHeader
        description="Order a service package and follow its approval and payment status."
        eyebrow="Customer"
        title="Service Orders"
      />

      {error ? <ErrorMessage className="mt-6" message={error} /> : null}

      {successMessage ? (
        <Alert className="mt-6" tone="success">
          {successMessage}
        </Alert>
      ) : null}

      <div className="mt-8 grid gap-6 xl:grid-cols-[390px_1fr]">
        <form className="form-panel" onSubmit={handleSubmit}>
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-slate-950">New order</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Select a package. The final amount is calculated by the backend.
            </p>
          </div>

          <div className="form-stack">
            <Select
              disabled={packages.length === 0}
              id="orderServicePackageId"
              label="Service package"
              onChange={(event) =>
                setForm({ ...form, servicePackageId: event.target.value })
              }
              required
              value={form.servicePackageId}
            >
              <option value="">Choose a package</option>
              {packages.map((servicePackage) => (
                <option key={servicePackage.id} value={servicePackage.id}>
                  {servicePackage.name}
                </option>
              ))}
            </Select>

            {selectedPackage ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-950">
                  {selectedPackage.name}
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {selectedPackage.description}
                </p>
                <dl className="mt-4 grid gap-2 border-t border-slate-200 pt-4 text-sm">
                  <OrderDetail
                    label="Setup fee"
                    value={sekFormatter.format(selectedPackage.setupFee)}
                  />
                  <OrderDetail
                    label="Monthly price"
                    value={sekFormatter.format(selectedPackage.monthlyPrice)}
                  />
                  <OrderDetail
                    label="Initial order amount"
                    value={sekFormatter.format(
                      selectedPackage.setupFee + selectedPackage.monthlyPrice,
                    )}
                  />
                </dl>
              </div>
            ) : null}

            <Input
              id="orderTitle"
              label="Title"
              maxLength={200}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              placeholder="Example: Business website order"
              required
              value={form.title}
            />

            <TextArea
              id="orderNotes"
              label="Notes"
              maxLength={2000}
              onChange={(event) => setForm({ ...form, notes: event.target.value })}
              placeholder="Add any useful context for the agency."
              value={form.notes}
            />

            <Input
              hint="Optional demo reference. This does not process a payment."
              id="orderPaymentReference"
              label="Payment reference"
              maxLength={100}
              onChange={(event) =>
                setForm({ ...form, paymentReference: event.target.value })
              }
              placeholder="Example: PO-2026-014"
              value={form.paymentReference}
            />
          </div>

          <div className="form-actions">
            <Button
              disabled={packages.length === 0}
              isLoading={isSaving}
              loadingLabel="Creating order"
              type="submit"
            >
              Create order
            </Button>
          </div>
        </form>

        <Card
          description="Amounts and payment states are demo records, not real card transactions."
          title="My orders"
        >
          {isLoading ? (
            <div className="flex items-center gap-3 p-5 text-sm font-medium text-slate-600">
              <LoadingSpinner label="Loading service orders" />
              <span>Loading service orders</span>
            </div>
          ) : null}

          {!isLoading && orders.length === 0 ? (
            <EmptyState
              compact
              description="Choose a package to create your first service order."
              icon={<ReceiptText />}
              title="No service orders yet"
            />
          ) : null}

          {!isLoading && orders.length > 0 ? (
            <div className="divide-y divide-slate-200">
              {orders.map((order) => (
                <article className="p-5" key={order.id}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold text-slate-950">
                        {order.title}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {order.servicePackageName}
                      </p>
                    </div>
                    <StatusBadge
                      label={order.status}
                      showDot
                      tone={getServiceOrderStatusTone(order.status)}
                    />
                  </div>

                  {order.notes ? (
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {order.notes}
                    </p>
                  ) : null}

                  <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                    <OrderDetail
                      label="Amount"
                      value={sekFormatter.format(order.amount)}
                    />
                    <OrderDetail
                      label="Payment reference"
                      value={order.paymentReference || 'Not provided'}
                    />
                    <OrderDetail
                      label="Created"
                      value={formatDate(order.createdAt)}
                    />
                    <OrderDetail
                      label="Updated"
                      value={formatDate(order.updatedAt)}
                    />
                    {order.paidAt ? (
                      <OrderDetail
                        label="Paid"
                        value={formatDate(order.paidAt)}
                      />
                    ) : null}
                  </dl>
                </article>
              ))}
            </div>
          ) : null}
        </Card>
      </div>
    </section>
  )
}

function OrderDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 sm:block">
      <dt className="text-slate-500">{label}</dt>
      <dd className="break-words text-right font-semibold text-slate-950 sm:mt-1 sm:text-left">
        {value}
      </dd>
    </div>
  )
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('sv-SE', {
    dateStyle: 'medium',
  }).format(new Date(value))
}
