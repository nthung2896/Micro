using System;

namespace Hinet.Migration.OldModels;

// POCO khớp 1-1 với bảng dbo.AuthenticationContract bên SQL Server cũ.
// Dùng cho Dapper đọc — KHÔNG mapping EF, KHÔNG attribute.
public class OldAuthenticationContract
{
    public long Id { get; set; }
    public int Status { get; set; }
    public string? WebsiteTypeId { get; set; }
    public long OrganizationId { get; set; }
    public string? TypeOrganization { get; set; }
    public string? CompanyName { get; set; }
    public string? CompanyTaxCode { get; set; }
    public string? CompanyAddress { get; set; }
    public string? CompanyPhone { get; set; }
    public string? CompanyFax { get; set; }
    public string? Domain { get; set; }
    public int ISPId { get; set; }
    public int StaffNumber { get; set; }
    public string? DiaChiTruSo { get; set; }
    public string? DienThoai { get; set; }
    public string? fax { get; set; }
    public string? email { get; set; }
    public string? RepresenterName { get; set; }
    public string? RepresenterMobile { get; set; }
    public string? RepresenterJob { get; set; }
    public string? RepresenterEmail { get; set; }
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
    public string? Reason { get; set; }
    public string? Comment { get; set; }
    public string? ImagePath { get; set; }
    public long? StickId { get; set; }
    public string? SendStatus { get; set; }
    public bool IsDelete { get; set; }
    public long? DeleteById { get; set; }
    public DateTime? DeleteDate { get; set; }
    public DateTime? EndDateNoti { get; set; }
    public DateTime? DateLine { get; set; }
    public long? OldSysId { get; set; }
    public string? TypeWedApp { get; set; }
    public string? ServicePostKhac { get; set; }
    public bool IsNuocNgoai { get; set; }

    // AuditableEntity fields
    public DateTime CreatedDate { get; set; }
    public string? CreatedBy { get; set; }
    public long? CreatedID { get; set; }
    public DateTime UpdatedDate { get; set; }
    public string? UpdatedBy { get; set; }
    public long? UpdatedID { get; set; }
}
