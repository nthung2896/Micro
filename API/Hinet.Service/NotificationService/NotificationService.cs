using Hinet.Model.Entities;
using Hinet.Repository.NotificationRepository;
using Hinet.Service.Common.Service;
using Hinet.Service.NotificationService.Dto;
using Hinet.Service.Common;
using Microsoft.EntityFrameworkCore;
using Hinet.Service.UserRoleService;
using Hinet.Service.RoleService;
using Hinet.Service.Constant;
using Hinet.Repository.AppUserRepository;
using Hinet.Service.Dto;
using Hinet.Service.NotificationService.Request;

namespace Hinet.Service.NotificationService
{
    public class NotificationService : Service<Notification>, INotificationService
    {
        private readonly IUserRoleService _userRoleService;
        private readonly IAppUserRepository _appUserRepository;
        private readonly IRoleService _roleService;

        public NotificationService(
            INotificationRepository notificationRepository,
            IUserRoleService userRoleService,
            IAppUserRepository appUserRepository,
            IRoleService roleService) : base(notificationRepository)
        {
            _userRoleService = userRoleService;
            _appUserRepository = appUserRepository;
            _roleService = roleService;
        }

        public async Task<PagedList<NotificationDto>> GetData(NotificationSearch search)
        {
            var query = from q in GetQueryable()
                        join users in _appUserRepository.GetQueryable()
                        on q.FromUser equals users.Id into userGroup
                        from user in userGroup.DefaultIfEmpty()
                        select new NotificationDto
                        {
                            Id = q.Id,
                            FromUser = q.FromUser,
                            FromUserName = user.Name ?? "",
                            ToUser = q.ToUser,
                            Message = q.Message,
                            Link = q.Link,
                            Type = q.Type,
                            DonViId = q.DonViId,
                            ItemType = q.ItemType,
                            SendToFrontEndUser = q.SendToFrontEndUser,
                            IsRead = q.IsRead,
                            CreatedDate = q.CreatedDate,
                            ItemId = q.ItemId,
                            Email = q.Email,
                            LoaiThongBao = q.LoaiThongBao,
                            ProductId = q.ProductId,
                            ProductName = q.ProductName,
                            TieuDe = q.TieuDe,
                            NoiDung = q.NoiDung,
                            FileDinhKem = q.FileDinhKem,
                            IsXuatBan = q.IsXuatBan,
                            CreatedId = q.CreatedId,
                            UpdatedId = q.UpdatedId,
                            IsDisplay = q.IsDisplay,
                            ItemName = q.ItemName,
                            IsDeleted = q.IsDeleted,
                            CreatedBy = q.CreatedBy,
                            UpdatedBy = q.UpdatedBy,
                            DeletedId = q.DeletedId,
                            UpdatedDate = q.UpdatedDate,
                            DeletedDate = q.DeletedDate,
                        };

            if (search != null)
            {
                if (!string.IsNullOrEmpty(search.ToUser))
                    query = query.Where(x => x.ToUser != null && x.ToUser.ToString() == search.ToUser);

                if (!string.IsNullOrEmpty(search.FromUser))
                    query = query.Where(x => x.FromUser != null && x.FromUser.ToString() == search.FromUser);

                if (!string.IsNullOrEmpty(search.FromUserName))
                    query = query.Where(x => x.FromUserName.ToLower().Contains(search.FromUserName.Trim().ToLower()));

                if (!string.IsNullOrEmpty(search.Message))
                    query = query.Where(x => x.Message.ToLower().Contains(search.Message.Trim().ToLower()));

                if (search.FromDate != null)
                    query = query.Where(x => x.CreatedDate >= search.FromDate);

                if (search.ToDate != null)
                    query = query.Where(x => x.CreatedDate <= search.ToDate);
            }

            query = query.OrderByDescending(x => x.CreatedDate);
            return await PagedList<NotificationDto>.CreateAsync(query, search);
        }

