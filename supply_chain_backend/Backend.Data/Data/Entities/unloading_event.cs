using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data.Data.Entities;

[Table("unloading_events", Schema = "public")]
public partial class unloading_event
{
    [Key]
    public Guid unload_id { get; set; }

    public Guid operation_id { get; set; }

    public string railcar_id { get; set; } = null!;

    public Guid material_id { get; set; }

    public DateTime unloaded_at { get; set; }

    public decimal? quantity { get; set; }

    public string? source_ref { get; set; }

    [ForeignKey("material_id")]
    [InverseProperty("unloading_events")]
    public virtual material material { get; set; } = null!;

    [ForeignKey("operation_id")]
    [InverseProperty("unloading_events")]
    public virtual operation operation { get; set; } = null!;

    [ForeignKey("railcar_id")]
    [InverseProperty("unloading_events")]
    public virtual railcar railcar { get; set; } = null!;
}
