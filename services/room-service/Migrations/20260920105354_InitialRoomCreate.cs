using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace roomservice.Migrations
{
    /// <inheritdoc />
    public partial class InitialRoomCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Room_BangGia",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ThuocTinh = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    LoaiTin = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    MaMau = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    GiaTin = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    IsTuDongDuyet = table.Column<bool>(type: "bit", nullable: true),
                    IsDuyTriThem10Ngay = table.Column<bool>(type: "bit", nullable: true),
                    IsHienThiNutGoi = table.Column<bool>(type: "bit", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Room_BangGia", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Room_CauHinhKhuyenMaiNap",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenChuongTrinh = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    LoaiKhuyenMai = table.Column<int>(type: "int", nullable: false),
                    MucNapToiThieu = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    MucNapToiDa = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    PhanTramKhuyenMai = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false),
                    TienThuongCoDinh = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    NgayBatDau = table.Column<DateTime>(type: "datetime2", nullable: true),
                    NgayKetThuc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    ThuTu = table.Column<int>(type: "int", nullable: false),
                    GhiChu = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Room_CauHinhKhuyenMaiNap", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Room_PhongTro",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TieuDe = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    MoTa = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    GiaThue = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    DienTich = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    DiaChiChiTiet = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TinhId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    HuyenId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    XaId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TrangThai = table.Column<int>(type: "int", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Room_PhongTro", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Room_ViTien",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SoDuChinh = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    SoDuKhuyenMai = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TongNap = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TongChi = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    HangThanhVien = table.Column<int>(type: "int", nullable: false),
                    TrangThai = table.Column<int>(type: "int", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Room_ViTien", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Room_BangGia");

            migrationBuilder.DropTable(
                name: "Room_CauHinhKhuyenMaiNap");

            migrationBuilder.DropTable(
                name: "Room_PhongTro");

            migrationBuilder.DropTable(
                name: "Room_ViTien");
        }
    }
}