        public async Task<NotificationDto> GetDto(Guid id)
        {
            var item = await (from q in GetQueryable().Where(x => x.Id == id)
                              select new NotificationDto
                              {
                                  ItemId = q.ItemId,
                                  CreatedId = q.CreatedId,
                                  UpdatedId = q.UpdatedId,
                                  FromUser = q.FromUser,
                                  ToUser = q.ToUser,
                                  Message = q.Message,
                                  Link = q.Link,
                                  Type = q.Type,
                                  DonViId = q.DonViId,
                                  ItemType = q.ItemType,
                                  IsDisplay = q.IsDisplay,
                                  SendToFrontEndUser = q.SendToFrontEndUser,
                                  ItemName = q.ItemName,
                                  Email = q.Email,
                                  LoaiThongBao = q.LoaiThongBao,
                                  ProductId = q.ProductId,
                                  ProductName = q.ProductName,
                                  TieuDe = q.TieuDe,
                                  NoiDung = q.NoiDung,
                                  FileDinhKem = q.FileDinhKem,
                                  IsXuatBan = q.IsXuatBan,
                                  IsRead = q.IsRead,
                                  IsDeleted = q.IsDeleted,
                                  Id = q.Id,
                                  CreatedBy = q.CreatedBy,
                                  UpdatedBy = q.UpdatedBy,
                                  DeletedId = q.DeletedId,
                                  CreatedDate = q.CreatedDate,
                                  UpdatedDate = q.UpdatedDate,
                                  DeletedDate = q.DeletedDate,
                              }).FirstOrDefaultAsync();

            return item ?? throw new Exception("Notification not found for ID: " + id);
        }

        public async Task<bool> CreateNhacNho(Notification newNoTi)
        {
            if (newNoTi == null)
                throw new Exception("Notification object is null");

            var idHoSoDonViKeKhai = newNoTi.ItemId;
            if (idHoSoDonViKeKhai == null)
                throw new Exception("ItemId is required for notification");

            newNoTi.IsRead = false;
            newNoTi.ItemName = "";
            newNoTi.Type = "";

            try
            {
                await CreateAsync(newNoTi);
                return true;
            }
            catch (Exception ex)
            {
                throw new Exception("Failed to create notification: " + ex.Message);
            }
        }

        public async Task<PagedList<NotificationDto>> GetNotification(Guid? id, NotificationSearch? search, int size = 20)
        {
            var query = from q in GetQueryable()
                        .Where(x => x.ToUser == id
                            && x.LoaiThongBao != "Website"
                            && x.LoaiThongBao != "Sản phẩm"
                            )
                        join users in _appUserRepository.GetQueryable()
                        on q.FromUser equals users.Id into userGroup
                        from user in userGroup.DefaultIfEmpty()
                        select new NotificationDto
                        {
                            Id = q.Id,
                            FromUser = q.FromUser,
                            FromUserName = user.Name ?? "",
                            ToUser = q.ToUser,
                            Message = q.Message,
                            Link = q.Link,
                            Type = q.Type,
                            DonViId = q.DonViId,
                            ItemType = q.ItemType,
                            SendToFrontEndUser = q.SendToFrontEndUser,
                            IsRead = q.IsRead,
                            Email = q.Email,
                            LoaiThongBao = q.LoaiThongBao,
                            ProductId = q.ProductId,
                            ProductName = q.ProductName,
                            TieuDe = q.TieuDe,
                            NoiDung = q.NoiDung,
                            FileDinhKem = q.FileDinhKem,
                            IsXuatBan = q.IsXuatBan,
                            CreatedDate = q.CreatedDate,
                            ItemId = q.ItemId,
                            CreatedId = q.CreatedId,
                            UpdatedId = q.UpdatedId,
                            IsDisplay = q.IsDisplay,
                            ItemName = q.ItemName,
                            IsDeleted = q.IsDeleted,
                            CreatedBy = q.CreatedBy,
                            UpdatedBy = q.UpdatedBy,
                            DeletedId = q.DeletedId,
                            UpdatedDate = q.UpdatedDate,
                            DeletedDate = q.DeletedDate,
                        };

            if (search != null)
            {
                if (!string.IsNullOrEmpty(search.ToUser))
                    query = query.Where(x => x.ToUser != null && x.ToUser.ToString() == search.ToUser);

                if (!string.IsNullOrEmpty(search.FromUser))
                    query = query.Where(x => x.FromUser != null && x.FromUser.ToString() == search.FromUser);

                if (!string.IsNullOrEmpty(search.FromUserName))
                    query = query.Where(x => x.FromUserName.ToLower().Contains(search.FromUserName.Trim().ToLower()));

                if (!string.IsNullOrEmpty(search.Message))
                    query = query.Where(x => x.Message.ToLower().Contains(search.Message.Trim().ToLower()));

                if (search.FromDate != null)
                    query = query.Where(x => x.CreatedDate >= search.FromDate);

                if (search.ToDate != null)
                    query = query.Where(x => x.CreatedDate <= search.ToDate);
            }

            query = query.OrderByDescending(e => e.IsRead == false).ThenByDescending(x => x.CreatedDate);

            return await PagedList<NotificationDto>.CreateAsync(query, search);
        }

