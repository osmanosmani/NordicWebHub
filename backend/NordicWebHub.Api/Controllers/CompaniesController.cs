using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NordicWebHub.Api.Data;
using NordicWebHub.Api.DTOs.Companies;
using NordicWebHub.Api.Models;
using NordicWebHub.Api.Services;

namespace NordicWebHub.Api.Controllers;

[ApiController]
[Route("api/companies")]
[Authorize]
public class CompaniesController(
    ApplicationDbContext dbContext,
    UserManager<ApplicationUser> userManager,
    ICurrentCustomerCompanyService currentCustomerCompanyService)
    : ControllerBase
{
    private const string AdminRole = "Admin";
    private const string CustomerRole = "Customer";

    [HttpGet]
    [Authorize(Roles = AdminRole)]
    public async Task<ActionResult<IEnumerable<CompanyDto>>> GetCompanies()
    {
        var companies = await dbContext.Companies
            .AsNoTracking()
            .OrderBy(company => company.Name)
            .Select(company => new CompanyDto
            {
                Id = company.Id,
                Name = company.Name,
                OrgNumber = company.OrgNumber,
                WebsiteUrl = company.WebsiteUrl,
                City = company.City,
                Industry = company.Industry,
                Phone = company.Phone,
                OwnerId = company.OwnerId,
                OwnerEmail = company.Owner.Email ?? string.Empty,
                CreatedAt = company.CreatedAt
            })
            .ToListAsync();

        return Ok(companies);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<CompanyDto>> GetCompany(int id)
    {
        var company = await dbContext.Companies
            .AsNoTracking()
            .Include(existingCompany => existingCompany.Owner)
            .FirstOrDefaultAsync(existingCompany => existingCompany.Id == id);

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

        return Ok(ToDto(company));
    }

    [HttpGet("my")]
    [Authorize(Roles = CustomerRole)]
    public async Task<ActionResult<CompanyDto>> GetMyCompany()
    {
        var customerCompany =
            await currentCustomerCompanyService.GetCurrentCustomerCompanyAsync();

        if (customerCompany is null)
        {
            return CustomerCompanyNotFound();
        }

        var company = await dbContext.Companies
            .AsNoTracking()
            .Include(existingCompany => existingCompany.Owner)
            .SingleAsync(existingCompany => existingCompany.Id == customerCompany.Id);

        return Ok(ToDto(company));
    }

    [HttpPost]
    [Authorize(Roles = AdminRole + "," + CustomerRole)]
    public async Task<ActionResult<CompanyDto>> CreateCompany(CreateCompanyDto dto)
    {
        if (!ValidateRequiredText(dto.Name, dto.OrgNumber, dto.City, dto.Industry))
        {
            return InvalidRequiredTextResponse();
        }

        ApplicationUser? owner;

        if (User.IsInRole(AdminRole))
        {
            if (string.IsNullOrWhiteSpace(dto.OwnerId))
            {
                return BadRequest(new
                {
                    message = "Owner is required."
                });
            }

            owner = await userManager.FindByIdAsync(dto.OwnerId.Trim());
        }
        else
        {
            var userId = GetCurrentUserId();
            owner = string.IsNullOrWhiteSpace(userId)
                ? null
                : await userManager.FindByIdAsync(userId);
        }

        if (owner is null)
        {
            return BadRequest(new
            {
                message = "Owner user was not found or is not a customer."
            });
        }

        if (!await userManager.IsInRoleAsync(owner, CustomerRole))
        {
            return BadRequest(new
            {
                message = "Company owner must be a customer user."
            });
        }

        if (await dbContext.Companies.AnyAsync(company => company.OwnerId == owner.Id))
        {
            return Conflict(new
            {
                message = "This customer already has a company."
            });
        }

        var company = new Company
        {
            Name = dto.Name.Trim(),
            OrgNumber = dto.OrgNumber.Trim(),
            WebsiteUrl = NormalizeOptionalText(dto.WebsiteUrl),
            City = dto.City.Trim(),
            Industry = dto.Industry.Trim(),
            Phone = NormalizeOptionalText(dto.Phone),
            OwnerId = owner.Id,
            CreatedAt = DateTime.UtcNow
        };

        dbContext.Companies.Add(company);
        await dbContext.SaveChangesAsync();

        company.Owner = owner;

        return CreatedAtAction(
            nameof(GetCompany),
            new { id = company.Id },
            ToDto(company));
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<CompanyDto>> UpdateCompany(int id, UpdateCompanyDto dto)
    {
        if (User.IsInRole(AdminRole)
            && !ValidateRequiredText(dto.Name, dto.OrgNumber, dto.City, dto.Industry))
        {
            return InvalidRequiredTextResponse();
        }

        if (!User.IsInRole(AdminRole)
            && !ValidateRequiredText(dto.City, dto.Industry))
        {
            return InvalidRequiredTextResponse();
        }

        var company = await dbContext.Companies
            .Include(existingCompany => existingCompany.Owner)
            .FirstOrDefaultAsync(existingCompany => existingCompany.Id == id);

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

        if (User.IsInRole(AdminRole))
        {
            var owner = await ResolveOwnerForUpdateAsync(dto.OwnerId, company.OwnerId);
            if (owner is null)
            {
                return BadRequest(new
                {
                    message = "Owner user was not found."
                });
            }

            var ownerAlreadyHasCompany = await dbContext.Companies
                .AnyAsync(existingCompany =>
                    existingCompany.OwnerId == owner.Id
                    && existingCompany.Id != company.Id);

            if (ownerAlreadyHasCompany)
            {
                return Conflict(new
                {
                    message = "This customer already has a company."
                });
            }

            company.Name = dto.Name!.Trim();
            company.OrgNumber = dto.OrgNumber!.Trim();
            company.WebsiteUrl = NormalizeOptionalText(dto.WebsiteUrl);
            company.City = dto.City.Trim();
            company.Industry = dto.Industry.Trim();
            company.Phone = NormalizeOptionalText(dto.Phone);
            company.OwnerId = owner.Id;
            company.Owner = owner;
        }
        else
        {
            company.WebsiteUrl = NormalizeOptionalText(dto.WebsiteUrl);
            company.City = dto.City.Trim();
            company.Industry = dto.Industry.Trim();
            company.Phone = NormalizeOptionalText(dto.Phone);
        }

        await dbContext.SaveChangesAsync();

        return Ok(ToDto(company));
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = AdminRole)]
    public async Task<IActionResult> DeleteCompany(int id)
    {
        var company = await dbContext.Companies
            .FirstOrDefaultAsync(existingCompany => existingCompany.Id == id);

        if (company is null)
        {
            return NotFound(new
            {
                message = "Company was not found."
            });
        }

        if (await HasRelatedRecordsAsync(id))
        {
            return Conflict(new
            {
                message = "Company cannot be deleted because it has related project, support, maintenance, hosting, SEO, or AI records."
            });
        }

        dbContext.Companies.Remove(company);
        await dbContext.SaveChangesAsync();

        return NoContent();
    }

    private string? GetCurrentUserId()
    {
        return User.FindFirstValue(ClaimTypes.NameIdentifier);
    }

    private async Task<ApplicationUser?> ResolveOwnerForUpdateAsync(string? ownerId, string currentOwnerId)
    {
        var normalizedOwnerId = NormalizeOptionalText(ownerId);
        var resolvedOwner = string.IsNullOrWhiteSpace(normalizedOwnerId)
            ? await userManager.FindByIdAsync(currentOwnerId)
            : await userManager.FindByIdAsync(normalizedOwnerId);

        if (resolvedOwner is null)
        {
            return null;
        }

        return await userManager.IsInRoleAsync(resolvedOwner, CustomerRole)
            ? resolvedOwner
            : null;
    }

    private async Task<bool> HasRelatedRecordsAsync(int companyId)
    {
        return await dbContext.ProjectRequests.AnyAsync(projectRequest => projectRequest.CompanyId == companyId)
            || await dbContext.Projects.AnyAsync(project => project.CompanyId == companyId)
            || await dbContext.SupportTickets.AnyAsync(ticket => ticket.CompanyId == companyId)
            || await dbContext.MaintenanceLogs.AnyAsync(log => log.CompanyId == companyId)
            || await dbContext.HostingStatuses.AnyAsync(status => status.CompanyId == companyId)
            || await dbContext.SeoReports.AnyAsync(report => report.CompanyId == companyId)
            || await dbContext.AiSeoRequests.AnyAsync(request => request.CompanyId == companyId);
    }

    private static CompanyDto ToDto(Company company)
    {
        return new CompanyDto
        {
            Id = company.Id,
            Name = company.Name,
            OrgNumber = company.OrgNumber,
            WebsiteUrl = company.WebsiteUrl,
            City = company.City,
            Industry = company.Industry,
            Phone = company.Phone,
            OwnerId = company.OwnerId,
            OwnerEmail = company.Owner.Email ?? string.Empty,
            CreatedAt = company.CreatedAt
        };
    }

    private static bool ValidateRequiredText(params string?[] values)
    {
        return values.All(value => !string.IsNullOrWhiteSpace(value));
    }

    private static string NormalizeOptionalText(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? string.Empty : value.Trim();
    }

    private BadRequestObjectResult InvalidRequiredTextResponse()
    {
        return BadRequest(new
        {
            message = "Please fill in all required company fields."
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
