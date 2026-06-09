import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AdminLayout } from '../layouts/AdminLayout'
import { CustomerLayout } from '../layouts/CustomerLayout'
import { PublicLayout } from '../layouts/PublicLayout'
import { AdminCompanies } from '../pages/admin/AdminCompanies'
import { AdminDashboard } from '../pages/admin/AdminDashboard'
import { AdminPackages } from '../pages/admin/AdminPackages'
import { CustomerCompany } from '../pages/customer/CustomerCompany'
import { CustomerDashboard } from '../pages/customer/CustomerDashboard'
import { Home } from '../pages/public/Home'
import { Login } from '../pages/public/Login'
import { Pricing } from '../pages/public/Pricing'
import { Register } from '../pages/public/Register'
import { Unauthorized } from '../pages/public/Unauthorized'
import { ProtectedRoute } from './ProtectedRoute'

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'pricing',
        element: <Pricing />,
      },
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'register',
        element: <Register />,
      },
      {
        path: 'unauthorized',
        element: <Unauthorized />,
      },
    ],
  },
  {
    element: <ProtectedRoute allowedRole="Admin" />,
    children: [
      {
        path: 'admin',
        element: <AdminLayout />,
        children: [
          {
            index: true,
            element: <Navigate replace to="/admin/dashboard" />,
          },
          {
            path: 'dashboard',
            element: <AdminDashboard />,
          },
          {
            path: 'packages',
            element: <AdminPackages />,
          },
          {
            path: 'companies',
            element: <AdminCompanies />,
          },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute allowedRole="Customer" />,
    children: [
      {
        path: 'customer',
        element: <CustomerLayout />,
        children: [
          {
            index: true,
            element: <Navigate replace to="/customer/dashboard" />,
          },
          {
            path: 'dashboard',
            element: <CustomerDashboard />,
          },
          {
            path: 'company',
            element: <CustomerCompany />,
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate replace to="/" />,
  },
])
