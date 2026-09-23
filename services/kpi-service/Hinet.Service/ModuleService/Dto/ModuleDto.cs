using Hinet.Model.Entities;
using Hinet.Service.OperationService.Dto;

namespace Hinet.Service.ModuleService.Dto
{
    public class ModuleDto : Module
    {
        public string TrangThaiHienThi { get; set; }
        public List<Operation> ListOperation { get; set; }
        public string? DuongDanIcon { get; set; }
    }
}
