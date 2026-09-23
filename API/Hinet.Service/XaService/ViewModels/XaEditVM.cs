using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;
namespace Hinet.Service.XaService.ViewModels
{
    public class XaEditVM : XaCreateVM
    {
        public Guid? Id { get; set; }
    }
}