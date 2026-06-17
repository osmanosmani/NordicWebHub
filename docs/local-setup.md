# Local Setup

This guide explains how to run NordicWebHub locally.

## Requirements

- Git
- Node.js and npm
- .NET SDK compatible with the backend `TargetFramework`
- SQL Server LocalDB or SQL Server
- Optional: Visual Studio or VS Code

The current backend project targets `net10.0`. Use a compatible .NET SDK for local builds.

## 1. Clone the Repository

```powershell
git clone https://github.com/osmanosmani/NordicWebHub.git
cd NordicWebHub
```

## 2. Backend Setup

```powershell
cd backend\NordicWebHub.Api
dotnet restore
copy appsettings.Development.example.json appsettings.Development.json
```

Open `appsettings.Development.json` locally and configure:

- `ConnectionStrings:DefaultConnection`
- `SeedData:AdminPassword`
- `SeedData:CustomerPassword`
- `Cors:AllowedOrigins`

Do not commit `appsettings.Development.json`.

## 3. Database Setup

Apply EF Core migrations:

```powershell
dotnet ef database update
```

If `dotnet ef` is not installed:

```powershell
dotnet tool install --global dotnet-ef
```

## 4. Run the Backend

```powershell
dotnet run --launch-profile http
```

Useful URLs:

```text
http://localhost:5096/swagger
http://localhost:5096/api/health
```

## 5. Frontend Setup

Open a second terminal:

```powershell
cd frontend\nordicwebhub-client
npm install
copy .env.example .env
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

## 6. Demo Users

The development seed can create demo users for local testing. Passwords must be configured in local development settings.

| Email | Role |
| --- | --- |
| admin@nordicwebhub.se | Admin |
| customer@nordicwebhub.se | Customer |
| demo@nordicwebhub.se | Customer |

## 7. Verification Commands

Backend:

```powershell
dotnet build
```

Tests:

```powershell
dotnet test ..\NordicWebHub.Api.Tests\NordicWebHub.Api.Tests.csproj
```

Frontend:

```powershell
npm run build
npm run lint
```

## Common Issues

## API Executable Is Locked

If `dotnet build` says the API executable is being used by another process, stop the running API terminal and build again.

## CORS Errors

Make sure:

- Frontend runs on `http://localhost:5173`
- Backend `Cors:AllowedOrigins` includes `http://localhost:5173`
- Axios uses credentials

## Login Does Not Persist

Make sure:

- Backend and frontend are both running
- Browser cookies are allowed for localhost
- CSRF token endpoint is reachable
- The frontend `.env` points to the correct API base URL
