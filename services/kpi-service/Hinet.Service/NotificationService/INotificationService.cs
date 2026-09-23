using Hinet.Model.Entities;
using Hinet.Service.NotificationService.Dto;
using Hinet.Service.Common;
using Hinet.Service.Common.Service;
using Hinet.Service.NotificationService.Request;

namespace Hinet.Service.NotificationService
{
    public interface INotificationService : IService<Notification>
    {
        Task<bool> CreateNhacNho(Notification newNoTi);

        Task<PagedList<NotificationDto>> GetData(NotificationSearch search);

        Task<NotificationDto> GetDto(Guid id);

        Task<PagedList<NotificationDto>> GetNotification(Guid? id, NotificationSearch? search, int size = 10);
        Task<PagedList<NotificationDto>> GetNotificationUser(Guid? id, int size = 10);

        Task<PagedList<NotificationDto>> GetDataDoanhNghiep(NotificationSearch search);

        Task<PagedList<NotificationDto>> GetDataSanPham(NotificationSearch search);

        Task MaskAsRead(Guid notiId);

        Task ClearAllNotification(Guid? userId);
    }
}