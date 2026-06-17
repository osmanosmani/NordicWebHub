# Deployment Notes

NordicWebHub is currently prepared as a demo-ready full-stack project. Production deployment requires environment-specific configuration and secret management.

## Recommended Deployment Model

- Frontend: Vercel
- Backend API: Azure App Service
- Database: Azure SQL for production, SQL Server LocalDB for local demo

## Frontend Deployment

The frontend is a Vite React application located in:

```text
frontend/nordicwebhub-client
```

Recommended Vercel settings:

- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Environment variable:

```text
VITE_API_BASE_URL=https://your-api-host.example.com/api
```

The frontend folder includes `vercel.json` for SPA routing. This allows routes such as `/login`, `/admin/dashboard`, and `/customer/dashboard` to load correctly on refresh.

## Backend Deployment

The backend is an ASP.NET Core Web API located in:

```text
backend/NordicWebHub.Api
```

Recommended Azure App Service settings:

- Runtime: ASP.NET Core / .NET version matching the project target
- Environment: Production
- App settings for secrets and environment-specific values
- HTTPS enabled

Configure these through Azure App Service settings, not committed JSON files:

- `ConnectionStrings__DefaultConnection`
- `Cors__AllowedOrigins__0`
- `SeedData__AdminPassword` only for development/demo environments
- `SeedData__CustomerPassword` only for development/demo environments
- `OpenAI__ApiKey` or `OPENAI_API_KEY` only if optional external AI SEO generation is enabled

## Database Deployment

For production, use Azure SQL or another managed SQL Server instance.

Recommended approach:

1. Create the database.
2. Store the connection string in Azure App Service configuration.
3. Run migrations as a controlled deployment step.
4. Do not run destructive database commands against production.

## Authentication and Cookies

Production deployment should use HTTPS. Cookie settings are configured to be stricter outside development.

Before deployment, verify:

- Frontend and backend URLs are final.
- CORS allows only the deployed frontend origin.
- Cookies work across the deployed frontend and backend domains.
- CSRF token requests succeed.

## Publishing Checklist

- No real secrets in GitHub.
- `.env` and local appsettings files are ignored.
- Production connection strings are set in hosting provider settings.
- Frontend API URL points to the deployed backend.
- Backend CORS origin points to the deployed frontend.
- Database migrations are applied intentionally.
- Demo data is not used as production data.
