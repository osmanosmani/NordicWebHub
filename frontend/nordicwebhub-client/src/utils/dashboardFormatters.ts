export function formatDashboardDate(value: string) {
  return new Intl.DateTimeFormat('sv-SE', {
    dateStyle: 'medium',
  }).format(new Date(value))
}

export function formatDashboardStatus(status: string) {
  return status.replace(/([a-z])([A-Z])/g, '$1 $2')
}

export function getDashboardStatusTone(status: string) {
  const tones = {
    Approved: 'emerald',
    Closed: 'slate',
    Completed: 'emerald',
    Design: 'amber',
    Development: 'blue',
    InProgress: 'blue',
    Live: 'emerald',
    New: 'amber',
    Open: 'amber',
    Planning: 'amber',
    Rejected: 'red',
    Review: 'blue',
    Reviewed: 'blue',
    WaitingForCustomer: 'amber',
  } as const

  return tones[status as keyof typeof tones] ?? 'slate'
}

export function getDashboardPriorityTone(priority: string) {
  const tones = {
    High: 'red',
    Low: 'slate',
    Medium: 'blue',
    Urgent: 'red',
  } as const

  return tones[priority as keyof typeof tones] ?? 'slate'
}
