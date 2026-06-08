using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using NordicWebHub.Api.Models;

namespace NordicWebHub.Api.Data;

public static class DbInitializer
{
    private const string AdminRole = "Admin";
    private const string CustomerRole = "Customer";
    private const string AdminEmail = "admin@nordicwebhub.se";
    private const string CustomerEmail = "customer@nordicwebhub.se";

    // Development/demo seed data only. Do not use these credentials in production.
    public static async Task InitializeAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();

        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();

        await dbContext.Database.MigrateAsync();

        await SeedRoleAsync(roleManager, AdminRole);
        await SeedRoleAsync(roleManager, CustomerRole);

        var admin = await SeedUserAsync(
            userManager,
            email: AdminEmail,
            password: "Admin123!",
            firstName: "Demo",
            lastName: "Admin");

        var customer = await SeedUserAsync(
            userManager,
            email: CustomerEmail,
            password: "Customer123!",
            firstName: "Demo",
            lastName: "Customer");

        await AddUserToRoleAsync(userManager, admin, AdminRole);
        await AddUserToRoleAsync(userManager, customer, CustomerRole);

        await SeedCompanyAsync(dbContext, customer.Id);
        await SeedServicePackagesAsync(dbContext);
    }

    private static async Task SeedRoleAsync(RoleManager<IdentityRole> roleManager, string roleName)
    {
        if (await roleManager.RoleExistsAsync(roleName))
        {
            return;
        }

        var result = await roleManager.CreateAsync(new IdentityRole(roleName));
        ThrowIfFailed(result, $"Failed to create role '{roleName}'.");
    }

    private static async Task<ApplicationUser> SeedUserAsync(
        UserManager<ApplicationUser> userManager,
        string email,
        string password,
        string firstName,
        string lastName)
    {
        var user = await userManager.FindByEmailAsync(email);
        if (user is not null)
        {
            user.FirstName = firstName;
            user.LastName = lastName;
            user.EmailConfirmed = true;

            var updateResult = await userManager.UpdateAsync(user);
            ThrowIfFailed(updateResult, $"Failed to update demo user '{email}'.");

            return user;
        }

        user = new ApplicationUser
        {
            UserName = email,
            Email = email,
            EmailConfirmed = true,
            FirstName = firstName,
            LastName = lastName,
            CreatedAt = DateTime.UtcNow
        };

        var createResult = await userManager.CreateAsync(user, password);
        ThrowIfFailed(createResult, $"Failed to create demo user '{email}'.");

        return user;
    }

    private static async Task AddUserToRoleAsync(
        UserManager<ApplicationUser> userManager,
        ApplicationUser user,
        string roleName)
    {
        if (await userManager.IsInRoleAsync(user, roleName))
        {
            return;
        }

        var result = await userManager.AddToRoleAsync(user, roleName);
        ThrowIfFailed(result, $"Failed to add user '{user.Email}' to role '{roleName}'.");
    }

    private static async Task SeedCompanyAsync(ApplicationDbContext dbContext, string ownerId)
    {
        const string companyName = "Nordic Web Hub Demo Customer";

        if (await dbContext.Companies.AnyAsync(company => company.Name == companyName))
        {
            return;
        }

        dbContext.Companies.Add(new Company
        {
            Name = companyName,
            OrgNumber = "559000-0001",
            WebsiteUrl = "https://demo.nordicwebhub.se",
            City = "Stockholm",
            Industry = "Digital Services",
            Phone = "+46 8 123 456 78",
            OwnerId = ownerId,
            CreatedAt = DateTime.UtcNow
        });

        await dbContext.SaveChangesAsync();
    }

    private static async Task SeedServicePackagesAsync(ApplicationDbContext dbContext)
    {
        var packages = new[]
        {
            new ServicePackage
            {
                Name = "Starter Website",
                Description = "A simple website package for small businesses that need a clean online presence.",
                Category = "Web Design",
                MonthlyPrice = 499,
                SetupFee = 4990,
                DeliveryTime = "2-3 weeks",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new ServicePackage
            {
                Name = "Business Website",
                Description = "A larger website package with more pages, stronger content structure, and lead-focused sections.",
                Category = "Web Design",
                MonthlyPrice = 999,
                SetupFee = 12990,
                DeliveryTime = "4-6 weeks",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new ServicePackage
            {
                Name = "SEO Basic",
                Description = "Basic search engine optimization setup for improved technical visibility.",
                Category = "SEO",
                MonthlyPrice = 1499,
                SetupFee = 2990,
                DeliveryTime = "1-2 weeks",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new ServicePackage
            {
                Name = "Hosting & Maintenance",
                Description = "Managed hosting, basic updates, uptime checks, and maintenance support.",
                Category = "Support",
                MonthlyPrice = 799,
                SetupFee = 0,
                DeliveryTime = "1 week",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new ServicePackage
            {
                Name = "E-commerce Setup",
                Description = "Store setup package for businesses that need product pages, payments, and checkout.",
                Category = "E-commerce",
                MonthlyPrice = 1999,
                SetupFee = 19990,
                DeliveryTime = "6-8 weeks",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            }
        };

        foreach (var servicePackage in packages)
        {
            var existingPackage = await dbContext.ServicePackages
                .FirstOrDefaultAsync(package => package.Name == servicePackage.Name);

            if (existingPackage is null)
            {
                dbContext.ServicePackages.Add(servicePackage);
                continue;
            }

            existingPackage.Description = servicePackage.Description;
            existingPackage.Category = servicePackage.Category;
            existingPackage.MonthlyPrice = servicePackage.MonthlyPrice;
            existingPackage.SetupFee = servicePackage.SetupFee;
            existingPackage.DeliveryTime = servicePackage.DeliveryTime;
            existingPackage.IsActive = servicePackage.IsActive;
        }

        await dbContext.SaveChangesAsync();
    }

    private static void ThrowIfFailed(IdentityResult result, string message)
    {
        if (result.Succeeded)
        {
            return;
        }

        var errors = string.Join(", ", result.Errors.Select(error => error.Description));
        throw new InvalidOperationException($"{message} {errors}");
    }
}
