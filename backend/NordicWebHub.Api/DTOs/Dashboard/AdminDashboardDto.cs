namespace NordicWebHub.Api.DTOs.Dashboard;

public class AdminDashboardDto
{
    public int TotalCustomers { get; set; }

    public int TotalCompanies { get; set; }

    public int TotalProjectRequests { get; set; }

    public int PendingProjectRequests { get; set; }

    public int ActiveProjects { get; set; }

    public int OpenTickets { get; set; }

    public IReadOnlyCollection<DashboardProjectRequestDto> RecentProjectRequests { get; set; } = [];

    public IReadOnlyCollection<DashboardSupportTicketDto> RecentSupportTickets { get; set; } = [];

    public IReadOnlyCollection<DashboardProjectDto> RecentProjects { get; set; } = [];
}
