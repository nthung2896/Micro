namespace Hinet.Migration.OldModels;

// POCO khớp 1-1 với bảng dbo.CompanyInfo bên SQL Server cũ.
// Dùng cho Dapper đọc — KHÔNG mapping EF, KHÔNG attribute.
// Chỉ khai báo cột cần dùng cho migration (đã loại cột bị drop).
public class OldCompanyInfo
{
    public long Id { get; set; }
    public int Status { get; set; }
    public string? Name { get; set; }
    public string? EnglishName { get; set; }
    public string? ShortName { get; set; }
    public string? TaxCode { get; set; }
    public string? Address { get; set; }
    public string? CityId { get; set; }
    public string? CityName { get; set; }
    public string? Phone { get; set; }
    public string? Fax { get; set; }
    public string? Email { get; set; }
    public string? RepresenterName { get; set; }
    public string? RepresenterMobile { get; set; }
    public string? RepresenterPhone { get; set; }
    public string? RepresenterEmail { get; set; }
    public string? RepresenterCCCD { get; set; }
    public string? Detail { get; set; }
    public DateTime? ApproveDateOnline { get; set; }
    public string? TinhId { get; set; }
    public string? TinhIdNew { get; set; }
    public string? XaId { get; set; }
    public string? QuocGiaId { get; set; }
    public string? TypeOrganization { get; set; }
    public bool IsNuocNgoai { get; set; }
    public bool? IsVonDauTuNuocNgoai { get; set; }
    public string? DKKD { get; set; }
    public DateTime CreatedDate { get; set; }
    public string? CreatedBy { get; set; }
    public long? CreatedID { get; set; }
    public DateTime UpdatedDate { get; set; }
    public string? UpdatedBy { get; set; }
    public long? UpdatedID { get; set; }
    public bool IsDelete { get; set; }
    public DateTime? DeleteDate { get; set; }
    public long? DeleteById { get; set; }
}
