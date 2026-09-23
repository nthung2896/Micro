using Hinet.Domain.Entites;
using Hinet.Model.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using VKS.Domain.Entites;

namespace Hinet.Model
{
    public class HinetContext : IdentityDbContext<AppUser, AppRole, Guid>
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public HinetContext(DbContextOptions<HinetContext> options, IHttpContextAccessor httpContextAccessor) : base(options)
        {
            this._httpContextAccessor = httpContextAccessor;
        }

        public DbSet<DM_NhomDanhMuc> DM_NhomDanhMuc { get; set; }
        public DbSet<DM_DuLieuDanhMuc> DM_DuLieuDanhMuc { get; set; }
        public DbSet<Role> Role { get; set; }
        public DbSet<UserRole> UserRole { get; set; }
        public DbSet<Module> Module { get; set; }
        public DbSet<Operation> Operation { get; set; }
        public DbSet<RoleOperation> RoleOperation { get; set; }
        public DbSet<Notification> Notification { get; set; }
        public DbSet<Audit> Audit { get; set; }
        public DbSet<Department> Department { get; set; }
        public DbSet<Tinh> Tinh { get; set; }
        public DbSet<Huyen> Huyen { get; set; }

        public DbSet<ApiPermissions> ApiPermissions { get; set; }

        public DbSet<TaiLieuDinhKem> TaiLieuDinhKem { get; set; }

        public DbSet<AppInfoItem> AppInfoItem { get; set; }


        public DbSet<KPI_BoTieuChiChung> KPI_BoTieuChiChung { get; set; }




        #region 6. Văn bản pháp luật (VanBanPhapLuat)

        public DbSet<LegalDocument> LegalDocument { get; set; }

        #endregion



        #region 8. Cấu hình email (EmailConfigs)

        public DbSet<EmailConfigs> EmailConfigs { get; set; }

        #endregion

        #region 9. Mẫu email (EmailTemplates)

        public DbSet<EmailTemplates> EmailTemplates { get; set; }

        #endregion





        #region 4. Chứng thực hợp đồng điện tử (AuthenticationContract)
        public DbSet<AppContractExtend> AppContractExtend { get; set; }
        #endregion

   

        //đăng ký xem nền tảng

        public DbSet<KPI_KetQuaThucHienNhiemVu> KPI_KetQuaThucHienNhiemVu { get; set; }
        public DbSet<KPI_PhieuDanhGiaTapThe> KPI_PhieuDanhGiaTapThe { get; set; } 
        public DbSet<AppConfiguration> AppConfiguration { get; set; }

        #region Đánh giá nhiệm vụ
        public DbSet<KPI_BoTieuChiDonVi> KPI_BoTieuChiDonVi { get; set; }

        public DbSet<KPI_NhomTieuChi> KPI_NhomTieuChi { get; set; }

        public DbSet<KPI_DotTheoDoiDanhGia> KPI_DotTheoDoiDanhGia { get; set; }

        public DbSet<KPI_VanBanDi> KPI_VanBanDi { get; set; }

        public DbSet<KPI_ThoiDiemDongBoVanBan> KPI_ThoiDiemDongBoVanBan { get; set; }

        public DbSet<KPI_DauRaNhiemVu> KPI_DauRaNhiemVu { get; set; }

        public DbSet<KPI_NhiemVu> KPI_NhiemVu { get; set; }

        public DbSet<KPI_LyLich2C> KPI_LyLich2C { get; set; }

        public DbSet<KPI_QLNgach> KPI_QLNgach { get; set; }

        public DbSet<KPI_VanBanDen> KPI_VanBanDen { get; set; }

        public DbSet<KPI_TieuChiChung> KPI_TieuChiChung { get; set; }

        public DbSet<KPI_TieuChiChung_DiemSo> KPI_TieuChiChung_DiemSo { get; set; }
        public DbSet<KPI_TieuChiChung_DiemSo_CapTren> KPI_TieuChiChung_DiemSo_CapTren { get; set; }

        public DbSet<KPI_CauHinhCongThucNhiemVu> KPI_CauHinhCongThucNhiemVu { get; set; }

        public DbSet<KPI_PhieuDanhGia> KPI_PhieuDanhGia { get; set; }

        public DbSet<KPI_CauHinhDiemTheoHeSoLanhDao> KPI_CauHinhDiemTheoHeSoLanhDao { get; set; }

        public DbSet<KPI_QuaTrinhXuLyPhieuDanhGia> KPI_QuaTrinhXuLyPhieuDanhGia { get; set; }

        public DbSet<KPI_DotDanhGia_DonVi> KPI_DotDanhGia_DonVi { get; set; }

        public DbSet<KPI_DauRaNhiemVu_ChiTietDanhGia> KPI_DauRaNhiemVu_ChiTietDanhGia { get; set; }


        #endregion




        #region Nhà trọ
        public DbSet<Xa> Xa { get; set; }
        public DbSet<PhongTro> PhongTro { get; set; }
        public DbSet<Room_BangGia> Room_BangGia { get; set; }
        public DbSet<Room_ViTien> Room_ViTien { get; set; }
        public DbSet<Room_GiaoDichNapTien> Room_GiaoDichNapTien { get; set; }
        public DbSet<Room_LichSuThanhToan> Room_LichSuThanhToan { get; set; }
        public DbSet<Room_CauHinhKhuyenMaiNap> Room_CauHinhKhuyenMaiNap { get; set; }
        public DbSet<Room_ThongTinNganHang> Room_ThongTinNganHang { get; set; }
        #endregion


        protected override void OnModelCreating(ModelBuilder builder)
        {
            builder.Entity<AppUser>().HasData(
                new AppUser
                {
                    Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
                    UserName = "admin",
                    Type = "Admin",
                    NormalizedUserName = "ADMIN",
                    Email = "admin",
                    NormalizedEmail = "ADMIN",
                    EmailConfirmed = true,
                    // ⚠️ Password mặc định "12345678" CHỈ dùng cho dev/test.
                    // Production: ĐỔI password ngay sau khi seed, hoặc sửa giá trị ở đây trước khi chạy InitialCreate.
                    PasswordHash = new PasswordHasher<AppUser>().HashPassword(null, "12345678"),
                    SecurityStamp = Guid.NewGuid().ToString()
                }
            );

            base.OnModelCreating(builder);

            builder.Entity<KPI_BoTieuChiChung>().ToTable(table => table.HasCheckConstraint(
                "CK_KPI_BoTieuChiChung_Type",
                "[Type] IS NULL OR [Type] IN ('CaNhan', 'TapThe')"));
        }

        public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            var entries = ChangeTracker.Entries<AuditableEntity>();

            Guid.TryParse(_httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier), out var userId);
            var userName = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.Name);
            foreach (var entry in entries)
            {
                if (entry.State == EntityState.Added)
                {
                    entry.Entity.CreatedDate = DateTime.Now;
                    entry.Entity.CreatedId = userId;
                    entry.Entity.CreatedBy = userName;
                }
                else if (entry.State == EntityState.Modified)
                {
                    entry.Entity.UpdatedDate = DateTime.Now;
                    entry.Entity.UpdatedId = userId;
                    entry.Entity.UpdatedBy = userName;
                }
                else if (entry.State == EntityState.Deleted)
                {
                    entry.State = EntityState.Modified;
                    entry.Entity.IsDeleted = true;
                    entry.Entity.DeletedDate = DateTime.Now;
                    entry.Entity.DeletedId = userId;
                }
            }

            return await base.SaveChangesAsync(cancellationToken);
        }
    }
}
