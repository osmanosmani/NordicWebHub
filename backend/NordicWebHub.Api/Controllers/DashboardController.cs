using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NordicWebHub.Api.Data;
using NordicWebHub.Api.DTOs.Dashboard;
using NordicWebHub.Api.Models.Enums;
using NordicWebHub.Api.Services;

namespace NordicWebHub.Api.Controllers;

[ApiController]
[Route("api/dashboard")]
[Authorize]
public class DashboardController(
    ApplicationDbContext dbContext,
    ICurrentCustomerCompanyService currentCustomerCompanyService)
    : ControllerBase
{
    private const string AdminRole = "Admin";
    private const string CustomerRole = "Customer";
    private const int RecentItemLimit = 5;

    [HttpGet("admin")]
    [Authorize(Roles = AdminRole)]
    public async Task<ActionResult<AdminDashboardDto>> GetAdminDashboard()
    {
        var customerRoleId = await dbContext.Roles
            .AsNoTracking()
            .Where(role => role.NormalizedName == CustomerRole.ToUpperInvariant())
            .Select(role => role.Id)
            .FirstOrDefaultAsync();

        var totalCustomers = string.IsNullOrWhiteSpace(customerRoleId)
            ? 0
            : await dbContext.UserRoles
                .AsNoTracking()
                .Where(userRole => userRole.RoleId == customerRoleId)
                .Select(userRole => userRole.UserId)
                .Distinct()
                .CountAsync();

        var dashboard = new AdminDashboardDto
        {
            TotalCustomers = totalCustomers,
            TotalCompanies = await dbContext.Companies.AsNoTracking().CountAsync(),
            TotalProjectRequests = await dbContext.ProjectRequests.AsNoTracking().CountAsync(),
            PendingProjectRequests = await dbContext.ProjectRequests
                .AsNoTracking()
                .CountAsync(request =>
                    request.Status == ProjectRequestStatus.New
                    || request.Status == ProjectRequestStatus.Reviewed),
            ActiveProjects = await dbContext.Projects
                .AsNoTracking()
                .CountAsync(project =>
                    project.Status != ProjectStatus.Completed
                    && project.Status != ProjectStatus.Cancelled),
            OpenTickets = await dbContext.SupportTickets
                .AsNoTracking()
                .CountAsync(ticket =>
                    ticket.Status == TicketStatus.Open
                    || ticket.Status == TicketStatus.InProgress
                    || ticket.Status == TicketStatus.WaitingForCustomer),
            RecentProjectRequests = await GetRecentProjectRequestsQuery()
                .Take(RecentItemLimit)
                .ToListAsync(),
            RecentSupportTickets = await GetRecentSupportTicketsQuery()
                .Take(RecentItemLimit)
                .ToListAsync(),
            RecentProjects = await GetRecentProjectsQuery()
                .Take(RecentItemLimit)
                .ToListAsync()
        };

        return Ok(dashboard);
    }

    [HttpGet("customer")]
    [Authorize(Roles = CustomerRole)]
    public async Task<ActionResult<CustomerDashboardDto>> GetCustomerDashboard()
    {
        var company =
            await currentCustomerCompanyService.GetCurrentCustomerCompanyAsync();

        if (company is null)
        {
            return NotFound(new
            {
                message = CurrentCustomerCompanyService.NoCompanyMessage
            });
        }

        var dashboard = new CustomerDashboardDto
        {
            Company = new DashboardCompanyDto
            {
                Id = company.Id,
                Name = company.Name,
                OrgNumber = company.OrgNumber,
                WebsiteUrl = company.WebsiteUrl,
                City = company.City,
                Industry = company.Industry,
                Phone = company.Phone
            },
            ActiveProjects = await GetRecentProjectsQuery(company.Id, activeOnly: true)
                .Take(RecentItemLimit)
                .ToListAsync(),
            OpenTickets = await GetRecentSupportTicketsQuery(company.Id, openOnly: true)
                .Take(RecentItemLimit)
                .ToListAsync(),
            RecentProjectRequests = await GetRecentProjectRequestsQuery(company.Id)
                .Take(RecentItemLimit)
                .ToListAsync(),
            RecentSupportTickets = await GetRecentSupportTicketsQuery(company.Id)
                .Take(RecentItemLimit)
                .ToListAsync()
        };

        return Ok(dashboard);
    }

    private IQueryable<DashboardProjectRequestDto> GetRecentProjectRequestsQuery(
        int? companyId = null)
    {
        var query = dbContext.ProjectRequests.AsNoTracking();

        if (companyId.HasValue)
        {
            query = query.Where(request => request.CompanyId == companyId.Value);
        }

        return query
            .OrderByDescending(request => request.CreatedAt)
            .Select(request => new DashboardProjectRequestDto
            {
                Id = request.Id,
                CompanyId = request.CompanyId,
                CompanyName = request.Company.Name,
                CustomerEmail = request.Customer.Email ?? string.Empty,
                ServicePackageId = request.ServicePackageId,
                ServicePackageName = request.ServicePackage.Name,
                Title = request.Title,
                Status = request.Status.ToString(),
                CreatedAt = request.CreatedAt
            });
    }

    private IQueryable<DashboardSupportTicketDto> GetRecentSupportTicketsQuery(
        int? companyId = null,
        bool openOnly = false)
    {
        var query = dbContext.SupportTickets.AsNoTracking();

        if (companyId.HasValue)
        {
            query = query.Where(ticket => ticket.CompanyId == companyId.Value);
        }

        if (openOnly)
        {
            query = query.Where(ticket =>
                ticket.Status == TicketStatus.Open
                || ticket.Status == TicketStatus.InProgress
                || ticket.Status == TicketStatus.WaitingForCustomer);
        }

        return query
            .OrderByDescending(ticket => ticket.CreatedAt)
            .Select(ticket => new DashboardSupportTicketDto
            {
                Id = ticket.Id,
                CompanyId = ticket.CompanyId,
                CompanyName = ticket.Company.Name,
                CustomerEmail = ticket.Customer.Email ?? string.Empty,
                Title = ticket.Title,
                Status = ticket.Status.ToString(),
                Priority = ticket.Priority == TicketPriority.Normal
                    ? "Medium"
                    : ticket.Priority.ToString(),
                CreatedAt = ticket.CreatedAt
            });
    }

    private IQueryable<DashboardProjectDto> GetRecentProjectsQuery(
        int? companyId = null,
        bool activeOnly = false)
    {
        var query = dbContext.Projects.AsNoTracking();

        if (companyId.HasValue)
        {
            query = query.Where(project => project.CompanyId == companyId.Value);
        }

        if (activeOnly)
        {
            query = query.Where(project =>
                project.Status != ProjectStatus.Completed
                && project.Status != ProjectStatus.Cancelled);
        }

        return query
            .OrderByDescending(project => project.CreatedAt)
            .Select(project => new DashboardProjectDto
            {
                Id = project.Id,
                CompanyId = project.CompanyId,
                CompanyName = project.Company.Name,
                Title = project.Title,
                Status = project.Status.ToString(),
                StartDate = project.StartDate,
                Deadline = project.Deadline,
                CreatedAt = project.CreatedAt
            });
    }
}
