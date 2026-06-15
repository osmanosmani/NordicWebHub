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
    section: 'Overview',
  },
  {
    to: '/customer/company',
    label: 'My Company',
    icon: Building2,
    section: 'Company',
  },
  {
    to: '/pricing',
    label: 'Packages',
    icon: Package,
    end: true,
    section: 'Company',
  },
  {
    to: '/customer/requests',
    label: 'My Requests',
    icon: ClipboardList,
    section: 'My work',
  },
  {
    to: '/customer/projects',
    label: 'My Projects',
    icon: FolderKanban,
    section: 'My work',
  },
  {
    to: '/customer/tickets',
    label: 'Support Tickets',
    icon: TicketCheck,
    section: 'Support',
  },
  {
    to: '/customer/maintenance-logs',
    label: 'Maintenance Logs',
    icon: Wrench,
    section: 'Support',
  },
  {
    to: '/customer/seo-reports',
    label: 'SEO Reports',
    icon: SearchCheck,
    section: 'Insights',
  },
  {
    to: '/customer/hosting-status',
    label: 'Hosting Status',
    icon: Globe2,
    section: 'Insights',
  },
  {
    to: '/customer/ai-seo',
    label: 'AI SEO Assistant',
    icon: BrainCircuit,
    section: 'Insights',
  },
]

export function CustomerLayout() {
  const { logout, user } = useAuth()

  return (
    <PortalShell
      navigation={customerNavigation}
      onLogout={logout}
      portalLabel="Customer portal"
      user={user}
    />
  )
}
