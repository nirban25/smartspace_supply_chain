using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data.Data.Entities;

[Table("node_types", Schema = "public")]
public partial class node_type
{
    [Key]
    [Column("node_type")]
    public string node_type1 { get; set; } = null!;

    public string description { get; set; } = null!;

    [InverseProperty("node_typeNavigation")]
    public virtual ICollection<node> nodes { get; set; } = new List<node>();
}
