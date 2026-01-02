using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data.Data.Entities;

[Table("material_design_limits", Schema = "public")]
public partial class material_design_limit
{
    [Key]
    public Guid material_id { get; set; }

    public int target_units { get; set; }

    public int safety_stock { get; set; }

    [ForeignKey("material_id")]
    [InverseProperty("material_design_limit")]
    public virtual material material { get; set; } = null!;
}
