using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NordicWebHub.Api.Data;
using NordicWebHub.Api.DTOs.Projects;
using NordicWebHub.Api.Models;
using NordicWebHub.Api.Models.Enums;

namespace NordicWebHub.Api.Controllers;

[ApiController]
[Route("api/projects")]
[Authorize]
public class ProjectsController(ApplicationDbContext dbContext) : ControllerBase
{
    private const string AdminRole = "Admin";
    private const string CustomerRole = "Customer";

    private static readonly ProjectStatus[] AllowedStatuses =
    [
        ProjectStatus.Planning,
        ProjectStatus.Design,
        ProjectStatus.Development,
        ProjectStatus.Review,
        ProjectStatus.Live,
        ProjectStatus.Completed
    ];

    [HttpGet]
    [Authorize(Roles = AdminRole)]
    public async Task<ActionResult<IEnumerable<ProjectDto>>> GetProjects()
    {
        var projects = await ProjectsWithDetails()
            .OrderBy(project => project.Deadline)
            .ThenBy(project => project.Title)
            .ToListAsync();

        return Ok(projects.Select(ToDto));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ProjectDto>> GetProject(int id)
    {
        var project = await ProjectsWithDetails()
            .FirstOrDefaultAsync(existingProject => existingProject.Id == id);

        if (project is null)
        {
            return NotFound(new
            {
                message = "Project was not found."
            });
        }

        if (!CanAccessProject(project))
        {
            return Forbid();
        }

        return Ok(ToDto(project));
    }

    [HttpGet("my")]
    [Authorize(Roles = CustomerRole)]
    public async Task<ActionResult<IEnumerable<ProjectDto>>> GetMyProjects()
    {
        var userId = GetCurrentUserId();
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized(new
            {
                message = "Your session is invalid. Please log in again."
            });
        }

        var projects = await ProjectsWithDetails()
            .Where(project => project.Company.OwnerId == userId)
            .OrderBy(project => project.Deadline)
            .ThenBy(project => project.Title)
            .ToListAsync();

        return Ok(projects.Select(ToDto));
    }

    [HttpPost]
    [Authorize(Roles = AdminRole)]
    public async Task<ActionResult<ProjectDto>> CreateProject(CreateProjectDto dto)
    {
        if (!dto.CompanyId.HasValue || dto.CompanyId.Value <= 0)
        {
            return BadRequest(new
            {
                message = "Company is required."
            });
        }

        if (!ValidateRequiredText(dto.Title, dto.Description))
        {
            return InvalidProjectTextResponse();
        }

        if (!TryParseAllowedStatus(dto.Status, out var status))
        {
            return InvalidStatusResponse();
        }

        if (!ValidateProjectDates(dto.StartDate, dto.Deadline, out var dateError))
        {
            return BadRequest(new
            {
                message = dateError
            });
        }

        var company = await dbContext.Companies
            .AsNoTracking()
            .FirstOrDefaultAsync(existingCompany => existingCompany.Id == dto.CompanyId.Value);

        if (company is null)
        {
            return BadRequest(new
            {
                message = "Company was not found."
            });
        }

        ProjectRequest? projectRequest = null;
        if (dto.ProjectRequestId.HasValue)
        {
            projectRequest = await ResolveApprovedProjectRequestAsync(dto.ProjectRequestId.Value);
            if (projectRequest is null)
            {
                return BadRequest(new
                {
                    message = "Project request was not found, is not approved, or already has a project."
                });
            }

            if (projectRequest.CompanyId != company.Id)
            {
                return BadRequest(new
                {
                    message = "Project request must belong to the selected company."
                });
            }
        }

        var project = new Project
        {
            CompanyId = company.Id,
            ProjectRequestId = projectRequest?.Id,
            Title = dto.Title.Trim(),
            Description = dto.Description.Trim(),
            Status = status,
            StartDate = dto.StartDate,
            Deadline = dto.Deadline,
            CreatedAt = DateTime.UtcNow
        };

        dbContext.Projects.Add(project);
        await dbContext.SaveChangesAsync();

        var createdProject = await ProjectsWithDetails()
            .FirstAsync(existingProject => existingProject.Id == project.Id);

        return CreatedAtAction(
            nameof(GetProject),
            new { id = createdProject.Id },
            ToDto(createdProject));
    }

