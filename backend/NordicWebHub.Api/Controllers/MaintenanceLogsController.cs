using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NordicWebHub.Api.Data;
using NordicWebHub.Api.DTOs.MaintenanceLogs;
using NordicWebHub.Api.Models;
using NordicWebHub.Api.Services;

namespace NordicWebHub.Api.Controllers;

[ApiController]
[Route("api/maintenance-logs")]
[Authorize]
public class MaintenanceLogsController(
    ApplicationDbContext dbContext,
    ICurrentCustomerCompanyService currentCustomerCompanyService)
    : ControllerBase
{
    private const string AdminRole = "Admin";
    private const string CustomerRole = "Customer";

    [HttpGet]
    [Authorize(Roles = AdminRole)]
    public async Task<ActionResult<IEnumerable<MaintenanceLogDto>>> GetMaintenanceLogs()
    {
        var maintenanceLogs = await MaintenanceLogsWithCompany()
            .OrderByDescending(log => log.CreatedAt)
            .ToListAsync();

        return Ok(maintenanceLogs.Select(ToDto));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<MaintenanceLogDto>> GetMaintenanceLog(int id)
    {
        var maintenanceLog = await MaintenanceLogsWithCompany()
            .FirstOrDefaultAsync(log => log.Id == id);

        if (maintenanceLog is null)
        {
            return MaintenanceLogNotFound();
        }

        if (!User.IsInRole(AdminRole))
        {
            var company =
                await currentCustomerCompanyService.GetCurrentCustomerCompanyAsync();

            if (company is null)
            {
                return CustomerCompanyNotFound();
            }

            if (maintenanceLog.CompanyId != company.Id)
            {
                return Forbid();
            }
        }

        return Ok(ToDto(maintenanceLog));
    }

    [HttpGet("my")]
    [Authorize(Roles = CustomerRole)]
    public async Task<ActionResult<IEnumerable<MaintenanceLogDto>>> GetMyMaintenanceLogs()
    {
        var company =
            await currentCustomerCompanyService.GetCurrentCustomerCompanyAsync();

        if (company is null)
        {
            return CustomerCompanyNotFound();
        }

        var maintenanceLogs = await MaintenanceLogsWithCompany()
            .Where(log => log.CompanyId == company.Id)
            .OrderByDescending(log => log.CreatedAt)
            .ToListAsync();

        return Ok(maintenanceLogs.Select(ToDto));
    }

    [HttpGet("company/{companyId:int}")]
    public async Task<ActionResult<IEnumerable<MaintenanceLogDto>>> GetMaintenanceLogsByCompany(
        int companyId)
    {
        var company = await dbContext.Companies
            .AsNoTracking()
            .FirstOrDefaultAsync(existingCompany => existingCompany.Id == companyId);

        if (company is null)
        {
            return NotFound(new
            {
                message = "Company was not found."
            });
        }

        if (!User.IsInRole(AdminRole))
        {
            var customerCompany =
                await currentCustomerCompanyService.GetCurrentCustomerCompanyAsync();

            if (customerCompany is null)
            {
                return CustomerCompanyNotFound();
            }

            if (customerCompany.Id != company.Id)
            {
                return Forbid();
            }
        }

        var maintenanceLogs = await MaintenanceLogsWithCompany()
            .Where(log => log.CompanyId == companyId)
            .OrderByDescending(log => log.CreatedAt)
            .ToListAsync();

        return Ok(maintenanceLogs.Select(ToDto));
    }

    [HttpPost]
    [Authorize(Roles = AdminRole)]
    public async Task<ActionResult<MaintenanceLogDto>> CreateMaintenanceLog(
        CreateMaintenanceLogDto dto)
    {
        if (!ValidateRequiredText(dto.Title, dto.Description, dto.ActionTaken, dto.Result))
        {
            return InvalidRequiredTextResponse();
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

        var maintenanceLog = new MaintenanceLog
        {
            CompanyId = dto.CompanyId,
            Title = dto.Title.Trim(),
            Description = dto.Description.Trim(),
            ActionTaken = dto.ActionTaken.Trim(),
            Result = dto.Result.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        dbContext.MaintenanceLogs.Add(maintenanceLog);
        await dbContext.SaveChangesAsync();

        var createdLog = await MaintenanceLogsWithCompany()
            .FirstAsync(log => log.Id == maintenanceLog.Id);

        return CreatedAtAction(
            nameof(GetMaintenanceLog),
            new { id = createdLog.Id },
            ToDto(createdLog));
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = AdminRole)]
    public async Task<ActionResult<MaintenanceLogDto>> UpdateMaintenanceLog(
        int id,
        UpdateMaintenanceLogDto dto)
    {
        if (!ValidateRequiredText(dto.Title, dto.Description, dto.ActionTaken, dto.Result))
        {
            return InvalidRequiredTextResponse();
        }

        var maintenanceLog = await dbContext.MaintenanceLogs
            .FirstOrDefaultAsync(log => log.Id == id);

        if (maintenanceLog is null)
        {
            return MaintenanceLogNotFound();
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

        maintenanceLog.CompanyId = dto.CompanyId;
        maintenanceLog.Title = dto.Title.Trim();
        maintenanceLog.Description = dto.Description.Trim();
        maintenanceLog.ActionTaken = dto.ActionTaken.Trim();
        maintenanceLog.Result = dto.Result.Trim();

        await dbContext.SaveChangesAsync();

        var updatedLog = await MaintenanceLogsWithCompany()
            .FirstAsync(log => log.Id == maintenanceLog.Id);

        return Ok(ToDto(updatedLog));
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = AdminRole)]
    public async Task<IActionResult> DeleteMaintenanceLog(int id)
    {
        var maintenanceLog = await dbContext.MaintenanceLogs
            .FirstOrDefaultAsync(log => log.Id == id);

        if (maintenanceLog is null)
        {
            return MaintenanceLogNotFound();
        }

        dbContext.MaintenanceLogs.Remove(maintenanceLog);
        await dbContext.SaveChangesAsync();

        return NoContent();
    }

    private IQueryable<MaintenanceLog> MaintenanceLogsWithCompany()
    {
        return dbContext.MaintenanceLogs
            .AsNoTracking()
            .Include(log => log.Company);
    }

    private static MaintenanceLogDto ToDto(MaintenanceLog maintenanceLog)
    {
        return new MaintenanceLogDto
        {
            Id = maintenanceLog.Id,
            CompanyId = maintenanceLog.CompanyId,
            CompanyName = maintenanceLog.Company.Name,
            Title = maintenanceLog.Title,
            Description = maintenanceLog.Description,
            ActionTaken = maintenanceLog.ActionTaken,
            Result = maintenanceLog.Result,
            CreatedAt = maintenanceLog.CreatedAt
        };
    }

    private static bool ValidateRequiredText(params string?[] values)
    {
        return values.All(value => !string.IsNullOrWhiteSpace(value));
    }

    private NotFoundObjectResult MaintenanceLogNotFound()
    {
        return NotFound(new
        {
            message = "Maintenance log was not found."
        });
    }

    private BadRequestObjectResult InvalidRequiredTextResponse()
    {
        return BadRequest(new
        {
            message = "Please fill in the title, description, action taken, and result."
        });
    }

    private NotFoundObjectResult CustomerCompanyNotFound()
    {
        return NotFound(new
        {
            message = CurrentCustomerCompanyService.NoCompanyMessage
        });
    }
}
