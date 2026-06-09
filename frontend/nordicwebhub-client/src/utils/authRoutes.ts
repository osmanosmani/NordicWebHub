import type { AuthUser } from '../types/auth'

export function getDefaultRouteForUser(user: AuthUser) {
  return user.role === 'Admin' ? '/admin/dashboard' : '/customer/dashboard'
}
