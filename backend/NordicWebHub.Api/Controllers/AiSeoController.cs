using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NordicWebHub.Api.Data;
using NordicWebHub.Api.DTOs.AiSeo;
using NordicWebHub.Api.Models;
using NordicWebHub.Api.Services;

namespace NordicWebHub.Api.Controllers;

[ApiController]
[Route("api/ai-seo")]
[Authorize(Roles = "Customer")]
public class AiSeoController(
    ApplicationDbContext dbContext,
    IAiSeoService aiSeoService,
    ICurrentCustomerCompanyService currentCustomerCompanyService,
    ILogger<AiSeoController> logger) : ControllerBase
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    [HttpPost("generate")]
    public async Task<ActionResult<AiSeoResultDto>> Generate(
        GenerateAiSeoRequestDto dto,
        CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();
        if (string.IsNullOrWhiteSpace(userId))
        {
            return InvalidSession();
        }

        var company = await currentCustomerCompanyService
            .GetCurrentCustomerCompanyAsync(cancellationToken);

        if (company is null)
        {
            return NotFound(new
            {
                message = CurrentCustomerCompanyService.NoCompanyMessage
            });
        }

        var industry = dto.Industry.Trim();
        var city = dto.City.Trim();

        if (industry.Length == 0 || city.Length == 0)
        {
            return BadRequest(new
            {
                message = "Industry and city are required."
            });
        }

        try
        {
            var result = await aiSeoService.GenerateAsync(
                industry,
                city,
                cancellationToken);

            var request = new AiSeoRequest
            {
                CompanyId = company.Id,
                CustomerId = userId,
                Industry = industry,
                City = city,
                ResultJson = JsonSerializer.Serialize(result, JsonOptions),
                CreatedAt = DateTime.UtcNow
            };

            dbContext.AiSeoRequests.Add(request);
            await dbContext.SaveChangesAsync(cancellationToken);

            return Ok(result);
        }
        catch (AiSeoServiceException exception)
        {
            logger.LogWarning(
                "AI SEO generation failed for customer {CustomerId}: {Message}",
                userId,
                exception.Message);

            return StatusCode(StatusCodes.Status503ServiceUnavailable, new
            {
                message = exception.Message
            });
        }
    }

    [HttpGet("my-results")]
    public async Task<ActionResult<IEnumerable<AiSeoRequestResultDto>>> GetMyResults(
        CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();
        if (string.IsNullOrWhiteSpace(userId))
        {
            return InvalidSession();
        }

        var company = await currentCustomerCompanyService
            .GetCurrentCustomerCompanyAsync(cancellationToken);

        if (company is null)
        {
            return NotFound(new
            {
                message = CurrentCustomerCompanyService.NoCompanyMessage
            });
        }

        var requests = await dbContext.AiSeoRequests
            .AsNoTracking()
            .Include(request => request.Company)
            .Where(request =>
                request.CustomerId == userId
                && request.CompanyId == company.Id)
            .OrderByDescending(request => request.CreatedAt)
            .ToListAsync(cancellationToken);

        var results = new List<AiSeoRequestResultDto>();

        foreach (var request in requests)
        {
            try
            {
                var result = JsonSerializer.Deserialize<AiSeoResultDto>(
                    request.ResultJson,
                    JsonOptions);

                if (result is null)
                {
                    continue;
                }

                results.Add(ToDto(request, result));
            }
            catch (JsonException exception)
            {
                logger.LogWarning(
                    exception,
                    "Skipped invalid stored AI SEO result {AiSeoRequestId}.",
                    request.Id);
            }
        }

        return Ok(results);
    }

    private string? GetCurrentUserId()
    {
        return User.FindFirstValue(ClaimTypes.NameIdentifier);
    }

    private UnauthorizedObjectResult InvalidSession()
    {
        return Unauthorized(new
        {
            message = "Your session is invalid. Please log in again."
        });
    }

    private static AiSeoRequestResultDto ToDto(
        AiSeoRequest request,
        AiSeoResultDto result)
    {
        return new AiSeoRequestResultDto
        {
            Id = request.Id,
            CompanyId = request.CompanyId,
            CompanyName = request.Company.Name,
            Industry = request.Industry,
            City = request.City,
            Result = result,
            CreatedAt = request.CreatedAt
        };
    }
}
