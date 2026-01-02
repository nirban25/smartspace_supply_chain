using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data.Data.Entities;

[Table("alert_severities", Schema = "public")]
public partial class alert_severity
{
    [Key]
    public string severity { get; set; } = null!;

    [InverseProperty("severityNavigation")]
    public virtual ICollection<alert> alerts { get; set; } = new List<alert>();
}
