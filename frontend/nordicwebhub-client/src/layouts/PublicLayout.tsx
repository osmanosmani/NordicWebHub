import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { Button, ButtonLink } from '../components/ui/Button'
import { cn } from '../utils/cn'

const publicLinks = [
  { to: '/', label: 'Home' },
  { to: '/pricing', label: 'Pricing' },
]

export function PublicLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="page-shell flex h-16 items-center justify-between gap-4">
          <Link className="flex items-center gap-3" to="/">
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
              <NavLink
                end={link.to === '/'}
                className={({ isActive }) =>
                  cn(
                    'rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950',
                    isActive && 'bg-blue-50 text-blue-700',
                  )
                }
                key={link.to}
                to={link.to}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <ButtonLink size="sm" to="/login" variant="ghost">
              Log in
            </ButtonLink>
            <ButtonLink size="sm" to="/register">
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
                <NavLink
                  className={({ isActive }) =>
                    cn(
                      'rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950',
                      isActive && 'bg-blue-50 text-blue-700',
                    )
                  }
                  end={link.to === '/'}
                  key={link.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  to={link.to}
                >
                  {link.label}
                </NavLink>
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
        <div className="page-shell grid gap-6 py-8 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <p className="text-sm font-semibold text-slate-950">NordicWebHub</p>
            <p className="mt-1 max-w-md text-sm leading-6 text-slate-500">
              A secure client portal for projects, support, hosting, and digital
              agency services.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
            {publicLinks.map((link) => (
              <Link
                className="font-medium text-slate-500 hover:text-slate-950"
                key={link.to}
                to={link.to}
              >
                {link.label}
              </Link>
            ))}
            <Link
              className="font-medium text-slate-500 hover:text-slate-950"
              to="/login"
            >
              Portal login
            </Link>
          </div>
        </div>
        <div className="border-t border-slate-100">
          <div className="page-shell py-4 text-xs text-slate-400">
            © {new Date().getFullYear()} NordicWebHub. Demo client portal.
          </div>
        </div>
      </footer>
    </div>
  )
}
