using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NordicWebHub.Api.Data;
using NordicWebHub.Api.DTOs.SeoReports;
using NordicWebHub.Api.Models;
using NordicWebHub.Api.Services;

namespace NordicWebHub.Api.Controllers;

[ApiController]
[Route("api/seo-reports")]
[Authorize]
public class SeoReportsController(
    ApplicationDbContext dbContext,
    ICurrentCustomerCompanyService currentCustomerCompanyService)
    : ControllerBase
{
    private const string AdminRole = "Admin";
    private const string CustomerRole = "Customer";

    [HttpGet]
    [Authorize(Roles = AdminRole)]
    public async Task<ActionResult<IEnumerable<SeoReportDto>>> GetSeoReports()
    {
        var seoReports = await SeoReportsWithCompany()
            .OrderByDescending(report => report.CreatedAt)
            .ToListAsync();

        return Ok(seoReports.Select(ToDto));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<SeoReportDto>> GetSeoReport(int id)
    {
        var seoReport = await SeoReportsWithCompany()
            .FirstOrDefaultAsync(report => report.Id == id);

        if (seoReport is null)
        {
            return SeoReportNotFound();
        }

        if (!User.IsInRole(AdminRole))
        {
            var company =
                await currentCustomerCompanyService.GetCurrentCustomerCompanyAsync();

            if (company is null)
            {
                return CustomerCompanyNotFound();
            }

            if (seoReport.CompanyId != company.Id)
            {
                return Forbid();
            }
        }

        return Ok(ToDto(seoReport));
    }

    [HttpGet("my")]
    [Authorize(Roles = CustomerRole)]
    public async Task<ActionResult<IEnumerable<SeoReportDto>>> GetMySeoReports()
    {
        var company =
            await currentCustomerCompanyService.GetCurrentCustomerCompanyAsync();

        if (company is null)
        {
            return CustomerCompanyNotFound();
        }

        var seoReports = await SeoReportsWithCompany()
            .Where(report => report.CompanyId == company.Id)
            .OrderByDescending(report => report.CreatedAt)
            .ToListAsync();

        return Ok(seoReports.Select(ToDto));
    }

    [HttpPost]
    [Authorize(Roles = AdminRole)]
    public async Task<ActionResult<SeoReportDto>> CreateSeoReport(CreateSeoReportDto dto)
    {
        if (!ValidateRequiredText(
                dto.TopKeywords,
                dto.TechnicalIssues,
                dto.Recommendations))
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

        var seoReport = new SeoReport
        {
            CompanyId = dto.CompanyId,
            SeoScore = dto.SeoScore,
            TopKeywords = dto.TopKeywords.Trim(),
            TechnicalIssues = dto.TechnicalIssues.Trim(),
            Recommendations = dto.Recommendations.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        dbContext.SeoReports.Add(seoReport);
        await dbContext.SaveChangesAsync();

        var createdReport = await SeoReportsWithCompany()
            .FirstAsync(report => report.Id == seoReport.Id);

        return CreatedAtAction(
            nameof(GetSeoReport),
            new { id = createdReport.Id },
            ToDto(createdReport));
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = AdminRole)]
    public async Task<ActionResult<SeoReportDto>> UpdateSeoReport(
        int id,
        UpdateSeoReportDto dto)
    {
        if (!ValidateRequiredText(
                dto.TopKeywords,
                dto.TechnicalIssues,
                dto.Recommendations))
        {
            return InvalidRequiredTextResponse();
        }

        var seoReport = await dbContext.SeoReports
            .FirstOrDefaultAsync(report => report.Id == id);

        if (seoReport is null)
        {
            return SeoReportNotFound();
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

        seoReport.CompanyId = dto.CompanyId;
        seoReport.SeoScore = dto.SeoScore;
        seoReport.TopKeywords = dto.TopKeywords.Trim();
        seoReport.TechnicalIssues = dto.TechnicalIssues.Trim();
        seoReport.Recommendations = dto.Recommendations.Trim();

        await dbContext.SaveChangesAsync();

        var updatedReport = await SeoReportsWithCompany()
            .FirstAsync(report => report.Id == seoReport.Id);

        return Ok(ToDto(updatedReport));
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = AdminRole)]
    public async Task<IActionResult> DeleteSeoReport(int id)
    {
        var seoReport = await dbContext.SeoReports
            .FirstOrDefaultAsync(report => report.Id == id);

        if (seoReport is null)
        {
            return SeoReportNotFound();
        }

        dbContext.SeoReports.Remove(seoReport);
        await dbContext.SaveChangesAsync();

        return NoContent();
    }

    private IQueryable<SeoReport> SeoReportsWithCompany()
    {
        return dbContext.SeoReports
            .AsNoTracking()
            .Include(report => report.Company);
    }

    private static SeoReportDto ToDto(SeoReport seoReport)
    {
        return new SeoReportDto
        {
            Id = seoReport.Id,
            CompanyId = seoReport.CompanyId,
            CompanyName = seoReport.Company.Name,
            SeoScore = seoReport.SeoScore,
            TopKeywords = seoReport.TopKeywords,
            TechnicalIssues = seoReport.TechnicalIssues,
            Recommendations = seoReport.Recommendations,
            CreatedAt = seoReport.CreatedAt
        };
    }

    private static bool ValidateRequiredText(params string?[] values)
    {
        return values.All(value => !string.IsNullOrWhiteSpace(value));
    }

    private NotFoundObjectResult SeoReportNotFound()
    {
        return NotFound(new
        {
            message = "SEO report was not found."
        });
    }

    private BadRequestObjectResult InvalidRequiredTextResponse()
    {
        return BadRequest(new
        {
            message = "Please fill in top keywords, technical issues, and recommendations."
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
