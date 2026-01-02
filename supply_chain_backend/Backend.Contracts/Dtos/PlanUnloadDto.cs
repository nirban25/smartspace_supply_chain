
namespace Backend.Contracts.Dtos;

public sealed class PlanUnloadDto
{
    public Guid PlanId { get; set; }
    public Guid NodeId { get; set; }
    public Guid MaterialId { get; set; }
    public int TargetUnits { get; set; }
}
