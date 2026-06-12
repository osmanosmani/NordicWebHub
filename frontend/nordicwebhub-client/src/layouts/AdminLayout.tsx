import {
  Activity,
  Building2,
  ClipboardList,
  FolderKanban,
  LayoutDashboard,
  Package,
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
  },
  { to: '/admin/companies', label: 'Companies', icon: Building2 },
  { to: '/admin/packages', label: 'Packages', icon: Package },
  {
    to: '/admin/requests',
    label: 'Project Requests',
    icon: ClipboardList,
  },
  { to: '/admin/projects', label: 'Projects', icon: FolderKanban },
  { to: '/admin/tickets', label: 'Tickets', icon: TicketCheck },
  {
    to: '/admin/maintenance-logs',
    label: 'Maintenance Logs',
    icon: Wrench,
  },
  { to: '/admin/seo-reports', label: 'SEO Reports', icon: SearchCheck },
  { to: '/admin/website-check', label: 'Website Check', icon: Activity },
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
