import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import type { AuthRole } from '../types/auth'

type ProtectedRouteProps = {
  allowedRole?: AuthRole
}

export function ProtectedRoute({ allowedRole }: ProtectedRouteProps) {
  const { isLoading, user } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="rounded-lg border border-slate-200 bg-white px-5 py-4 text-sm font-medium text-slate-700 shadow-sm">
          Loading session
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate replace state={{ from: location }} to="/login" />
  }

  if (allowedRole && user.role !== allowedRole) {
    return <Navigate replace to="/unauthorized" />
  }

  return <Outlet />
}
