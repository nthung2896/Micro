namespace Hinet.Migration.OldModels;

public class OldModule
{
    public int Id { get; set; }
    public string Code { get; set; } = default!;
    public string Name { get; set; } = default!;
    public int Order { get; set; }
    public bool IsShow { get; set; }
    public string? Icon { get; set; }
    public string? ClassCss { get; set; }
    public string? StyleCss { get; set; }
    public string? Link { get; set; }
    public bool? AllowFilterScope { get; set; }
    public DateTime CreatedDate { get; set; }
    public string? CreatedBy { get; set; }
    public long? CreatedID { get; set; }
    public DateTime UpdatedDate { get; set; }
    public string? UpdatedBy { get; set; }
    public long? UpdatedID { get; set; }
}

public class OldOperation
{
    public long Id { get; set; }
    public int ModuleId { get; set; }
    public string Name { get; set; } = default!;
    public string URL { get; set; } = default!;
    public string Code { get; set; } = default!;
    public string? Css { get; set; }
    public bool IsShow { get; set; }
    public int Order { get; set; }
    public DateTime CreatedDate { get; set; }
    public string? CreatedBy { get; set; }
    public long? CreatedID { get; set; }
    public DateTime UpdatedDate { get; set; }
    public string? UpdatedBy { get; set; }
    public long? UpdatedID { get; set; }
}

public class OldRoleOperation
{
    public long Id { get; set; }
    public int RoleId { get; set; }
    public long OperationId { get; set; }
    public int IsAccess { get; set; }
    public DateTime CreatedDate { get; set; }
    public string? CreatedBy { get; set; }
    public long? CreatedID { get; set; }
    public DateTime UpdatedDate { get; set; }
    public string? UpdatedBy { get; set; }
    public long? UpdatedID { get; set; }
}
