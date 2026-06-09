import { NavLink, Outlet } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { useAuth } from '../context/useAuth'
import { cn } from '../utils/cn'

const adminLinks = [
  { to: '/admin/dashboard', label: 'Overview' },
  { to: '/admin/packages', label: 'Packages' },
  { to: '/admin/companies', label: 'Companies' },
  { to: '/admin/requests', label: 'Requests' },
]

export function AdminLayout() {
  const { logout, user } = useAuth()

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white p-5 lg:block">
        <div className="mb-8">
          <p className="text-lg font-semibold text-slate-950">NordicWebHub</p>
          <p className="mt-1 text-sm text-slate-500">Admin portal</p>
        </div>

        <nav className="grid gap-1">
          {adminLinks.map((link) => (
            <NavLink
              className={({ isActive }) =>
                cn(
                  'rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950',
                  isActive && 'bg-blue-50 text-blue-800',
                )
              }
              key={link.to}
              to={link.to}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="lg:pl-64">
        <header className="border-b border-slate-200 bg-white">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div>
              <p className="text-sm font-medium text-slate-500">Signed in as</p>
              <p className="text-sm font-semibold text-slate-950">
                {user?.fullName || user?.email}
              </p>
            </div>
            <Button className="h-10 px-3" onClick={() => void logout()} variant="secondary">
              Log out
            </Button>
          </div>
        </header>

        <main className="px-4 py-8 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
