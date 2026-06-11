using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NordicWebHub.Api.Data;
using NordicWebHub.Api.DTOs.ProjectRequests;
using NordicWebHub.Api.Models;
using NordicWebHub.Api.Models.Enums;
using NordicWebHub.Api.Services;

namespace NordicWebHub.Api.Controllers;

[ApiController]
[Route("api/project-requests")]
[Authorize]
public class ProjectRequestsController(
    ApplicationDbContext dbContext,
    ICurrentCustomerCompanyService currentCustomerCompanyService)
    : ControllerBase
{
    private const string AdminRole = "Admin";
    private const string CustomerRole = "Customer";

    private static readonly ProjectRequestStatus[] AllowedStatuses =
    [
        ProjectRequestStatus.New,
        ProjectRequestStatus.Reviewed,
        ProjectRequestStatus.Approved,
        ProjectRequestStatus.Rejected
    ];

    [HttpGet]
    [Authorize(Roles = AdminRole)]
    public async Task<ActionResult<IEnumerable<ProjectRequestDto>>> GetProjectRequests()
    {
        var requests = await ProjectRequestsWithDetails()
            .OrderByDescending(projectRequest => projectRequest.CreatedAt)
            .ToListAsync();

        return Ok(requests.Select(ToDto));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ProjectRequestDto>> GetProjectRequest(int id)
    {
        var request = await ProjectRequestsWithDetails()
            .FirstOrDefaultAsync(projectRequest => projectRequest.Id == id);

        if (request is null)
        {
            return NotFound(new
            {
                message = "Project request was not found."
            });
        }

        if (!User.IsInRole(AdminRole))
        {
            var company =
                await currentCustomerCompanyService.GetCurrentCustomerCompanyAsync();

            if (company is null)
            {
                return CustomerCompanyNotFound();
            }

            if (request.CompanyId != company.Id
                || request.CustomerId != GetCurrentUserId())
            {
                return Forbid();
            }
        }

        return Ok(ToDto(request));
    }

    [HttpGet("my")]
    [Authorize(Roles = CustomerRole)]
    public async Task<ActionResult<IEnumerable<ProjectRequestDto>>> GetMyProjectRequests()
    {
        var userId = GetCurrentUserId();
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized(new
            {
                message = "Your session is invalid. Please log in again."
            });
        }

        var company =
            await currentCustomerCompanyService.GetCurrentCustomerCompanyAsync();

        if (company is null)
        {
            return CustomerCompanyNotFound();
        }

        var requests = await ProjectRequestsWithDetails()
            .Where(projectRequest =>
                projectRequest.CompanyId == company.Id
                && projectRequest.CustomerId == userId)
            .OrderByDescending(projectRequest => projectRequest.CreatedAt)
            .ToListAsync();

        return Ok(requests.Select(ToDto));
    }

    [HttpPost]
    [Authorize(Roles = CustomerRole)]
    public async Task<ActionResult<ProjectRequestDto>> CreateProjectRequest(CreateProjectRequestDto dto)
    {
        if (!ValidateRequiredText(dto.Title, dto.Description))
        {
            return BadRequest(new
            {
                message = "Please add a title and description for your project request."
            });
        }

        var userId = GetCurrentUserId();
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized(new
            {
                message = "Your session is invalid. Please log in again."
            });
        }

        var company =
            await currentCustomerCompanyService.GetCurrentCustomerCompanyAsync();

        if (company is null)
        {
            return CustomerCompanyNotFound();
        }

        var servicePackage = await dbContext.ServicePackages
            .AsNoTracking()
            .FirstOrDefaultAsync(package => package.Id == dto.ServicePackageId && package.IsActive);

        if (servicePackage is null)
        {
            return BadRequest(new
            {
                message = "Service package was not found or is not active."
            });
        }

        var projectRequest = new ProjectRequest
        {
            CompanyId = company.Id,
            ServicePackageId = servicePackage.Id,
            CustomerId = userId,
            Title = dto.Title.Trim(),
            Description = dto.Description.Trim(),
            BudgetRange = NormalizeOptionalText(dto.BudgetRange),
            Status = ProjectRequestStatus.New,
            CreatedAt = DateTime.UtcNow
        };

        dbContext.ProjectRequests.Add(projectRequest);
        await dbContext.SaveChangesAsync();

        var createdRequest = await ProjectRequestsWithDetails()
            .FirstAsync(existingRequest => existingRequest.Id == projectRequest.Id);

        return CreatedAtAction(
            nameof(GetProjectRequest),
            new { id = createdRequest.Id },
            ToDto(createdRequest));
    }

    [HttpPut("{id:int}/status")]
    [Authorize(Roles = AdminRole)]
    public async Task<ActionResult<ProjectRequestDto>> UpdateProjectRequestStatus(
        int id,
        UpdateProjectRequestStatusDto dto)
    {
        if (!TryParseAllowedStatus(dto.Status, out var status))
        {
            return BadRequest(new
            {
                message = "Status must be one of: New, Reviewed, Approved, Rejected."
            });
        }

        var request = await dbContext.ProjectRequests
            .Include(projectRequest => projectRequest.Company)
            .Include(projectRequest => projectRequest.ServicePackage)
            .Include(projectRequest => projectRequest.Customer)
            .FirstOrDefaultAsync(projectRequest => projectRequest.Id == id);

        if (request is null)
        {
            return NotFound(new
            {
                message = "Project request was not found."
            });
        }

        request.Status = status;

        await dbContext.SaveChangesAsync();

        return Ok(ToDto(request));
    }

    private IQueryable<ProjectRequest> ProjectRequestsWithDetails()
    {
        return dbContext.ProjectRequests
            .AsNoTracking()
            .Include(projectRequest => projectRequest.Company)
            .Include(projectRequest => projectRequest.ServicePackage)
            .Include(projectRequest => projectRequest.Customer);
    }

    private string? GetCurrentUserId()
    {
        return User.FindFirstValue(ClaimTypes.NameIdentifier);
    }

    private static ProjectRequestDto ToDto(ProjectRequest projectRequest)
    {
        return new ProjectRequestDto
        {
            Id = projectRequest.Id,
            CompanyId = projectRequest.CompanyId,
            CompanyName = projectRequest.Company.Name,
            ServicePackageId = projectRequest.ServicePackageId,
            ServicePackageName = projectRequest.ServicePackage.Name,
            CustomerId = projectRequest.CustomerId,
            CustomerEmail = projectRequest.Customer.Email ?? string.Empty,
            Title = projectRequest.Title,
            Description = projectRequest.Description,
            BudgetRange = projectRequest.BudgetRange,
            Status = projectRequest.Status.ToString(),
            CreatedAt = projectRequest.CreatedAt
        };
    }

    private static bool TryParseAllowedStatus(string? value, out ProjectRequestStatus status)
    {
        status = ProjectRequestStatus.New;

        return !string.IsNullOrWhiteSpace(value)
            && Enum.TryParse(value.Trim(), ignoreCase: true, out status)
            && AllowedStatuses.Contains(status);
    }

    private static bool ValidateRequiredText(params string?[] values)
    {
        return values.All(value => !string.IsNullOrWhiteSpace(value));
    }

    private static string NormalizeOptionalText(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? string.Empty : value.Trim();
    }

    private NotFoundObjectResult CustomerCompanyNotFound()
    {
        return NotFound(new
        {
            message = CurrentCustomerCompanyService.NoCompanyMessage
        });
    }
}
