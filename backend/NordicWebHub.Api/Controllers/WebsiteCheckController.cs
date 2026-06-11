using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NordicWebHub.Api.DTOs.WebsiteCheck;
using NordicWebHub.Api.Services;

namespace NordicWebHub.Api.Controllers;

[ApiController]
[Route("api/website-check")]
[Authorize(Roles = "Admin")]
public class WebsiteCheckController(WebsiteHealthCheckService websiteHealthCheckService)
    : ControllerBase
{
    [HttpPost("run")]
    public async Task<ActionResult<WebsiteCheckSummaryDto>> RunWebsiteCheck(
        CancellationToken cancellationToken)
    {
        var summary = await websiteHealthCheckService.RunAsync(cancellationToken);

        return Ok(summary);
    }
}
