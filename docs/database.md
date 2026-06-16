# Database

NordicWebHub uses Entity Framework Core with SQL Server.

Default local database:

```text
NordicWebHub
```

The default development connection string uses SQL Server LocalDB and Windows authentication. It does not contain a database password.

## Main Entities

## Identity

- `ApplicationUser`
- ASP.NET Core Identity role and login tables

`ApplicationUser` extends IdentityUser and adds:

- FirstName
- LastName
- CreatedAt

## Domain Entities

- `Company`
- `ServicePackage`
- `ProjectRequest`
- `Project`
- `SupportTicket`
- `TicketReply`
- `MaintenanceLog`
- `HostingStatus`
- `SeoReport`
- `AiSeoRequest`
- `ServiceOrder`

## Important Relationships

- One Customer user owns one Company for the MVP.
- Company is the main ownership boundary for customer data.
- Project Requests, Projects, Tickets, Logs, SEO Reports, Hosting Statuses, AI requests, and Service Orders are connected to a Company.
- Support Ticket replies are connected to a ticket and a user.
- Service Orders are connected to Company, Customer, and Service Package.

## Customer Data Isolation

The MVP uses CompanyId and OwnerId for data isolation.

- Admin users can access all records.
- Customer users can only access records connected to their own Company.
- Customer endpoints derive CompanyId from the logged-in user and do not trust CompanyId from request bodies.
- Customers are blocked from accessing another customer's data by changing route IDs.

## Migrations

Run migrations from the backend API folder:

```powershell
cd backend\NordicWebHub.Api
dotnet ef database update
```

Important migrations include:

- Initial database and Identity setup
- Operational domain models
- One Customer equals one Company rule
- Ticket status consistency
- Service Orders
- AI Service Recommendations

## Demo Seed Data

The app includes development/demo seed data for roles, users, companies, packages, requests, projects, tickets, logs, reports, service orders, and AI assistant examples.

Seed data is create-only by default. Existing demo records should not be overwritten on every startup unless the reset flag is enabled intentionally.

Configuration:

```json
{
  "SeedData": {
    "ResetDemoData": false
  }
}
```

Do not enable demo seed behavior in production.
