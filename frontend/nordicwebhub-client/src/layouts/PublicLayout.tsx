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
  const isHomePage = location.pathname === '/'

  function isLinkActive(to: string) {
    const [pathname, hash = ''] = to.split('#')

    return (
      location.pathname === pathname &&
      location.hash === (hash ? `#${hash}` : '')
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 border-b backdrop-blur-xl transition-colors supports-[backdrop-filter]:bg-opacity-90 md:sticky',
          isHomePage
            ? 'border-white/10 bg-slate-950/95 shadow-[0_16px_45px_-35px_rgba(14,165,233,0.65)]'
            : 'border-slate-200 bg-white/95 shadow-[0_10px_30px_-28px_rgba(15,23,42,0.3)]',
        )}
      >
        <div className="page-shell flex h-[4.5rem] items-center justify-between gap-4">
          <Link
            aria-label="NordicWebHub home"
            className="flex shrink-0 items-center gap-3"
            to="/"
          >
            <span
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold text-white shadow-sm ring-1 ring-white/10',
                isHomePage
                  ? 'bg-gradient-to-br from-blue-500 to-cyan-400'
                  : 'bg-blue-600',
              )}
            >
              N
            </span>
            <span className="grid">
              <span
                className={cn(
                  'text-[17px] font-semibold leading-5',
                  isHomePage ? 'text-white' : 'text-slate-950',
                )}
              >
                NordicWebHub
              </span>
              <span
                className={cn(
                  'hidden text-[12px] font-medium leading-4 sm:block',
                  isHomePage ? 'text-slate-300' : 'text-slate-500',
                )}
              >
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
                  'rounded-xl px-3.5 py-2.5 text-[13px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-4',
                  isHomePage
                    ? 'text-slate-100 hover:bg-white/10 hover:text-white focus-visible:ring-cyan-300/20'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 focus-visible:ring-blue-100',
                  isLinkActive(link.to) &&
                    (isHomePage
                      ? 'bg-white/10 font-semibold text-white'
                      : 'bg-blue-50 font-semibold text-blue-700'),
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
                className={
                  isHomePage
                    ? '!border-white/20 !bg-white !text-slate-950 hover:!bg-slate-100'
                    : undefined
                }
              >
                Open portal
              </ButtonLink>
            ) : (
              <>
                <ButtonLink
                  size="sm"
                  to="/login"
                  className={
                    isHomePage
                      ? '!text-slate-200 hover:!bg-white/10 hover:!text-white'
                      : undefined
                  }
                  variant={
                    location.pathname === '/login' ? 'secondary' : 'ghost'
                  }
                >
                  Log in
                </ButtonLink>
                <ButtonLink
                  className={
                    isHomePage
                      ? '!border-white/20 !bg-white !text-slate-950 hover:!bg-slate-100'
                      : undefined
                  }
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
            aria-controls="public-mobile-menu"
            aria-expanded={isMobileMenuOpen}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            className={cn(
              '!h-12 !w-12 shrink-0 !rounded-2xl !px-0 shadow-sm md:hidden',
              isHomePage
                ? '!border-white/20 !bg-white/10 !text-white shadow-[0_16px_40px_-24px_rgba(34,211,238,0.8)] hover:!bg-white/[0.15] focus-visible:!ring-cyan-300/20'
                : '!border-slate-300 !bg-white !text-slate-900 hover:!bg-slate-50 focus-visible:!ring-blue-100',
            )}
            onClick={() => setIsMobileMenuOpen((current) => !current)}
            title={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            variant="secondary"
          >
            {isMobileMenuOpen ? (
              <X
                aria-hidden="true"
                className="h-6 w-6"
                strokeWidth={2.6}
              />
            ) : (
              <Menu
                aria-hidden="true"
                className="h-6 w-6"
                strokeWidth={2.6}
              />
            )}
          </Button>
        </div>

        {isMobileMenuOpen ? (
          <>
            <button
              aria-label="Close mobile menu overlay"
              className="fixed inset-0 top-[4.5rem] z-40 bg-slate-950/45 backdrop-blur-sm md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
              type="button"
            />
            <div
              className={cn(
                'fixed left-3 right-3 top-[5.25rem] z-[60] max-h-[calc(100dvh-6rem)] overflow-y-auto rounded-2xl border shadow-[0_24px_70px_-34px_rgba(15,23,42,0.65)] ring-1 md:hidden',
                isHomePage
                  ? 'border-white/10 bg-slate-950/95 text-white ring-cyan-300/10'
                  : 'border-slate-200 bg-white text-slate-900 ring-slate-900/5',
              )}
              id="public-mobile-menu"
            >
              <div className="h-px bg-gradient-to-r from-blue-500 via-cyan-300 to-emerald-300" />
              <div className="grid gap-3 p-3">
                <div
                  className={cn(
                    'rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-wide',
                    isHomePage
                      ? 'bg-white/[0.06] text-cyan-100'
                      : 'bg-blue-50 text-blue-700',
                  )}
                >
                  Navigation
                </div>

                <nav
                  aria-label="Mobile public navigation"
                  className="grid gap-1"
                >
                  {publicLinks.map((link) => (
                    <Link
                      className={cn(
                        'flex items-center justify-between rounded-xl px-3 py-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-4',
                        isHomePage
                          ? 'text-slate-200 hover:bg-white/10 hover:text-white focus-visible:ring-cyan-300/20'
                          : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950 focus-visible:ring-blue-100',
                        isLinkActive(link.to) &&
                          (isHomePage
                            ? 'bg-white/10 text-white'
                            : 'bg-blue-50 text-blue-700'),
                      )}
                      key={link.to}
                      onClick={() => setIsMobileMenuOpen(false)}
                      to={link.to}
                    >
                      <span>{link.label}</span>
                      <ArrowRight
                        aria-hidden="true"
                        className="h-4 w-4 opacity-60"
                      />
                    </Link>
                  ))}
                </nav>

                <div
                  className={cn(
                    'grid grid-cols-2 gap-2 border-t pt-3',
                    isHomePage ? 'border-white/10' : 'border-slate-200',
                  )}
                >
                  {portalRoute ? (
                    <ButtonLink
                      className="col-span-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                      size="sm"
                      to={portalRoute}
                      trailingIcon={<ArrowRight className="h-4 w-4" />}
                    >
                      Open portal
                    </ButtonLink>
                  ) : (
                    <>
                      <ButtonLink
                        className={
                          isHomePage
                            ? '!border-white/20 !bg-white/[0.08] !text-white hover:!bg-white/[0.14]'
                            : undefined
                        }
                        onClick={() => setIsMobileMenuOpen(false)}
                        size="sm"
                        to="/login"
                        variant="secondary"
                      >
                        Log in
                      </ButtonLink>
                      <ButtonLink
                        className={
                          isHomePage
                            ? '!border-white !bg-white !text-slate-950 hover:!bg-slate-100'
                            : undefined
                        }
                        onClick={() => setIsMobileMenuOpen(false)}
                        size="sm"
                        to="/register"
                        trailingIcon={<ArrowRight className="h-4 w-4" />}
                      >
                        Create account
                      </ButtonLink>
                    </>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : null}
      </header>

      <main className="pt-[4.5rem] md:pt-0">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-gradient-to-b from-white to-slate-50">
        <div className="page-shell grid gap-10 py-16 md:grid-cols-2 lg:grid-cols-[1.25fr_0.8fr_0.8fr_0.75fr] lg:py-18">
          <div className="max-w-md">
            <Link
              aria-label="NordicWebHub home"
              className="inline-flex items-center gap-3"
              to="/"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white shadow-sm">
                N
              </span>
              <span className="text-[17px] font-semibold text-slate-950">
                NordicWebHub
              </span>
            </Link>
            <p className="mt-5 text-sm leading-7 text-slate-600">
              Digital agency services and a secure client portal for Swedish
              small businesses.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {['Web', 'SEO', 'Hosting', 'Support'].map((item) => (
                <span
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600"
                  key={item}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <nav
            aria-label="Platform navigation"
            className="grid content-start gap-3"
          >
            <p className="text-xs font-semibold uppercase text-slate-500">
              Platform
            </p>
            {[
              { to: '/#platform', label: 'Platform' },
              { to: '/#how-it-works', label: 'How it works' },
              { to: '/pricing', label: 'Pricing' },
              { to: portalRoute ?? '/login', label: 'Client portal' },
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
            aria-label="Service categories"
            className="grid content-start gap-3"
          >
            <p className="text-xs font-semibold uppercase text-slate-500">
              Services
            </p>
            {[
              { to: '/#services', label: 'Web Development' },
              { to: '/#services', label: 'SEO' },
              { to: '/#services', label: 'Hosting & Maintenance' },
              { to: '/#services', label: 'Support Tickets' },
            ].map((link) => (
              <Link
                className="text-sm font-medium text-slate-600 transition-colors hover:text-blue-700 focus-visible:rounded focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
                key={link.label}
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
