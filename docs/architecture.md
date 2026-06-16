# Architecture

NordicWebHub is a decoupled full-stack application.

```text
React + TypeScript frontend
        |
        | HTTP API requests with credentials
        v
ASP.NET Core Web API
        |
        | EF Core
        v
SQL Server database
```

## Frontend Architecture

Frontend location:

```text
frontend/nordicwebhub-client
```

Main frontend structure:

```text
src/
  api/
  components/
    ui/
  context/
  layouts/
  pages/
    public/
    admin/
    customer/
  routes/
  types/
  utils/
```

Key frontend responsibilities:

- Route rendering through React Router
- Role-based route protection
- Auth state through AuthContext
- API communication through Axios
- CSRF token handling for unsafe requests
- Shared UI components for buttons, cards, forms, status badges, loading, errors, and empty states
- Separate Admin and Customer portal layouts

## Backend Architecture

Backend location:

```text
backend/NordicWebHub.Api
```

Main backend structure:

```text
Controllers/
Data/
DTOs/
Models/
Services/
Migrations/
```

Key backend responsibilities:

- Web API endpoints
- ASP.NET Core Identity user and role management
- Cookie authentication and authorization
- CSRF protection
- Entity Framework Core database access
- SQL Server persistence
- DTO-based API responses
- Resource-level access checks for Customer data
- Development/demo seed data

## Backend Controllers

The backend includes controllers for:

- Authentication
- Companies
- Dashboard
- Service Packages
- Project Requests
- Projects
- Support Tickets
- Service Orders
- Maintenance Logs
- SEO Reports
- Hosting Statuses
- Website Check
- AI SEO / AI Service Assistant

## Design Principles

The project intentionally avoids full Clean Architecture with multiple backend projects because the MVP scope is small and school/demo focused. The current structure keeps the code practical, readable, and suitable for a 3-week MVP while still separating controllers, DTOs, models, data access, and services.
