import { useEffect, useState, type ReactNode } from 'react'
import {
  LogOut,
  Menu,
  X,
  type LucideIcon,
} from 'lucide-react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import type { AuthUser } from '../types/auth'
import { cn } from '../utils/cn'

export type PortalNavItem = {
  label: string
  to: string
  icon: LucideIcon
  end?: boolean
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
    brand: 'bg-blue-600 text-white',
    active: 'bg-blue-50 text-blue-700',
    icon: 'text-blue-600',
  },
  emerald: {
    brand: 'bg-emerald-600 text-white',
    active: 'bg-emerald-50 text-emerald-700',
    icon: 'text-emerald-600',
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

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsMobileNavigationOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isMobileNavigationOpen])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <PortalSidebar
        accent={accent}
        navigation={navigation}
        portalLabel={portalLabel}
      />

      {isMobileNavigationOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close navigation"
            className="absolute inset-0 bg-slate-950/30"
            onClick={() => setIsMobileNavigationOpen(false)}
            type="button"
          />
          <aside
            aria-label={`${portalLabel} mobile navigation`}
            aria-modal="true"
            className="relative flex h-full w-[min(19rem,85vw)] flex-col border-r border-slate-200 bg-white shadow-xl"
            role="dialog"
          >
            <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4">
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
            <UserPanel className="border-t border-slate-200 p-4" user={user} />
          </aside>
        </div>
      ) : null}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
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
                <p className="text-xs font-semibold uppercase text-slate-500">
                  {portalLabel}
                </p>
                <p className="truncate text-sm font-semibold text-slate-950">
                  {currentItem.label}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {utility}
              <UserPanel className="hidden sm:flex" compact user={user} />
              <Button
                aria-label="Log out"
                className="h-10 px-3"
                leadingIcon={<LogOut className="h-4 w-4" />}
                onClick={() => void onLogout()}
                size="sm"
                title="Log out"
                variant="secondary"
              >
                <span className="hidden md:inline">Log out</span>
              </Button>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-screen-2xl px-4 py-8 sm:px-6 lg:px-8">
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
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-slate-200 bg-white lg:flex lg:flex-col">
      <div className="flex h-20 items-center border-b border-slate-200 px-5">
        <Brand portalLabel={portalLabel} tone={accent} />
      </div>
      <PortalNavigation
        accent={accent}
        className="flex-1 overflow-y-auto p-4"
        navigation={navigation}
      />
      <div className="border-t border-slate-200 px-5 py-4 text-xs leading-5 text-slate-500">
        Secure NordicWebHub workspace
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
      <p className="mb-2 px-3 text-xs font-semibold uppercase text-slate-400">
        Workspace
      </p>
      <div className="grid gap-1">
        {navigation.map((item) => {
          const Icon = item.icon

          return (
            <NavLink
              className={({ isActive }) =>
                cn(
                  'group flex min-h-10 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950',
                  isActive && accentClasses[accent].active,
                )
              }
              end={item.end}
              key={item.to}
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
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
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
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
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
