using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NordicWebHub.Api.Data;
using NordicWebHub.Api.DTOs.Dashboard;
using NordicWebHub.Api.Models.Enums;

namespace NordicWebHub.Api.Controllers;

[ApiController]
[Route("api/dashboard")]
[Authorize]
public class DashboardController(ApplicationDbContext dbContext) : ControllerBase
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
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized(new
            {
                message = "Your session is invalid. Please log in again."
            });
        }

        var company = await dbContext.Companies
            .AsNoTracking()
            .Where(existingCompany => existingCompany.OwnerId == userId)
            .OrderBy(existingCompany => existingCompany.Id)
            .Select(existingCompany => new DashboardCompanyDto
            {
                Id = existingCompany.Id,
                Name = existingCompany.Name,
                OrgNumber = existingCompany.OrgNumber,
                WebsiteUrl = existingCompany.WebsiteUrl,
                City = existingCompany.City,
                Industry = existingCompany.Industry,
                Phone = existingCompany.Phone
            })
            .FirstOrDefaultAsync();

        var dashboard = new CustomerDashboardDto
        {
            Company = company,
            ActiveProjects = await GetRecentProjectsQuery(userId, activeOnly: true)
                .Take(RecentItemLimit)
                .ToListAsync(),
            OpenTickets = await GetRecentSupportTicketsQuery(userId, openOnly: true)
                .Take(RecentItemLimit)
                .ToListAsync(),
            RecentProjectRequests = await GetRecentProjectRequestsQuery(userId)
                .Take(RecentItemLimit)
                .ToListAsync(),
            RecentSupportTickets = await GetRecentSupportTicketsQuery(userId)
                .Take(RecentItemLimit)
                .ToListAsync()
        };

        return Ok(dashboard);
    }

    private IQueryable<DashboardProjectRequestDto> GetRecentProjectRequestsQuery(
        string? customerId = null)
    {
        var query = dbContext.ProjectRequests.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(customerId))
        {
            query = query.Where(request => request.CustomerId == customerId);
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
        string? customerId = null,
        bool openOnly = false)
    {
        var query = dbContext.SupportTickets.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(customerId))
        {
            query = query.Where(ticket => ticket.CustomerId == customerId);
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
        string? companyOwnerId = null,
        bool activeOnly = false)
    {
        var query = dbContext.Projects.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(companyOwnerId))
        {
            query = query.Where(project => project.Company.OwnerId == companyOwnerId);
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
