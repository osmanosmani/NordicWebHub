using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NordicWebHub.Api.Data;
using NordicWebHub.Api.DTOs.HostingStatuses;
using NordicWebHub.Api.Models;
using NordicWebHub.Api.Services;

namespace NordicWebHub.Api.Controllers;

[ApiController]
[Route("api/hosting-statuses")]
[Authorize]
public class HostingStatusesController(
    ApplicationDbContext dbContext,
    ICurrentCustomerCompanyService currentCustomerCompanyService)
    : ControllerBase
{
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<IEnumerable<HostingStatusDto>>> GetHostingStatuses()
    {
        var statuses = await HostingStatusesWithCompany()
            .OrderBy(status => status.Company.Name)
            .ThenByDescending(status => status.LastCheckedAt)
            .ToListAsync();

        return Ok(statuses.Select(ToDto));
    }

    [HttpGet("my")]
    [Authorize(Roles = "Customer")]
    public async Task<ActionResult<IEnumerable<HostingStatusDto>>> GetMyHostingStatuses()
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

        var statuses = await HostingStatusesWithCompany()
            .Where(status => status.CompanyId == company.Id)
            .OrderByDescending(status => status.LastCheckedAt)
            .ToListAsync();

        return Ok(statuses.Select(ToDto));
    }

    private IQueryable<HostingStatus> HostingStatusesWithCompany()
    {
        return dbContext.HostingStatuses
            .AsNoTracking()
            .Include(status => status.Company);
    }

    private static HostingStatusDto ToDto(HostingStatus status)
    {
        return new HostingStatusDto
        {
            Id = status.Id,
            CompanyId = status.CompanyId,
            CompanyName = status.Company.Name,
            DomainName = status.DomainName,
            IsOnline = status.IsOnline,
            LastCheckedAt = status.LastCheckedAt,
            StatusCode = status.StatusCode,
            Notes = status.Notes
        };
    }
}
