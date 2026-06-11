import { StatusBadge } from './StatusBadge'

type HostingStatusBadgeProps = {
  isOnline: boolean
  statusCode: number
}

export function HostingStatusBadge({
  isOnline,
  statusCode,
}: HostingStatusBadgeProps) {
  if (!isOnline) {
    return <StatusBadge label="Offline" tone="red" />
  }

  if (statusCode >= 300) {
    return <StatusBadge label="Warning" tone="amber" />
  }

  return <StatusBadge label="Online" tone="emerald" />
}
