# NordicWebHub

NordicWebHub is a full-stack B2B SaaS-style client portal for digital service delivery. It gives agencies, Swedish companies, organizations, startups, freelancers, and digital service teams one secure workspace for service packages, project requests, project delivery, support tickets, maintenance work, SEO reports, hosting status, service orders, and AI-assisted service recommendations.

The project is built as a realistic MVP with a decoupled React frontend, ASP.NET Core Web API backend, SQL Server database, Identity-based authentication, role-based access, customer data isolation, and live cloud deployment. It is suitable for school review, portfolio documentation, and private GitHub publishing.

## Key Features

- Public landing page and pricing page
- Admin and Customer authentication
- Role-based dashboards
- Company management
- Service package management
- Project requests and project tracking
- Support tickets with replies
- Service Orders / Payment Status demo
- Maintenance logs
- SEO reports
- Manual website health check and hosting status
- AI Service Assistant with rule-based recommendations
- One Customer equals one Company data isolation
- HttpOnly cookie authentication and CSRF protection

## Tech Stack

Frontend:

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios

Backend:

- ASP.NET Core Web API
- Entity Framework Core
- SQL Server / SQL Server LocalDB
- ASP.NET Core Identity
- Cookie authentication
- Role-based authorization
- CSRF protection

> Note: the current backend project file targets `net10.0`. Use the matching .NET SDK for local builds, or intentionally retarget in a separate task if your environment requires another .NET version.

## Architecture Overview

```text
React + TypeScript + Vite frontend
        |
        | Axios API requests with credentials
        v
ASP.NET Core Web API
        |
        | Entity Framework Core
        v
SQL Server database
```

The frontend runs separately from the API and communicates through `/api` endpoints. Authentication is handled by the backend through HttpOnly cookies. Unsafe requests use CSRF tokens.

## Project Structure

```text
NordicWebHub/
  backend/
    NordicWebHub.Api/
    NordicWebHub.Api.Tests/
  frontend/
    nordicwebhub-client/
  docs/
    screenshots/
```

## Local Setup

Clone the repository and install dependencies:

```powershell
git clone https://github.com/osmanosmani/NordicWebHub.git
cd NordicWebHub
```

## Backend Setup

```powershell
cd backend\NordicWebHub.Api
dotnet restore
copy appsettings.Development.example.json appsettings.Development.json
```

Edit `appsettings.Development.json` locally:

- Set the local SQL Server connection string if needed.
- Set local demo seed passwords.
- Keep `Cors:AllowedOrigins` aligned with the frontend URL.

Apply migrations:

```powershell
dotnet ef database update
```

Run the API:

```powershell
dotnet run --launch-profile http
```

Useful API URLs:

```text
http://localhost:5096/swagger
http://localhost:5096/api/health
```

## Frontend Setup

```powershell
cd frontend\nordicwebhub-client
npm install
copy .env.example .env
npm run dev
```

Default frontend URL:

```text
http://localhost:5173
```

Default local API URL:

```text
http://localhost:5096/api
```

## Database Setup

The default local setup uses SQL Server LocalDB:

```json
"DefaultConnection": "Server=(localdb)\\MSSQLLocalDB;Database=NordicWebHub;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True"
```

For production, use a secure SQL Server or Azure SQL connection string through environment variables or hosting provider configuration. Do not commit production connection strings.

## Authentication and Roles

NordicWebHub uses ASP.NET Core Identity with two roles:

- Admin
- Customer

Admin users can manage all operational data. Customer users can only access records connected to their own company.

Authentication uses HttpOnly cookies. The frontend does not store JWT tokens in localStorage. Unsafe API requests use CSRF protection.

## Demo Users

Development seed data can create local demo users:

| Email | Role |
| --- | --- |
| admin@nordicwebhub.se | Admin |
| customer@nordicwebhub.se | Customer |
| demo@nordicwebhub.se | Customer |

Demo passwords are configured only in local development settings. Do not commit real passwords.

## Testing

Backend build:

```powershell
dotnet build backend\NordicWebHub.Api\NordicWebHub.Api.csproj
```

Backend tests:

```powershell
dotnet test backend\NordicWebHub.Api.Tests\NordicWebHub.Api.Tests.csproj
```

Frontend build:

```powershell
cd frontend\nordicwebhub-client
npm run build
```

Frontend lint:

```powershell
cd frontend\nordicwebhub-client
npm run lint
```

## Deployment Notes

Recommended deployment direction:

- React frontend: Vercel
- ASP.NET Core API: Azure App Service
- Database: Azure SQL for production or SQL Server LocalDB for demo

The frontend includes a Vercel SPA routing configuration. Backend deployment should use environment variables or hosting provider settings for connection strings, allowed frontend origins, and any optional API keys.

## Security Notes

- Do not commit `.env`, `appsettings.Development.json`, production appsettings files, API keys, tokens, certificates, database files, or backups.
- Keep demo credentials local.
- Use HTTPS-only cookies in production.
- Restrict CORS to the deployed frontend origin.
- Store production connection strings in secure hosting configuration.
- Review `.gitignore` before publishing.

## Documentation

More documentation is available in [docs](docs/README.md):

- Architecture
- Local setup
- Deployment notes
- Security checklist
- Project review checklist
- Testing
- Screenshot checklist

## Project Status

Completed:

- Core Admin and Customer portal workflows
- Authentication, roles, CSRF, and login lockout
- Customer data isolation
- Service Orders demo
- AI Service Assistant
- Public documentation and screenshot checklist

Known limitations:

- Service Orders are a demo payment workflow, not real card processing.
- AI Service Assistant uses rule-based recommendations unless optional external AI SEO configuration is added.
- Production deployment, monitoring, and production secret management are not included.

Future improvements:

- Stripe or another real payment provider
- Optional OpenAI or Azure OpenAI integration
- Email notifications
- File uploads
- Team/member accounts
- More automated integration tests
- Production deployment pipeline
