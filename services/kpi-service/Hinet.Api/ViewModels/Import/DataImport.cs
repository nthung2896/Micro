namespace Hinet.Api.Request.Import
{
    public class DataImport
    {
        public Guid IdFile { get; set; }
        public Guid? IdQuyetDinh { get; set; }
        public string? SoQuyetDinh { get; set; }
        public List<FieldAndSTT> Collection { get; set; }
    }

    public class FieldAndSTT
    {
        public int Order { get; set; }
        public string ColumnName { get; set; }
        public string DisplayName { get; set; }
    }
}
