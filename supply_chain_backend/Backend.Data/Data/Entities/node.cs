using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data.Data.Entities;

[Table("nodes", Schema = "public")]
[Index("name", Name = "nodes_name_key", IsUnique = true)]
public partial class node
{
    [Key]
    public Guid node_id { get; set; }

    public string name { get; set; } = null!;

    public string node_type { get; set; } = null!;

    public int? design_capacity { get; set; }

    public string? tz { get; set; }

    [InverseProperty("node")]
    public virtual ICollection<alert> alerts { get; set; } = new List<alert>();

    [InverseProperty("node")]
    public virtual ICollection<inventory_snapshot> inventory_snapshots { get; set; } = new List<inventory_snapshot>();

    [ForeignKey("node_type")]
    [InverseProperty("nodes")]
    public virtual node_type node_typeNavigation { get; set; } = null!;

    [InverseProperty("plant_node")]
    public virtual ICollection<operation> operations { get; set; } = new List<operation>();

    [InverseProperty("node")]
    public virtual ICollection<plan_unload> plan_unloads { get; set; } = new List<plan_unload>();

    [InverseProperty("from_nodeNavigation")]
    public virtual ICollection<railcar_movement> railcar_movementfrom_nodeNavigations { get; set; } = new List<railcar_movement>();

    [InverseProperty("to_nodeNavigation")]
    public virtual ICollection<railcar_movement> railcar_movementto_nodeNavigations { get; set; } = new List<railcar_movement>();

    [InverseProperty("plant_node")]
    public virtual ICollection<silo> silos { get; set; } = new List<silo>();
}
