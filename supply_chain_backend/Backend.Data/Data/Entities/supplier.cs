using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data.Data.Entities;

[Table("suppliers", Schema = "public")]
[Index("name", Name = "suppliers_name_key", IsUnique = true)]
public partial class supplier
{
    [Key]
    public Guid supplier_id { get; set; }

    public string name { get; set; } = null!;
}
