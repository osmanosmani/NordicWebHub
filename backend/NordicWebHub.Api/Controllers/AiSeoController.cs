using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NordicWebHub.Api.Data;
using NordicWebHub.Api.DTOs.AiSeo;
using NordicWebHub.Api.Models;
using NordicWebHub.Api.Models.Enums;
using NordicWebHub.Api.Services;

namespace NordicWebHub.Api.Controllers;

[ApiController]
[Route("api/ai-seo")]
[Authorize]
public class AiSeoController(
    ApplicationDbContext dbContext,
    IAiSeoService aiSeoService,
    IAiServiceRecommendationService aiServiceRecommendationService,
    ICurrentCustomerCompanyService currentCustomerCompanyService,
    ILogger<AiSeoController> logger) : ControllerBase
{
    private const string AdminRole = "Admin";
    private const string CustomerRole = "Customer";

    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    [HttpGet]
    [Authorize(Roles = AdminRole)]
    public async Task<ActionResult<IEnumerable<AiSeoRequestResultDto>>> GetResults(
        CancellationToken cancellationToken)
    {
        var requests = await dbContext.AiSeoRequests
            .AsNoTracking()
            .Include(request => request.Company)
            .Where(request => request.RequestType == AiSeoRequestType.Seo)
            .OrderByDescending(request => request.CreatedAt)
            .ToListAsync(cancellationToken);

        return Ok(ParseResults(requests));
    }

    [HttpPost("generate")]
    [Authorize(Roles = CustomerRole)]
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
                RequestType = AiSeoRequestType.Seo,
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
    [Authorize(Roles = CustomerRole)]
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
                request.RequestType == AiSeoRequestType.Seo
                && request.CustomerId == userId
                && request.CompanyId == company.Id)
            .OrderByDescending(request => request.CreatedAt)
            .ToListAsync(cancellationToken);

        return Ok(ParseResults(requests));
    }

    [HttpGet("service-results")]
    [Authorize(Roles = AdminRole)]
    public async Task<ActionResult<IEnumerable<AiServiceRecommendationRequestResultDto>>>
        GetServiceRecommendationResults(CancellationToken cancellationToken)
    {
        var requests = await dbContext.AiSeoRequests
            .AsNoTracking()
            .Include(request => request.Company)
            .Include(request => request.Customer)
            .Where(request =>
                request.RequestType == AiSeoRequestType.ServiceRecommendation)
            .OrderByDescending(request => request.CreatedAt)
            .ToListAsync(cancellationToken);

        return Ok(ParseServiceRecommendationResults(requests));
    }

    [HttpGet("my-service-results")]
    [Authorize(Roles = CustomerRole)]
    public async Task<ActionResult<IEnumerable<AiServiceRecommendationRequestResultDto>>>
        GetMyServiceRecommendationResults(CancellationToken cancellationToken)
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
            .Include(request => request.Customer)
            .Where(request =>
                request.RequestType == AiSeoRequestType.ServiceRecommendation
                && request.CustomerId == userId
                && request.CompanyId == company.Id)
            .OrderByDescending(request => request.CreatedAt)
            .ToListAsync(cancellationToken);

        return Ok(ParseServiceRecommendationResults(requests));
    }

    [HttpPost("service-recommendation")]
    [Authorize(Roles = CustomerRole)]
    public async Task<ActionResult<AiServiceRecommendationRequestResultDto>>
        GenerateServiceRecommendation(
            GenerateAiServiceRecommendationDto dto,
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

        var input = NormalizeServiceRecommendationInput(dto);
        if (input.NeededServices.Count == 0)
        {
            return BadRequest(new
            {
                message = "Select at least one needed service."
            });
        }

        var result = aiServiceRecommendationService.Generate(input);
        var request = new AiSeoRequest
        {
            CompanyId = company.Id,
            CustomerId = userId,
            Industry = input.Industry,
            City = input.City,
            RequestType = AiSeoRequestType.ServiceRecommendation,
            InputJson = JsonSerializer.Serialize(input, JsonOptions),
            ResultJson = JsonSerializer.Serialize(result, JsonOptions),
            CreatedAt = DateTime.UtcNow
        };

        dbContext.AiSeoRequests.Add(request);
        await dbContext.SaveChangesAsync(cancellationToken);

        request.Company = company;
        request.Customer = await dbContext.Users
            .AsNoTracking()
            .SingleAsync(user => user.Id == userId, cancellationToken);

        return Ok(ToServiceRecommendationDto(request, input, result));
    }

    private IReadOnlyCollection<AiSeoRequestResultDto> ParseResults(
        IEnumerable<AiSeoRequest> requests)
    {
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

        return results;
    }

    private IReadOnlyCollection<AiServiceRecommendationRequestResultDto>
        ParseServiceRecommendationResults(IEnumerable<AiSeoRequest> requests)
    {
        var results = new List<AiServiceRecommendationRequestResultDto>();

        foreach (var request in requests)
        {
            try
            {
                var input = JsonSerializer.Deserialize<GenerateAiServiceRecommendationDto>(
                    request.InputJson ?? string.Empty,
                    JsonOptions);
                var result = JsonSerializer.Deserialize<AiServiceRecommendationResultDto>(
                    request.ResultJson,
                    JsonOptions);

                if (input is null || result is null)
                {
                    continue;
                }

                results.Add(ToServiceRecommendationDto(request, input, result));
            }
            catch (JsonException exception)
            {
                logger.LogWarning(
                    exception,
                    "Skipped invalid stored service recommendation {AiSeoRequestId}.",
                    request.Id);
            }
        }

        return results;
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

    private static AiServiceRecommendationRequestResultDto
        ToServiceRecommendationDto(
            AiSeoRequest request,
            GenerateAiServiceRecommendationDto input,
            AiServiceRecommendationResultDto result)
    {
        return new AiServiceRecommendationRequestResultDto
        {
            Id = request.Id,
            CompanyId = request.CompanyId,
            CompanyName = request.Company.Name,
            CustomerEmail = request.Customer.Email ?? string.Empty,
            Input = input,
            Result = result,
            CreatedAt = request.CreatedAt
        };
    }

    private static GenerateAiServiceRecommendationDto
        NormalizeServiceRecommendationInput(GenerateAiServiceRecommendationDto dto)
    {
        return new GenerateAiServiceRecommendationDto
        {
            BusinessName = dto.BusinessName.Trim(),
            Industry = dto.Industry.Trim(),
            City = dto.City.Trim(),
            CurrentWebsiteUrl = string.IsNullOrWhiteSpace(dto.CurrentWebsiteUrl)
                ? null
                : dto.CurrentWebsiteUrl.Trim(),
            BusinessGoal = dto.BusinessGoal.Trim(),
            TargetCustomers = dto.TargetCustomers.Trim(),
            NeededServices = dto.NeededServices
                .Select(service => service.Trim())
                .Where(service => service.Length > 0)
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToArray(),
            BudgetRange = dto.BudgetRange.Trim(),
            PreferredTimeline = dto.PreferredTimeline.Trim(),
            Notes = string.IsNullOrWhiteSpace(dto.Notes)
                ? null
                : dto.Notes.Trim()
        };
    }
}
