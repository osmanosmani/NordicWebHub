import { ReceiptText } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  getServiceOrders,
  updateServiceOrderStatus,
} from '../../api/serviceOrdersApi'
import { Alert } from '../../components/ui/Alert'
import { Card } from '../../components/ui/Card'
import { DataTable } from '../../components/ui/DataTable'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorMessage } from '../../components/ui/ErrorMessage'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { PageHeader } from '../../components/ui/PageHeader'
import { Select } from '../../components/ui/Select'
import { StatusBadge } from '../../components/ui/StatusBadge'
import type {
  ServiceOrder,
  ServiceOrderStatus,
} from '../../types/serviceOrder'
import { getErrorMessage } from '../../utils/getErrorMessage'
import {
  getServiceOrderStatusTone,
  serviceOrderStatuses,
} from '../../utils/serviceOrderStatus'

const sekFormatter = new Intl.NumberFormat('sv-SE', {
  currency: 'SEK',
  maximumFractionDigits: 0,
  style: 'currency',
})

export function AdminOrders() {
  const [orders, setOrders] = useState<ServiceOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadOrders() {
      setIsLoading(true)
      setError('')

      try {
        const loadedOrders = await getServiceOrders()

        if (isMounted) {
          setOrders(loadedOrders)
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

    void loadOrders()

    return () => {
      isMounted = false
    }
  }, [])

  async function handleStatusChange(
    order: ServiceOrder,
    status: ServiceOrderStatus,
  ) {
    if (order.status === status) {
      return
    }

    setUpdatingOrderId(order.id)
    setError('')
    setSuccessMessage('')

    try {
      const updatedOrder = await updateServiceOrderStatus(order.id, { status })

      setOrders((currentOrders) =>
        currentOrders.map((currentOrder) =>
          currentOrder.id === updatedOrder.id ? updatedOrder : currentOrder,
        ),
      )
      setSuccessMessage('Service order status updated.')
    } catch (updateError) {
      setError(
        getErrorMessage(
          updateError,
          'Could not update service order status. Please try again.',
        ),
      )
    } finally {
      setUpdatingOrderId(null)
    }
  }

  return (
    <section>
      <PageHeader
        description="Review customer service orders and manage their approval and demo payment status."
        eyebrow="Admin"
        title="Service Orders"
      />

      {error ? <ErrorMessage className="mt-6" message={error} /> : null}

      {successMessage ? (
        <Alert className="mt-6" tone="success">
          {successMessage}
        </Alert>
      ) : null}

      <Card
        className="mt-8"
        description="Payment states are tracked for demonstration only. No card payment is processed."
        title="All service orders"
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
            description="Customer orders will appear here when submitted."
            icon={<ReceiptText />}
            title="No service orders yet"
          />
        ) : null}

        {!isLoading && orders.length > 0 ? (
          <>
            <div className="divide-y divide-slate-200 md:hidden">
              {orders.map((order) => (
                <article className="p-5" key={order.id}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-slate-950">
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
                    <p className="mt-4 text-sm leading-6 text-slate-600">
                      {order.notes}
                    </p>
                  ) : null}

                  <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                    <OrderDetail label="Company" value={order.companyName} />
                    <OrderDetail label="Customer" value={order.customerEmail} />
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
                    <OrderDetail
                      label="Paid"
                      value={order.paidAt ? formatDate(order.paidAt) : 'Not paid'}
                    />
                  </dl>

                  <StatusSelect
                    disabled={updatingOrderId === order.id}
                    id={`mobile-order-status-${order.id}`}
                    onChange={(status) => void handleStatusChange(order, status)}
                    order={order}
                    wrapperClassName="mt-5"
                  />
                </article>
              ))}
            </div>

            <DataTable
              className="min-w-[1120px]"
              scrollLabel="Service orders table"
              showMobileHint={false}
              wrapperClassName="hidden md:block"
            >
              <thead className="bg-slate-50 text-xs text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Order</th>
                  <th className="px-5 py-3 font-semibold">Customer</th>
                  <th className="px-5 py-3 font-semibold">Package</th>
                  <th className="px-5 py-3 font-semibold">Amount</th>
                  <th className="px-5 py-3 font-semibold">Reference</th>
                  <th className="px-5 py-3 font-semibold">Dates</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="max-w-sm px-5 py-4 align-top">
                      <p className="font-semibold text-slate-950">
                        {order.title}
                      </p>
                      <p className="mt-1 text-slate-500">
                        {order.companyName}
                      </p>
                      {order.notes ? (
                        <p className="mt-2 line-clamp-2 text-xs text-slate-400">
                          {order.notes}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-5 py-4 align-top text-slate-700">
                      {order.customerEmail}
                    </td>
                    <td className="px-5 py-4 align-top text-slate-700">
                      {order.servicePackageName}
                    </td>
                    <td className="px-5 py-4 align-top font-semibold text-slate-950">
                      {sekFormatter.format(order.amount)}
                    </td>
                    <td className="max-w-48 break-words px-5 py-4 align-top text-slate-700">
                      {order.paymentReference || 'Not provided'}
                    </td>
                    <td className="px-5 py-4 align-top text-xs leading-5 text-slate-500">
                      <p>Created: {formatDate(order.createdAt)}</p>
                      <p>Updated: {formatDate(order.updatedAt)}</p>
                      <p>
                        Paid:{' '}
                        {order.paidAt ? formatDate(order.paidAt) : 'Not paid'}
                      </p>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <div className="mb-2">
                        <StatusBadge
                          label={order.status}
                          showDot
                          tone={getServiceOrderStatusTone(order.status)}
                        />
                      </div>
                      <StatusSelect
                        className="h-10 min-w-32 font-semibold"
                        disabled={updatingOrderId === order.id}
                        hideLabel
                        id={`order-status-${order.id}`}
                        onChange={(status) =>
                          void handleStatusChange(order, status)
                        }
                        order={order}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </DataTable>
          </>
        ) : null}
      </Card>
    </section>
  )
}

function StatusSelect({
  className,
  disabled,
  hideLabel = false,
  id,
  onChange,
  order,
  wrapperClassName,
}: {
  className?: string
  disabled: boolean
  hideLabel?: boolean
  id: string
  onChange: (status: ServiceOrderStatus) => void
  order: ServiceOrder
  wrapperClassName?: string
}) {
  return (
    <Select
      className={className}
      disabled={disabled}
      hideLabel={hideLabel}
      id={id}
      label={`Status for ${order.title}`}
      onChange={(event) => onChange(event.target.value as ServiceOrderStatus)}
      value={order.status}
      wrapperClassName={wrapperClassName}
    >
      {serviceOrderStatuses.map((status) => (
        <option key={status} value={status}>
          {status}
        </option>
      ))}
    </Select>
  )
}

function OrderDetail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-slate-500">{label}</dt>
      <dd className="mt-1 break-words font-semibold text-slate-950">{value}</dd>
    </div>
  )
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('sv-SE', {
    dateStyle: 'medium',
  }).format(new Date(value))
}
