import {
  Activity,
  Building2,
  ClipboardList,
  FolderKanban,
  LayoutDashboard,
  Package,
  ReceiptText,
  SearchCheck,
  TicketCheck,
  Wrench,
} from 'lucide-react'
import { useAuth } from '../context/useAuth'
import { PortalShell, type PortalNavItem } from './PortalShell'

const adminNavigation: PortalNavItem[] = [
  {
    to: '/admin/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    section: 'Overview',
  },
  {
    to: '/admin/companies',
    label: 'Companies',
    icon: Building2,
    section: 'Client work',
  },
  {
    to: '/admin/packages',
    label: 'Packages',
    icon: Package,
    section: 'Client work',
  },
  {
    to: '/admin/orders',
    label: 'Service Orders',
    icon: ReceiptText,
    section: 'Client work',
  },
  {
    to: '/admin/requests',
    label: 'Project Requests',
    icon: ClipboardList,
    section: 'Client work',
  },
  {
    to: '/admin/projects',
    label: 'Projects',
    icon: FolderKanban,
    section: 'Client work',
  },
  {
    to: '/admin/tickets',
    label: 'Tickets',
    icon: TicketCheck,
    section: 'Support',
  },
  {
    to: '/admin/maintenance-logs',
    label: 'Maintenance Logs',
    icon: Wrench,
    section: 'Support',
  },
  {
    to: '/admin/seo-reports',
    label: 'SEO Reports',
    icon: SearchCheck,
    section: 'Insights',
  },
  {
    to: '/admin/website-check',
    label: 'Website Check',
    icon: Activity,
    section: 'Insights',
  },
]

export function AdminLayout() {
  const { logout, user } = useAuth()

  return (
    <PortalShell
      navigation={adminNavigation}
      onLogout={logout}
      portalLabel="Admin portal"
      user={user}
    />
  )
}
