using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data.Data.Entities;

[Table("empty_car_releases", Schema = "public")]
public partial class empty_car_release
{
    [Key]
    public Guid release_id { get; set; }

    public string railcar_id { get; set; } = null!;

    public DateTime released_time { get; set; }

    public string? portal_txn_id { get; set; }

    public string? source_ref { get; set; }

    [ForeignKey("railcar_id")]
    [InverseProperty("empty_car_releases")]
    public virtual railcar railcar { get; set; } = null!;
}
