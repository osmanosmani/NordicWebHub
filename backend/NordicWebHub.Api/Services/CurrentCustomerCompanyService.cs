using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using NordicWebHub.Api.Data;
using NordicWebHub.Api.Models;

namespace NordicWebHub.Api.Services;

public class CurrentCustomerCompanyService(
    ApplicationDbContext dbContext,
    IHttpContextAccessor httpContextAccessor)
    : ICurrentCustomerCompanyService
{
    public const string NoCompanyMessage =
        "No company is connected to your account yet.";

    public async Task<Company?> GetCurrentCustomerCompanyAsync(
        CancellationToken cancellationToken = default)
    {
        var userId = httpContextAccessor.HttpContext?.User
            .FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userId))
        {
            return null;
        }

        return await dbContext.Companies
            .AsNoTracking()
            .SingleOrDefaultAsync(
                company => company.OwnerId == userId,
                cancellationToken);
    }
}
