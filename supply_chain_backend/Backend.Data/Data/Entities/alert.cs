using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data.Data.Entities;

[Table("alerts", Schema = "public")]
[Index("category", "node_id", "material_id", "raised_at", Name = "uq_alert_instance", IsUnique = true)]
public partial class alert
{
    [Key]
    public Guid alert_id { get; set; }

    public string category { get; set; } = null!;

    public string severity { get; set; } = null!;

    public Guid? node_id { get; set; }

    public Guid? material_id { get; set; }

    public string message { get; set; } = null!;

    public DateTime raised_at { get; set; }

    public DateTime? cleared_at { get; set; }

    [ForeignKey("category")]
    [InverseProperty("alerts")]
    public virtual alert_category categoryNavigation { get; set; } = null!;

    [ForeignKey("material_id")]
    [InverseProperty("alerts")]
    public virtual material? material { get; set; }

    [ForeignKey("node_id")]
    [InverseProperty("alerts")]
    public virtual node? node { get; set; }

    [ForeignKey("severity")]
    [InverseProperty("alerts")]
    public virtual alert_severity severityNavigation { get; set; } = null!;
}