        public async Task<PagedList<NotificationDto>> GetDataDoanhNghiep(NotificationSearch search)
        {
            var query = from q in GetQueryable().Where(x => x.LoaiThongBao == "Website")
                        join users in _appUserRepository.GetQueryable()
                        on q.FromUser equals users.Id into userGroup
                        from user in userGroup.DefaultIfEmpty()
                        select new NotificationDto
                        {
                            Id = q.Id,
                            FromUser = q.FromUser,
                            FromUserName = user.Name ?? "",
                            ToUser = q.ToUser,
                            Message = q.Message,
                            Link = q.Link,
                            Type = q.Type,
                            DonViId = q.DonViId,
                            ItemType = q.ItemType,
                            SendToFrontEndUser = q.SendToFrontEndUser,
                            IsRead = q.IsRead,
                            CreatedDate = q.CreatedDate,
                            ItemId = q.ItemId,
                            Email = q.Email,
                            LoaiThongBao = q.LoaiThongBao,
                            ProductId = q.ProductId,
                            ProductName = q.ProductName,
                            TieuDe = q.TieuDe,
                            NoiDung = q.NoiDung,
                            FileDinhKem = q.FileDinhKem,
                            IsXuatBan = q.IsXuatBan,
                            CreatedId = q.CreatedId,
                            UpdatedId = q.UpdatedId,
                            IsDisplay = q.IsDisplay,
                            ItemName = q.ItemName,
                            IsDeleted = q.IsDeleted,
                            CreatedBy = q.CreatedBy,
                            UpdatedBy = q.UpdatedBy,
                            DeletedId = q.DeletedId,
                            UpdatedDate = q.UpdatedDate,
                            DeletedDate = q.DeletedDate,
                        };

            if (search != null)
            {
                if (!string.IsNullOrEmpty(search.ToUser))
                    query = query.Where(x => x.ToUser != null && x.ToUser.ToString() == search.ToUser);

                if (!string.IsNullOrEmpty(search.FromUser))
                    query = query.Where(x => x.FromUser != null && x.FromUser.ToString() == search.FromUser);

                if (!string.IsNullOrEmpty(search.FromUserName))
                    query = query.Where(x => x.FromUserName.ToLower().Contains(search.FromUserName.Trim().ToLower()));

                if (!string.IsNullOrEmpty(search.Message))
                    query = query.Where(x => x.Message.ToLower().Contains(search.Message.Trim().ToLower()));

                if (search.FromDate != null)
                    query = query.Where(x => x.CreatedDate >= search.FromDate);

                if (search.ToDate != null)
                    query = query.Where(x => x.CreatedDate <= search.ToDate);
            }

            query = query.OrderByDescending(x => x.CreatedDate);
            return await PagedList<NotificationDto>.CreateAsync(query, search);
        }

