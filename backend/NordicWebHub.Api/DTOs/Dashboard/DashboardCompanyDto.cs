namespace NordicWebHub.Api.DTOs.Dashboard;

public class DashboardCompanyDto
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string OrgNumber { get; set; } = string.Empty;

    public string WebsiteUrl { get; set; } = string.Empty;

    public string City { get; set; } = string.Empty;

    public string Industry { get; set; } = string.Empty;

    public string Phone { get; set; } = string.Empty;
}
