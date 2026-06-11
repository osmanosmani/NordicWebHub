using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NordicWebHub.Api.Data;
using NordicWebHub.Api.DTOs.HostingStatuses;
using NordicWebHub.Api.Models;

namespace NordicWebHub.Api.Controllers;

[ApiController]
[Route("api/hosting-statuses")]
[Authorize]
public class HostingStatusesController(ApplicationDbContext dbContext) : ControllerBase
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
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized(new
            {
                message = "Your session is invalid. Please log in again."
            });
        }

        var statuses = await HostingStatusesWithCompany()
            .Where(status => status.Company.OwnerId == userId)
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
