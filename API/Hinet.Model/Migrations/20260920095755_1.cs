using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Hinet.Model.Migrations
{
    /// <inheritdoc />
    public partial class _1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AuthConstractCategory");

            migrationBuilder.DropTable(
                name: "AuthenticationContract");

            migrationBuilder.DropTable(
                name: "Banner");

            migrationBuilder.DropTable(
                name: "BCBaoCao");

            migrationBuilder.DropTable(
                name: "BCBaoCaoDoiTuong");

            migrationBuilder.DropTable(
                name: "BCDotBaoCao");

            migrationBuilder.DropTable(
                name: "BieuMau");

            migrationBuilder.DropTable(
                name: "CompanyInfo");

            migrationBuilder.DropTable(
                name: "DangKyXem");

            migrationBuilder.DropTable(
                name: "DangKyXemLog");

            migrationBuilder.DropTable(
                name: "DangKyXemNenTang");

            migrationBuilder.DropTable(
                name: "DvcSyncFileMap");

            migrationBuilder.DropTable(
                name: "DvcSyncLog");

            migrationBuilder.DropTable(
                name: "EnterprisePlatformItem");

            migrationBuilder.DropTable(
                name: "HistoryChangedAuthencationContract");

            migrationBuilder.DropTable(
                name: "HolidayConfigs");

            migrationBuilder.DropTable(
                name: "HomeBlock");

            migrationBuilder.DropTable(
                name: "MauBaoCao");

            migrationBuilder.DropTable(
                name: "MauBaoCaoChiTiet");

            migrationBuilder.DropTable(
                name: "MauTraLoi");

            migrationBuilder.DropTable(
                name: "NavMenu");

            migrationBuilder.DropTable(
                name: "NenTangViPham");

            migrationBuilder.DropTable(
                name: "NguoiDuyetBaoCao");

            migrationBuilder.DropTable(
                name: "PhanAnhNenTang");

            migrationBuilder.DropTable(
                name: "PlatformManage");

            migrationBuilder.DropTable(
                name: "PlatformManageHistory");

            migrationBuilder.DropTable(
                name: "PlatformProductItem");

            migrationBuilder.DropTable(
                name: "ProcessingDeadlineConfig");

            migrationBuilder.DropTable(
                name: "RutTienKyQuy");

            migrationBuilder.DropTable(
                name: "RutTienKyQuyHistory");

            migrationBuilder.DropTable(
                name: "SignatureInfo");

            migrationBuilder.DropTable(
                name: "TinTuc");

            migrationBuilder.DropTable(
                name: "VanBanPhapLuat");

            migrationBuilder.DropTable(
                name: "VuViecNenTang");

            migrationBuilder.DropTable(
                name: "VuViecPhanAnh");

            migrationBuilder.DropTable(
                name: "VuViecTraoDoi");

            migrationBuilder.DropTable(
                name: "WeeklyConfig");



            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "17c177ce-3d1c-4161-9ce1-e12f15b509cf", "AQAAAAIAAYagAAAAECW4JVehDtOMDQT8g0y8JT9jviWBmznYzVIJfHp8qPp/g8IH10wbnC4BFuk4x1gCCQ==", "9b7e76fd-e821-47a3-936b-a20b7c9bdee7" });

           
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {


            migrationBuilder.CreateTable(
                name: "AuthConstractCategory",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AuthContractId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DeletedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    LinhVucCungCapDichVuCode = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AuthConstractCategory", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AuthenticationContract",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ChuSoHuu = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ChuyenVienXuLyId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CompanyTaxCode = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DeletedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Domain = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DomainAdd = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DvcErrorMessage = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DvcIdHoSo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DvcMaHoSo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DvcRetryCount = table.Column<int>(type: "int", nullable: false),
                    DvcSyncDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DvcSyncStatus = table.Column<int>(type: "int", nullable: false),
                    ISPId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ISPidKhac = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    LinhVucCungCapKhac = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Logo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    LyDoDeNghiCapNhat = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    NgonNgu = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Note = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    OrganizationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RepresenterCCCDOnline = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RepresenterDiaChiOnline = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RepresenterEmailOnline = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RepresenterJob = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RepresenterJobOnline = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RepresenterMobileOnline = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RepresenterNameOnline = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    StaffNumber = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    TypeOrganization = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AuthenticationContract", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Banner",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DeletedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Image = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    Link = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    Name = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Position = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Banner", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "BCBaoCao",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ChuKyBaoCao = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DeletedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    MongoFormTemplateId = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Name = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BCBaoCao", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "BCBaoCaoDoiTuong",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CompanyName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CompanyTaxcode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DeletedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IdDoiTuong = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IdDotBaoCao = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IdOrganization = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    IsSend = table.Column<bool>(type: "bit", nullable: false),
                    MongoSubmissionDataId = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TypeDoiTuong = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    TypeOrganization = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BCBaoCaoDoiTuong", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "BCDotBaoCao",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DeletedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IdBaoCao = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    IsGuiMail = table.Column<bool>(type: "bit", nullable: false),
                    IsSend = table.Column<bool>(type: "bit", nullable: false),
                    KySo = table.Column<int>(type: "int", nullable: true),
                    LoaiKyBaoCao = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    MongoFormTemplateId = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    NamBaoCao = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    ScheduledSendDate = table.Column<int>(type: "int", nullable: true),
                    TimeEnd = table.Column<DateTime>(type: "datetime2", nullable: true),
                    TimeStart = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BCDotBaoCao", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "BieuMau",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DeletedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    FileDinhKem = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    LoaiBieuMau = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    MoTa = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TenTaiLieu = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    ThuTu = table.Column<int>(type: "int", nullable: true),
                    TrangThai = table.Column<int>(type: "int", nullable: false),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BieuMau", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CompanyInfo",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Address = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ApproveDateOnline = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CityId = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CityName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DKKD = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DeletedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Detail = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EnglishName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Fax = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    IsNuocNgoai = table.Column<bool>(type: "bit", nullable: false),
                    IsVonDauTuNuocNgoai = table.Column<bool>(type: "bit", nullable: false),
                    MaTinh = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Phone = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    QuocGiaId = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepresenterCCCD = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepresenterEmail = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepresenterMobile = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepresenterName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepresenterPhone = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ShortName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false),
                    TaxCode = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TinhId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    TinhIdNew = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    TypeOrganization = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    XaId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CompanyInfo", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "DangKyXem",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DeletedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DenNgay = table.Column<DateTime>(type: "datetime2", nullable: true),
                    HoTen = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    LyDoTuChoi = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NenTangMuonXem = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NoiDung = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NoiDungKhac = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NoiDungMuonXem = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TrangThai = table.Column<int>(type: "int", nullable: false),
                    TuNgay = table.Column<DateTime>(type: "datetime2", nullable: true),
                    TypeGuiDeXuat = table.Column<int>(type: "int", nullable: false),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DangKyXem", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "DangKyXemLog",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DeletedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    HanhDong = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    ItemId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    NoiDung = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TrangThaiCu = table.Column<int>(type: "int", nullable: true),
                    TrangThaiMoi = table.Column<int>(type: "int", nullable: true),
                    Type = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DangKyXemLog", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "DangKyXemNenTang",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DangKyXemId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DeletedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DenNgay = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    NoiDungXem = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PlatformId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TuNgay = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DangKyXemNenTang", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "DvcSyncFileMap",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DeletedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    HashTepTin = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    IdGiayTo = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    PlatformManageId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenFile = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    TrangThai = table.Column<int>(type: "int", nullable: false),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DvcSyncFileMap", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "DvcSyncLog",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ActionType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DeletedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DurationMs = table.Column<long>(type: "bigint", nullable: false),
                    ErrorMessage = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IdHoSo = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    IsSuccess = table.Column<bool>(type: "bit", nullable: false),
                    MaHoSo = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    MaxRetry = table.Column<int>(type: "int", nullable: false),
                    RequestBody = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RequestUrl = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    ResponseBody = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RetryCount = table.Column<int>(type: "int", nullable: false),
                    StatusCode = table.Column<int>(type: "int", nullable: false),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DvcSyncLog", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "EnterprisePlatformItem",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DeletedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Note = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PlatformManageId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    WebsiteLink = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EnterprisePlatformItem", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "HistoryChangedAuthencationContract",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Action = table.Column<int>(type: "int", nullable: true),
                    ActionType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AuthenticationConstractId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Content = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DeletedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    FromStatus = table.Column<int>(type: "int", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    Note = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RoleThaoTac = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ToStatus = table.Column<int>(type: "int", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserName = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HistoryChangedAuthencationContract", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "HolidayConfigs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Day = table.Column<int>(type: "int", nullable: false),
                    DeletedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsAnnualYear = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    Month = table.Column<int>(type: "int", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Year = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HolidayConfigs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "HomeBlock",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Body = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    BodyType = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Code = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DataSource = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    DeletedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    Position = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Variables = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HomeBlock", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "MauBaoCao",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DeletedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    FileDinhKem = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    HanNopNgay = table.Column<int>(type: "int", nullable: false),
                    HanNopThang = table.Column<int>(type: "int", nullable: false),
                    HtmlContent = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    Keys = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    KyBaoCao = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    LoaiHinhNenTang = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    LoaiNenTang = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    MaMauBaoCao = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    PhanLoai = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    TenMauBaoCao = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    TrangThaiNenTang = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MauBaoCao", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "MauBaoCaoChiTiet",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DeletedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DisplayName = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    InputType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    IsRequired = table.Column<bool>(type: "bit", nullable: false),
                    KeyName = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    Layout = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    MauBaoCaoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MaxValue = table.Column<int>(type: "int", nullable: true),
                    MinValue = table.Column<int>(type: "int", nullable: true),
                    Options = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MauBaoCaoChiTiet", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "MauTraLoi",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Content = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DeletedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    NhomTaiLieu = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Type = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MauTraLoi", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "NavMenu",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DeletedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Href = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    Label = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    MenuType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ParentId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NavMenu", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "NenTangViPham",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DeletedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    IsHienThi = table.Column<bool>(type: "bit", nullable: false),
                    LoaiViPhamId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    NenTangLienKetId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    NgayBatDau = table.Column<DateTime>(type: "datetime2", nullable: true),
                    NgayKetThuc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    NguonId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    NoiDung = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TenNenTang = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TenUngDung = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NenTangViPham", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "NguoiDuyetBaoCao",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DeletedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IdDotBaoCao = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IdNguoiDuyet = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NguoiDuyetBaoCao", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PhanAnhNenTang",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DeletedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DiaChiNenTang = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DiaChiThuongTru = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    HoTen = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsCVTao = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    LienKetTaiUngDung = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LoaiPhanAnhId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    LyDoTuChoi = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MaTinh = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NgayCap = table.Column<DateTime>(type: "datetime2", nullable: true),
                    NgaySinh = table.Column<DateTime>(type: "datetime2", nullable: true),
                    NoiCap = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NoiDungPhanAnh = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SoCCCD = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SoDienThoai = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TenNenTang = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TenUngDung = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TrangThai = table.Column<int>(type: "int", nullable: false),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PhanAnhNenTang", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PlatformManage",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    API = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Address = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AddressDL = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AddressDaiDien = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AddressOnline = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AppIconPath = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AppManageTypeId = table.Column<int>(type: "int", nullable: true),
                    AppOS = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AvailabilityType = table.Column<int>(type: "int", nullable: true),
                    ChinhSachApDungHHDV = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ChinhSachBaoMat = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ChinhSachGia = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ChinhSachGiaoHang = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ChinhSachThanhToan = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ChuSoHuu = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ChucNangNenTang = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CompanyAddress = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CompanyEmail = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CompanyFax = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CompanyName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CompanyPhone = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CompanyTaxCode = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DataSignedUser = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DateLine = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DateLineEnterprise = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Detail = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DieuKienCungCap = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DieuKienOrHanCheCungCapHHDV = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Domain = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DomainAdd = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DomainOwner = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DvcErrorMessage = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DvcIdHoSo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DvcMaHoSo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DvcRetryCount = table.Column<int>(type: "int", nullable: false),
                    DvcSyncDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DvcSyncStatus = table.Column<int>(type: "int", nullable: false),
                    HinhThucHoTroTrucTuyen = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    HuyenId = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ISPId = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ISPIdKhac = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ImagePath = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    IsNenTangLon = table.Column<bool>(type: "bit", nullable: true),
                    IsNuocNgoai = table.Column<bool>(type: "bit", nullable: true),
                    LoaiHangHoaKhac = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Logo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MaTinh = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MauSo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NgonNgu = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    OldSysId = table.Column<long>(type: "bigint", nullable: true),
                    OrganizationCodeUyQuyen = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    OrganizationDiaChiUyQuyen = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    OrganizationEmailUyQuyen = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    OrganizationFileDangKyUyQuyen = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    OrganizationId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    OrganizationNameUyQuyen = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PassApp = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PhapNhanChiDinh_CCCD = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PhapNhanChiDinh_DiaChi = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PhapNhanChiDinh_Email = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PhapNhanChiDinh_HoTen = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PhapNhanChiDinh_SDT = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PhuongThucGiaiQuyetPhanAnh = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PhuongThucLienHe = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PhuongThucLienHeDaiDien = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PhuongThucLienHeOnline = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PlatformType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    QlHdtmdt_CCCD = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    QlHdtmdt_ChucDanh = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    QlHdtmdt_DiaChi = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    QlHdtmdt_Email = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    QlHdtmdt_HoTen = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    QlHdtmdt_SDT = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    QlKhieuNai_CCCD = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    QlKhieuNai_ChucDanh = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    QlKhieuNai_DiaChi = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    QlKhieuNai_Email = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    QlKhieuNai_HoTen = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    QlKhieuNai_SDT = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    QuocGiaId = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepresenterCCCD = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepresenterCCCDDL = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepresenterCCCDDaiDien = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepresenterCCCDDauMoiUyQuyen = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepresenterCCCDOnline = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepresenterCCCDUyQuyen = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepresenterCCCDVanHanh = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepresenterDiaChi = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepresenterDiaChiDauMoiUyQuyen = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepresenterDiaChiOnline = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepresenterDiaChiUyQuyen = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepresenterDiaChiVanHanh = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepresenterEmail = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepresenterEmailDL = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepresenterEmailDaiDien = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepresenterEmailDauMoiUyQuyen = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepresenterEmailOnline = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepresenterEmailUyQuyen = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepresenterEmailVanHanh = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepresenterJob = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepresenterJobDaiDien = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepresenterJobDaiDienNgay = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RepresenterJobDaiDienNoiCap = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepresenterJobDaiDienSo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepresenterJobDauMoiUyQuyen = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepresenterJobOnline = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepresenterJobUyQuyen = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepresenterJobVanHanh = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepresenterMobile = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepresenterMobileDL = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepresenterMobileDaiDien = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepresenterMobileDauMoiUyQuyen = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepresenterMobileOnline = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepresenterMobileUyQuyen = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepresenterMobileVanHanh = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepresenterName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepresenterNameDaiDien = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepresenterNameDauMoiUyQuyen = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepresenterNameOnline = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepresenterNameUyQuyen = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepresenterNameVanHanh = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RequestChangeDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RequestChangeName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ReviewDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ReviewId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ReviewName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Seal = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SignDateUser = table.Column<DateTime>(type: "datetime2", nullable: true),
                    SoCongVan = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    StaffNumber = table.Column<int>(type: "int", nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false),
                    SubmitDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    SubmitName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TienIchKhac = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TiepNhanKhieuNai = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TinhId = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TypeOrganization = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    URLApp = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UserApp = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    WebsiteNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    WebsiteNumberNgay = table.Column<DateTime>(type: "datetime2", nullable: true),
                    WebsiteNumberNoiCap = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    WebsiteNumberSo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    XaId = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlatformManage", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PlatformManageHistory",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Action = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DeletedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    Note = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PlatformManageId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SenderId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    SenderName = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    StatusAfter = table.Column<int>(type: "int", nullable: false),
                    StatusBefore = table.Column<int>(type: "int", nullable: false),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlatformManageHistory", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PlatformProductItem",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DeletedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    PlatformManageId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProductCategoryCode = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlatformProductItem", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ProcessingDeadlineConfig",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Code = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DeletedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IsCheckHoliday = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    IsNenTang = table.Column<bool>(type: "bit", nullable: false),
                    LimitDays = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    STT = table.Column<int>(type: "int", nullable: true),
                    StatusAfter = table.Column<int>(type: "int", nullable: true),
                    StatusBefore = table.Column<int>(type: "int", nullable: true),
                    Type = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProcessingDeadlineConfig", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "RutTienKyQuy",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AppTenUngDung = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    ChuyenVienId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ChuyenVienName = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DdplChucDanh = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    DdplDiaChi = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    DdplHoVaTen = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    DdplSdt = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    DdplSoCccdHoChieu = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    DeletedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DiaChiNgayThangNam = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    DiaChiTruSoChinh = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Dieu = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    DmlhHoVaTen = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    DmlhSdt = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    EmailTiepNhan = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    Khoan = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    LyDo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MaSoThue = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    NganHang = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    Ngay = table.Column<DateTime>(type: "datetime2", nullable: true),
                    NghiDinh = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    OrganizationId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    QuySo = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    SdtToChuc = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    SoNgayNoiCapGCN = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    SoVanBan = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false),
                    TenChuQuanToChuc = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    VanBanTaiLieuKemTheo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    WebDiaChi = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RutTienKyQuy", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "RutTienKyQuyHistory",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Action = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DeletedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    Note = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RutTienKyQuyId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SenderId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    SenderName = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    StatusAfter = table.Column<int>(type: "int", nullable: false),
                    StatusBefore = table.Column<int>(type: "int", nullable: false),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RutTienKyQuyHistory", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SignatureInfo",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CertCommonName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    CertDistinguishedName = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CertIssuer = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CertSerialNumber = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    CertValidFrom = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    CertValidTo = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    CertificateRawBase64 = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DeletedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    HoSoId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    OriginalData = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SignaturePkcs7 = table.Column<string>(type: "text", nullable: true),
                    SignatureStatus = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    SignedDateTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SignatureInfo", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TinTuc",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AnhDaiDien = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DanhMucId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DeletedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DepartmentId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    IsNoiBat = table.Column<bool>(type: "bit", nullable: false),
                    LuotXem = table.Column<int>(type: "int", nullable: false),
                    MoTaNgan = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    NgayXuatBan = table.Column<DateTime>(type: "datetime2", nullable: true),
                    NoiDung = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Slug = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Tags = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    TenDanhMuc = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    ThuTu = table.Column<int>(type: "int", nullable: true),
                    TieuDe = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    TrangThai = table.Column<int>(type: "int", nullable: false),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TinTuc", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "VanBanPhapLuat",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DeletedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DonViBanHanh = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    FileDinhKem = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    LinhVuc = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    LoaiVanBan = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    NgayBanHanh = table.Column<DateTime>(type: "datetime2", nullable: true),
                    NgayHieuLuc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    SoHieu = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    TenVanBan = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    ThuTu = table.Column<int>(type: "int", nullable: true),
                    TrangThai = table.Column<int>(type: "int", nullable: false),
                    TrichYeu = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VanBanPhapLuat", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "VuViecNenTang",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DeletedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    PhanAnhNenTangId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    VuViecPhanAnhId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VuViecNenTang", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "VuViecPhanAnh",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DeletedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DiaChi = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DienThoai = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DoanhNghiepId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    KetLuan = table.Column<int>(type: "int", nullable: false),
                    MaSoDoanhNghiep = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MaTinh = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NenTangLienKetId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    PhanAnhNenTangId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SoCongThuongId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    SoThuTu = table.Column<int>(type: "int", nullable: false),
                    TenNenTang = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TenThuongNhan = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TenUngDung = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TrangThai = table.Column<int>(type: "int", nullable: false),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VuViecPhanAnh", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "VuViecTraoDoi",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ChucVuNguoiGui = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DeletedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    LoaiNguoiGui = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NguoiGuiId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    NoiDung = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ParentId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    TenDonViNguoiGui = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TenNguoiGui = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    VuViecPhanAnhId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VuViecTraoDoi", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "WeeklyConfig",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DayOfWeek = table.Column<int>(type: "int", nullable: false),
                    DeletedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    IsWorking = table.Column<bool>(type: "bit", nullable: false),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WeeklyConfig", x => x.Id);
                });

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "43b9bbfa-c4c1-4aa1-b33b-a9ef124bfbae", "AQAAAAIAAYagAAAAEC7GGjDcdCfNjFGGA9c90RNGYVphMyCfBCA0MAE9pGJ8j+Vhku2Y6PA7zgU++BGejA==", "f1f0bc26-0845-49a3-806c-9635686d1ba9" });
        }
    }
}
