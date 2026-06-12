import {
  BrainCircuit,
  Building2,
  ClipboardList,
  FolderKanban,
  Globe2,
  LayoutDashboard,
  Package,
  SearchCheck,
  TicketCheck,
  Wrench,
} from 'lucide-react'
import { useAuth } from '../context/useAuth'
import { PortalShell, type PortalNavItem } from './PortalShell'

const customerNavigation: PortalNavItem[] = [
  {
    to: '/customer/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  { to: '/customer/company', label: 'My Company', icon: Building2 },
  { to: '/pricing', label: 'Packages', icon: Package, end: true },
  {
    to: '/customer/requests',
    label: 'My Requests',
    icon: ClipboardList,
  },
  { to: '/customer/projects', label: 'My Projects', icon: FolderKanban },
  {
    to: '/customer/tickets',
    label: 'Support Tickets',
    icon: TicketCheck,
  },
  {
    to: '/customer/maintenance-logs',
    label: 'Maintenance Logs',
    icon: Wrench,
  },
  { to: '/customer/seo-reports', label: 'SEO Reports', icon: SearchCheck },
  {
    to: '/customer/hosting-status',
    label: 'Hosting Status',
    icon: Globe2,
  },
  {
    to: '/customer/ai-seo',
    label: 'AI SEO Assistant',
    icon: BrainCircuit,
  },
]

export function CustomerLayout() {
  const { logout, user } = useAuth()

  return (
    <PortalShell
      accent="emerald"
      navigation={customerNavigation}
      onLogout={logout}
      portalLabel="Customer portal"
      user={user}
    />
  )
}
