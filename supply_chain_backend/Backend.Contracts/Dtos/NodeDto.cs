namespace Backend.Contracts.Dtos;

public sealed class NodeDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public string NodeType { get; set; } = null!;
    public int? DesignCapacity { get; set; }
    public string? Timezone { get; set; }
}