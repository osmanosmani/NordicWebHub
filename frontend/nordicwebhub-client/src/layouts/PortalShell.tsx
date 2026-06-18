import { Fragment, useEffect, useState, type ReactNode } from 'react'
import {
  LogOut,
  Menu,
  ShieldCheck,
  X,
  type LucideIcon,
} from 'lucide-react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { LanguageToggle } from '../components/ui/LanguageToggle'
import { useLanguage } from '../context/useLanguage'
import type { AuthUser } from '../types/auth'
import { cn } from '../utils/cn'

export type PortalNavItem = {
  label: string
  to: string
  icon: LucideIcon
  end?: boolean
  section?: string
}

type PortalShellProps = {
  portalLabel: string
  navigation: PortalNavItem[]
  user: AuthUser | null
  onLogout: () => Promise<void>
  accent?: 'blue' | 'emerald'
  utility?: ReactNode
}

const accentClasses = {
  blue: {
    brand: 'bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-sm',
    active:
      'border-blue-200 bg-gradient-to-r from-blue-50 to-white text-blue-800 shadow-[0_12px_34px_-30px_rgba(37,99,235,0.9)]',
    icon: 'text-blue-700',
  },
  emerald: {
    brand:
      'bg-gradient-to-br from-emerald-600 to-teal-500 text-white shadow-sm',
    active:
      'border-emerald-200 bg-gradient-to-r from-emerald-50 to-white text-emerald-800 shadow-[0_12px_34px_-30px_rgba(16,185,129,0.9)]',
    icon: 'text-emerald-700',
  },
}

