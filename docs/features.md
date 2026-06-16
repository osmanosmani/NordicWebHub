# Features

## Public Experience

- Landing page for the NordicWebHub service concept
- Pricing/service package page
- Login and registration pages
- Role-based redirect after login

## Authentication and Roles

- ASP.NET Core Identity user management
- Admin and Customer roles
- HttpOnly cookie authentication
- CSRF protection for unsafe requests
- Login lockout protection
- Protected frontend routes

## Admin Features

- Dashboard with operational metrics and recent activity
- Company management
- Service package management
- Project request review and status updates
- Project management
- Support ticket management
- Service order management and payment status demo
- Maintenance log management
- SEO report management
- Manual website health checks

## Customer Features

- Customer dashboard
- Own company profile
- Service package browsing
- Project request creation and tracking
- Project progress tracking
- Support ticket creation and replies
- Own service orders
- Maintenance log history
- SEO report history
- Hosting status view
- AI Service Assistant

## Service Orders / Payment Status Demo

Service Orders demonstrate how a customer could request a paid service package without implementing real card payments.

Supported demo statuses:

- Pending
- Approved
- Paid
- Cancelled

Payment status is managed by Admin users. This is a demo workflow only and does not process real payments.

## AI Service Assistant

The AI Service Assistant is implemented as a safe demo feature using rule-based recommendation logic. It does not require an external AI provider or API key.

Customers provide business context such as industry, city, business goals, target customers, needed services, budget, and timeline. The system generates a structured recommendation containing:

- Recommended package
- Recommended services
- Suggested website structure
- SEO keyword ideas
- Estimated priority
- Next steps
- Explanation

## Website Health Check

Admin users can run a manual website health check for companies that have a website URL. The system stores hosting status information and can create urgent support tickets when a site appears offline or unhealthy.
