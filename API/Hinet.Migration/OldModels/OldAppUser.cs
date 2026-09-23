namespace Hinet.Migration.OldModels;

// POCO khớp dbo.AppUser SQL Server cũ. Chỉ giữ cột dùng cho migration.
public class OldAppUser
{
    public long Id { get; set; }
    public string UserName { get; set; } = default!;
    public string? Email { get; set; }
    public string? PhoneNumber { get; set; }
    public DateTime? BirthDay { get; set; }
    public int Gender { get; set; }
    public string? Address { get; set; }
    public string? FullName { get; set; }
    public string? Avatar { get; set; }
    public string? TypeAccount { get; set; }
    public long? OrganizationId { get; set; }
    public DateTime? CreatedDate { get; set; }
    public string? CreatedBy { get; set; }
    public long? CreatedID { get; set; }
    public DateTime? UpdatedDate { get; set; }
    public string? UpdatedBy { get; set; }
    public long? UpdatedID { get; set; }
    public bool? IsDelete { get; set; }
    public DateTime? DeleteTime { get; set; }
    public long? DeleteId { get; set; }
    public string? GroupUser { get; set; }
    public bool? IsLoginSSO { get; set; }

    // Identity fields
    public bool EmailConfirmed { get; set; }
    public string? PasswordHash { get; set; }
    public string? SecurityStamp { get; set; }
    public bool PhoneNumberConfirmed { get; set; }
    public bool TwoFactorEnabled { get; set; }
    public DateTime? LockoutEndDateUtc { get; set; }
    public bool LockoutEnabled { get; set; }
    public int AccessFailedCount { get; set; }
}
