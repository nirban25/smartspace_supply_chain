namespace Backend.Contracts.Dtos;

public sealed class InventorySnapshotDto
{
    public Guid SnapshotId { get; set; }
    public Guid NodeId { get; set; }
    public Guid MaterialId { get; set; }
    public int Quantity { get; set; }
    public DateTime AsOf { get; set; }
}
