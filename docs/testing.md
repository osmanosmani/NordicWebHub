# Testing

This document describes the basic checks used for NordicWebHub.

## Backend Build

Run from the backend API folder:

```powershell
cd backend\NordicWebHub.Api
dotnet build
```

## Backend Tests

Run from the repository root:

```powershell
dotnet test backend\NordicWebHub.Api.Tests\NordicWebHub.Api.Tests.csproj
```

The test project contains basic API integration tests.

## Frontend Build

Run from the frontend folder:

```powershell
cd frontend\nordicwebhub-client
npm run build
```

## Frontend Lint

Run from the frontend folder:

```powershell
cd frontend\nordicwebhub-client
npm run lint
```

## Manual Smoke Test

Start the backend:

```powershell
cd backend\NordicWebHub.Api
dotnet run --launch-profile http
```

Backend URLs:

```text
http://localhost:5096/swagger
http://localhost:5096/api/health
```

Start the frontend:

```powershell
cd frontend\nordicwebhub-client
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

## Manual Checks

- Login as Admin
- Login as Customer
- Refresh browser and verify `/api/auth/me` keeps the user logged in
- Logout
- Customer cannot open Admin pages
- Customer only sees own company data
- Admin can view all companies and records
- Create, update, and delete a service package as Admin
- Create a project request as Customer
- Update project request status as Admin
- Create and reply to support tickets
- Create a service order as Customer
- Update service order status as Admin
- Run website check as Admin
- Use AI Service Assistant as Customer

## Known Testing Notes

- Website health checks depend on reachable website URLs.
- Demo seed data is development-only.
- Real payment processing is not implemented.
- AI Service Assistant currently uses rule-based recommendation logic, not an external AI API.
