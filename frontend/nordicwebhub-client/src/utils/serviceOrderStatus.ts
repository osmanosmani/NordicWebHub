import type { ServiceOrderStatus } from '../types/serviceOrder'

export const serviceOrderStatuses: ServiceOrderStatus[] = [
  'Pending',
  'Approved',
  'Paid',
  'Cancelled',
]

export function getServiceOrderStatusTone(
  status: ServiceOrderStatus,
): 'amber' | 'blue' | 'emerald' | 'red' {
  const tones: Record<
    ServiceOrderStatus,
    'amber' | 'blue' | 'emerald' | 'red'
  > = {
    Approved: 'blue',
    Cancelled: 'red',
    Paid: 'emerald',
    Pending: 'amber',
  }

  return tones[status]
}
