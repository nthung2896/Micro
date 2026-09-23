using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Hinet.Model.Migrations
{
    /// <inheritdoc />
    public partial class InitialSqlServerCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ApiPermissions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    RoleId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Path = table.Column<string>(type: "nvarchar(max)", nullable: true),
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
                    table.PrimaryKey("PK_ApiPermissions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AppConfiguration",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenApp = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TenDoanhNghiep = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DiaChi = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SoDienThoai = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LogoLink = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LoginBackgroundLink = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LoginModalImage = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PrimaryColor = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    isActive = table.Column<bool>(type: "bit", nullable: true),
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
                    table.PrimaryKey("PK_AppConfiguration", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AppContractExtend",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AppName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ContractId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    OsCode = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AppLink = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Logo = table.Column<string>(type: "nvarchar(max)", nullable: false),
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
                    table.PrimaryKey("PK_AppContractExtend", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AppInfoItem",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PlatformManageId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AppName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    OsCode = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AppLink = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AppLogo = table.Column<string>(type: "nvarchar(max)", nullable: true),
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
                    table.PrimaryKey("PK_AppInfoItem", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AspNetRoles",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    NormalizedName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    ConcurrencyStamp = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetRoles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Audit",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SessionID = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AuditID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IPAddress = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UserName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    URLAccessed = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TimeAccessed = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Note = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Type = table.Column<int>(type: "int", nullable: false),
                    Data = table.Column<string>(type: "nvarchar(max)", nullable: false),
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
                    table.PrimaryKey("PK_Audit", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AuthConstractCategory",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AuthContractId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LinhVucCungCapDichVuCode = table.Column<string>(type: "nvarchar(max)", nullable: false),
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
                    table.PrimaryKey("PK_AuthConstractCategory", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AuthenticationContract",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RepresenterJob = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CompanyTaxCode = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    OrganizationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TypeOrganization = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RepresenterNameOnline = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RepresenterJobOnline = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RepresenterCCCDOnline = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RepresenterDiaChiOnline = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RepresenterMobileOnline = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RepresenterEmailOnline = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Domain = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DomainAdd = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ChuSoHuu = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Logo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ISPId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ISPidKhac = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LinhVucCungCapKhac = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NgonNgu = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    StaffNumber = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    LyDoDeNghiCapNhat = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Note = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ChuyenVienXuLyId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DvcMaHoSo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DvcIdHoSo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DvcSyncStatus = table.Column<int>(type: "int", nullable: false),
                    DvcSyncDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DvcRetryCount = table.Column<int>(type: "int", nullable: false),
                    DvcErrorMessage = table.Column<string>(type: "nvarchar(max)", nullable: true),
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
                    table.PrimaryKey("PK_AuthenticationContract", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Banner",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Image = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    Link = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    Position = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
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
                    table.PrimaryKey("PK_Banner", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "BCBaoCao",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    MongoFormTemplateId = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    ChuKyBaoCao = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
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
                    table.PrimaryKey("PK_BCBaoCao", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "BCBaoCaoDoiTuong",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IdDotBaoCao = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IdDoiTuong = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TypeDoiTuong = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    TypeOrganization = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IdOrganization = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsSend = table.Column<bool>(type: "bit", nullable: false),
                    CompanyName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CompanyTaxcode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    MongoSubmissionDataId = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
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
                    table.PrimaryKey("PK_BCBaoCaoDoiTuong", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "BCDotBaoCao",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IdBaoCao = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TimeStart = table.Column<DateTime>(type: "datetime2", nullable: true),
                    TimeEnd = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsSend = table.Column<bool>(type: "bit", nullable: false),
                    MongoFormTemplateId = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    LoaiKyBaoCao = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    KySo = table.Column<int>(type: "int", nullable: true),
                    NamBaoCao = table.Column<int>(type: "int", nullable: false),
                    IsGuiMail = table.Column<bool>(type: "bit", nullable: false),
                    ScheduledSendDate = table.Column<int>(type: "int", nullable: true),
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
                    table.PrimaryKey("PK_BCDotBaoCao", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "BieuMau",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenTaiLieu = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    MoTa = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LoaiBieuMau = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    TrangThai = table.Column<int>(type: "int", nullable: false),
                    ThuTu = table.Column<int>(type: "int", nullable: true),
                    FileDinhKem = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
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
                    table.PrimaryKey("PK_BieuMau", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CompanyInfo",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EnglishName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ShortName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TaxCode = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Address = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CityId = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CityName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Phone = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Fax = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepresenterName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepresenterMobile = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepresenterPhone = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepresenterEmail = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepresenterCCCD = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Detail = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ApproveDateOnline = table.Column<DateTime>(type: "datetime2", nullable: true),
                    TinhId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    TinhIdNew = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    MaTinh = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    XaId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    QuocGiaId = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TypeOrganization = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsNuocNgoai = table.Column<bool>(type: "bit", nullable: false),
                    IsVonDauTuNuocNgoai = table.Column<bool>(type: "bit", nullable: false),
                    DKKD = table.Column<string>(type: "nvarchar(max)", nullable: true),
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
                    table.PrimaryKey("PK_CompanyInfo", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "DangKyXem",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    HoTen = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NoiDung = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NoiDungKhac = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TrangThai = table.Column<int>(type: "int", nullable: false),
                    LyDoTuChoi = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NenTangMuonXem = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NoiDungMuonXem = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TypeGuiDeXuat = table.Column<int>(type: "int", nullable: false),
                    TuNgay = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DenNgay = table.Column<DateTime>(type: "datetime2", nullable: true),
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
                    table.PrimaryKey("PK_DangKyXem", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "DangKyXemLog",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ItemId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    HanhDong = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NoiDung = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TrangThaiCu = table.Column<int>(type: "int", nullable: true),
                    TrangThaiMoi = table.Column<int>(type: "int", nullable: true),
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
                    table.PrimaryKey("PK_DangKyXemLog", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "DangKyXemNenTang",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DangKyXemId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PlatformId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    NoiDungXem = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TuNgay = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DenNgay = table.Column<DateTime>(type: "datetime2", nullable: true),
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
                    table.PrimaryKey("PK_DangKyXemNenTang", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Department",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    ShortName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Code = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    ParentId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Priority = table.Column<long>(type: "bigint", nullable: true),
                    Level = table.Column<int>(type: "int", nullable: false),
                    Loai = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    DiaDanh = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MaTinh = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Address = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Hotline = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: true),
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
                    table.PrimaryKey("PK_Department", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "DM_DuLieuDanhMuc",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    GroupId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Name = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    Code = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    Note = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Priority = table.Column<int>(type: "int", nullable: true),
                    DonViId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DuongDanFile = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NoiDung = table.Column<string>(type: "nvarchar(max)", nullable: true),
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
                    table.PrimaryKey("PK_DM_DuLieuDanhMuc", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "DM_NhomDanhMuc",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    GroupName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    GroupCode = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
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
                    table.PrimaryKey("PK_DM_NhomDanhMuc", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "DvcSyncFileMap",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PlatformManageId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IdGiayTo = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    HashTepTin = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    TenFile = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
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
                    table.PrimaryKey("PK_DvcSyncFileMap", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "DvcSyncLog",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ActionType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    RequestUrl = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    RequestBody = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ResponseBody = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    StatusCode = table.Column<int>(type: "int", nullable: false),
                    IsSuccess = table.Column<bool>(type: "bit", nullable: false),
                    ErrorMessage = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DurationMs = table.Column<long>(type: "bigint", nullable: false),
                    RetryCount = table.Column<int>(type: "int", nullable: false),
                    MaxRetry = table.Column<int>(type: "int", nullable: false),
                    MaHoSo = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IdHoSo = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
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
                    table.PrimaryKey("PK_DvcSyncLog", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "EmailConfigs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    From = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Host = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Alias = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Port = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UserName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Password = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EnableSsl = table.Column<bool>(type: "bit", nullable: true),
                    AllowSendMail = table.Column<bool>(type: "bit", nullable: true),
                    DailyLimit = table.Column<int>(type: "int", nullable: true),
                    SentToday = table.Column<int>(type: "int", nullable: true),
                    QuotaResetDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastUsedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ConsecutiveFailures = table.Column<int>(type: "int", nullable: true),
                    LastFailedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastFailReason = table.Column<string>(type: "nvarchar(max)", nullable: true),
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
                    table.PrimaryKey("PK_EmailConfigs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "EmailTemplates",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Code = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Subject = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Body = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    BodyType = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Variables = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
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
                    table.PrimaryKey("PK_EmailTemplates", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "EnterprisePlatformItem",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PlatformManageId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    WebsiteLink = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Note = table.Column<string>(type: "nvarchar(max)", nullable: true),
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
                    table.PrimaryKey("PK_EnterprisePlatformItem", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "HistoryChangedAuthencationContract",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ActionType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UserName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Content = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AuthenticationConstractId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FromStatus = table.Column<int>(type: "int", nullable: true),
                    ToStatus = table.Column<int>(type: "int", nullable: true),
                    RoleThaoTac = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Note = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Action = table.Column<int>(type: "int", nullable: true),
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
                    table.PrimaryKey("PK_HistoryChangedAuthencationContract", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "HolidayConfigs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Day = table.Column<int>(type: "int", nullable: false),
                    Month = table.Column<int>(type: "int", nullable: false),
                    Year = table.Column<int>(type: "int", nullable: true),
                    IsAnnualYear = table.Column<bool>(type: "bit", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
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
                    table.PrimaryKey("PK_HolidayConfigs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "HomeBlock",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Code = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Title = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Body = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    BodyType = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Variables = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Position = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    DataSource = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
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
                    table.PrimaryKey("PK_HomeBlock", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Huyen",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenHuyen = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Ma = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    MaTinh = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    LoaiHuyen = table.Column<int>(type: "int", nullable: false),
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
                    table.PrimaryKey("PK_Huyen", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "KPI_BoTieuChiChung",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SoQuyetDinh = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TenBoTieuChiDonVi = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Type = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IdDonVi = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IdDot = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    NgayQuyetDinh = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ApDungTuNgay = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ApDungToiNgay = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: true),
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
                    table.PrimaryKey("PK_KPI_BoTieuChiChung", x => x.Id);
                    table.CheckConstraint("CK_KPI_BoTieuChiChung_Type", "[Type] IS NULL OR [Type] IN ('CaNhan', 'TapThe')");
                });

            migrationBuilder.CreateTable(
                name: "KPI_BoTieuChiDonVi",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SoQuyetDinh = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TenBoTieuChiDonVi = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IdDonVi = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IdDot = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    NgayQuyetDinh = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ApDungTuNgay = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ApDungToiNgay = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Is_locked = table.Column<bool>(type: "bit", nullable: false),
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
                    table.PrimaryKey("PK_KPI_BoTieuChiDonVi", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "KPI_CauHinhCongThucNhiemVu",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IdDonVi = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IdDotDanhGia = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    TargetTable = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TargetColumn = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    fomula = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Type = table.Column<string>(type: "nvarchar(max)", nullable: true),
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
                    table.PrimaryKey("PK_KPI_CauHinhCongThucNhiemVu", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "KPI_CauHinhDiemTheoHeSoLanhDao",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ChucVu = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    HeSo = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    IdBoTieuChi = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
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
                    table.PrimaryKey("PK_KPI_CauHinhDiemTheoHeSoLanhDao", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "KPI_DauRaNhiemVu",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IdNhiemVu = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IdThoiDiemDongBoVanBan = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IdDotDanhGia = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    TypeVanBan = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TenSanPhamDauRa = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TieuChiId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DiemTheoBoTieuChi = table.Column<double>(type: "float", nullable: true),
                    ChamDiemSoLuong_HoanThanh = table.Column<double>(type: "float", nullable: true),
                    ChamDiemSoLuong_KhongHoanThanh = table.Column<double>(type: "float", nullable: true),
                    ChamDiemSoLuong_Diem = table.Column<double>(type: "float", nullable: true),
                    ChamDiemChatLuong_KhongDat = table.Column<double>(type: "float", nullable: true),
                    ChamDiemChatLuong_SoDiemConLai = table.Column<double>(type: "float", nullable: true),
                    ChamDiemChatLuong_Diem = table.Column<double>(type: "float", nullable: true),
                    ChamDiemTienDo_KhongDat = table.Column<double>(type: "float", nullable: true),
                    ChamDiemTienDo_SoDiemConLai = table.Column<double>(type: "float", nullable: true),
                    ChamDiemTienDo_Diem = table.Column<double>(type: "float", nullable: true),
                    GhiChuGiaTrinh = table.Column<string>(type: "nvarchar(max)", nullable: true),
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
                    table.PrimaryKey("PK_KPI_DauRaNhiemVu", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "KPI_DauRaNhiemVu_ChiTietDanhGia",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IdDauRaNhiemVu = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IdPhieuDanhGia = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    VaiTroDanhGia = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NguoiDanhGiaId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ChamDiemSoLuong_HoanThanh = table.Column<double>(type: "float", nullable: true),
                    ChamDiemSoLuong_KhongHoanThanh = table.Column<double>(type: "float", nullable: true),
                    ChamDiemSoLuong_Diem = table.Column<double>(type: "float", nullable: true),
                    ChamDiemChatLuong_KhongDat = table.Column<double>(type: "float", nullable: true),
                    ChamDiemChatLuong_SoDiemConLai = table.Column<double>(type: "float", nullable: true),
                    ChamDiemChatLuong_Diem = table.Column<double>(type: "float", nullable: true),
                    ChamDiemTienDo_KhongDat = table.Column<double>(type: "float", nullable: true),
                    ChamDiemTienDo_SoDiemConLai = table.Column<double>(type: "float", nullable: true),
                    ChamDiemTienDo_Diem = table.Column<double>(type: "float", nullable: true),
                    GhiChu = table.Column<string>(type: "nvarchar(max)", nullable: true),
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
                    table.PrimaryKey("PK_KPI_DauRaNhiemVu_ChiTietDanhGia", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "KPI_DotDanhGia_DonVi",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IdDotDanhGia = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IdDonVi = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IdBoChiSoNhiemVu = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IdBoTieuChiChung = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
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
                    table.PrimaryKey("PK_KPI_DotDanhGia_DonVi", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "KPI_DotTheoDoiDanhGia",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenDotTheoDoiDanhGia = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Thang = table.Column<int>(type: "int", nullable: true),
                    Quy = table.Column<int>(type: "int", nullable: true),
                    Nam = table.Column<int>(type: "int", nullable: true),
                    ThoiGianBatDau = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ThoiGianKetThuc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Type = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TrangThai = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DefaultTieuChiChung = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DefaultTieuChiDonVi = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
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
                    table.PrimaryKey("PK_KPI_DotTheoDoiDanhGia", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "KPI_KetQuaThucHienNhiemVu",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IdPhieuDanhGia = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IdLyLich = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IdDotDanhGia = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DiemBoTieuChi = table.Column<double>(type: "float", nullable: true),
                    DiemHeSoLanhDao = table.Column<double>(type: "float", nullable: true),
                    DaChotHeSoLanhDao = table.Column<bool>(type: "bit", nullable: false),
                    CoApDungHeSoLanhDao = table.Column<bool>(type: "bit", nullable: false),
                    HeSoLanhDaoApDung = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    ChucVuLanhDaoApDung = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    KhoiLuongDiem = table.Column<double>(type: "float", nullable: true),
                    KhoiLuongPhanTram = table.Column<double>(type: "float", nullable: true),
                    ChatLuongDiem = table.Column<double>(type: "float", nullable: true),
                    ChatLuongPhanTram = table.Column<double>(type: "float", nullable: true),
                    TienDoDiem = table.Column<double>(type: "float", nullable: true),
                    TienDoPhanTram = table.Column<double>(type: "float", nullable: true),
                    KetQuaLinhVucPhanTram = table.Column<double>(type: "float", nullable: true),
                    KhaNangToChucPhanTram = table.Column<double>(type: "float", nullable: true),
                    NangLucTapHopPhanTram = table.Column<double>(type: "float", nullable: true),
                    GhiChuGiaiTrinh = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DiemTieuChiKetQua = table.Column<double>(type: "float", nullable: true),
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
                    table.PrimaryKey("PK_KPI_KetQuaThucHienNhiemVu", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "KPI_LyLich2C",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DonViSuDungId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PhongBanId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ChucVuHienTai = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MaCanBo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    HoTen = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Avatar = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    GioiTinh = table.Column<int>(type: "int", nullable: true),
                    SoHieuCCVC = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NgayBoNhiem = table.Column<DateTime>(type: "datetime2", nullable: true),
                    NgayBoNhiemLai = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Ngaysinh = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TinhTrangHonNhan = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TenKhac = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Phone = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LoaiHopDong = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SoCMND = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NgayCapCMND = table.Column<DateTime>(type: "datetime2", nullable: true),
                    NoiCapCMND = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NoiSinhTinh = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NoiSinhXa = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsNoiSinh = table.Column<bool>(type: "bit", nullable: true),
                    NoiSinh = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    QueQuanGoc = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    QueQuanTinh = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    QueQuanXa = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    QueQuan = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DanToc = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TonGiao = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    QuocTich = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    HoKhauThuongTru_Tinh = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    HoKhauThuongTru_Xa = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NoiDangKyHKTT = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NoiOHienNay_Tinh = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NoiOHienNay_Xa = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DiaChiHienTai = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CoQuanTuyenDung = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NgayTuyenDung = table.Column<DateTime>(type: "datetime2", nullable: true),
                    NVaoCoQuanHienDangCongTac = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CongViecChinh = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SoTruongCongTac = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CongViecLamLauNhat = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ChucDanh = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ChucDanhQuyHoach = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LoaiHinhDaoTao = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    BoiDuongLanhDaoCapVu = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    QuanLyNN = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TrinhDoGiaoDucPhoThong = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TrinhDoMax = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TrinhDo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ViTriViecLam = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NoteTrinhDoCM = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LyLuanChinhTri = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    QuanLyNhaNuoc = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    QuanLyNganh = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TinHoc = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ThongTinTinHoc = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TiengAnh = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ThongTinTiengAnh = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NgoaiNgu = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ThongTinNgoaiNgu = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TiengDanToc = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ThongTinTiengDanToc = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NgayVaoDang = table.Column<DateTime>(type: "datetime2", nullable: true),
                    NgayVaoDangChinhThucTxt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    NoiKetNapDang = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ChucVuDangHienTai = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ChiBoSinhHoatDang = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DaiBieuHoiDongNhanDan = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NgayVaoDoan = table.Column<DateTime>(type: "datetime2", nullable: true),
                    NoiKetNapDoan = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ChucVuDoan = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NgayNhapNgu = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DanhHieuPhongTang = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DanhHieuMax = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    HocHam = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NamPhongHocHam = table.Column<DateTime>(type: "datetime2", nullable: true),
                    NamPhongChucDanhKhoaHoc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ChuyenNganhHocHam = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ChucDanhKhoaHoc = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LevelThuongBinh = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LaConGiaDinhChinhSach = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SoBaoHiemXH = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TPhanGiaDinhXuatThan = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TPhanBanThanXuatThan = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NgayThamGiaCachMang = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DoiTuongChinhSach = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Luong = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NguonThuKhac = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NhanXetDanhGia = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NgayKyQuyetDinh = table.Column<DateTime>(type: "datetime2", nullable: true),
                    NgayHieuLuc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LyDo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SoQuyetDinh = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NguoiKy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NgayHuongLuong = table.Column<DateTime>(type: "datetime2", nullable: true),
                    MaNgach = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    HeSoLuong = table.Column<double>(type: "float", nullable: true),
                    BacLuong = table.Column<int>(type: "int", nullable: true),
                    NgachCongVienChuc = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IdBacLuong = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    LoaiDieuChinhLuongLyLich = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LoaiLuong = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SoTienLuongThoaThuan = table.Column<long>(type: "bigint", nullable: true),
                    NgayBoNhiemChucDanh = table.Column<DateTime>(type: "datetime2", nullable: true),
                    PhanTramHuong = table.Column<double>(type: "float", nullable: true),
                    NgayHuongPhuCapThamNienVuotKhung = table.Column<DateTime>(type: "datetime2", nullable: true),
                    VuotKhung = table.Column<double>(type: "float", nullable: true),
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
                    table.PrimaryKey("PK_KPI_LyLich2C", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "KPI_NhiemVu",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IdNhiemVuTraVe = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    TenNhiemVuDayDu = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TenNhiemVuRutGon = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MaLoaiNhiemVu = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    TenLoaiNhiemVu = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NhiemVuTrongTam = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ThoiHan = table.Column<DateTime>(type: "datetime2", nullable: true),
                    NgayHoanThanh = table.Column<DateTime>(type: "datetime2", nullable: true),
                    NgayVanBan = table.Column<DateTime>(type: "datetime2", nullable: true),
                    MaNhiemVuCha = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    LoaiHanXuLy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IdDotTheoDoiDanhGia = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IdLyLich = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IdPhongBan = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    TenPhongBan = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IdNguoiXuLy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    TenNguoiXuLy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IdLinhVuc = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    TenLinhVuc = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SoLanCapNhatTienDo = table.Column<int>(type: "int", nullable: true),
                    IsHoanThanh = table.Column<bool>(type: "bit", nullable: true),
                    IsDaDuyet = table.Column<bool>(type: "bit", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    KetQuaXuLyMoiNhat = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    KetQuaTuXepLoai = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    KetQuaPhoPhongXepLoai = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    KetQuaLanhDaoXepLoai = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Type = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TypeCaNhanTruongBan = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EmailsNguoiThucHien = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TimeDongBo = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DiemTheoBoTieuChi = table.Column<double>(type: "float", nullable: true),
                    ChamDiemSoLuong_HoanThanh = table.Column<double>(type: "float", nullable: true),
                    ChamDiemSoLuong_KhongHoanThanh = table.Column<double>(type: "float", nullable: true),
                    ChamDiemSoLuong_Diem = table.Column<double>(type: "float", nullable: true),
                    ChamDiemChatLuong_KhongDat = table.Column<double>(type: "float", nullable: true),
                    ChamDiemChatLuong_SoDiemConLai = table.Column<double>(type: "float", nullable: true),
                    ChamDiemChatLuong_Diem = table.Column<double>(type: "float", nullable: true),
                    ChamDiemTienDo_KhongDat = table.Column<double>(type: "float", nullable: true),
                    ChamDiemTienDo_SoDiemConLai = table.Column<double>(type: "float", nullable: true),
                    ChamDiemTienDo_Diem = table.Column<double>(type: "float", nullable: true),
                    GhiChuGiaTrinh = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IdPhieuDanhGia = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
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
                    table.PrimaryKey("PK_KPI_NhiemVu", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "KPI_NhomTieuChi",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IdBoTieuChiDonVi = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    TenNhomTieuChi = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CongViecChiTiet = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SanPhamDauRa = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PhanNhom = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    KhungDiemToiDa = table.Column<int>(type: "int", nullable: true),
                    Diem = table.Column<int>(type: "int", nullable: true),
                    HeSoQuyDoi = table.Column<int>(type: "int", nullable: true),
                    GhiChu = table.Column<int>(type: "int", nullable: true),
                    IdDonVi = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ParentID = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Level = table.Column<int>(type: "int", nullable: true),
                    STT = table.Column<int>(type: "int", nullable: true),
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
                    table.PrimaryKey("PK_KPI_NhomTieuChi", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "KPI_PhieuDanhGia",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IdLyLich = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IdDotDanhGia = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DonVi = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Luong = table.Column<int>(type: "int", nullable: false),
                    PhongBan = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DiemTieuChiChung = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    DiemThucHienNhiemVu = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    TongDiem = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    UuDiem = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    HanChe = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    YKienNhanXet = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TrangThai = table.Column<string>(type: "nvarchar(max)", nullable: false),
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
                    table.PrimaryKey("PK_KPI_PhieuDanhGia", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "KPI_PhieuDanhGiaTapThe",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IdDotDanhGia = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DonVi = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Luong = table.Column<int>(type: "int", nullable: true),
                    PhongBan = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DiemTieuChiChung = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    DiemThucHienNhiemVu = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    TongDiem = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    ChatLuongTuDanhGia = table.Column<int>(type: "int", nullable: true),
                    ChatLuongCapTrenDanhGia = table.Column<int>(type: "int", nullable: true),
                    TrangThai = table.Column<string>(type: "nvarchar(max)", nullable: false),
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
                    table.PrimaryKey("PK_KPI_PhieuDanhGiaTapThe", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "KPI_QLNgach",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    OldNhomNgach = table.Column<long>(type: "bigint", nullable: true),
                    MaNgach = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TenNgach = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    NhomVienChuc = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    NhomNgach = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ThoiGianNangLuong = table.Column<int>(type: "int", nullable: true),
                    ThongTinMoTa = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: true),
                    SoThuTu = table.Column<int>(type: "int", nullable: true),
                    IsNganhYTe = table.Column<bool>(type: "bit", nullable: true),
                    NgayApDung = table.Column<DateTime>(type: "datetime2", nullable: true),
                    NgayHetHan = table.Column<DateTime>(type: "datetime2", nullable: true),
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
                    table.PrimaryKey("PK_KPI_QLNgach", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "KPI_QuaTrinhXuLyPhieuDanhGia",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IdPhieuDanhGia = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TrangThai = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IdNguoiXuLy = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IdNguoiGui = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    GhiChu = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsXuLy = table.Column<bool>(type: "bit", nullable: false),
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
                    table.PrimaryKey("PK_KPI_QuaTrinhXuLyPhieuDanhGia", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "KPI_ThoiDiemDongBoVanBan",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IdVanBan = table.Column<long>(type: "bigint", nullable: true),
                    TypeVanBan = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ThoiGianDongBoVanBan = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsTuNhap = table.Column<bool>(type: "bit", nullable: true),
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
                    table.PrimaryKey("PK_KPI_ThoiDiemDongBoVanBan", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "KPI_TieuChiChung",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Ten = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ParentId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    MyProperty = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Priority = table.Column<int>(type: "int", nullable: true),
                    IdBoTieuChiChung = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
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
                    table.PrimaryKey("PK_KPI_TieuChiChung", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "KPI_TieuChiChung_DiemSo",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IdTieuChiChung = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IdLyLich = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IdDotDanhGia = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IdPhieuDanhGia = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DiemTuCham = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
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
                    table.PrimaryKey("PK_KPI_TieuChiChung_DiemSo", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "KPI_TieuChiChung_DiemSo_CapTren",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Id_TieuChiChung_DiemSo = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Id_PhieuDanhGia = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Id_LyLich = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Id_DotDanhGia = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    VaiTroDanhGia = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Diem = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    GhiChu = table.Column<string>(type: "nvarchar(max)", nullable: true),
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
                    table.PrimaryKey("PK_KPI_TieuChiChung_DiemSo_CapTren", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "KPI_VanBanDen",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IdVanBanDongBo = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    SoVanBan = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NgayVanBan = table.Column<DateTime>(type: "datetime2", nullable: true),
                    TrichYeu = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TrangThai = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NgayHoanThanh = table.Column<DateTime>(type: "datetime2", nullable: true),
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
                    table.PrimaryKey("PK_KPI_VanBanDen", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "KPI_VanBanDi",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IdVanBanDongBo = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DoMat = table.Column<long>(type: "bigint", nullable: true),
                    DepartmentId = table.Column<long>(type: "bigint", nullable: true),
                    LoaiVanBan = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SoHieu = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DoKhan = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TrichYeu = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    HanXuLy = table.Column<DateTime>(type: "datetime2", nullable: true),
                    SoBan = table.Column<int>(type: "int", nullable: true),
                    SoDi = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SoVanBanId = table.Column<long>(type: "bigint", nullable: true),
                    NgayBanHanh = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsCapSo = table.Column<bool>(type: "bit", nullable: true),
                    NgayVanBan = table.Column<DateTime>(type: "datetime2", nullable: true),
                    NguoiSoanThao = table.Column<long>(type: "bigint", nullable: true),
                    TrichYeuNormalized = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TrangThai = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    GhiChu = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsTuNhap = table.Column<bool>(type: "bit", nullable: true),
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
                    table.PrimaryKey("PK_KPI_VanBanDi", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "LegalDocument",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LoaiVanBan = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Code = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    PublicDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    PublicBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ActivedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ExpiredDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    SignedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Document = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Content = table.Column<string>(type: "text", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LoaiHeThong = table.Column<string>(type: "nvarchar(max)", nullable: true),
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
                    table.PrimaryKey("PK_LegalDocument", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "MauBaoCao",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MaMauBaoCao = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    TenMauBaoCao = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    FileDinhKem = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    LoaiNenTang = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    LoaiHinhNenTang = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    HtmlContent = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Keys = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TrangThaiNenTang = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    KyBaoCao = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    HanNopThang = table.Column<int>(type: "int", nullable: false),
                    HanNopNgay = table.Column<int>(type: "int", nullable: false),
                    PhanLoai = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
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
                    table.PrimaryKey("PK_MauBaoCao", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "MauBaoCaoChiTiet",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MauBaoCaoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    KeyName = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    DisplayName = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    InputType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    IsRequired = table.Column<bool>(type: "bit", nullable: false),
                    Options = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Layout = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    MinValue = table.Column<int>(type: "int", nullable: true),
                    MaxValue = table.Column<int>(type: "int", nullable: true),
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
                    table.PrimaryKey("PK_MauBaoCaoChiTiet", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "MauTraLoi",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Content = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    NhomTaiLieu = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
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
                    table.PrimaryKey("PK_MauTraLoi", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Module",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Code = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    Order = table.Column<int>(type: "int", nullable: false),
                    IsShow = table.Column<bool>(type: "bit", nullable: false),
                    Icon = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ClassCss = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    StyleCss = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Link = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AllowFilterScope = table.Column<bool>(type: "bit", nullable: true),
                    IsMobile = table.Column<bool>(type: "bit", nullable: true),
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
                    table.PrimaryKey("PK_Module", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "NavMenu",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Label = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    Href = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    ParentId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    MenuType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
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
                    table.PrimaryKey("PK_NavMenu", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "NenTangViPham",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenNenTang = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TenUngDung = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NguonId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    LoaiViPhamId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    NgayBatDau = table.Column<DateTime>(type: "datetime2", nullable: true),
                    NgayKetThuc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsHienThi = table.Column<bool>(type: "bit", nullable: false),
                    NoiDung = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NenTangLienKetId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
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
                    table.PrimaryKey("PK_NenTangViPham", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "NguoiDuyetBaoCao",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IdDotBaoCao = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IdNguoiDuyet = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
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
                    table.PrimaryKey("PK_NguoiDuyetBaoCao", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Notification",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Message = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Link = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FromUser = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ToUser = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IsRead = table.Column<bool>(type: "bit", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    SendToFrontEndUser = table.Column<bool>(type: "bit", nullable: true),
                    ItemId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ItemName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ItemType = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IsDisplay = table.Column<bool>(type: "bit", nullable: true),
                    DonViId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LoaiThongBao = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ProductId = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ProductName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TieuDe = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    NoiDung = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    NguoiTao = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    FileDinhKem = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsXuatBan = table.Column<bool>(type: "bit", nullable: true),
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
                    table.PrimaryKey("PK_Notification", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Operation",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ModuleId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    Url = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    Code = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Css = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsShow = table.Column<bool>(type: "bit", nullable: false),
                    Order = table.Column<int>(type: "int", nullable: false),
                    Icon = table.Column<string>(type: "nvarchar(max)", nullable: true),
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
                    table.PrimaryKey("PK_Operation", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PhanAnhNenTang",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    HoTen = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SoDienThoai = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NgaySinh = table.Column<DateTime>(type: "datetime2", nullable: true),
                    SoCCCD = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NgayCap = table.Column<DateTime>(type: "datetime2", nullable: true),
                    NoiCap = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DiaChiThuongTru = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LoaiPhanAnhId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    TenNenTang = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DiaChiNenTang = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TenUngDung = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LienKetTaiUngDung = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MaTinh = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NoiDungPhanAnh = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TrangThai = table.Column<int>(type: "int", nullable: false),
                    IsCVTao = table.Column<bool>(type: "bit", nullable: false),
                    LyDoTuChoi = table.Column<string>(type: "nvarchar(max)", nullable: true),
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
                    table.PrimaryKey("PK_PhanAnhNenTang", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PlatformManage",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    AppManageTypeId = table.Column<int>(type: "int", nullable: true),
                    OrganizationId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    TypeOrganization = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    OldSysId = table.Column<long>(type: "bigint", nullable: true),
                    DateLine = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DateLineEnterprise = table.Column<DateTime>(type: "datetime2", nullable: true),
                    MauSo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PlatformType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AvailabilityType = table.Column<int>(type: "int", nullable: true),
                    ChucNangNenTang = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CompanyName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CompanyTaxCode = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CompanyAddress = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Address = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CompanyPhone = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CompanyFax = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CompanyEmail = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    StaffNumber = table.Column<int>(type: "int", nullable: true),
                    IsNuocNgoai = table.Column<bool>(type: "bit", nullable: true),
                    IsNenTangLon = table.Column<bool>(type: "bit", nullable: true),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Domain = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ChuSoHuu = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Logo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DomainOwner = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DomainAdd = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ISPId = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ISPIdKhac = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AppOS = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Detail = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Seal = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ImagePath = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AppIconPath = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TienIchKhac = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LoaiHangHoaKhac = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    API = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    URLApp = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UserApp = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PassApp = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TinhId = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    HuyenId = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    XaId = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    QuocGiaId = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MaTinh = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SubmitDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    SubmitName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ReviewDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ReviewId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ReviewName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RequestChangeDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RequestChangeName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DataSignedUser = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SignDateUser = table.Column<DateTime>(type: "datetime2", nullable: true),
                    NgonNgu = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ChinhSachBaoMat = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TiepNhanKhieuNai = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ChinhSachGia = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ChinhSachThanhToan = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DieuKienCungCap = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ChinhSachGiaoHang = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PhuongThucGiaiQuyetPhanAnh = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DieuKienOrHanCheCungCapHHDV = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ChinhSachApDungHHDV = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    HinhThucHoTroTrucTuyen = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SoCongVan = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    WebsiteNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    WebsiteNumberSo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    WebsiteNumberNgay = table.Column<DateTime>(type: "datetime2", nullable: true),
                    WebsiteNumberNoiCap = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepresenterName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepresenterJob = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepresenterMobile = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepresenterEmail = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepresenterCCCD = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepresenterDiaChi = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepresenterCCCDDL = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AddressDL = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepresenterMobileDL = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepresenterEmailDL = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepresenterNameOnline = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepresenterJobOnline = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepresenterCCCDOnline = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepresenterMobileOnline = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepresenterEmailOnline = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepresenterDiaChiOnline = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AddressOnline = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PhuongThucLienHeOnline = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepresenterNameDaiDien = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepresenterJobDaiDien = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepresenterCCCDDaiDien = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepresenterMobileDaiDien = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepresenterEmailDaiDien = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AddressDaiDien = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PhuongThucLienHeDaiDien = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PhuongThucLienHe = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepresenterJobDaiDienSo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepresenterJobDaiDienNgay = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RepresenterJobDaiDienNoiCap = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepresenterNameUyQuyen = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepresenterJobUyQuyen = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepresenterCCCDUyQuyen = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepresenterDiaChiUyQuyen = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepresenterMobileUyQuyen = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepresenterEmailUyQuyen = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepresenterNameVanHanh = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepresenterJobVanHanh = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepresenterCCCDVanHanh = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepresenterDiaChiVanHanh = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepresenterMobileVanHanh = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepresenterEmailVanHanh = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    OrganizationNameUyQuyen = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    OrganizationCodeUyQuyen = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    OrganizationFileDangKyUyQuyen = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    OrganizationDiaChiUyQuyen = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    OrganizationEmailUyQuyen = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepresenterNameDauMoiUyQuyen = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepresenterJobDauMoiUyQuyen = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepresenterCCCDDauMoiUyQuyen = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepresenterDiaChiDauMoiUyQuyen = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepresenterMobileDauMoiUyQuyen = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepresenterEmailDauMoiUyQuyen = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    QlHdtmdt_HoTen = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    QlHdtmdt_ChucDanh = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    QlHdtmdt_CCCD = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    QlHdtmdt_DiaChi = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    QlHdtmdt_SDT = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    QlHdtmdt_Email = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    QlKhieuNai_HoTen = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    QlKhieuNai_ChucDanh = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    QlKhieuNai_CCCD = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    QlKhieuNai_DiaChi = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    QlKhieuNai_SDT = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    QlKhieuNai_Email = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PhapNhanChiDinh_HoTen = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PhapNhanChiDinh_CCCD = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PhapNhanChiDinh_DiaChi = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PhapNhanChiDinh_SDT = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PhapNhanChiDinh_Email = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DvcMaHoSo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DvcIdHoSo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DvcSyncStatus = table.Column<int>(type: "int", nullable: false),
                    DvcSyncDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DvcRetryCount = table.Column<int>(type: "int", nullable: false),
                    DvcErrorMessage = table.Column<string>(type: "nvarchar(max)", nullable: true),
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
                    table.PrimaryKey("PK_PlatformManage", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PlatformManageHistory",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PlatformManageId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SenderId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    SenderName = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    Action = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    StatusBefore = table.Column<int>(type: "int", nullable: false),
                    StatusAfter = table.Column<int>(type: "int", nullable: false),
                    Note = table.Column<string>(type: "nvarchar(max)", nullable: true),
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
                    table.PrimaryKey("PK_PlatformManageHistory", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PlatformProductItem",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PlatformManageId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProductCategoryCode = table.Column<string>(type: "nvarchar(max)", nullable: true),
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
                    table.PrimaryKey("PK_PlatformProductItem", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ProcessingDeadlineConfig",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Code = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    StatusBefore = table.Column<int>(type: "int", nullable: true),
                    StatusAfter = table.Column<int>(type: "int", nullable: true),
                    LimitDays = table.Column<int>(type: "int", nullable: false),
                    IsCheckHoliday = table.Column<bool>(type: "bit", nullable: false),
                    STT = table.Column<int>(type: "int", nullable: true),
                    IsNenTang = table.Column<bool>(type: "bit", nullable: false),
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
                    table.PrimaryKey("PK_ProcessingDeadlineConfig", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Role",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Code = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    DepartmentId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
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
                    table.PrimaryKey("PK_Role", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "RoleOperation",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RoleId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    OperationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IsAccess = table.Column<int>(type: "int", nullable: false),
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
                    table.PrimaryKey("PK_RoleOperation", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "RutTienKyQuy",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenChuQuanToChuc = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    SoNgayNoiCapGCN = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    MaSoThue = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    DiaChiTruSoChinh = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    EmailTiepNhan = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    OrganizationId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    SdtToChuc = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    DdplHoVaTen = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    DdplChucDanh = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    DdplSoCccdHoChieu = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    DdplDiaChi = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    DdplSdt = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    DmlhHoVaTen = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    DmlhSdt = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    WebDiaChi = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    AppTenUngDung = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    NganHang = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    QuySo = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Ngay = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LyDo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    VanBanTaiLieuKemTheo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Khoan = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Dieu = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    NghiDinh = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    SoVanBan = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    DiaChiNgayThangNam = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false),
                    ChuyenVienId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ChuyenVienName = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
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
                    table.PrimaryKey("PK_RutTienKyQuy", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "RutTienKyQuyHistory",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RutTienKyQuyId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SenderId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    SenderName = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    Action = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    StatusBefore = table.Column<int>(type: "int", nullable: false),
                    StatusAfter = table.Column<int>(type: "int", nullable: false),
                    Note = table.Column<string>(type: "nvarchar(max)", nullable: true),
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
                    table.PrimaryKey("PK_RutTienKyQuyHistory", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SignatureInfo",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    HoSoId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CertCommonName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    CertSerialNumber = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    CertDistinguishedName = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CertIssuer = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CertValidFrom = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    CertValidTo = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    CertificateRawBase64 = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    OriginalData = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SignaturePkcs7 = table.Column<string>(type: "text", nullable: true),
                    SignatureStatus = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    SignedDateTime = table.Column<DateTime>(type: "datetime2", nullable: true),
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
                    table.PrimaryKey("PK_SignatureInfo", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TaiLieuDinhKem",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    KichThuoc = table.Column<long>(type: "bigint", nullable: true),
                    TenTaiLieu = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    LoaiTaiLieu = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    ItemId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DuongDanFile = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DuongDanFilePDF = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Extension = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    TenTaiLieuText = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsKySo = table.Column<bool>(type: "bit", nullable: true),
                    NguoiKy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DonViPhatHanh = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NgayKy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CoChuKySo = table.Column<bool>(type: "bit", nullable: true),
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
                    table.PrimaryKey("PK_TaiLieuDinhKem", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Tinh",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenTinh = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    STT = table.Column<int>(type: "int", nullable: true),
                    MaTinh = table.Column<string>(type: "nvarchar(max)", nullable: true),
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
                    table.PrimaryKey("PK_Tinh", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TinTuc",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TieuDe = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Slug = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    MoTaNgan = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    NoiDung = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AnhDaiDien = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    DanhMucId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    TenDanhMuc = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    TrangThai = table.Column<int>(type: "int", nullable: false),
                    NgayXuatBan = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LuotXem = table.Column<int>(type: "int", nullable: false),
                    IsNoiBat = table.Column<bool>(type: "bit", nullable: false),
                    ThuTu = table.Column<int>(type: "int", nullable: true),
                    Tags = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    DepartmentId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
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
                    table.PrimaryKey("PK_TinTuc", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "UserRole",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RoleId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DepartmentId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    KhoiCode = table.Column<string>(type: "nvarchar(max)", nullable: true),
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
                    table.PrimaryKey("PK_UserRole", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "VanBanPhapLuat",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SoHieu = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    TenVanBan = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    DonViBanHanh = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    NgayBanHanh = table.Column<DateTime>(type: "datetime2", nullable: true),
                    NgayHieuLuc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LoaiVanBan = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    LinhVuc = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    TrichYeu = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TrangThai = table.Column<int>(type: "int", nullable: false),
                    ThuTu = table.Column<int>(type: "int", nullable: true),
                    FileDinhKem = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
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
                    table.PrimaryKey("PK_VanBanPhapLuat", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "VuViecNenTang",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PhanAnhNenTangId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    VuViecPhanAnhId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
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
                    table.PrimaryKey("PK_VuViecNenTang", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "VuViecPhanAnh",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenNenTang = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TenUngDung = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TenThuongNhan = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MaSoDoanhNghiep = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DiaChi = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DienThoai = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MaTinh = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TrangThai = table.Column<int>(type: "int", nullable: false),
                    KetLuan = table.Column<int>(type: "int", nullable: false),
                    DoanhNghiepId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    SoCongThuongId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    PhanAnhNenTangId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    NenTangLienKetId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    SoThuTu = table.Column<int>(type: "int", nullable: false),
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
                    table.PrimaryKey("PK_VuViecPhanAnh", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "VuViecTraoDoi",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    VuViecPhanAnhId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    NoiDung = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NguoiGuiId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LoaiNguoiGui = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TenNguoiGui = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ChucVuNguoiGui = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TenDonViNguoiGui = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ParentId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
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
                    table.PrimaryKey("PK_VuViecTraoDoi", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "WeeklyConfig",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DayOfWeek = table.Column<int>(type: "int", nullable: false),
                    IsWorking = table.Column<bool>(type: "bit", nullable: false),
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
                    table.PrimaryKey("PK_WeeklyConfig", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AspNetRoleClaims",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RoleId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ClaimType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ClaimValue = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetRoleClaims", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AspNetRoleClaims_AspNetRoles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUsers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MaCanBo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Gender = table.Column<int>(type: "int", nullable: false),
                    Picture = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Type = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DonViId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    NgaySinh = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DiaChi = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsSSO = table.Column<bool>(type: "bit", nullable: true),
                    CanBoId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    GroupRole = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CCCD = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsKySo = table.Column<bool>(type: "bit", nullable: false),
                    OrganizationId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UserName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    NormalizedUserName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    Email = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    NormalizedEmail = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    EmailConfirmed = table.Column<bool>(type: "bit", nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SecurityStamp = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ConcurrencyStamp = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PhoneNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PhoneNumberConfirmed = table.Column<bool>(type: "bit", nullable: false),
                    TwoFactorEnabled = table.Column<bool>(type: "bit", nullable: false),
                    LockoutEnd = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    LockoutEnabled = table.Column<bool>(type: "bit", nullable: false),
                    AccessFailedCount = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUsers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AspNetUsers_Department_DonViId",
                        column: x => x.DonViId,
                        principalTable: "Department",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserClaims",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ClaimType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ClaimValue = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserClaims", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AspNetUserClaims_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserLogins",
                columns: table => new
                {
                    LoginProvider = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ProviderKey = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ProviderDisplayName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserLogins", x => new { x.LoginProvider, x.ProviderKey });
                    table.ForeignKey(
                        name: "FK_AspNetUserLogins_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserRoles",
                columns: table => new
                {
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RoleId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserRoles", x => new { x.UserId, x.RoleId });
                    table.ForeignKey(
                        name: "FK_AspNetUserRoles_AspNetRoles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AspNetUserRoles_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserTokens",
                columns: table => new
                {
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LoginProvider = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Value = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserTokens", x => new { x.UserId, x.LoginProvider, x.Name });
                    table.ForeignKey(
                        name: "FK_AspNetUserTokens_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "AspNetUsers",
                columns: new[] { "Id", "AccessFailedCount", "CCCD", "CanBoId", "ConcurrencyStamp", "CreatedBy", "CreatedDate", "CreatedId", "DeletedDate", "DeletedId", "DiaChi", "DonViId", "Email", "EmailConfirmed", "Gender", "GroupRole", "IsDeleted", "IsKySo", "IsSSO", "LockoutEnabled", "LockoutEnd", "MaCanBo", "Name", "NgaySinh", "NormalizedEmail", "NormalizedUserName", "OrganizationId", "PasswordHash", "PhoneNumber", "PhoneNumberConfirmed", "Picture", "SecurityStamp", "TwoFactorEnabled", "Type", "UpdatedBy", "UpdatedDate", "UpdatedId", "UserName" },
                values: new object[] { new Guid("11111111-1111-1111-1111-111111111111"), 0, null, null, "871694db-d63b-4973-9cae-5121c3a84c05", null, new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null, null, null, null, "admin", true, 0, null, false, false, null, false, null, null, null, null, "ADMIN", "ADMIN", null, "AQAAAAIAAYagAAAAEB8pCAlfZembxGYb6NsisBM8QeflHGfUhy6TbWxc8SkruZxLoH0zW844tiJtciKbkQ==", null, false, null, "376d4f7a-6672-4e82-9149-870e3de48e2d", false, "Admin", null, new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, "admin" });

            migrationBuilder.CreateIndex(
                name: "IX_AspNetRoleClaims_RoleId",
                table: "AspNetRoleClaims",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "RoleNameIndex",
                table: "AspNetRoles",
                column: "NormalizedName",
                unique: true,
                filter: "[NormalizedName] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserClaims_UserId",
                table: "AspNetUserClaims",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserLogins_UserId",
                table: "AspNetUserLogins",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserRoles_RoleId",
                table: "AspNetUserRoles",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "EmailIndex",
                table: "AspNetUsers",
                column: "NormalizedEmail");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUsers_DonViId",
                table: "AspNetUsers",
                column: "DonViId");

            migrationBuilder.CreateIndex(
                name: "UserNameIndex",
                table: "AspNetUsers",
                column: "NormalizedUserName",
                unique: true,
                filter: "[NormalizedUserName] IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ApiPermissions");

            migrationBuilder.DropTable(
                name: "AppConfiguration");

            migrationBuilder.DropTable(
                name: "AppContractExtend");

            migrationBuilder.DropTable(
                name: "AppInfoItem");

            migrationBuilder.DropTable(
                name: "AspNetRoleClaims");

            migrationBuilder.DropTable(
                name: "AspNetUserClaims");

            migrationBuilder.DropTable(
                name: "AspNetUserLogins");

            migrationBuilder.DropTable(
                name: "AspNetUserRoles");

            migrationBuilder.DropTable(
                name: "AspNetUserTokens");

            migrationBuilder.DropTable(
                name: "Audit");

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
                name: "DM_DuLieuDanhMuc");

            migrationBuilder.DropTable(
                name: "DM_NhomDanhMuc");

            migrationBuilder.DropTable(
                name: "DvcSyncFileMap");

            migrationBuilder.DropTable(
                name: "DvcSyncLog");

            migrationBuilder.DropTable(
                name: "EmailConfigs");

            migrationBuilder.DropTable(
                name: "EmailTemplates");

            migrationBuilder.DropTable(
                name: "EnterprisePlatformItem");

            migrationBuilder.DropTable(
                name: "HistoryChangedAuthencationContract");

            migrationBuilder.DropTable(
                name: "HolidayConfigs");

            migrationBuilder.DropTable(
                name: "HomeBlock");

            migrationBuilder.DropTable(
                name: "Huyen");

            migrationBuilder.DropTable(
                name: "KPI_BoTieuChiChung");

            migrationBuilder.DropTable(
                name: "KPI_BoTieuChiDonVi");

            migrationBuilder.DropTable(
                name: "KPI_CauHinhCongThucNhiemVu");

            migrationBuilder.DropTable(
                name: "KPI_CauHinhDiemTheoHeSoLanhDao");

            migrationBuilder.DropTable(
                name: "KPI_DauRaNhiemVu");

            migrationBuilder.DropTable(
                name: "KPI_DauRaNhiemVu_ChiTietDanhGia");

            migrationBuilder.DropTable(
                name: "KPI_DotDanhGia_DonVi");

            migrationBuilder.DropTable(
                name: "KPI_DotTheoDoiDanhGia");

            migrationBuilder.DropTable(
                name: "KPI_KetQuaThucHienNhiemVu");

            migrationBuilder.DropTable(
                name: "KPI_LyLich2C");

            migrationBuilder.DropTable(
                name: "KPI_NhiemVu");

            migrationBuilder.DropTable(
                name: "KPI_NhomTieuChi");

            migrationBuilder.DropTable(
                name: "KPI_PhieuDanhGia");

            migrationBuilder.DropTable(
                name: "KPI_PhieuDanhGiaTapThe");

            migrationBuilder.DropTable(
                name: "KPI_QLNgach");

            migrationBuilder.DropTable(
                name: "KPI_QuaTrinhXuLyPhieuDanhGia");

            migrationBuilder.DropTable(
                name: "KPI_ThoiDiemDongBoVanBan");

            migrationBuilder.DropTable(
                name: "KPI_TieuChiChung");

            migrationBuilder.DropTable(
                name: "KPI_TieuChiChung_DiemSo");

            migrationBuilder.DropTable(
                name: "KPI_TieuChiChung_DiemSo_CapTren");

            migrationBuilder.DropTable(
                name: "KPI_VanBanDen");

            migrationBuilder.DropTable(
                name: "KPI_VanBanDi");

            migrationBuilder.DropTable(
                name: "LegalDocument");

            migrationBuilder.DropTable(
                name: "MauBaoCao");

            migrationBuilder.DropTable(
                name: "MauBaoCaoChiTiet");

            migrationBuilder.DropTable(
                name: "MauTraLoi");

            migrationBuilder.DropTable(
                name: "Module");

            migrationBuilder.DropTable(
                name: "NavMenu");

            migrationBuilder.DropTable(
                name: "NenTangViPham");

            migrationBuilder.DropTable(
                name: "NguoiDuyetBaoCao");

            migrationBuilder.DropTable(
                name: "Notification");

            migrationBuilder.DropTable(
                name: "Operation");

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
                name: "Role");

            migrationBuilder.DropTable(
                name: "RoleOperation");

            migrationBuilder.DropTable(
                name: "RutTienKyQuy");

            migrationBuilder.DropTable(
                name: "RutTienKyQuyHistory");

            migrationBuilder.DropTable(
                name: "SignatureInfo");

            migrationBuilder.DropTable(
                name: "TaiLieuDinhKem");

            migrationBuilder.DropTable(
                name: "Tinh");

            migrationBuilder.DropTable(
                name: "TinTuc");

            migrationBuilder.DropTable(
                name: "UserRole");

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

            migrationBuilder.DropTable(
                name: "AspNetRoles");

            migrationBuilder.DropTable(
                name: "AspNetUsers");

            migrationBuilder.DropTable(
                name: "Department");
        }
    }
}
