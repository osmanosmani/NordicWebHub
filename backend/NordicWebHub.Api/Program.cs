using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi;
using NordicWebHub.Api.Data;
using NordicWebHub.Api.Models;
using NordicWebHub.Api.Services;

const string reactFrontendCorsPolicy = "ReactFrontend";

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' is missing.");

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString));

builder.Services
    .AddHttpClient("WebsiteHealthCheck", client =>
    {
        client.Timeout = TimeSpan.FromSeconds(8);
        client.DefaultRequestHeaders.UserAgent.ParseAdd("NordicWebHub-HealthCheck/1.0");
    })
    .ConfigurePrimaryHttpMessageHandler(() => new HttpClientHandler
    {
        AllowAutoRedirect = false
    });

builder.Services.AddScoped<WebsiteHealthCheckService>();

builder.Services
    .AddIdentity<ApplicationUser, IdentityRole>(options =>
    {
        options.User.RequireUniqueEmail = true;
        options.Password.RequiredLength = 8;
        options.Password.RequireNonAlphanumeric = false;
        options.SignIn.RequireConfirmedEmail = false;
    })
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders();

builder.Services.ConfigureApplicationCookie(options =>
{
    options.Cookie.Name = "NordicWebHub.Auth";
    options.Cookie.HttpOnly = true;
    // The React app runs on http://localhost:5173 while the API runs on HTTPS,
    // so browser cookie rules require SameSite=None and Secure for local auth.
    options.Cookie.SameSite = SameSiteMode.None;
    options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
    options.ExpireTimeSpan = TimeSpan.FromDays(7);
    options.SlidingExpiration = true;

    options.Events.OnRedirectToLogin = context =>
    {
        context.Response.StatusCode = StatusCodes.Status401Unauthorized;
        return Task.CompletedTask;
    };

    options.Events.OnRedirectToAccessDenied = context =>
    {
        context.Response.StatusCode = StatusCodes.Status403Forbidden;
        return Task.CompletedTask;
    };
});

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
    options.AddPolicy("CustomerOnly", policy => policy.RequireRole("Customer"));
    options.AddPolicy("ClientOnly", policy => policy.RequireRole("Customer"));
});

builder.Services.AddCors(options =>
{
    options.AddPolicy(reactFrontendCorsPolicy, policy =>
    {
        policy
            .WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "NordicWebHub API",
        Version = "v1"
    });

    options.AddSecurityDefinition("cookieAuth", new OpenApiSecurityScheme
    {
        Name = "NordicWebHub.Auth",
        Description = "Authentication cookie set by POST /api/auth/login.",
        In = ParameterLocation.Cookie,
        Type = SecuritySchemeType.ApiKey
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    // Development/demo seed data only. Do not run seeded demo credentials in production.
    await DbInitializer.InitializeAsync(app.Services);

    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors(reactFrontendCorsPolicy);
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapGet("/api/health", () => Results.Ok(new
{
    status = "Healthy",
    application = "NordicWebHub.Api",
    utc = DateTime.UtcNow
}))
.AllowAnonymous()
.WithName("HealthCheck")
.WithTags("Health");

app.Run();
