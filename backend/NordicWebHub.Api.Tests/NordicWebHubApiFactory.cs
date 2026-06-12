using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using NordicWebHub.Api.Data;
using NordicWebHub.Api.Models;

namespace NordicWebHub.Api.Tests;

public sealed class NordicWebHubApiFactory : WebApplicationFactory<Program>
{
    private readonly string databaseName = $"NordicWebHubTests-{Guid.NewGuid()}";
    private readonly SemaphoreSlim seedLock = new(1, 1);
    private bool isSeeded;

    public int CustomerCompanyId { get; private set; }

    public int OtherCompanyId { get; private set; }

    public HttpClient CreateApiClient()
    {
        return CreateClient(new WebApplicationFactoryClientOptions
        {
            AllowAutoRedirect = false,
            BaseAddress = new Uri("https://localhost"),
            HandleCookies = true
        });
    }

    public async Task EnsureSeededAsync()
    {
        await seedLock.WaitAsync();

        try
        {
            if (isSeeded)
            {
                return;
            }

            using var scope = Services.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
            var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();

            await dbContext.Database.EnsureCreatedAsync();

            await EnsureRoleAsync(roleManager, "Admin");
            await EnsureRoleAsync(roleManager, "Customer");

            var admin = await EnsureUserAsync(
                userManager,
                "admin@test.local",
                "Test123!",
                "Test",
                "Admin",
                "Admin");
            var customer = await EnsureUserAsync(
                userManager,
                "customer@test.local",
                "Test123!",
                "Test",
                "Customer",
                "Customer");
            var otherCustomer = await EnsureUserAsync(
                userManager,
                "other@test.local",
                "Test123!",
                "Other",
                "Customer",
                "Customer");

            _ = admin;

            var customerCompany = new Company
            {
                Name = "Test Customer Company AB",
                OrgNumber = "559100-1001",
                WebsiteUrl = "https://customer.test",
                City = "Stockholm",
                Industry = "Consulting",
                Phone = "0700000001",
                OwnerId = customer.Id,
                CreatedAt = DateTime.UtcNow
            };
            var otherCompany = new Company
            {
                Name = "Other Test Company AB",
                OrgNumber = "559100-1002",
                WebsiteUrl = "https://other.test",
                City = "Malmö",
                Industry = "Services",
                Phone = "0700000002",
                OwnerId = otherCustomer.Id,
                CreatedAt = DateTime.UtcNow
            };

            dbContext.Companies.AddRange(customerCompany, otherCompany);
            await dbContext.SaveChangesAsync();

            CustomerCompanyId = customerCompany.Id;
            OtherCompanyId = otherCompany.Id;
            isSeeded = true;
        }
        finally
        {
            seedLock.Release();
        }
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");

        builder.ConfigureServices(services =>
        {
            services.RemoveAll<DbContextOptions<ApplicationDbContext>>();
            services.RemoveAll<IDbContextOptionsConfiguration<ApplicationDbContext>>();
            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseInMemoryDatabase(databaseName));

            services.PostConfigure<AntiforgeryOptions>(options =>
            {
                options.Cookie.SameSite = SameSiteMode.Lax;
                options.Cookie.SecurePolicy = CookieSecurePolicy.None;
            });
            services.PostConfigure<CookieAuthenticationOptions>(
                IdentityConstants.ApplicationScheme,
                options =>
                {
                    options.Cookie.SameSite = SameSiteMode.Lax;
                    options.Cookie.SecurePolicy = CookieSecurePolicy.None;
                });
        });
    }

    private static async Task EnsureRoleAsync(
        RoleManager<IdentityRole> roleManager,
        string roleName)
    {
        if (await roleManager.RoleExistsAsync(roleName))
        {
            return;
        }

        var result = await roleManager.CreateAsync(new IdentityRole(roleName));
        Assert.True(result.Succeeded, FormatErrors(result));
    }

    private static async Task<ApplicationUser> EnsureUserAsync(
        UserManager<ApplicationUser> userManager,
        string email,
        string password,
        string firstName,
        string lastName,
        string role)
    {
        var existingUser = await userManager.FindByEmailAsync(email);
        if (existingUser is not null)
        {
            return existingUser;
        }

        var user = new ApplicationUser
        {
            UserName = email,
            Email = email,
            EmailConfirmed = true,
            FirstName = firstName,
            LastName = lastName,
            LockoutEnabled = true,
            CreatedAt = DateTime.UtcNow
        };

        var createResult = await userManager.CreateAsync(user, password);
        Assert.True(createResult.Succeeded, FormatErrors(createResult));

        var roleResult = await userManager.AddToRoleAsync(user, role);
        Assert.True(roleResult.Succeeded, FormatErrors(roleResult));

        return user;
    }

    private static string FormatErrors(IdentityResult result)
    {
        return string.Join(", ", result.Errors.Select(error => error.Description));
    }
}
