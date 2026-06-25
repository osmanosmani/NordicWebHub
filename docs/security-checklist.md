# Security Checklist

Use this checklist before publishing to GitHub or preparing a demo.

## Git and Repository Safety

- [ ] `.env` files are not committed.
- [ ] `appsettings.Development.json` is not committed.
- [ ] `appsettings.Production.json` is not committed.
- [ ] Database files, backups, and exports are not committed.
- [ ] `bin/`, `obj/`, `node_modules/`, `dist/`, `.vs/`, and publish output are ignored.
- [ ] No real client data is included.
- [ ] No private local machine paths are required for the app to run.

## Configuration

- [ ] Connection strings with passwords are stored outside Git.
- [ ] Demo seed passwords are local only.
- [ ] API keys are stored in environment variables or secure hosting settings.
- [ ] `VITE_API_BASE_URL` is configured per environment.
- [ ] `Cors:AllowedOrigins` contains only trusted frontend origins.

## Authentication

- [ ] ASP.NET Core Identity is enabled.
- [ ] Admin and Customer roles exist.
- [ ] Login lockout is enabled.
- [ ] Passwords are not logged or documented.
- [ ] Logout clears the authentication cookie.
- [ ] `/api/auth/me` requires authentication.

## Cookies and CSRF

- [ ] Auth cookie is HttpOnly.
- [ ] Production cookies require HTTPS.
- [ ] Unsafe methods require CSRF validation.
- [ ] Frontend fetches and sends `X-CSRF-TOKEN` for unsafe requests.
- [ ] GET endpoints do not require CSRF.

## Authorization and Data Isolation

- [ ] Admin endpoints require Admin role.
- [ ] Customer endpoints require Customer role.
- [ ] Customer CompanyId is derived from the logged-in user.
- [ ] Customers cannot access another customer's company data by changing URL IDs.
- [ ] DTOs do not expose sensitive Identity fields.

## Validation

- [ ] Required fields are validated.
- [ ] Friendly API errors are returned.
- [ ] Frontend shows validation and error states.
- [ ] Dangerous input is not trusted for ownership decisions.

## GitHub Publishing

- [ ] Run a secret scan/search before pushing.
- [ ] Review `git status`.
- [ ] Review `git diff --cached --name-only`.
- [ ] Verify the remote URL.
- [ ] Confirm the repository visibility matches the intended release.
