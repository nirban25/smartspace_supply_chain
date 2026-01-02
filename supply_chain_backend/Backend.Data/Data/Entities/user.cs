
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data.Data.Entities;

[Table("users", Schema = "public")]
[Index(nameof(username), IsUnique = true)]
[Index(nameof(email), IsUnique = true)]
public sealed class user
{
    [Key] public Guid user_id { get; set; }
    [Required] public string username { get; set; } = null!;
    [Required] public string email { get; set; } = null!;
    [Required] public string password_hash { get; set; } = null!;
    public DateTime created_at { get; set; } = DateTime.UtcNow;
}
