namespace Backend.Contracts.Dtos;

public sealed class DailyPlanDto
{
    public Guid PlanId { get; set; }
    public DateOnly PlanDate { get; set; }
    public int Version { get; set; }
    public string CreatedBy { get; set; } = null!;
    public DateTime PublishedAt { get; set; }
}
