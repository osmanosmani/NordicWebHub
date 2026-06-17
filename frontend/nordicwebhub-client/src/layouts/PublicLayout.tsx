import { useState } from 'react'
import { ArrowRight, Menu, X } from 'lucide-react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { Button, ButtonLink } from '../components/ui/Button'
import { useAuth } from '../context/useAuth'
import { getDefaultRouteForUser } from '../utils/authRoutes'
import { cn } from '../utils/cn'

const publicLinks = [
  { to: '/', label: 'Home' },
  { to: '/#services', label: 'Services' },
  { to: '/#how-it-works', label: 'How it works' },
  { to: '/#platform', label: 'Platform' },
  { to: '/pricing', label: 'Pricing' },
]

export function PublicLayout() {
  const location = useLocation()
  const { user } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const portalRoute = user ? getDefaultRouteForUser(user) : null

  function isLinkActive(to: string) {
    const [pathname, hash = ''] = to.split('#')

    return (
      location.pathname === pathname &&
      location.hash === (hash ? `#${hash}` : '')
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 shadow-[0_1px_2px_rgba(15,23,42,0.03)] backdrop-blur">
        <div className="page-shell flex h-16 items-center justify-between gap-4">
          <Link
            aria-label="NordicWebHub home"
            className="flex shrink-0 items-center gap-3"
            to="/"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
              N
            </span>
            <span className="grid">
              <span className="text-base font-semibold leading-5 text-slate-950">
                NordicWebHub
              </span>
              <span className="hidden text-[11px] font-medium leading-4 text-slate-500 sm:block">
                Digital services portal
              </span>
            </span>
          </Link>

          <nav
            aria-label="Public navigation"
            className="hidden items-center gap-1 md:flex"
          >
            {publicLinks.map((link) => (
              <Link
                className={cn(
                  'rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950',
                  isLinkActive(link.to) &&
                    'bg-blue-50 font-semibold text-blue-700',
                )}
                key={link.to}
                to={link.to}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            {portalRoute ? (
              <ButtonLink
                size="sm"
                to={portalRoute}
                trailingIcon={<ArrowRight className="h-4 w-4" />}
              >
                Open portal
              </ButtonLink>
            ) : (
              <>
                <ButtonLink
                  size="sm"
                  to="/login"
                  variant={
                    location.pathname === '/login' ? 'secondary' : 'ghost'
                  }
                >
                  Log in
                </ButtonLink>
                <ButtonLink
                  size="sm"
                  to="/register"
                  trailingIcon={<ArrowRight className="h-4 w-4" />}
                >
                  Create account
                </ButtonLink>
              </>
            )}
          </div>

          <Button
            aria-expanded={isMobileMenuOpen}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            className="h-10 w-10 px-0 md:hidden"
            onClick={() => setIsMobileMenuOpen((current) => !current)}
            title={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            variant="secondary"
          >
            {isMobileMenuOpen ? (
              <X aria-hidden="true" className="h-5 w-5" />
            ) : (
              <Menu aria-hidden="true" className="h-5 w-5" />
            )}
          </Button>
        </div>

        {isMobileMenuOpen ? (
          <div className="border-t border-slate-200 bg-white md:hidden">
            <div className="page-shell grid gap-1 py-3">
              {publicLinks.map((link) => (
                <Link
                  className={cn(
                    'rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950',
                    isLinkActive(link.to) &&
                      'bg-blue-50 font-semibold text-blue-700',
                  )}
                  key={link.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  to={link.to}
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-2 grid grid-cols-2 gap-2 border-t border-slate-200 pt-3">
                {portalRoute ? (
                  <ButtonLink
                    className="col-span-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                    size="sm"
                    to={portalRoute}
                  >
                    Open portal
                  </ButtonLink>
                ) : (
                  <>
                    <ButtonLink
                      onClick={() => setIsMobileMenuOpen(false)}
                      size="sm"
                      to="/login"
                      variant="secondary"
                    >
                      Log in
                    </ButtonLink>
                    <ButtonLink
                      onClick={() => setIsMobileMenuOpen(false)}
                      size="sm"
                      to="/register"
                    >
                      Create account
                    </ButtonLink>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="page-shell grid gap-10 py-14 md:grid-cols-[1.2fr_0.8fr] lg:grid-cols-[1.4fr_0.6fr_0.6fr] lg:py-16">
          <div className="max-w-sm">
            <Link
              aria-label="NordicWebHub home"
              className="inline-flex items-center gap-3"
              to="/"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
                N
              </span>
              <span className="text-base font-semibold text-slate-950">
                NordicWebHub
              </span>
            </Link>
            <p className="mt-5 text-sm leading-7 text-slate-600">
              Digital agency services and a secure client portal for Swedish
              small businesses.
            </p>
          </div>

          <nav
            aria-label="Services and platform"
            className="grid content-start gap-3"
          >
            <p className="text-xs font-semibold uppercase text-slate-500">
              Explore
            </p>
            {[
              { to: '/#services', label: 'Services' },
              { to: '/#how-it-works', label: 'How it works' },
              { to: '/#platform', label: 'Platform' },
              { to: '/pricing', label: 'Pricing' },
            ].map((link) => (
              <Link
                className="text-sm font-medium text-slate-600 transition-colors hover:text-blue-700 focus-visible:rounded focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
                key={link.to}
                to={link.to}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <nav
            aria-label="Account navigation"
            className="grid content-start gap-3"
          >
            <p className="text-xs font-semibold uppercase text-slate-500">
              Account
            </p>
            {portalRoute ? (
              <Link
                className="text-sm font-medium text-slate-600 transition-colors hover:text-blue-700 focus-visible:rounded focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
                to={portalRoute}
              >
                Open portal
              </Link>
            ) : (
              <>
                <Link
                  className="text-sm font-medium text-slate-600 transition-colors hover:text-blue-700 focus-visible:rounded focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
                  to="/login"
                >
                  Portal login
                </Link>
                <Link
                  className="text-sm font-medium text-slate-600 transition-colors hover:text-blue-700 focus-visible:rounded focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
                  to="/register"
                >
                  Create account
                </Link>
              </>
            )}
          </nav>
        </div>
        <div className="border-t border-slate-100">
          <div className="page-shell flex flex-col gap-2 py-5 text-xs leading-5 text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <span>© {new Date().getFullYear()} NordicWebHub.</span>
            <span>Portfolio demo with fictional Swedish business data.</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
