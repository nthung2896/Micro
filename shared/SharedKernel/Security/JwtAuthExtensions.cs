using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;

namespace SharedKernel.Security
{
    public class JwtOptions
    {
        public const string SectionName = "AuthSetting";

        public string Key { get; set; } = "Hinet_AdminBase_jwt_4f9c7b21e5a8d63c0f2b8e1d4a7f9c3b6e0d8a5c2f7b4e1d6a9c3f0b7e4d1a8f5";
        public string Issuer { get; set; } = "admin-base-api";
        public string Audience { get; set; } = "admin-base-client";
        public int SecondsExpires { get; set; } = 360000;
        public int DaysRefreshTokenExpires { get; set; } = 7;
    }

    public static class JwtAuthExtensions
    {
        public static IServiceCollection AddSharedJwtAuth(this IServiceCollection services, IConfiguration configuration)
        {
            var jwtOptions = new JwtOptions();
            var section = configuration.GetSection(JwtOptions.SectionName);
            if (section.Exists())
            {
                section.Bind(jwtOptions);
            }

            services.AddSingleton(jwtOptions);

            var keyBytes = Encoding.UTF8.GetBytes(jwtOptions.Key);

            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.RequireHttpsMetadata = false;
                options.SaveToken = true;
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuer = jwtOptions.Issuer,
                    ValidateAudience = true,
                    ValidAudience = jwtOptions.Audience,
                    ValidateLifetime = true,
                    RequireExpirationTime = true,
                    ClockSkew = TimeSpan.FromSeconds(30),
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(keyBytes)
                };
            });

            services.AddAuthorization();

            return services;
        }

        public static string GenerateToken(JwtOptions options, Guid userId, string username, string? fullName, IEnumerable<string>? roles = null)
        {
            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, userId.ToString()),
                new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
                new Claim(ClaimTypes.Name, username),
                new Claim("username", username),
                new Claim("fullName", fullName ?? username),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            if (roles != null)
            {
                foreach (var role in roles)
                {
                    claims.Add(new Claim(ClaimTypes.Role, role));
                    claims.Add(new Claim("role", role));
                }
            }

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(options.Key));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var expires = DateTime.UtcNow.AddSeconds(options.SecondsExpires);

            var token = new JwtSecurityToken(
                issuer: options.Issuer,
                audience: options.Audience,
                claims: claims,
                expires: expires,
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
