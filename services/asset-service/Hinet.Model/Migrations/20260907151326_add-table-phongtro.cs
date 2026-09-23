using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Hinet.Model.Migrations
{
    /// <inheritdoc />
    public partial class addtablephongtro : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PhongTro",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TieuDe = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    MaPhong = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    TenPhong = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    LoaiPhong = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    DiaChi = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    MaTinh = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    TenTinh = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    MaHuyen = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    TenHuyen = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    MaXa = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    TenXa = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    ToaDo = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    DienTich = table.Column<double>(type: "float", nullable: true),
                    GiaChoThue = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    TienCoc = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Tang = table.Column<int>(type: "int", nullable: true),
                    SoNguoiOToiDa = table.Column<int>(type: "int", nullable: true),
                    SoPhongNgu = table.Column<int>(type: "int", nullable: true),
                    SoPhongTam = table.Column<int>(type: "int", nullable: true),
                    GiaDien = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    DonViDien = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    GiaNuoc = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    DonViNuoc = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    GiaInternet = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    DonViInternet = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    GiaDichVuChung = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    DonViDichVuChung = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    GiaGuiXe = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    GiaVeSinh = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    GioGiacTuDo = table.Column<bool>(type: "bit", nullable: true),
                    QuyDinhGioGiac = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    CoMayGiat = table.Column<bool>(type: "bit", nullable: true),
                    CoDieuHoa = table.Column<bool>(type: "bit", nullable: true),
                    CoNongLanh = table.Column<bool>(type: "bit", nullable: true),
                    CoTuLanh = table.Column<bool>(type: "bit", nullable: true),
                    CoGiuongTu = table.Column<bool>(type: "bit", nullable: true),
                    CoBanCong = table.Column<bool>(type: "bit", nullable: true),
                    CoThangMay = table.Column<bool>(type: "bit", nullable: true),
                    CoChoDeXe = table.Column<bool>(type: "bit", nullable: true),
                    CoKhoaVanTay = table.Column<bool>(type: "bit", nullable: true),
                    KhongChungChu = table.Column<bool>(type: "bit", nullable: true),
                    ChoNuoiThuCung = table.Column<bool>(type: "bit", nullable: true),
                    CoKeBep = table.Column<bool>(type: "bit", nullable: true),
                    TienNghiKhac = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    HinhAnhDaiDien = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    DanhSachHinhAnh = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    VideoLink = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    TenLienHe = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    SoDienThoaiLienHe = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    ZaloLienHe = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    MoTa = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    QuyDinh = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TrangThai = table.Column<int>(type: "int", nullable: false),
                    NgayTrong = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsNoiBat = table.Column<bool>(type: "bit", nullable: false),
                    LuotXem = table.Column<int>(type: "int", nullable: false),
                    ChuTroId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    GoiTin = table.Column<int>(type: "int", nullable: false),
                    NgayBatDau = table.Column<DateTime>(type: "datetime2", nullable: true),
                    NgayHetHan = table.Column<DateTime>(type: "datetime2", nullable: true),
                    NgayDayTin = table.Column<DateTime>(type: "datetime2", nullable: true),
                    SoLuotDayTin = table.Column<int>(type: "int", nullable: false),
                    PhiDangTin = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    TrangThaiDuyet = table.Column<int>(type: "int", nullable: false),
                    LyDoTuChoi = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    NguoiDuyet = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NgayDuyet = table.Column<DateTime>(type: "datetime2", nullable: true),
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
                    table.PrimaryKey("PK_PhongTro", x => x.Id);
                });

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "380a7c53-dfd4-4cda-beca-92d936bbd2de", "AQAAAAIAAYagAAAAEK4uvWv1b1L1pD+F8OljHcH9An4C0ZZpQ5uUuJLR0xPnrMPL/znptVVPCtO9CrTwNw==", "73902d32-3205-4635-b764-53abd2814948" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PhongTro");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "d2b9b59c-d29c-4fac-adf5-ed63249f3054", "AQAAAAIAAYagAAAAECsJ/WcLfaBs/Cku3Jv24c2+RiJjzp9HRTToROzZvLo2+EjZj/WhG7yUgoC3PW6yog==", "ba5c3194-fceb-430e-90b7-3e2911886940" });
        }
    }
}