    [HttpPost("from-request/{requestId:int}")]
    [Authorize(Roles = AdminRole)]
    public async Task<ActionResult<ProjectDto>> CreateProjectFromRequest(
        int requestId,
        CreateProjectDto dto)
    {
        if (!ValidateRequiredText(dto.Title, dto.Description))
        {
            return InvalidProjectTextResponse();
        }

        if (!TryParseAllowedStatus(dto.Status, out var status))
        {
            return InvalidStatusResponse();
        }

        if (!ValidateProjectDates(dto.StartDate, dto.Deadline, out var dateError))
        {
            return BadRequest(new
            {
                message = dateError
            });
        }

        var projectRequest = await ResolveApprovedProjectRequestAsync(requestId);
        if (projectRequest is null)
        {
            return BadRequest(new
            {
                message = "Project request was not found, is not approved, or already has a project."
            });
        }

        var project = new Project
        {
            CompanyId = projectRequest.CompanyId,
            ProjectRequestId = projectRequest.Id,
            Title = dto.Title.Trim(),
            Description = dto.Description.Trim(),
            Status = status,
            StartDate = dto.StartDate,
            Deadline = dto.Deadline,
            CreatedAt = DateTime.UtcNow
        };

        dbContext.Projects.Add(project);
        await dbContext.SaveChangesAsync();

        var createdProject = await ProjectsWithDetails()
            .FirstAsync(existingProject => existingProject.Id == project.Id);

        return CreatedAtAction(
            nameof(GetProject),
            new { id = createdProject.Id },
            ToDto(createdProject));
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = AdminRole)]
    public async Task<ActionResult<ProjectDto>> UpdateProject(int id, UpdateProjectDto dto)
    {
        if (!ValidateRequiredText(dto.Title, dto.Description))
        {
            return InvalidProjectTextResponse();
        }

        if (!ValidateProjectDates(dto.StartDate, dto.Deadline, out var dateError))
        {
            return BadRequest(new
            {
                message = dateError
            });
        }

        var project = await dbContext.Projects
            .Include(existingProject => existingProject.Company)
            .Include(existingProject => existingProject.ProjectRequest)
            .FirstOrDefaultAsync(existingProject => existingProject.Id == id);

        if (project is null)
        {
            return NotFound(new
            {
                message = "Project was not found."
            });
        }

        var companyExists = await dbContext.Companies
            .AsNoTracking()
            .AnyAsync(company => company.Id == dto.CompanyId);

        if (!companyExists)
        {
            return BadRequest(new
            {
                message = "Company was not found."
            });
        }

        if (dto.ProjectRequestId.HasValue)
        {
            var projectRequest = await dbContext.ProjectRequests
                .AsNoTracking()
                .Include(existingRequest => existingRequest.Project)
                .FirstOrDefaultAsync(existingRequest => existingRequest.Id == dto.ProjectRequestId.Value);

            if (projectRequest is null || projectRequest.Status != ProjectRequestStatus.Approved)
            {
                return BadRequest(new
                {
                    message = "Project request was not found or is not approved."
                });
            }

            if (projectRequest.CompanyId != dto.CompanyId)
            {
                return BadRequest(new
                {
                    message = "Project request must belong to the selected company."
                });
            }

            if (projectRequest.Project is not null && projectRequest.Project.Id != project.Id)
            {
                return Conflict(new
                {
                    message = "Project request already has a project."
                });
            }
        }

        project.CompanyId = dto.CompanyId;
        project.ProjectRequestId = dto.ProjectRequestId;
        project.Title = dto.Title.Trim();
        project.Description = dto.Description.Trim();
        project.StartDate = dto.StartDate;
        project.Deadline = dto.Deadline;

        await dbContext.SaveChangesAsync();

        var updatedProject = await ProjectsWithDetails()
            .FirstAsync(existingProject => existingProject.Id == project.Id);

        return Ok(ToDto(updatedProject));
    }

    [HttpPut("{id:int}/status")]
    [Authorize(Roles = AdminRole)]
    public async Task<ActionResult<ProjectDto>> UpdateProjectStatus(
        int id,
        UpdateProjectStatusDto dto)
    {
        if (!TryParseAllowedStatus(dto.Status, out var status))
        {
            return InvalidStatusResponse();
        }

        var project = await dbContext.Projects
            .Include(existingProject => existingProject.Company)
            .Include(existingProject => existingProject.ProjectRequest)
            .FirstOrDefaultAsync(existingProject => existingProject.Id == id);

        if (project is null)
        {
            return NotFound(new
            {
                message = "Project was not found."
            });
        }

        project.Status = status;

        await dbContext.SaveChangesAsync();

        var updatedProject = await ProjectsWithDetails()
            .FirstAsync(existingProject => existingProject.Id == project.Id);

        return Ok(ToDto(updatedProject));
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = AdminRole)]
    public async Task<IActionResult> DeleteProject(int id)
    {
        var project = await dbContext.Projects
            .FirstOrDefaultAsync(existingProject => existingProject.Id == id);

        if (project is null)
        {
            return NotFound(new
            {
                message = "Project was not found."
            });
        }

        dbContext.Projects.Remove(project);
        await dbContext.SaveChangesAsync();

        return NoContent();
    }

    private IQueryable<Project> ProjectsWithDetails()
    {
        return dbContext.Projects
            .AsNoTracking()
            .Include(project => project.Company)
            .Include(project => project.ProjectRequest);
    }

    private bool CanAccessProject(Project project)
    {
        return User.IsInRole(AdminRole) || project.Company.OwnerId == GetCurrentUserId();
    }

    private string? GetCurrentUserId()
    {
        return User.FindFirstValue(ClaimTypes.NameIdentifier);
    }

    private async Task<ProjectRequest?> ResolveApprovedProjectRequestAsync(int requestId)
    {
        var projectRequest = await dbContext.ProjectRequests
            .Include(existingRequest => existingRequest.Project)
            .FirstOrDefaultAsync(existingRequest => existingRequest.Id == requestId);

        if (projectRequest is null
            || projectRequest.Status != ProjectRequestStatus.Approved
            || projectRequest.Project is not null)
        {
            return null;
        }

        return projectRequest;
    }

    private static ProjectDto ToDto(Project project)
    {
        return new ProjectDto
        {
            Id = project.Id,
            CompanyId = project.CompanyId,
            CompanyName = project.Company.Name,
            ProjectRequestId = project.ProjectRequestId,
            ProjectRequestTitle = project.ProjectRequest?.Title ?? string.Empty,
            Title = project.Title,
            Description = project.Description,
            Status = project.Status.ToString(),
            StartDate = project.StartDate,
            Deadline = project.Deadline,
            CreatedAt = project.CreatedAt
        };
    }

    private static bool TryParseAllowedStatus(string? value, out ProjectStatus status)
    {
        status = ProjectStatus.Planning;

        return !string.IsNullOrWhiteSpace(value)
            && Enum.TryParse(value.Trim(), ignoreCase: true, out status)
            && AllowedStatuses.Contains(status);
    }

    private static bool ValidateProjectDates(DateTime startDate, DateTime deadline, out string error)
    {
        if (startDate == default || deadline == default)
        {
            error = "Start date and deadline are required.";
            return false;
        }

        if (deadline.Date < startDate.Date)
        {
            error = "Deadline cannot be before the start date.";
            return false;
        }

        error = string.Empty;
        return true;
    }

    private static bool ValidateRequiredText(params string?[] values)
    {
        return values.All(value => !string.IsNullOrWhiteSpace(value));
    }

    private BadRequestObjectResult InvalidProjectTextResponse()
    {
        return BadRequest(new
        {
            message = "Please fill in the project title and description."
        });
    }

    private BadRequestObjectResult InvalidStatusResponse()
    {
        return BadRequest(new
        {
            message = "Status must be one of: Planning, Design, Development, Review, Live, Completed."
        });
    }
}
