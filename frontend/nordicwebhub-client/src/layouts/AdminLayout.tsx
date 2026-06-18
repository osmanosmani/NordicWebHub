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
import { useLanguage } from '../context/useLanguage'
import { PortalShell, type PortalNavItem } from './PortalShell'

const adminNavigationConfig = [
  {
    to: '/admin/dashboard',
    labelKey: 'common.dashboard',
    icon: LayoutDashboard,
    sectionKey: 'portal.overview',
  },
  {
    to: '/admin/companies',
    labelKey: 'portal.companies',
    icon: Building2,
    sectionKey: 'portal.clientWork',
  },
  {
    to: '/admin/packages',
    labelKey: 'portal.packages',
    icon: Package,
    sectionKey: 'portal.clientWork',
  },
  {
    to: '/admin/orders',
    labelKey: 'portal.serviceOrders',
    icon: ReceiptText,
    sectionKey: 'portal.clientWork',
  },
  {
    to: '/admin/requests',
    labelKey: 'portal.projectRequests',
    icon: ClipboardList,
    sectionKey: 'portal.clientWork',
  },
  {
    to: '/admin/projects',
    labelKey: 'portal.projects',
    icon: FolderKanban,
    sectionKey: 'portal.clientWork',
  },
  {
    to: '/admin/tickets',
    labelKey: 'portal.tickets',
    icon: TicketCheck,
    sectionKey: 'portal.support',
  },
  {
    to: '/admin/maintenance-logs',
    labelKey: 'portal.maintenanceLogs',
    icon: Wrench,
    sectionKey: 'portal.support',
  },
  {
    to: '/admin/seo-reports',
    labelKey: 'portal.seoReports',
    icon: SearchCheck,
    sectionKey: 'portal.insights',
  },
  {
    to: '/admin/website-check',
    labelKey: 'portal.websiteCheck',
    icon: Activity,
    sectionKey: 'portal.insights',
  },
]

export function AdminLayout() {
  const { logout, user } = useAuth()
  const { t } = useLanguage()
  const adminNavigation: PortalNavItem[] = adminNavigationConfig.map((item) => ({
    ...item,
    label: t(item.labelKey),
    section: t(item.sectionKey),
  }))

  return (
    <PortalShell
      navigation={adminNavigation}
      onLogout={logout}
      portalLabel={t('common.adminPortal')}
      user={user}
    />
  )
}