export function PortalShell({
  accent = 'blue',
  navigation,
  onLogout,
  portalLabel,
  user,
  utility,
}: PortalShellProps) {
  const { t } = useLanguage()
  const location = useLocation()
  const [isMobileNavigationOpen, setIsMobileNavigationOpen] = useState(false)
  const currentItem =
    navigation.find((item) =>
      item.end
        ? location.pathname === item.to
        : location.pathname.startsWith(item.to),
    ) ?? navigation[0]

  useEffect(() => {
    if (!isMobileNavigationOpen) {
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsMobileNavigationOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isMobileNavigationOpen])

  return (
    <div className="min-h-screen bg-[#f7f3ea] bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.08),transparent_32%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.08),transparent_30%)] text-slate-900">
      <PortalSidebar
        accent={accent}
        navigation={navigation}
        portalLabel={portalLabel}
      />

      {isMobileNavigationOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close navigation backdrop"
            className="absolute inset-0 bg-slate-950/35 backdrop-blur-[1px]"
            onClick={() => setIsMobileNavigationOpen(false)}
            type="button"
          />
          <aside
            aria-label={`${portalLabel} mobile navigation`}
            aria-modal="true"
            className="relative flex h-full w-[min(18rem,88vw)] flex-col border-r border-slate-200 bg-[#fffdf8] shadow-xl"
            role="dialog"
          >
            <div className="flex h-16 items-center justify-between border-b border-slate-200/80 px-4">
              <Brand portalLabel={portalLabel} tone={accent} />
              <Button
                aria-label="Close navigation"
                className="h-10 w-10 px-0"
                onClick={() => setIsMobileNavigationOpen(false)}
                title="Close navigation"
                variant="ghost"
              >
                <X aria-hidden="true" className="h-5 w-5" />
              </Button>
            </div>
            <PortalNavigation
              accent={accent}
              className="flex-1 overflow-y-auto p-3"
              navigation={navigation}
              onNavigate={() => setIsMobileNavigationOpen(false)}
            />
            <div className="border-t border-slate-200/80 bg-white/45 p-4">
              <UserPanel className="flex" user={user} />
              <div className="mt-4">
                <LanguageToggle />
              </div>
              <Button
                className="mt-4 w-full"
                leadingIcon={<LogOut className="h-4 w-4" />}
                onClick={() => void onLogout()}
                size="sm"
                variant="secondary"
              >
                {t('common.logOut')}
              </Button>
            </div>
          </aside>
        </div>
      ) : null}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-[#fffdf8]/92 shadow-[0_1px_2px_rgba(15,23,42,0.04)] backdrop-blur-xl">
          <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <Button
                aria-label="Open navigation"
                className="h-10 w-10 px-0 lg:hidden"
                onClick={() => setIsMobileNavigationOpen(true)}
                title="Open navigation"
                variant="secondary"
              >
                <Menu aria-hidden="true" className="h-5 w-5" />
              </Button>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-500">
                  {portalLabel}
                </p>
                <p className="truncate text-sm font-semibold text-slate-950">
                  {currentItem.label}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {utility}
              <LanguageToggle compact />
              <UserPanel className="hidden sm:flex" compact user={user} />
              <Button
                aria-label={t('common.logOut')}
                className="h-10 px-3"
                leadingIcon={<LogOut className="h-4 w-4" />}
                onClick={() => void onLogout()}
                size="sm"
                title={t('common.logOut')}
                variant="secondary"
              >
                <span className="hidden md:inline">{t('common.logOut')}</span>
              </Button>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function PortalSidebar({
  accent,
  navigation,
  portalLabel,
}: {
  accent: NonNullable<PortalShellProps['accent']>
  navigation: PortalNavItem[]
  portalLabel: string
}) {
  const { t } = useLanguage()

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-slate-200/80 bg-[#fffdf8]/95 shadow-[18px_0_55px_-50px_rgba(15,23,42,0.55)] backdrop-blur lg:flex lg:flex-col">
      <div className="flex h-16 items-center border-b border-slate-200/80 px-5">
        <Brand portalLabel={portalLabel} tone={accent} />
      </div>
      <PortalNavigation
        accent={accent}
        className="flex-1 overflow-y-auto p-4"
        navigation={navigation}
      />
      <div className="border-t border-slate-200/80 bg-white/45 px-5 py-4">
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs leading-5 text-slate-600 shadow-sm">
          <ShieldCheck aria-hidden="true" className="h-4 w-4 text-blue-600" />
          <span>{t('common.secureWorkspace')}</span>
        </div>
      </div>
    </aside>
  )
}

function Brand({
  portalLabel,
  tone,
}: {
  portalLabel: string
  tone: NonNullable<PortalShellProps['accent']>
}) {
  return (
    <Link className="flex min-w-0 items-center gap-3" to="/">
      <span
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold',
          accentClasses[tone].brand,
        )}
      >
        N
      </span>
      <span className="min-w-0">
        <span className="block truncate text-base font-semibold text-slate-950">
          NordicWebHub
        </span>
        <span className="block truncate text-xs text-slate-500">
          {portalLabel}
        </span>
      </span>
    </Link>
  )
}

function PortalNavigation({
  accent,
  className,
  navigation,
  onNavigate,
}: {
  accent: NonNullable<PortalShellProps['accent']>
  className?: string
  navigation: PortalNavItem[]
  onNavigate?: () => void
}) {
  return (
    <nav aria-label="Portal navigation" className={className}>
      <div className="grid gap-1">
        {navigation.map((item, index) => {
          const Icon = item.icon
          const showSection =
            item.section && item.section !== navigation[index - 1]?.section

          return (
            <Fragment key={item.to}>
              {showSection ? (
                <p
                  className={cn(
                    'px-3 pb-1 text-xs font-semibold text-slate-400',
                    index > 0 && 'mt-4',
                  )}
                >
                  {item.section}
                </p>
              ) : null}
              <NavLink
                className={({ isActive }) =>
                  cn(
                    'group flex min-h-10 items-center gap-3 rounded-xl border border-transparent px-3 py-2 text-sm font-medium text-slate-600 transition-all hover:border-slate-200 hover:bg-white hover:text-slate-950 hover:shadow-sm',
                    isActive && accentClasses[accent].active,
                  )
                }
                end={item.end}
                onClick={onNavigate}
                to={item.to}
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      aria-hidden="true"
                      className={cn(
                        'h-[18px] w-[18px] shrink-0 text-slate-400 transition-colors group-hover:text-slate-700',
                        isActive && accentClasses[accent].icon,
                      )}
                    />
                    <span className="truncate">{item.label}</span>
                  </>
                )}
              </NavLink>
            </Fragment>
          )
        })}
      </div>
    </nav>
  )
}

function UserPanel({
  className,
  compact = false,
  user,
}: {
  className?: string
  compact?: boolean
  user: AuthUser | null
}) {
  const displayName = user?.fullName || user?.email || 'Signed-in user'
  const initials = getInitials(displayName)

  return (
    <div className={cn('items-center gap-3', className)}>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-sm">
        {initials}
      </span>
      <span className={cn('min-w-0', compact && 'max-w-44')}>
        <span className="block truncate text-sm font-semibold text-slate-950">
          {displayName}
        </span>
        <span className="block truncate text-xs text-slate-500">
          {user?.email}
        </span>
      </span>
    </div>
  )
}

function getInitials(value: string) {
  const initials = value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')

  return initials || 'NW'
}
