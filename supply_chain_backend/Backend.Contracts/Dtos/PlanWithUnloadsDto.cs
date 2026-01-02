namespace Backend.Contracts.Dtos;

public sealed class PlanWithUnloadsDto
{
    public DailyPlanDto Plan { get; set; } = default!;
    public IReadOnlyList<PlanUnloadDto> Unloads { get; set; } = Array.Empty<PlanUnloadDto>();
}
