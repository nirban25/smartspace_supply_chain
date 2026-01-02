using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data.Data.Entities;

[PrimaryKey("silo_id", "material_id")]
[Table("silo_material_capacity")]
public partial class silo_material_capacity
{
    [Key]
    public Guid silo_id { get; set; }

    [Key]
    public Guid material_id { get; set; }

    public int max_units { get; set; }

    [ForeignKey("material_id")]
    [InverseProperty("silo_material_capacities")]
    public virtual material material { get; set; } = null!;

    [ForeignKey("silo_id")]
    [InverseProperty("silo_material_capacities")]
    public virtual silo silo { get; set; } = null!;
}
