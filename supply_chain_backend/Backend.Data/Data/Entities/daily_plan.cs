using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data.Data.Entities;

[Table("daily_plans", Schema = "public")]
[Index("plan_date", "version", Name = "uq_plan_version", IsUnique = true)]
public partial class daily_plan
{
    [Key]
    public Guid plan_id { get; set; }

    public DateOnly plan_date { get; set; }

    public int version { get; set; }

    public string created_by { get; set; } = null!;

    public DateTime published_at { get; set; }

    [InverseProperty("plan")]
    public virtual ICollection<plan_unload> plan_unloads { get; set; } = new List<plan_unload>();
}
