import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AdminLayout } from '../layouts/AdminLayout'
import { CustomerLayout } from '../layouts/CustomerLayout'
import { PublicLayout } from '../layouts/PublicLayout'
import { AdminCompanies } from '../pages/admin/AdminCompanies'
import { AdminDashboard } from '../pages/admin/AdminDashboard'
import { AdminMaintenanceLogs } from '../pages/admin/AdminMaintenanceLogs'
import { AdminPackages } from '../pages/admin/AdminPackages'
import { AdminProjects } from '../pages/admin/AdminProjects'
import { AdminRequests } from '../pages/admin/AdminRequests'
import { AdminSeoReports } from '../pages/admin/AdminSeoReports'
import { AdminTickets } from '../pages/admin/AdminTickets'
import { AdminWebsiteCheck } from '../pages/admin/AdminWebsiteCheck'
import { CustomerAiSeo } from '../pages/customer/CustomerAiSeo'
import { CustomerCompany } from '../pages/customer/CustomerCompany'
import { CustomerDashboard } from '../pages/customer/CustomerDashboard'
import { CustomerHostingStatus } from '../pages/customer/CustomerHostingStatus'
import { CustomerMaintenanceLogs } from '../pages/customer/CustomerMaintenanceLogs'
import { CustomerProjects } from '../pages/customer/CustomerProjects'
import { CustomerRequests } from '../pages/customer/CustomerRequests'
import { CustomerSeoReports } from '../pages/customer/CustomerSeoReports'
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
          {
            path: 'maintenance-logs',
            element: <AdminMaintenanceLogs />,
          },
          {
            path: 'seo-reports',
            element: <AdminSeoReports />,
          },
          {
            path: 'website-check',
            element: <AdminWebsiteCheck />,
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
          {
            path: 'maintenance-logs',
            element: <CustomerMaintenanceLogs />,
          },
          {
            path: 'seo-reports',
            element: <CustomerSeoReports />,
          },
          {
            path: 'hosting-status',
            element: <CustomerHostingStatus />,
          },
          {
            path: 'ai-seo',
            element: <CustomerAiSeo />,
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
