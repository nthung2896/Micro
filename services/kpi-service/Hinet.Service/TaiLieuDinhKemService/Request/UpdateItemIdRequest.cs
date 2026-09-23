using Hinet.Model.Entities;
using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace Hinet.Service.TaiLieuDinhKemService.Dto
{
    public class UpdateItemIdRequest
    {
        public List<Guid> FileIds { get; set; }
        public Guid ItemId { get; set; }
    }
}
