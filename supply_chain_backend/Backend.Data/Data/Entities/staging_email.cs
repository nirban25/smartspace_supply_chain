using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data.Data.Entities;

[Table("staging_emails", Schema = "public")]
public partial class staging_email
{
    [Key]
    public Guid mail_id { get; set; }

    public string subject { get; set; } = null!;

    public DateTime received_at { get; set; }

    public string? sender { get; set; }

    public string? source_label { get; set; }

    [InverseProperty("mail")]
    public virtual ICollection<staging_attachment> staging_attachments { get; set; } = new List<staging_attachment>();
}
