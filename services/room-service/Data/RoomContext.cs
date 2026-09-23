using Microsoft.EntityFrameworkCore;
using RoomService.Entities;

namespace RoomService.Data
{
    public class RoomContext : DbContext
    {
        public RoomContext(DbContextOptions<RoomContext> options) : base(options)
        {
        }

        public DbSet<PhongTro> PhongTros => Set<PhongTro>();
        public DbSet<Room_BangGia> Room_BangGias => Set<Room_BangGia>();
        public DbSet<Room_CauHinhKhuyenMaiNap> Room_CauHinhKhuyenMaiNaps => Set<Room_CauHinhKhuyenMaiNap>();
        public DbSet<Room_ViTien> Room_ViTiens => Set<Room_ViTien>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Cấu hình chuẩn cho Decimal precision & scale để không bao giờ bị warning
            modelBuilder.Entity<Room_BangGia>()
                .Property(x => x.GiaTin)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Room_CauHinhKhuyenMaiNap>()
                .Property(x => x.PhanTramKhuyenMai)
                .HasPrecision(5, 2);
        }
    }
}
