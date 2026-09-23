using Hinet.Service.Dto;


namespace Hinet.Service.ModuleService.Request
{
    public class ModuleSearch : SearchBase
    {
        public bool? IsShow { get; set; }
        public string? Code { get; set; }
        public string? Name { get; set; }
    }
}
