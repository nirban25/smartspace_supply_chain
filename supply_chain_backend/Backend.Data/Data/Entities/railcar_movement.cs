using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data.Data.Entities;

[Table("railcar_movements", Schema = "public")]
[Index("railcar_id", "to_node", "event_time", Name = "uq_movement", IsUnique = true)]
public partial class railcar_movement
{
    [Key]
    public Guid movement_id { get; set; }

    public string railcar_id { get; set; } = null!;

    public Guid? from_node { get; set; }

    public Guid to_node { get; set; }

    public Guid material_id { get; set; }

    public DateTime event_time { get; set; }

    public decimal? quantity { get; set; }

    public string? source_ref { get; set; }

    [ForeignKey("from_node")]
    [InverseProperty("railcar_movementfrom_nodeNavigations")]
    public virtual node? from_nodeNavigation { get; set; }

    [ForeignKey("material_id")]
    [InverseProperty("railcar_movements")]
    public virtual material material { get; set; } = null!;

    [ForeignKey("railcar_id")]
    [InverseProperty("railcar_movements")]
    public virtual railcar railcar { get; set; } = null!;

    [ForeignKey("to_node")]
    [InverseProperty("railcar_movementto_nodeNavigations")]
    public virtual node to_nodeNavigation { get; set; } = null!;
}
