using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data.Data.Entities;

[Table("alert_categories", Schema = "public")]
public partial class alert_category
{
    [Key]
    public string category { get; set; } = null!;

    [InverseProperty("categoryNavigation")]
    public virtual ICollection<alert> alerts { get; set; } = new List<alert>();
}
