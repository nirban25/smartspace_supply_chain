using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data.Data.Entities;

[Table("staging_rows", Schema = "public")]
public partial class staging_row
{
    [Key]
    public Guid row_id { get; set; }

    public Guid attachment_id { get; set; }

    public string? key { get; set; }

    public string? value { get; set; }

    public DateTime parsed_at { get; set; }

    [ForeignKey("attachment_id")]
    [InverseProperty("staging_rows")]
    public virtual staging_attachment attachment { get; set; } = null!;
}
