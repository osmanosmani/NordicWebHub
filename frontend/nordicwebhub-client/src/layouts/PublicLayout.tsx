import { Link, NavLink, Outlet } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { cn } from '../utils/cn'

const publicLinks = [
  { to: '/', label: 'Home' },
  { to: '/pricing', label: 'Pricing' },
]

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="page-shell flex h-16 items-center justify-between gap-4">
          <Link className="text-lg font-semibold text-slate-950" to="/">
            NordicWebHub
          </Link>

          <nav className="hidden items-center gap-1 sm:flex">
            {publicLinks.map((link) => (
              <NavLink
                className={({ isActive }) =>
                  cn(
                    'rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950',
                    isActive && 'bg-slate-100 text-slate-950',
                  )
                }
                key={link.to}
                to={link.to}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link to="/login">
              <Button className="h-10 px-3" variant="ghost">
                Log in
              </Button>
            </Link>
            <Link to="/register">
              <Button className="h-10 px-3">Register</Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="page-shell flex flex-col gap-3 py-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>NordicWebHub client portal</span>
          <span>Built for secure customer access</span>
        </div>
      </footer>
    </div>
  )
}
