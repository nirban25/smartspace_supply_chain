using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data.Data.Entities;

[Keyless]
public partial class mv_release_vs_unload
{
    public DateOnly? business_date { get; set; }

    public long? unloaded_cnt { get; set; }

    public long? released_cnt { get; set; }

    public long? delta { get; set; }
}
