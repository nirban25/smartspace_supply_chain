using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data.Data.Entities;

[Table("mv_daily_receipts", Schema = "public")]
[Keyless]
public partial class mv_daily_receipt
{
    public Guid? node_id { get; set; }

    public DateOnly? receipt_date { get; set; }

    public long? arrivals { get; set; }
}
