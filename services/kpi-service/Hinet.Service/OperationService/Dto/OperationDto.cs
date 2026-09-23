using Hinet.Model.Entities;
using System.ComponentModel.DataAnnotations;

namespace Hinet.Service.OperationService.Dto
{
    public class OperationDto : Operation
    {
        public string TrangThaiHienThi { get; set; }
        public bool IsAccess { get; set; }
    }

    public class ModuleMenuDTO : Module
    {
        public List<OperationDto>? ListOperation { get; set; }
    }
}
