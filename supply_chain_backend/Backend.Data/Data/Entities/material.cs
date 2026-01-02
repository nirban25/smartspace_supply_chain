using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data.Data.Entities;

[Table("materials", Schema = "public")]
[Index("code", Name = "materials_code_key", IsUnique = true)]
public partial class material
{
    [Key]
    public Guid material_id { get; set; }

    public string code { get; set; } = null!;

    public string display_name { get; set; } = null!;

    public bool hazardous { get; set; }

    [InverseProperty("material")]
    public virtual ICollection<alert> alerts { get; set; } = new List<alert>();

    [InverseProperty("material")]
    public virtual ICollection<inventory_snapshot> inventory_snapshots { get; set; } = new List<inventory_snapshot>();

    [InverseProperty("material")]
    public virtual material_design_limit? material_design_limit { get; set; }

    [InverseProperty("material")]
    public virtual ICollection<plan_unload> plan_unloads { get; set; } = new List<plan_unload>();

    [InverseProperty("material")]
    public virtual ICollection<railcar_movement> railcar_movements { get; set; } = new List<railcar_movement>();

    [InverseProperty("material")]
    public virtual ICollection<silo_material_capacity> silo_material_capacities { get; set; } = new List<silo_material_capacity>();

    [InverseProperty("material")]
    public virtual ICollection<unloading_event> unloading_events { get; set; } = new List<unloading_event>();
}
