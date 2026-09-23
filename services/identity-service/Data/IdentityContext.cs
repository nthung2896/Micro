using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using IdentityService.Entities;

namespace IdentityService.Data
{
    public class IdentityContext : IdentityDbContext<AppUser, AppRole, Guid>
    {
        public IdentityContext(DbContextOptions<IdentityContext> options) : base(options)
        {
        }

        public DbSet<Role> Role { get; set; }
        public DbSet<UserRole> UserRole { get; set; }
        public DbSet<Module> Module { get; set; }
        public DbSet<Operation> Operation { get; set; }
        public DbSet<RoleOperation> RoleOperation { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // Sử dụng chuẩn tên bảng đồng bộ với Hinet
            builder.Entity<AppUser>(b => b.ToTable("AspNetUsers"));
            builder.Entity<AppRole>(b => b.ToTable("AspNetRoles"));
            builder.Entity<Role>(b => b.ToTable("Role"));
            builder.Entity<UserRole>(b => b.ToTable("UserRole"));
            builder.Entity<Module>(b => b.ToTable("Module"));
            builder.Entity<Operation>(b => b.ToTable("Operation"));
            builder.Entity<RoleOperation>(b => b.ToTable("RoleOperation"));
        }
    }
}
