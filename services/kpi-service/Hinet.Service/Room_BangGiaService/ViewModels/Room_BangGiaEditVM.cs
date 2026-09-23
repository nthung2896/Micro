using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;
namespace Hinet.Service.Room_BangGiaService.ViewModels
{
    public class Room_BangGiaEditVM : Room_BangGiaCreateVM
    {
        public Guid? Id { get; set; }
    }
}