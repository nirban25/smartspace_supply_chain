using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data.Data.Entities;

[Table("operations", Schema = "public")]
public partial class operation
{
    [Key]
    public Guid operation_id { get; set; }

    public Guid plant_node_id { get; set; }

    public string name { get; set; } = null!;

    public int max_daily_unloads { get; set; }

    [ForeignKey("plant_node_id")]
    [InverseProperty("operations")]
    public virtual node plant_node { get; set; } = null!;

    [InverseProperty("operation")]
    public virtual ICollection<unloading_event> unloading_events { get; set; } = new List<unloading_event>();
}
