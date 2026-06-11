namespace NordicWebHub.Api.DTOs.WebsiteCheck;

public class WebsiteCheckSummaryDto
{
    public int CheckedCount { get; set; }

    public int OnlineCount { get; set; }

    public int FailedCount { get; set; }
}
