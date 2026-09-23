using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;
namespace Hinet.Service.PhongTroService.ViewModels
{
    public class PhongTroEditVM : PhongTroCreateVM
    {
        public Guid? Id { get; set; }
    }
}