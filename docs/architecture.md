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

## API Communication

The frontend uses Axios with credentials enabled. The API base URL is configured through the Vite environment variable:

```text
VITE_API_BASE_URL=http://localhost:5096/api
```

For production deployment, this value should point to the deployed ASP.NET Core API URL.

Authentication is cookie-based:

- `POST /api/auth/login` signs the user in and sets an HttpOnly cookie.
- `GET /api/auth/me` restores the current user on app load.
- `POST /api/auth/logout` clears the cookie.
- Unsafe requests include a CSRF token from `GET /api/csrf-token`.

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

## Configuration

The backend reads local configuration from appsettings files and environment variables. Safe example files are committed, while local development files with real values are ignored by Git.

Important local configuration areas:

- `ConnectionStrings:DefaultConnection`
- `SeedData:AdminPassword`
- `SeedData:CustomerPassword`
- `Cors:AllowedOrigins`
- Optional `OpenAI:ApiKey` or `OPENAI_API_KEY` if external AI SEO generation is enabled

Do not commit real secrets or production credentials.

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
