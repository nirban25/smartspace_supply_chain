using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data.Data.Entities;

[Table("system_parameters", Schema = "public")]
public partial class system_parameter
{
    [Key]
    public string param_key { get; set; } = null!;

    public string param_value { get; set; } = null!;

    public DateTime updated_at { get; set; }
}
