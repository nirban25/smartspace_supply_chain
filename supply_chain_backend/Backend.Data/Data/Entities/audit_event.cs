using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data.Data.Entities;

[Table("audit_events", Schema = "public")]
public partial class audit_event
{
    [Key]
    public Guid audit_id { get; set; }

    public string actor { get; set; } = null!;

    public string action { get; set; } = null!;

    public string entity_type { get; set; } = null!;

    public Guid? entity_id { get; set; }

    public DateTime occurred_at { get; set; }

    [Column(TypeName = "jsonb")]
    public string? details { get; set; }
}
