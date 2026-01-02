using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data.Data.Entities;

[Table("railcars", Schema = "public")]
public partial class railcar
{
    [Key]
    public string railcar_id { get; set; } = null!;

    public string? check_digit { get; set; }

    [InverseProperty("railcar")]
    public virtual ICollection<empty_car_release> empty_car_releases { get; set; } = new List<empty_car_release>();

    [InverseProperty("railcar")]
    public virtual ICollection<railcar_movement> railcar_movements { get; set; } = new List<railcar_movement>();

    [InverseProperty("railcar")]
    public virtual ICollection<unloading_event> unloading_events { get; set; } = new List<unloading_event>();
}
