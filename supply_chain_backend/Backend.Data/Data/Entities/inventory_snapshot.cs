using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data.Data.Entities;

[Table("inventory_snapshots", Schema = "public")]
[Index("node_id", "material_id", "as_of", Name = "uq_inventory", IsUnique = true)]
public partial class inventory_snapshot
{
    [Key]
    public Guid snapshot_id { get; set; }

    public Guid node_id { get; set; }

    public Guid material_id { get; set; }

    public int quantity { get; set; }

    public DateTime as_of { get; set; }

    [ForeignKey("material_id")]
    [InverseProperty("inventory_snapshots")]
    public virtual material material { get; set; } = null!;

    [ForeignKey("node_id")]
    [InverseProperty("inventory_snapshots")]
    public virtual node node { get; set; } = null!;
}
