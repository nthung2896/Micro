namespace Hinet.Migration.OldModels;

public class OldRole
{
    public int Id { get; set; }
    public string Name { get; set; } = default!;
    public string Code { get; set; } = default!;
    public DateTime CreatedDate { get; set; }
    public string? CreatedBy { get; set; }
    public long? CreatedID { get; set; }
    public DateTime UpdatedDate { get; set; }
    public string? UpdatedBy { get; set; }
    public long? UpdatedID { get; set; }
}

public class OldUserRole
{
    public long Id { get; set; }
    public long UserId { get; set; }
    public int RoleId { get; set; }
    public DateTime CreatedDate { get; set; }
    public string? CreatedBy { get; set; }
    public long? CreatedID { get; set; }
    public DateTime UpdatedDate { get; set; }
    public string? UpdatedBy { get; set; }
    public long? UpdatedID { get; set; }
}