        public async Task<PagedList<NotificationDto>> GetDataSanPham(NotificationSearch search)
        {
            var query = from q in GetQueryable().Where(x => x.LoaiThongBao == "Sản phẩm")
                        join users in _appUserRepository.GetQueryable()
                        on q.FromUser equals users.Id into userGroup
                        from user in userGroup.DefaultIfEmpty()
                        select new NotificationDto
                        {
                            Id = q.Id,
                            FromUser = q.FromUser,
                            FromUserName = user.Name ?? "",
                            ToUser = q.ToUser,
                            Message = q.Message,
                            Link = q.Link,
                            Type = q.Type,
                            DonViId = q.DonViId,
                            ItemType = q.ItemType,
                            SendToFrontEndUser = q.SendToFrontEndUser,
                            IsRead = q.IsRead,
                            CreatedDate = q.CreatedDate,
                            ItemId = q.ItemId,
                            Email = q.Email,
                            LoaiThongBao = q.LoaiThongBao,
                            ProductId = q.ProductId,
                            ProductName = q.ProductName,
                            TieuDe = q.TieuDe,
                            NoiDung = q.NoiDung,
                            FileDinhKem = q.FileDinhKem,
                            IsXuatBan = q.IsXuatBan,
                            CreatedId = q.CreatedId,
                            UpdatedId = q.UpdatedId,
                            IsDisplay = q.IsDisplay,
                            ItemName = q.ItemName,
                            IsDeleted = q.IsDeleted,
                            CreatedBy = q.CreatedBy,
                            UpdatedBy = q.UpdatedBy,
                            DeletedId = q.DeletedId,
                            UpdatedDate = q.UpdatedDate,
                            DeletedDate = q.DeletedDate,

                        };

            if (search != null)
            {
                if (!string.IsNullOrEmpty(search.ToUser))
                    query = query.Where(x => x.ToUser != null && x.ToUser.ToString() == search.ToUser);

                if (!string.IsNullOrEmpty(search.FromUser))
                    query = query.Where(x => x.FromUser != null && x.FromUser.ToString() == search.FromUser);

                if (!string.IsNullOrEmpty(search.FromUserName))
                    query = query.Where(x => x.FromUserName.ToLower().Contains(search.FromUserName.Trim().ToLower()));

                if (!string.IsNullOrEmpty(search.Message))
                    query = query.Where(x => x.Message.ToLower().Contains(search.Message.Trim().ToLower()));

                if (search.FromDate != null)
                    query = query.Where(x => x.CreatedDate >= search.FromDate);

                if (search.ToDate != null)
                    query = query.Where(x => x.CreatedDate <= search.ToDate);
            }

            query = query.OrderByDescending(x => x.CreatedDate);
            return await PagedList<NotificationDto>.CreateAsync(query, search);
        }

        public async Task MaskAsRead(Guid notiId)
        {
            var notification = await GetByIdAsync(notiId) ?? throw new Exception("Thông báo không tồn tại");

            notification.IsRead = true;

            await UpdateAsync(notification);
        }

        public async Task ClearAllNotification(Guid? userId)
        {
            var noti = await GetQueryable()
                .Where(e => e.ToUser == userId && e.IsRead != true)
                .ToListAsync();

            foreach (var item in noti)
            {
                item.IsRead = true;
                await UpdateAsync(item);
            }

        }

        public async Task<PagedList<NotificationDto>> GetNotificationUser(Guid? id, int size = 10)
        {
            var query = from q in GetQueryable()
                       .Where(x => x.ToUser == id
                           && x.LoaiThongBao != "Website"
                           && x.LoaiThongBao != "Sản phẩm"
                           && x.IsRead != true
                           )
                        join users in _appUserRepository.GetQueryable()
                        on q.FromUser equals users.Id into userGroup
                        from user in userGroup.DefaultIfEmpty()
                        select new NotificationDto
                        {
                            Id = q.Id,
                            FromUser = q.FromUser,
                            FromUserName = user.Name ?? "",
                            ToUser = q.ToUser,
                            Message = q.Message,
                            Link = q.Link,
                            Type = q.Type,
                            DonViId = q.DonViId,
                            ItemType = q.ItemType,
                            SendToFrontEndUser = q.SendToFrontEndUser,
                            IsRead = q.IsRead,
                            Email = q.Email,
                            LoaiThongBao = q.LoaiThongBao,
                            ProductId = q.ProductId,
                            ProductName = q.ProductName,
                            TieuDe = q.TieuDe,
                            NoiDung = q.NoiDung,
                            FileDinhKem = q.FileDinhKem,
                            IsXuatBan = q.IsXuatBan,
                            CreatedDate = q.CreatedDate,
                            ItemId = q.ItemId,
                            CreatedId = q.CreatedId,
                            UpdatedId = q.UpdatedId,
                            IsDisplay = q.IsDisplay,
                            ItemName = q.ItemName,
                            IsDeleted = q.IsDeleted,
                            CreatedBy = q.CreatedBy,
                            UpdatedBy = q.UpdatedBy,
                            DeletedId = q.DeletedId,
                            UpdatedDate = q.UpdatedDate,
                            DeletedDate = q.DeletedDate,
                        };
            query = query.OrderByDescending(x => x.CreatedDate);
            var search = new SearchBase
            {
                PageIndex = 1,
                PageSize = size,
            };
            return await PagedList<NotificationDto>.CreateAsync(query, search);
        }
    }
}