using System.Net;
using Microsoft.EntityFrameworkCore;
using NordicWebHub.Api.Data;
using NordicWebHub.Api.DTOs.WebsiteCheck;
using NordicWebHub.Api.Models;
using NordicWebHub.Api.Models.Enums;

namespace NordicWebHub.Api.Services;

public class WebsiteHealthCheckService(
    ApplicationDbContext dbContext,
    IHttpClientFactory httpClientFactory)
{
    private const string HealthCheckTicketTitle = "Website health check failed.";

    public async Task<WebsiteCheckSummaryDto> RunAsync(
        CancellationToken cancellationToken = default)
    {
        var companies = await dbContext.Companies
            .AsNoTracking()
            .Where(company => company.WebsiteUrl != string.Empty)
            .OrderBy(company => company.Id)
            .ToListAsync(cancellationToken);

        var checks = await Task.WhenAll(
            companies.Select(company => CheckWebsiteAsync(company, cancellationToken)));

        var existingStatuses = await dbContext.HostingStatuses
            .OrderByDescending(status => status.LastCheckedAt)
            .ToListAsync(cancellationToken);

        var latestStatusByCompany = existingStatuses
            .GroupBy(status => status.CompanyId)
            .ToDictionary(group => group.Key, group => group.First());

        var activeFailureTickets = await dbContext.SupportTickets
            .Where(ticket =>
                ticket.Title == HealthCheckTicketTitle
                && ticket.Status != TicketStatus.Closed)
            .ToListAsync(cancellationToken);

        var activeTicketByCompany = activeFailureTickets
            .GroupBy(ticket => ticket.CompanyId)
            .ToDictionary(group => group.Key, group => group.First());

        foreach (var check in checks)
        {
            if (!latestStatusByCompany.TryGetValue(check.Company.Id, out var hostingStatus))
            {
                hostingStatus = new HostingStatus
                {
                    CompanyId = check.Company.Id
                };

                dbContext.HostingStatuses.Add(hostingStatus);
                latestStatusByCompany[check.Company.Id] = hostingStatus;
            }

            hostingStatus.DomainName = Truncate(check.DomainName, 250);
            hostingStatus.IsOnline = check.IsOnline;
            hostingStatus.LastCheckedAt = check.CheckedAt;
            hostingStatus.StatusCode = check.StatusCode;
            hostingStatus.Notes = Truncate(check.Notes, 1000);

            if (!check.IsOnline)
            {
                AddOrUpdateFailureTicket(check, activeTicketByCompany);
            }
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        return new WebsiteCheckSummaryDto
        {
            CheckedCount = checks.Length,
            OnlineCount = checks.Count(check => check.IsOnline),
            FailedCount = checks.Count(check => !check.IsOnline)
        };
    }

    private async Task<WebsiteCheckResult> CheckWebsiteAsync(
        Company company,
        CancellationToken cancellationToken)
    {
        var checkedAt = DateTime.UtcNow;
        var rawUrl = company.WebsiteUrl.Trim();

        if (!Uri.TryCreate(rawUrl, UriKind.Absolute, out var uri)
            || (uri.Scheme != Uri.UriSchemeHttp && uri.Scheme != Uri.UriSchemeHttps))
        {
            return WebsiteCheckResult.Failed(
                company,
                GetFallbackDomainName(rawUrl),
                checkedAt,
                "Website URL is invalid. Use an absolute HTTP or HTTPS URL.");
        }

        if (await IsPrivateOrLocalDestinationAsync(uri, cancellationToken))
        {
            return WebsiteCheckResult.Failed(
                company,
                uri.Host,
                checkedAt,
                "Website URL points to a local or private network address and was not checked.");
        }

        try
        {
            var client = httpClientFactory.CreateClient("WebsiteHealthCheck");
            using var request = new HttpRequestMessage(HttpMethod.Get, uri);
            using var response = await client.SendAsync(
                request,
                HttpCompletionOption.ResponseHeadersRead,
                cancellationToken);

            var statusCode = (int)response.StatusCode;
            var isOnline = statusCode < StatusCodes.Status400BadRequest;
            var notes = isOnline
                ? $"Website responded successfully with HTTP {statusCode}."
                : $"Website returned HTTP {statusCode}.";

            return new WebsiteCheckResult(
                company,
                uri.Host,
                isOnline,
                checkedAt,
                statusCode,
                notes);
        }
        catch (OperationCanceledException) when (!cancellationToken.IsCancellationRequested)
        {
            return WebsiteCheckResult.Failed(
                company,
                uri.Host,
                checkedAt,
                "Website request timed out.");
        }
        catch (HttpRequestException exception)
        {
            return WebsiteCheckResult.Failed(
                company,
                uri.Host,
                checkedAt,
                $"Website request failed: {exception.Message}");
        }
    }

    private void AddOrUpdateFailureTicket(
        WebsiteCheckResult check,
        IDictionary<int, SupportTicket> activeTicketByCompany)
    {
        var description =
            $"Automated website health check failed for {check.Company.WebsiteUrl}. "
            + $"Status code: {check.StatusCode}. {check.Notes}";

        if (activeTicketByCompany.TryGetValue(check.Company.Id, out var existingTicket))
        {
            existingTicket.Priority = TicketPriority.Urgent;
            existingTicket.Description = Truncate(description, 2000);
            return;
        }

        var ticket = new SupportTicket
        {
            CompanyId = check.Company.Id,
            CustomerId = check.Company.OwnerId,
            Title = HealthCheckTicketTitle,
            Description = Truncate(description, 2000),
            Status = TicketStatus.Open,
            Priority = TicketPriority.Urgent,
            CreatedAt = DateTime.UtcNow
        };

        dbContext.SupportTickets.Add(ticket);
        activeTicketByCompany[check.Company.Id] = ticket;
    }

    private static async Task<bool> IsPrivateOrLocalDestinationAsync(
        Uri uri,
        CancellationToken cancellationToken)
    {
        if (uri.IsLoopback
            || uri.Host.Equals("localhost", StringComparison.OrdinalIgnoreCase))
        {
            return true;
        }

        if (IPAddress.TryParse(uri.Host, out var parsedAddress))
        {
            return IsPrivateOrLocalAddress(parsedAddress);
        }

        try
        {
            var addresses = await Dns.GetHostAddressesAsync(uri.Host, cancellationToken);
            return addresses.Any(IsPrivateOrLocalAddress);
        }
        catch (OperationCanceledException)
        {
            throw;
        }
        catch
        {
            // The HTTP request below will record the DNS or connection failure.
            return false;
        }
    }

    private static bool IsPrivateOrLocalAddress(IPAddress address)
    {
        if (IPAddress.IsLoopback(address)
            || address.Equals(IPAddress.Any)
            || address.Equals(IPAddress.IPv6Any)
            || address.Equals(IPAddress.None)
            || address.Equals(IPAddress.IPv6None)
            || address.IsIPv6LinkLocal
            || address.IsIPv6SiteLocal)
        {
            return true;
        }

        if (address.AddressFamily == System.Net.Sockets.AddressFamily.InterNetwork)
        {
            var bytes = address.GetAddressBytes();

            return bytes[0] == 10
                || bytes[0] == 127
                || (bytes[0] == 169 && bytes[1] == 254)
                || (bytes[0] == 172 && bytes[1] is >= 16 and <= 31)
                || (bytes[0] == 192 && bytes[1] == 168);
        }

        if (address.AddressFamily == System.Net.Sockets.AddressFamily.InterNetworkV6)
        {
            var bytes = address.GetAddressBytes();
            if ((bytes[0] & 0xFE) == 0xFC)
            {
                return true;
            }
        }

        return address.IsIPv4MappedToIPv6
            && IsPrivateOrLocalAddress(address.MapToIPv4());
    }

    private static string GetFallbackDomainName(string websiteUrl)
    {
        return string.IsNullOrWhiteSpace(websiteUrl) ? "Unknown" : websiteUrl;
    }

    private static string Truncate(string value, int maxLength)
    {
        return value.Length <= maxLength ? value : value[..maxLength];
    }

    private sealed record WebsiteCheckResult(
        Company Company,
        string DomainName,
        bool IsOnline,
        DateTime CheckedAt,
        int StatusCode,
        string Notes)
    {
        public static WebsiteCheckResult Failed(
            Company company,
            string domainName,
            DateTime checkedAt,
            string notes)
        {
            return new WebsiteCheckResult(
                company,
                domainName,
                false,
                checkedAt,
                0,
                notes);
        }
    }
}
