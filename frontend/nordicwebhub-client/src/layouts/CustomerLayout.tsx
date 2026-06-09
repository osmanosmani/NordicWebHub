import { NavLink, Outlet } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { useAuth } from '../context/useAuth'
import { cn } from '../utils/cn'

const customerLinks = [
  { to: '/customer/dashboard', label: 'Overview' },
  { to: '/customer/company', label: 'My Company' },
  { to: '/customer/requests', label: 'Requests' },
  { to: '/customer/projects', label: 'Projects' },
]

export function CustomerLayout() {
  const { logout, user } = useAuth()

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="page-shell flex h-16 items-center justify-between gap-4">
          <div>
            <p className="text-lg font-semibold text-slate-950">NordicWebHub</p>
            <p className="text-sm text-slate-500">Customer portal</p>
          </div>

          <nav className="hidden items-center gap-1 md:flex">
            {customerLinks.map((link) => (
              <NavLink
                className={({ isActive }) =>
                  cn(
                    'rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950',
                    isActive && 'bg-emerald-50 text-emerald-800',
                  )
                }
                key={link.to}
                to={link.to}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <span className="hidden text-sm font-medium text-slate-600 sm:inline">
              {user?.fullName || user?.email}
            </span>
            <Button className="h-10 px-3" onClick={() => void logout()} variant="secondary">
              Log out
            </Button>
          </div>
        </div>
      </header>

      <main className="page-shell py-8">
        <Outlet />
      </main>
    </div>
  )
}
