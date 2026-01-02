using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data.Data.Entities;

[Table("staging_attachments", Schema = "public")]
public partial class staging_attachment
{
    [Key]
    public Guid attachment_id { get; set; }

    public Guid mail_id { get; set; }

    public string filename { get; set; } = null!;

    public string? content_type { get; set; }

    public string? stored_path { get; set; }

    [ForeignKey("mail_id")]
    [InverseProperty("staging_attachments")]
    public virtual staging_email mail { get; set; } = null!;

    [InverseProperty("attachment")]
    public virtual ICollection<staging_row> staging_rows { get; set; } = new List<staging_row>();
}
