import { useState } from 'react'
import { ArrowRight, Menu, X } from 'lucide-react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { Button, ButtonLink } from '../components/ui/Button'
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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
          <Link className="flex shrink-0 items-center gap-3" to="/">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
              N
            </span>
            <span className="text-base font-semibold text-slate-950">
              NordicWebHub
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
            <ButtonLink
              size="sm"
              to="/login"
              variant={location.pathname === '/login' ? 'secondary' : 'ghost'}
            >
              Log in
            </ButtonLink>
            <ButtonLink
              size="sm"
              to="/register"
              trailingIcon={<ArrowRight className="h-4 w-4" />}
            >
              Register
            </ButtonLink>
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
                  Register
                </ButtonLink>
              </div>
            </div>
          </div>
        ) : null}
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="page-shell grid gap-8 py-10 md:grid-cols-[1fr_auto] md:items-start">
          <div className="max-w-md">
            <Link className="inline-flex items-center gap-3" to="/">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
                N
              </span>
              <span className="text-base font-semibold text-slate-950">
                NordicWebHub
              </span>
            </Link>
            <p className="mt-1 max-w-md text-sm leading-6 text-slate-500">
              A secure client portal for projects, support, hosting, and digital
              agency services.
            </p>
          </div>
          <nav
            aria-label="Footer navigation"
            className="flex max-w-xl flex-wrap gap-x-5 gap-y-3 text-sm"
          >
            {publicLinks.map((link) => (
              <Link
                className="font-medium text-slate-600 transition-colors hover:text-blue-700"
                key={link.to}
                to={link.to}
              >
                {link.label}
              </Link>
            ))}
            <Link
              className="font-medium text-slate-600 transition-colors hover:text-blue-700"
              to="/login"
            >
              Portal login
            </Link>
          </nav>
        </div>
        <div className="border-t border-slate-100">
          <div className="page-shell flex flex-col gap-1 py-4 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <span>© {new Date().getFullYear()} NordicWebHub.</span>
            <span>Demo client portal for Swedish digital services.</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
