using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Backend.Data.Data;
using Backend.Data.Data.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;


namespace Backend.Api.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AuthController : ControllerBase
{
    private readonly SupplyChainDbContext _db;
    private readonly IConfiguration _config;

    public AuthController(SupplyChainDbContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }

    // Signup
    [HttpPost("signup")]
    public async Task<IActionResult> Signup([FromBody] SignupRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Username) || string.IsNullOrWhiteSpace(req.Email) || string.IsNullOrWhiteSpace(req.Password))
            return BadRequest("Username, Email, Password required.");

        var exists = await _db.Users.AnyAsync(u => u.username == req.Username || u.email == req.Email);
        if (exists) return Conflict("Username or email already exists.");

        var hashed = BCrypt.Net.BCrypt.HashPassword(req.Password);
        var u = new user
        {
            username = req.Username,
            email = req.Email,
            password_hash = hashed,
        };

        _db.Users.Add(u);
        await _db.SaveChangesAsync();

        return Ok(new { message = "User registered", userId = u.user_id });
    }

    // Login
    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest req)
    {
        var u = await _db.Users.FirstOrDefaultAsync(x => x.username == req.Username);
        if (u is null) return Unauthorized("Invalid credentials");

        var ok = BCrypt.Net.BCrypt.Verify(req.Password, u.password_hash);
        if (!ok) return Unauthorized("Invalid credentials");

        var token = GenerateJwtToken(u);
        return Ok(new { token });
    }

    private string GenerateJwtToken(user u)
    {
        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, u.username),
            new Claim(ClaimTypes.NameIdentifier, u.user_id.ToString()),
            new Claim(ClaimTypes.Email, u.email),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expiryMinutes = int.TryParse(_config["Jwt:ExpiryMinutes"], out var m) ? m : 60;

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expiryMinutes),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}

public sealed class SignupRequest
{
    public string Username { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string Password { get; set; } = null!;
}

public sealed class LoginRequest
{
    public string Username { get; set; } = null!;
    public string Password { get; set; } = null!;
}
