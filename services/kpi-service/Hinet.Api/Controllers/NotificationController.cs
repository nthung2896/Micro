using Hinet.Service.Core.Mapper;
using Microsoft.AspNetCore.Mvc;
using Hinet.Model.Entities;
using Hinet.Service.NotificationService;
using Hinet.Service.NotificationService.Dto;
using Hinet.Service.Common;
using Hinet.Service.Dto;
using Hinet.Service.NotificationService.Request;
using Hinet.Api.Filter;
using Microsoft.EntityFrameworkCore;
using Hinet.Service.ModuleService.Dto;
using Hinet.Api.Dto;
using CommonHelper.String;
using Hinet.Service.EmailService.Dto;
using Hinet.Service.EmailService;

namespace Hinet.Controllers
{
    [Route("api/[controller]")]
    public class NotificationController : HinetController
    {
        private readonly INotificationService _notificationService;
        private readonly IMapper _mapper;
        private readonly ILogger<NotificationController> _logger;
        public NotificationController(
            INotificationService notificationService,
            IMapper mapper,
            ILogger<NotificationController> logger
            )
        {
            this._notificationService = notificationService;
            this._mapper = mapper;
            _logger = logger;
        }

        [HttpPost("Create")]
        public async Task<DataResponse<Notification>> Create([FromBody] NotificationRequest model)
        {
            try
            {
                var entity = _mapper.Map<NotificationRequest, Notification>(model);
                if (string.IsNullOrEmpty(model.Message)) entity.Message = ".";
                entity.FromUser = model.FromUser != null ? new Guid(model.FromUser) : null;
                entity.ToUser = model.ToUser != null ? new Guid(model.ToUser) : null;
                if (string.IsNullOrEmpty(model.ItemName)) entity.ItemName = ".";
                await _notificationService.CreateAsync(entity);


                return new DataResponse<Notification>() { Data = entity, Status = true };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tạo rà soát");
                return new DataResponse<Notification>()
                {
                    Data = null,
                    Status = false,
                    Message = "Đã xảy ra lỗi khi tạo dữ liệu."
                };
            }
        }

        [HttpPost("CreateNhacNho")]
        public async Task<DataResponse<bool>> CreateNhacNho([FromBody] NotificationNhacNhoRequest model)
        {
            var entity = _mapper.Map<NotificationNhacNhoRequest, Notification>(model);
            var result = await _notificationService.CreateNhacNho(entity);
            return new DataResponse<bool>
            {
                Data = result,
                Message = "CreateNhacNho bool thành công",
                Status = true
            };
        }

        [HttpPut("Update")]
        public async Task<DataResponse<Notification>> Update([FromBody] NotificationRequest model)
        {
            try
            {
                var entity = await _notificationService.GetByIdAsync(model.Id);
                if (entity == null)
                    return DataResponse<Notification>.False("Notification not found");

                entity = _mapper.Map(model, entity);
                if (string.IsNullOrEmpty(model.Message)) entity.Message = ".";
                entity.FromUser = model.FromUser != null ? new Guid(model.FromUser) : null;
                entity.ToUser = model.ToUser != null ? new Guid(model.ToUser) : null;
                if (string.IsNullOrEmpty(model.ItemName)) entity.ItemName = ".";
                await _notificationService.UpdateAsync(entity);


                return new DataResponse<Notification>() { Data = entity, Status = true };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tạo rà soát");
                return new DataResponse<Notification>()
                {
                    Data = null,
                    Status = false,
                    Message = "Đã xảy ra lỗi khi cập nhật dữ liệu."
                };
            }
        }

        [HttpGet("Get/{id}")]
        public async Task<DataResponse<NotificationDto>> Get(Guid id)
        {
            var data = await _notificationService.GetDto(id);
            return new DataResponse<NotificationDto> { Data = data, Status = true };
        }

        [HttpPost("GetData")]
        public async Task<DataResponse<PagedList<NotificationDto>>> GetData([FromBody] NotificationSearch search)
        {
            var data = await _notificationService.GetData(search);

            return new DataResponse<PagedList<NotificationDto>> { Data = data, Status = true };
        }

        [HttpDelete("Delete/{id}")]
        public async Task<DataResponse> Delete(Guid id)
        {
            var entity = await _notificationService.GetByIdAsync(id);
            await _notificationService.DeleteAsync(entity);
            return DataResponse.Success(null);
        }

        [HttpPost("GetNotification")]
        public async Task<DataResponse<PagedList<NotificationDto>>> GetNotification([FromBody] NotificationSearch search)
        {
            var data = await _notificationService.GetNotification(UserId, search, 5);

            return new DataResponse<PagedList<NotificationDto>> { Data = data, Status = true };
        }
        [HttpPost("GetNotificationUser")]
        public async Task<DataResponse<PagedList<NotificationDto>>> GetNotificationUser()
        {
            var data = await _notificationService.GetNotificationUser(UserId, 100);

            return new DataResponse<PagedList<NotificationDto>> { Data = data, Status = true };
        }

        [HttpPost("GetDataDoanhNghiep")]
        public async Task<DataResponse<PagedList<NotificationDto>>> GetDataDoanhNghiep([FromBody] NotificationSearch search)
        {
            var data = await _notificationService.GetDataDoanhNghiep(search);

            return new DataResponse<PagedList<NotificationDto>> { Data = data, Status = true };
        }

        [HttpPost("GetDataSanPham")]
        public async Task<DataResponse<PagedList<NotificationDto>>> GetDataSanPham([FromBody] NotificationSearch search)
        {
            var data = await _notificationService.GetDataSanPham(search);

            return new DataResponse<PagedList<NotificationDto>> { Data = data, Status = true };
        }

        [HttpGet("ToggleLock/{id}")]
        public async Task<DataResponse> ToggleLock(Guid id)
        {
            var res = new DataResponse();
            try
            {
                var obj = await _notificationService.GetByIdAsync(id);
                if (obj == null)
                {
                    res.Status = false;
                    res.Message = "Không tìm thấy thông tin!";
                    return res;
                }
                if (obj.IsXuatBan == true)
                {
                    obj.IsXuatBan = false;
                    res.Message = "Khóa thành công";
                    res.Status = true;
                }
                else
                {
                    obj.IsXuatBan = true;
                    res.Message = "Mở khóa thành công";
                    res.Status = true;
                }
                await _notificationService.UpdateAsync(obj);

                return res;
            }
            catch (Exception)
            {
                res.Status = false;
                res.Message = "Đã xảy ra lỗi!";
                return res;
            }
        }

        [HttpPut("MaskAsRead/{id}")]
        public async Task<DataResponse> MaskAsRead(Guid id)
        {
            await _notificationService.MaskAsRead(id);
            return DataResponse.Success(id);
        }

        [HttpDelete("ClearAll")]
        public async Task<DataResponse> ClearAllNotification()
        {
            await _notificationService.ClearAllNotification(UserId);
            return DataResponse.Success(UserId);
        }


    }
}