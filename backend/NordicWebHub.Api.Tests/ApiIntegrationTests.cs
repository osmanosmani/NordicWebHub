using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using NordicWebHub.Api.DTOs.Auth;
using NordicWebHub.Api.DTOs.Companies;
using NordicWebHub.Api.DTOs.ServicePackages;

namespace NordicWebHub.Api.Tests;

public class ApiIntegrationTests(NordicWebHubApiFactory factory)
    : IClassFixture<NordicWebHubApiFactory>
{
    [Fact]
    public async Task Health_endpoint_is_available_without_authentication()
    {
        using var client = factory.CreateApiClient();

        var response = await client.GetAsync("/api/health");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        using var payload = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        Assert.Equal("ok", payload.RootElement.GetProperty("status").GetString());
        Assert.Equal(
            "NordicWebHub.Api",
            payload.RootElement.GetProperty("app").GetString());
    }

    [Fact]
    public async Task Unsafe_request_without_csrf_token_is_rejected()
    {
        using var client = factory.CreateApiClient();

        var response = await client.PostAsJsonAsync("/api/auth/login", new
        {
            email = "customer@test.local",
            password = "Test123!"
        });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Customer_can_login_and_load_current_user()
    {
        await factory.EnsureSeededAsync();
        using var client = factory.CreateApiClient();

        var loginResponse = await LoginAsync(
            client,
            "customer@test.local",
            "Test123!");

        Assert.Equal(HttpStatusCode.OK, loginResponse.StatusCode);

        var loginUser = await loginResponse.Content.ReadFromJsonAsync<AuthResponseDto>();
        Assert.NotNull(loginUser);
        Assert.Equal("customer@test.local", loginUser.Email);
        Assert.Equal("Customer", loginUser.Role);

        var meResponse = await client.GetAsync("/api/auth/me");

        Assert.Equal(HttpStatusCode.OK, meResponse.StatusCode);

        var currentUser = await meResponse.Content.ReadFromJsonAsync<AuthResponseDto>();
        Assert.NotNull(currentUser);
        Assert.Equal(loginUser.Id, currentUser.Id);
        Assert.Equal("Customer", currentUser.Role);
    }

    [Fact]
    public async Task Customer_cannot_access_admin_or_another_customers_company()
    {
        await factory.EnsureSeededAsync();
        using var client = factory.CreateApiClient();
        await LoginAsync(client, "customer@test.local", "Test123!");

        var adminResponse = await client.GetAsync("/api/companies");
        var otherCompanyResponse =
            await client.GetAsync($"/api/companies/{factory.OtherCompanyId}");
        var ownCompanyResponse = await client.GetAsync("/api/companies/my");

        Assert.Equal(HttpStatusCode.Forbidden, adminResponse.StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, otherCompanyResponse.StatusCode);
        Assert.Equal(HttpStatusCode.OK, ownCompanyResponse.StatusCode);

        var ownCompany =
            await ownCompanyResponse.Content.ReadFromJsonAsync<CompanyDto>();
        Assert.NotNull(ownCompany);
        Assert.Equal(factory.CustomerCompanyId, ownCompany.Id);
    }

    [Fact]
    public async Task Admin_can_create_package_with_csrf_token()
    {
        await factory.EnsureSeededAsync();
        using var client = factory.CreateApiClient();
        await LoginAsync(client, "admin@test.local", "Test123!");

        var request = new CreateServicePackageDto
        {
            Name = "Integration Test Package",
            Description = "Created by the API integration test.",
            Category = "Testing",
            MonthlyPrice = 100,
            SetupFee = 500,
            DeliveryTime = "1 week",
            IsActive = true
        };

        var response = await SendWithCsrfAsync(
            client,
            HttpMethod.Post,
            "/api/packages",
            request);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var servicePackage =
            await response.Content.ReadFromJsonAsync<ServicePackageDto>();
        Assert.NotNull(servicePackage);
        Assert.Equal(request.Name, servicePackage.Name);
        Assert.True(servicePackage.IsActive);
    }

    private static async Task<HttpResponseMessage> LoginAsync(
        HttpClient client,
        string email,
        string password)
    {
        return await SendWithCsrfAsync(
            client,
            HttpMethod.Post,
            "/api/auth/login",
            new
            {
                email,
                password
            });
    }

    private static async Task<HttpResponseMessage> SendWithCsrfAsync<T>(
        HttpClient client,
        HttpMethod method,
        string path,
        T body)
    {
        var csrfResponse =
            await client.GetFromJsonAsync<CsrfTokenResponse>("/api/csrf-token");

        Assert.NotNull(csrfResponse);
        Assert.False(string.IsNullOrWhiteSpace(csrfResponse.Token));

        using var request = new HttpRequestMessage(method, path)
        {
            Content = JsonContent.Create(body)
        };
        request.Headers.Add("X-CSRF-TOKEN", csrfResponse.Token);

        return await client.SendAsync(request);
    }

    private sealed record CsrfTokenResponse(string Token);
}
