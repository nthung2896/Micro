using System;

namespace Hinet.Migration.OldModels;

// POCO khớp 1-1 với bảng dbo.WebsiteInfoFileAttach bên SQL Server cũ.
// Dùng cho Dapper đọc — KHÔNG mapping EF, KHÔNG attribute.
public class OldWebsiteInfoFileAttach
{
    public long Id { get; set; }
    public string? Name { get; set; }
    public string? FileName { get; set; }
    public string? Note { get; set; }
    public string? flag { get; set; }
    public int? Type { get; set; }
    public bool TaiLieuNhayCam { get; set; }
    public string? NoiDungTuKhoa { get; set; }
    public long WebsiteId { get; set; }
    public int? FileIndex { get; set; }

    // AuditableEntity fields
    public DateTime CreatedDate { get; set; }
    public string? CreatedBy { get; set; }
    public long? CreatedID { get; set; }
    public DateTime UpdatedDate { get; set; }
    public string? UpdatedBy { get; set; }
    public long? UpdatedID { get; set; }
}
