using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data.Data.Entities;

[Table("plan_unloads", Schema = "public")]
[PrimaryKey("plan_id", "node_id", "material_id")]
public partial class plan_unload
{
    [Key]
    public Guid plan_id { get; set; }

    [Key]
    public Guid node_id { get; set; }

    [Key]
    public Guid material_id { get; set; }

    public int target_units { get; set; }

    [ForeignKey("material_id")]
    [InverseProperty("plan_unloads")]
    public virtual material material { get; set; } = null!;

    [ForeignKey("node_id")]
    [InverseProperty("plan_unloads")]
    public virtual node node { get; set; } = null!;

    [ForeignKey("plan_id")]
    [InverseProperty("plan_unloads")]
    public virtual daily_plan plan { get; set; } = null!;
}
