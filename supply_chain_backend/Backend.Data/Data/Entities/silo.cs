using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data.Data.Entities;

[Table("silos", Schema = "public")]
[Index("plant_node_id", "name", Name = "silos_plant_node_id_name_key", IsUnique = true)]
public partial class silo
{
    [Key]
    public Guid silo_id { get; set; }

    public Guid plant_node_id { get; set; }

    public string name { get; set; } = null!;

    public int max_units { get; set; }

    [ForeignKey("plant_node_id")]
    [InverseProperty("silos")]
    public virtual node plant_node { get; set; } = null!;

    [InverseProperty("silo")]
    public virtual ICollection<silo_material_capacity> silo_material_capacities { get; set; } = new List<silo_material_capacity>();
}
