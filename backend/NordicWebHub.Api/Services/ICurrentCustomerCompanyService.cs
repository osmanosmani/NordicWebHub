using NordicWebHub.Api.Models;

namespace NordicWebHub.Api.Services;

public interface ICurrentCustomerCompanyService
{
    Task<Company?> GetCurrentCustomerCompanyAsync(
        CancellationToken cancellationToken = default);
}
