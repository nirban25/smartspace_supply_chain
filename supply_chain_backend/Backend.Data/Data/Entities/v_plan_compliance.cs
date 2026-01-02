using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data.Data.Entities;

[Keyless]
public partial class v_plan_compliance
{
    public Guid? plan_id { get; set; }

    public DateOnly? plan_date { get; set; }

    public int? version { get; set; }

    public long? planned_units { get; set; }

    public long? actual_unloads { get; set; }

    public decimal? compliance_pct { get; set; }
}
