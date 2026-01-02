using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data.Data.Entities;

[Keyless]
public partial class mv_current_inventory
{
    public Guid? node_id { get; set; }

    public Guid? material_id { get; set; }

    public int? quantity { get; set; }

    public DateTime? as_of { get; set; }
}
