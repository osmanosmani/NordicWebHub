import {
  BrainCircuit,
  Building2,
  ClipboardList,
  FolderKanban,
  Globe2,
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

const customerNavigationConfig = [
  {
    to: '/customer/dashboard',
    labelKey: 'common.dashboard',
    icon: LayoutDashboard,
    sectionKey: 'portal.overview',
  },
  {
    to: '/customer/company',
    labelKey: 'portal.myCompany',
    icon: Building2,
    sectionKey: 'portal.company',
  },
  {
    to: '/customer/packages',
    labelKey: 'portal.packages',
    icon: Package,
    sectionKey: 'portal.company',
  },
  {
    to: '/customer/orders',
    labelKey: 'portal.serviceOrders',
    icon: ReceiptText,
    sectionKey: 'portal.myWork',
  },
  {
    to: '/customer/requests',
    labelKey: 'portal.myRequests',
    icon: ClipboardList,
    sectionKey: 'portal.myWork',
  },
  {
    to: '/customer/projects',
    labelKey: 'portal.myProjects',
    icon: FolderKanban,
    sectionKey: 'portal.myWork',
  },
  {
    to: '/customer/tickets',
    labelKey: 'portal.supportTickets',
    icon: TicketCheck,
    sectionKey: 'portal.support',
  },
  {
    to: '/customer/maintenance-logs',
    labelKey: 'portal.maintenanceLogs',
    icon: Wrench,
    sectionKey: 'portal.support',
  },
  {
    to: '/customer/seo-reports',
    labelKey: 'portal.seoReports',
    icon: SearchCheck,
    sectionKey: 'portal.insights',
  },
  {
    to: '/customer/hosting-status',
    labelKey: 'portal.hostingStatus',
    icon: Globe2,
    sectionKey: 'portal.insights',
  },
  {
    to: '/customer/ai-seo',
    labelKey: 'portal.aiAssistant',
    icon: BrainCircuit,
    sectionKey: 'portal.insights',
  },
]

export function CustomerLayout() {
  const { logout, user } = useAuth()
  const { t } = useLanguage()
  const customerNavigation: PortalNavItem[] = customerNavigationConfig.map((item) => ({
    ...item,
    label: t(item.labelKey),
    section: t(item.sectionKey),
  }))

  return (
    <PortalShell
      navigation={customerNavigation}
      onLogout={logout}
      portalLabel={t('common.customerPortal')}
      user={user}
    />
  )
}
