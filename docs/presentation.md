# NordicWebHub Final Presentation

This document contains material for a short final school presentation, portfolio explanation, and GitHub project walkthrough.



## 1. Presentation Outline

## Introduction

- Project name: NordicWebHub
- Full-stack client portal for a digital agency
- Built as a realistic MVP for Swedish small and medium-sized businesses

## Problem and Idea

- Agency communication can become scattered across email, meetings, documents, and support messages.
- Customers want a clearer way to request services and follow progress.
- Agencies need one place to manage customers, projects, support, maintenance, reports, and orders.
- NordicWebHub solves this by centralizing the agency-client workflow in one portal.

## Target Users

- Admin: the agency team
- Customer: a business client with one connected company

## Tech Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS
- Backend: ASP.NET Core Web API and .NET 10
- Database: SQL Server with Entity Framework Core
- Authentication: ASP.NET Core Identity with HttpOnly cookies
- Security: CSRF protection, login lockout, role-based access, and customer data isolation

## Main Features

- Landing and pricing pages
- Admin and Customer dashboards
- Companies
- Service packages
- Project requests
- Projects
- Support tickets
- Service orders and payment status demo
- Maintenance logs
- SEO reports
- Website health and hosting status
- AI Service Assistant

## Admin Role

- Admin can manage all companies and operational data.
- Admin can update requests, projects, tickets, orders, maintenance logs, SEO reports, and website checks.

## Customer Role

- Customer can only access data connected to their own company.
- Customer can request services, track projects, open tickets, view reports, create service orders, and use the AI Service Assistant.

## Security and Authentication

- Login uses ASP.NET Core Identity.
- Auth is stored in an HttpOnly cookie, not localStorage.
- Unsafe requests use CSRF protection.
- Failed login attempts are counted with Identity lockout.
- Routes and APIs are protected by role.

## Database and Data Isolation

- Main ownership model: one Customer equals one Company.
- CompanyId is used as the boundary for customer data.
- Admin can access all data.
- Customer endpoints derive CompanyId from the logged-in user.

## Service Orders / Payment Status Demo

- Customers can create service orders from packages.
- Admin can update order status: Pending, Approved, Paid, Cancelled.
- This is a demo payment workflow, not real card processing.

## AI Service Assistant

- Customer fills in business needs.
- The system generates a structured recommendation using rule-based logic.
- No external AI API key is required for the demo.

## Testing

- Backend build
- Backend integration tests
- Frontend build
- Frontend lint
- Manual role-based smoke testing

## Completed

- Full-stack MVP with realistic core modules
- Role-based client portal
- Technical polish and UI polish
- Documentation and screenshot checklist

## Future Improvements

- Real payments
- Real AI integration
- Email notifications
- File uploads
- Production deployment
- More automated tests

## Closing

- NordicWebHub demonstrates a complete full-stack workflow for a digital agency portal.
- It combines practical business features, role-based security, clean UI, and realistic technical architecture.




## Before the Demo

Start the backend:

```powershell
cd backend\NordicWebHub.Api
dotnet run --launch-profile http
```

Start the frontend:

```powershell
cd frontend\nordicwebhub-client
npm run dev
```

Open:

```text
http://localhost:5173
```

## Demo Steps

1. Open the landing page.
   - Explain what NordicWebHub is.
   - Mention the agency/client portal idea.

2. Open the pricing page.
   - Show service packages.
   - Explain that customers can request services from packages.

3. Log in as a Customer demo user.
   - Mention HttpOnly cookie authentication briefly.

4. Show the Customer dashboard.
   - Point out company overview, active projects, tickets, and recent requests.

5. Open Project Requests.
   - Show existing requests or quickly create one if demo data allows.
   - Explain how a customer asks the agency for work.

6. Open Support Tickets.
   - Show ticket list and replies.
   - Explain communication between customer and agency.

7. Open Service Orders.
   - Show orders and payment statuses.
   - Explain that it is a demo workflow, not real payment processing.

8. Open AI Service Assistant.
   - Show previous recommendations or generate a new one.
   - Explain that it is rule-based and safe for demo.

9. Logout.

10. Log in as an Admin demo user.

11. Show Admin dashboard.
    - Highlight total customers, companies, requests, projects, and tickets.

12. Open Admin Companies and Packages.
    - Explain data management.

13. Open Admin Orders, Tickets, and Projects.
    - Show that Admin can manage all customer activity.

14. Explain role-based access.
    - Customer only sees own company data.
    - Admin sees all data.

15. Closing.
    - Mention completed MVP, security work, testing, and future improvements.

## 4. Screenshot Order

Use this order for README, portfolio, and presentation slides.

1. `01-public-home.png` - Public landing page
2. `02-public-pricing.png` - Pricing/service packages
3. `03-public-login.png` - Login page
4. `04-customer-dashboard.png` - Customer dashboard
5. `05-customer-requests.png` - Customer project requests
6. `06-customer-tickets.png` - Customer support tickets
7. `07-customer-service-orders.png` - Customer service orders
8. `08-customer-ai-service-assistant.png` - AI Service Assistant
9. `09-admin-dashboard.png` - Admin dashboard
10. `10-admin-companies.png` - Admin companies
11. `11-admin-packages.png` - Admin service packages
12. `12-admin-projects.png` - Admin projects
13. `13-admin-tickets.png` - Admin support tickets
14. `14-admin-service-orders.png` - Admin service orders
15. `15-admin-website-check.png` - Website check / hosting status
16. `16-mobile-navigation.png` - Mobile navigation view

Save screenshots in:

```text
docs/screenshots/
```

## 5. Final Project Summary

## GitHub README Summary

NordicWebHub is a full-stack client portal for digital agency services. It provides Admin and Customer workflows for service packages, companies, project requests, projects, support tickets, service orders, maintenance logs, SEO reports, website health checks, and AI-style service recommendations. The app is built with React, TypeScript, Tailwind CSS, ASP.NET Core Web API, Entity Framework Core, SQL Server, and ASP.NET Core Identity.

## Portfolio Card Summary

NordicWebHub is a full-stack B2B SaaS-style client portal for digital agencies. It includes secure role-based authentication, customer data isolation, project and support workflows, service orders, SEO reports, website health checks, and an AI Service Assistant. Built with React, TypeScript, Tailwind CSS, ASP.NET Core Web API, EF Core, SQL Server, and Identity.

## LinkedIn Post Draft

I completed NordicWebHub, a full-stack client portal MVP for digital agency services.

The project includes a React/TypeScript frontend, ASP.NET Core Web API backend, SQL Server database, ASP.NET Core Identity authentication, role-based access, CSRF protection, and customer data isolation.

Main features include Admin and Customer dashboards, companies, service packages, project requests, projects, support tickets, service orders, maintenance logs, SEO reports, website health checks, and an AI Service Assistant.

This project helped me practice building a realistic full-stack SaaS-style application with secure authentication, structured backend APIs, reusable frontend components, and a professional user interface.

