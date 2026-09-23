using System;

namespace Hinet.Migration.OldModels;

// POCO khớp 1-1 với bảng dbo.WebsiteInfo bên SQL Server cũ.
// Dùng cho Dapper đọc — KHÔNG mapping EF, KHÔNG attribute.
public class OldWebsiteInfo
{
    public long Id { get; set; }
    public int Status { get; set; }
    public string? WebsiteTypeId { get; set; }
    public int WebsiteManageTypeId { get; set; }
    public long OrganizationId { get; set; }
    public string? TypeOrganization { get; set; }
    public int DepartmentId { get; set; }
    public int CompanyTypeId { get; set; }
    public string? CompanyName { get; set; }
    public string? CompanyTaxCode { get; set; }
    public string? CompanyAddress { get; set; }
    public string? CompanyPhone { get; set; }
    public string? CompanyFax { get; set; }
    public string? Name { get; set; }
    public string? Domain { get; set; }
    public string? Customer { get; set; }
    public string? MonitorMethod { get; set; }
    public string? ProductType { get; set; }
    public int ISPId { get; set; }
    public string? ISPIdKhac { get; set; }
    public int StaffNumber { get; set; }
    public int CommitApprove { get; set; }
    public string? Detail { get; set; }
    public string? History { get; set; }
    public DateTime? SubmitDate { get; set; }
    public string? SubmitName { get; set; }
    public string? SubmitSignature { get; set; }
    public DateTime? ReviewDate { get; set; }
    public string? ReviewName { get; set; }
    public string? ReviewSignature { get; set; }
    public DateTime? ApproveDate { get; set; }
    public string? ApproveName { get; set; }
    public string? ApproveSignature { get; set; }
    public DateTime? RequestChangeDate { get; set; }
    public string? RequestChangeName { get; set; }
    public string? WebsiteNumber { get; set; }
    public string? Seal { get; set; }
    public string? flag { get; set; }
    public string? Reason { get; set; }
    public string? Comment { get; set; }
    public string? Utility { get; set; }
    public string? DomainAdd { get; set; }
    public string? ImagePath { get; set; }
    public string? CCCD { get; set; }
    public long? StickId { get; set; }
    public string? TinhId { get; set; }
    public string? HuyenId { get; set; }
    public string? XaId { get; set; }
    public string? QuocGiaId { get; set; }
    public string? SendStatus { get; set; }
    public bool IsDelete { get; set; }
    public long? DeleteById { get; set; }
    public DateTime? DeleteDate { get; set; }
    public DateTime? EndDateNoti { get; set; }
    public string? TienIchKhac { get; set; }
    public string? LoaiHangHoaKhac { get; set; }
    public DateTime? DateLine { get; set; }
    public string? RepresenterName { get; set; }
    public string? RepresenterCCCD { get; set; }
    public string? RepresenterMobile { get; set; }
    public string? RepresenterJob { get; set; }
    public string? RepresenterEmail { get; set; }
    public string? Address { get; set; }
    public string? PhuongThucLienHe { get; set; }
    public string? RepresenterNameOnline { get; set; }
    public string? RepresenterJobOnline { get; set; }
    public string? RepresenterMobileOnline { get; set; }
    public string? RepresenterEmailOnline { get; set; }
    public string? AddressOnline { get; set; }
    public string? PhuongThucLienHeOnline { get; set; }
    public string? RepresenterNameDaiDien { get; set; }
    public string? RepresenterJobDaiDien { get; set; }
    public string? RepresenterMobileDaiDien { get; set; }
    public string? RepresenterEmailDaiDien { get; set; }
    public string? AddressDaiDien { get; set; }
    public string? PhuongThucLienHeDaiDien { get; set; }
    public bool IsUuTienGuiBaoCao { get; set; }
    public bool? ReviewDatHang { get; set; }
    public long? UserReviewDatHang { get; set; }
    public bool API { get; set; }
    public string? URLWebsite { get; set; }
    public string? UserWebsite { get; set; }
    public string? PassWebsite { get; set; }
    public bool IsNuocNgoai { get; set; }
    public string? SoCongVan { get; set; }
    public int? PhuongAnCungCapBaoCao { get; set; }
    public string? DataSignedTruongPhong { get; set; }
    public DateTime? SignDateTruongPhong { get; set; }
    public long? TruongPhongId { get; set; }
    public string? DataSignedLanhDao { get; set; }
    public DateTime? SignDateLanhDao { get; set; }
    public long? LanhDaoId { get; set; }
    public string? DataSignedUser { get; set; }
    public string? TinhIdNew { get; set; }
    public DateTime? SignDateUser { get; set; }

    // AuditableEntity fields
    public DateTime CreatedDate { get; set; }
    public string? CreatedBy { get; set; }
    public long? CreatedID { get; set; }
    public DateTime UpdatedDate { get; set; }
    public string? UpdatedBy { get; set; }
    public long? UpdatedID { get; set; }
}
