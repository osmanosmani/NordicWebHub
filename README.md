# NordicWebHub

NordicWebHub is a full-stack client portal for digital agency services. It helps an agency manage service packages, customer companies, project requests, active projects, support tickets, maintenance logs, SEO reports, hosting status, service orders, and AI-style service recommendations in one place.

The project is built as a realistic Swedish B2B SaaS-style MVP with a React/TypeScript frontend and an ASP.NET Core Web API backend.

## Tech Stack

## Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios

## Backend

- ASP.NET Core Web API
- .NET 10
- Entity Framework Core
- SQL Server / LocalDB
- ASP.NET Core Identity
- Cookie authentication
- CSRF protection
- Role-based authorization

## Main Features

- Public landing page and pricing page
- Admin and Customer login
- HttpOnly cookie authentication
- CSRF protection for unsafe API requests
- Admin dashboard
- Customer dashboard
- Company management
- Service package management
- Project requests
- Project tracking
- Support tickets and replies
- Service Orders / Payment Status demo
- Maintenance logs
- SEO reports
- Website health check / hosting status
- AI Service Assistant with rule-based recommendations
- One Customer equals one Company data isolation

## User Roles

## Admin

Admin users can manage all operational data:

- Companies
- Service packages
- Project requests
- Projects
- Support tickets
- Service orders
- Maintenance logs
- SEO reports
- Website checks

## Customer

Customer users can access only their own company data:

- Own company profile
- Own project requests
- Own projects
- Own support tickets
- Own service orders
- Own maintenance logs
- Own SEO reports
- Own hosting status
- AI Service Assistant

## Screenshots

Screenshots should be saved in:

```text
docs/screenshots/
```

Suggested screenshots:

- Public landing page
- Pricing page
- Login page
- Admin dashboard
- Admin service orders
- Customer dashboard
- Customer service orders
- Customer AI Service Assistant
- Mobile navigation

See [docs/screenshot-checklist.md](docs/screenshot-checklist.md) for the full screenshot list.

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

## Backend Setup

From the repository root:

```powershell
cd backend\NordicWebHub.Api
dotnet restore
```

Create a local development settings file:

```powershell
copy appsettings.Development.example.json appsettings.Development.json
```

Then edit `appsettings.Development.json` locally and set demo seed passwords. This file is ignored by Git and should not be committed.

Apply database migrations:

```powershell
dotnet ef database update
```

Run the backend:

```powershell
dotnet run --launch-profile http
```

Backend URLs:

```text
http://localhost:5096/swagger
http://localhost:5096/api/health
```

## Frontend Setup

From the repository root:

```powershell
cd frontend\nordicwebhub-client
npm install
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

## Demo Users

The development seed can create these demo users when seed passwords are configured locally:

| Email | Role |
| --- | --- |
| admin@nordicwebhub.se | Admin |
| customer@nordicwebhub.se | Customer |
| demo@nordicwebhub.se | Customer |

Passwords are configured locally in ignored development settings. Do not commit real credentials.

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

## Security Notes

- Authentication uses HttpOnly cookies.
- Frontend does not store JWT tokens in localStorage.
- Unsafe API requests require CSRF tokens.
- Admin and Customer authorization is enforced on the backend.
- Customer data is isolated through CompanyId and OwnerId.
- Development/demo seed data is not intended for production.
- Do not commit `appsettings.Development.json`, `.env` files, production credentials, API keys, or database backups.

## Documentation

More documentation is available in the [docs](docs/README.md) folder:

- Project overview
- Features
- Architecture
- Database
- Authentication and security
- Testing
- Future improvements
- Screenshot checklist

## Project Status

NordicWebHub is a demo-ready MVP for final presentation, screenshots, documentation, and private GitHub review.

It is not production-ready without deployment hardening, production secrets management, monitoring, stronger test coverage, and real payment provider integration.

## Future Improvements

- Real payment provider integration
- Email notifications
- File uploads
- Advanced reporting
- Scheduled website health checks
- More integration tests
- Production deployment configuration
