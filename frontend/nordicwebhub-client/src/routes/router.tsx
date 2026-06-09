import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AdminLayout } from '../layouts/AdminLayout'
import { CustomerLayout } from '../layouts/CustomerLayout'
import { PublicLayout } from '../layouts/PublicLayout'
import { AdminCompanies } from '../pages/admin/AdminCompanies'
import { AdminDashboard } from '../pages/admin/AdminDashboard'
import { AdminPackages } from '../pages/admin/AdminPackages'
import { AdminProjects } from '../pages/admin/AdminProjects'
import { AdminRequests } from '../pages/admin/AdminRequests'
import { AdminTickets } from '../pages/admin/AdminTickets'
import { CustomerCompany } from '../pages/customer/CustomerCompany'
import { CustomerDashboard } from '../pages/customer/CustomerDashboard'
import { CustomerProjects } from '../pages/customer/CustomerProjects'
import { CustomerRequests } from '../pages/customer/CustomerRequests'
import { CustomerTickets } from '../pages/customer/CustomerTickets'
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
          {
            path: 'requests',
            element: <AdminRequests />,
          },
          {
            path: 'projects',
            element: <AdminProjects />,
          },
          {
            path: 'tickets',
            element: <AdminTickets />,
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
          {
            path: 'requests',
            element: <CustomerRequests />,
          },
          {
            path: 'projects',
            element: <CustomerProjects />,
          },
          {
            path: 'tickets',
            element: <CustomerTickets />,
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
