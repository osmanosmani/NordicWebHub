# Authentication and Security

NordicWebHub uses ASP.NET Core Identity and role-based authorization.

## Authentication

- User management: ASP.NET Core Identity
- Auth method: HttpOnly cookie authentication
- Roles: Admin and Customer
- Login lockout: enabled
- CSRF protection: enabled for unsafe API requests

## Roles

## Admin

Admin users can manage all operational data:

- Companies
- Packages
- Project requests
- Projects
- Tickets
- Service orders
- Maintenance logs
- SEO reports
- Website checks

## Customer

Customer users can only access their own company data.

Customer users can:

- View and update limited company fields
- Create project requests
- View their own projects
- Create and reply to their own support tickets
- View their own logs, SEO reports, hosting status, and orders
- Use the AI Service Assistant

## Cookie Authentication

The backend sets an HttpOnly authentication cookie after login.

Frontend rules:

- Do not store JWT tokens in localStorage.
- Axios sends requests with `withCredentials: true`.
- `/api/auth/me` is used to restore the logged-in user on app load.

## CSRF Protection

Unsafe API methods require a CSRF token:

- POST
- PUT
- PATCH
- DELETE

The frontend retrieves a token from:

```text
GET /api/csrf-token
```

It sends the token using:

```text
X-CSRF-TOKEN
```

Safe GET requests do not require CSRF validation.

## Login Lockout

Identity lockout is enabled to reduce brute force risk.

Current behavior:

- Failed login attempts are counted.
- Accounts can be temporarily locked after too many failed attempts.
- Error messages do not reveal whether an email exists.

## Data Isolation

The MVP follows one Customer equals one Company.

Important rules:

- Company ownership is stored through `Company.OwnerId`.
- Customer CompanyId is derived from the logged-in user.
- Customer endpoints must not accept CompanyId from request bodies when ownership should be inferred.
- Admin users can access all data.
- Customers receive `Forbid()` when attempting to access another customer's resources.

## Security Considerations

This project is demo-ready, but production deployment would require additional work:

- Production secrets through secure secret storage
- HTTPS-only cookies
- Production CORS restrictions
- Monitoring and logging
- More integration and authorization tests
- Deployment-specific database backups and migration process
- Real payment provider integration if payments are added

## Secrets

Do not commit:

- Real connection strings with passwords
- API keys
- JWT secrets
- Production credentials
- `.env` files
- `appsettings.Development.json`
- `appsettings.Production.json`

The tracked development example file uses placeholders only.
