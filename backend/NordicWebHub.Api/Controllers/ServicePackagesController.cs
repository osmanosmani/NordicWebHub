using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NordicWebHub.Api.Data;
using NordicWebHub.Api.DTOs.ServicePackages;
using NordicWebHub.Api.Models;

namespace NordicWebHub.Api.Controllers;

[ApiController]
[Route("api/packages")]
public class ServicePackagesController(ApplicationDbContext dbContext) : ControllerBase
{
    private const string AdminRole = "Admin";

    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<ServicePackageDto>>> GetPackages()
    {
        var query = dbContext.ServicePackages.AsNoTracking();

        if (!User.IsInRole(AdminRole))
        {
            query = query.Where(servicePackage => servicePackage.IsActive);
        }

        var packages = await query
            .OrderBy(servicePackage => servicePackage.Category)
            .ThenBy(servicePackage => servicePackage.MonthlyPrice)
            .ThenBy(servicePackage => servicePackage.Name)
            .Select(servicePackage => ToDto(servicePackage))
            .ToListAsync();

        return Ok(packages);
    }

    [HttpGet("{id:int}")]
    [AllowAnonymous]
    public async Task<ActionResult<ServicePackageDto>> GetPackage(int id)
    {
        var servicePackage = await dbContext.ServicePackages
            .AsNoTracking()
            .FirstOrDefaultAsync(package => package.Id == id);

        if (servicePackage is null || (!servicePackage.IsActive && !User.IsInRole(AdminRole)))
        {
            return NotFound(new
            {
                message = "Service package was not found."
            });
        }

        return Ok(ToDto(servicePackage));
    }

    [HttpPost]
    [Authorize(Roles = AdminRole)]
    public async Task<ActionResult<ServicePackageDto>> CreatePackage(CreateServicePackageDto dto)
    {
        if (!ValidateRequiredText(dto.Name, dto.Description, dto.Category, dto.DeliveryTime))
        {
            return InvalidTextResponse();
        }

        var servicePackage = new ServicePackage
        {
            Name = dto.Name.Trim(),
            Description = dto.Description.Trim(),
            Category = dto.Category.Trim(),
            MonthlyPrice = dto.MonthlyPrice,
            SetupFee = dto.SetupFee,
            DeliveryTime = dto.DeliveryTime.Trim(),
            IsActive = dto.IsActive,
            CreatedAt = DateTime.UtcNow
        };

        dbContext.ServicePackages.Add(servicePackage);
        await dbContext.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetPackage),
            new { id = servicePackage.Id },
            ToDto(servicePackage));
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = AdminRole)]
    public async Task<ActionResult<ServicePackageDto>> UpdatePackage(int id, UpdateServicePackageDto dto)
    {
        if (!ValidateRequiredText(dto.Name, dto.Description, dto.Category, dto.DeliveryTime))
        {
            return InvalidTextResponse();
        }

        var servicePackage = await dbContext.ServicePackages
            .FirstOrDefaultAsync(package => package.Id == id);

        if (servicePackage is null)
        {
            return NotFound(new
            {
                message = "Service package was not found."
            });
        }

        servicePackage.Name = dto.Name.Trim();
        servicePackage.Description = dto.Description.Trim();
        servicePackage.Category = dto.Category.Trim();
        servicePackage.MonthlyPrice = dto.MonthlyPrice;
        servicePackage.SetupFee = dto.SetupFee;
        servicePackage.DeliveryTime = dto.DeliveryTime.Trim();
        servicePackage.IsActive = dto.IsActive;

        await dbContext.SaveChangesAsync();

        return Ok(ToDto(servicePackage));
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = AdminRole)]
    public async Task<IActionResult> DeletePackage(int id)
    {
        var servicePackage = await dbContext.ServicePackages
            .FirstOrDefaultAsync(package => package.Id == id);

        if (servicePackage is null)
        {
            return NotFound(new
            {
                message = "Service package was not found."
            });
        }

        var isUsedByProjectRequest = await dbContext.ProjectRequests
            .AnyAsync(projectRequest => projectRequest.ServicePackageId == id);
        var isUsedByServiceOrder = await dbContext.ServiceOrders
            .AnyAsync(serviceOrder => serviceOrder.ServicePackageId == id);

        if (isUsedByProjectRequest || isUsedByServiceOrder)
        {
            servicePackage.IsActive = false;
        }
        else
        {
            dbContext.ServicePackages.Remove(servicePackage);
        }

        await dbContext.SaveChangesAsync();

        return NoContent();
    }

    private static ServicePackageDto ToDto(ServicePackage servicePackage)
    {
        return new ServicePackageDto
        {
            Id = servicePackage.Id,
            Name = servicePackage.Name,
            Description = servicePackage.Description,
            Category = servicePackage.Category,
            MonthlyPrice = servicePackage.MonthlyPrice,
            SetupFee = servicePackage.SetupFee,
            DeliveryTime = servicePackage.DeliveryTime,
            IsActive = servicePackage.IsActive,
            CreatedAt = servicePackage.CreatedAt
        };
    }

    private static bool ValidateRequiredText(params string[] values)
    {
        return values.All(value => !string.IsNullOrWhiteSpace(value));
    }

    private BadRequestObjectResult InvalidTextResponse()
    {
        return BadRequest(new
        {
            message = "Please fill in all required text fields."
        });
    }
}
