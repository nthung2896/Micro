using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Hinet.Model.Entities;
using Hinet.Repository.Room_ViTienRepository;
using Hinet.Repository.Room_GiaoDichNapTienRepository;
using Hinet.Repository.Room_LichSuThanhToanRepository;
using Hinet.Repository.Room_CauHinhKhuyenMaiNapRepository;
using Hinet.Repository.Room_ThongTinNganHangRepository;
using Hinet.Repository.PhongTroRepository;
using Hinet.Repository.AppUserRepository;
using Hinet.Service.Common.Service;
using Hinet.Service.ViTienService.Dto;

namespace Hinet.Service.ViTienService
{
    public class ViTienService : Service<Room_ViTien>, IViTienService
    {
        private readonly IRoom_ViTienRepository _viTienRepo;
        private readonly IRoom_GiaoDichNapTienRepository _giaoDichNapRepo;
        private readonly IRoom_LichSuThanhToanRepository _lichSuThanhToanRepo;
        private readonly IRoom_CauHinhKhuyenMaiNapRepository _khuyenMaiRepo;
        private readonly IRoom_ThongTinNganHangRepository _nganHangRepo;
        private readonly IPhongTroRepository _phongTroRepo;
        private readonly IAppUserRepository _userRepo;

        public ViTienService(
            IRoom_ViTienRepository viTienRepo,
            IRoom_GiaoDichNapTienRepository giaoDichNapRepo,
            IRoom_LichSuThanhToanRepository lichSuThanhToanRepo,
            IRoom_CauHinhKhuyenMaiNapRepository khuyenMaiRepo,
            IRoom_ThongTinNganHangRepository nganHangRepo,
            IPhongTroRepository phongTroRepo,
            IAppUserRepository userRepo
        ) : base(viTienRepo)
        {
            _viTienRepo = viTienRepo;
            _giaoDichNapRepo = giaoDichNapRepo;
            _lichSuThanhToanRepo = lichSuThanhToanRepo;
            _khuyenMaiRepo = khuyenMaiRepo;
            _nganHangRepo = nganHangRepo;
            _phongTroRepo = phongTroRepo;
            _userRepo = userRepo;
        }

        public async Task<ViTienDto> GetThongTinVi(Guid userId)
        {
            var wallet = await _viTienRepo.GetQueryable().FirstOrDefaultAsync(x => x.UserId == userId && !x.IsDeleted);
            if (wallet == null)
            {
                wallet = new Room_ViTien
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    SoDuChinh = 0,
                    SoDuKhuyenMai = 0,
                    TongNap = 0,
                    TongChi = 0,
                    HangThanhVien = 1,
                    TrangThai = 1,
                    CreatedDate = DateTime.Now,
                    UpdatedDate = DateTime.Now
                };
                _viTienRepo.Add(wallet);
                await _viTienRepo.SaveAsync();
            }

            var user = await _userRepo.GetQueryable().FirstOrDefaultAsync(x => x.Id == userId);

            return new ViTienDto
            {
                Id = wallet.Id,
                UserId = wallet.UserId,
                SoDuChinh = wallet.SoDuChinh,
                SoDuKhuyenMai = wallet.SoDuKhuyenMai,
                TongNap = wallet.TongNap,
                TongChi = wallet.TongChi,
                HangThanhVien = wallet.HangThanhVien,
                TrangThai = wallet.TrangThai,
                UserName = user?.UserName,
                FullName = user?.Name,
                PhoneNumber = user?.PhoneNumber
            };
        }

        public async Task<GiaoDichNapTienDto> TaoYeuCauNap(TaoYeuCauNapRequest request, Guid userId)
        {
            if (request.SoTienNap <= 0)
            {
                throw new ArgumentException("Số tiền nạp phải lớn hơn 0");
            }

            // 1. Tính tiền khuyến mãi
            decimal tienKhuyenMai = 0;

            // Kiểm tra nạp lần đầu: nếu chưa có giao dịch nào thành công
            bool hasSuccessDeposit = await _giaoDichNapRepo.GetQueryable()
                .AnyAsync(x => x.UserId == userId && x.TrangThai == 1 && !x.IsDeleted);

            var activePromos = await _khuyenMaiRepo.GetQueryable()
                .Where(x => x.IsActive && !x.IsDeleted)
                .OrderBy(x => x.ThuTu)
                .ToListAsync();

            if (!hasSuccessDeposit)
            {
                // Tìm ưu đãi nạp lần đầu
                var firstPromo = activePromos.FirstOrDefault(x => x.LoaiKhuyenMai == 1 && request.SoTienNap >= x.MucNapToiThieu);
                if (firstPromo != null)
                {
                    tienKhuyenMai += firstPromo.TienThuongCoDinh;
                    if (firstPromo.PhanTramKhuyenMai > 0)
                    {
                        tienKhuyenMai += request.SoTienNap * (firstPromo.PhanTramKhuyenMai / 100);
                    }
                }
            }

            // Bậc thang nạp tiền (tặng 10%, 15%, 25%, 30%)
            var tierPromo = activePromos.FirstOrDefault(x => x.LoaiKhuyenMai == 2
                && request.SoTienNap >= x.MucNapToiThieu
                && (!x.MucNapToiDa.HasValue || request.SoTienNap <= x.MucNapToiDa.Value));

            if (tierPromo != null && tierPromo.PhanTramKhuyenMai > 0)
            {
                tienKhuyenMai += request.SoTienNap * (tierPromo.PhanTramKhuyenMai / 100);
            }

            decimal tongNhan = request.SoTienNap + tienKhuyenMai;

            // 2. Sinh mã giao dịch duy nhất
            string dateStr = DateTime.Now.ToString("yyMMdd");
            string randomCode = new Random().Next(1000, 9999).ToString();
            string maGiaoDich = $"NAP{dateStr}{randomCode}";

            // Lấy mã tài khoản hoặc SĐT làm nội dung chuyển khoản
            var user = await _userRepo.GetQueryable().FirstOrDefaultAsync(x => x.Id == userId);
            string userRef = user?.PhoneNumber ?? user?.UserName ?? userId.ToString().Substring(0, 6);
            string noiDungCK = $"NAP {userRef} {randomCode}";

            var giaoDich = new Room_GiaoDichNapTien
            {
                Id = Guid.NewGuid(),
                MaGiaoDich = maGiaoDich,
                UserId = userId,
                SoTienNap = request.SoTienNap,
                TienKhuyenMai = tienKhuyenMai,
                TongNhan = tongNhan,
                PhuongThuc = request.PhuongThuc ?? "VIETQR",
                NoiDungChuyenKhoan = noiDungCK,
                TrangThai = 0, // Chờ thanh toán
                GhiChu = request.GhiChu,
                CreatedDate = DateTime.Now,
                UpdatedDate = DateTime.Now
            };

            _giaoDichNapRepo.Add(giaoDich);
            await _giaoDichNapRepo.SaveAsync();

            // 3. Tạo link VietQR chuẩn
            var bank = await GetThongTinNganHangDefault();
            string qrUrl = string.Empty;
            if (bank != null)
            {
                string bankCode = bank.NganHangCode;
                string accountNo = bank.SoTaiKhoan;
                string accountName = Uri.EscapeDataString(bank.ChuTaiKhoan);
                string encodedMemo = Uri.EscapeDataString(noiDungCK);
                qrUrl = $"https://img.vietqr.io/image/{bankCode}-{accountNo}-compact2.png?amount={(long)request.SoTienNap}&addInfo={encodedMemo}&accountName={accountName}";
            }

            return new GiaoDichNapTienDto
            {
                Id = giaoDich.Id,
                MaGiaoDich = giaoDich.MaGiaoDich,
                UserId = giaoDich.UserId,
                UserName = user?.UserName,
                FullName = user?.Name,
                SoTienNap = giaoDich.SoTienNap,
                TienKhuyenMai = giaoDich.TienKhuyenMai,
                TongNhan = giaoDich.TongNhan,
                PhuongThuc = giaoDich.PhuongThuc,
                NoiDungChuyenKhoan = giaoDich.NoiDungChuyenKhoan,
                TrangThai = giaoDich.TrangThai,
                QrCodeUrl = qrUrl,
                CreatedDate = giaoDich.CreatedDate
            };
        }

        public async Task<bool> XacNhanNapTien(string maGiaoDich, Guid? adminId = null, string? adminName = null)
        {
            var gd = await _giaoDichNapRepo.GetQueryable().FirstOrDefaultAsync(x => x.MaGiaoDich == maGiaoDich && !x.IsDeleted);
            if (gd == null) return false;
            if (gd.TrangThai == 1) return true; // Đã thanh toán rồi

            gd.TrangThai = 1;
            gd.ThoiGianThanhToan = DateTime.Now;
            gd.NguoiDuyetId = adminId;
            gd.NguoiDuyetName = adminName ?? "Hệ thống tự động";
            gd.UpdatedDate = DateTime.Now;
            _giaoDichNapRepo.Update(gd);

            // Cập nhật số dư ví
            var wallet = await _viTienRepo.GetQueryable().FirstOrDefaultAsync(x => x.UserId == gd.UserId && !x.IsDeleted);
            if (wallet == null)
            {
                wallet = new Room_ViTien
                {
                    Id = Guid.NewGuid(),
                    UserId = gd.UserId,
                    SoDuChinh = 0,
                    SoDuKhuyenMai = 0,
                    TongNap = 0,
                    TongChi = 0,
                    HangThanhVien = 1,
                    TrangThai = 1,
                    CreatedDate = DateTime.Now
                };
                _viTienRepo.Add(wallet);
            }

            decimal sdChinhTruoc = wallet.SoDuChinh;
            decimal sdKmTruoc = wallet.SoDuKhuyenMai;

            wallet.SoDuChinh += gd.SoTienNap;
            wallet.SoDuKhuyenMai += gd.TienKhuyenMai;
            wallet.TongNap += gd.SoTienNap;
            wallet.UpdatedDate = DateTime.Now;

            // Nâng hạng thành viên
            if (wallet.TongNap >= 10000000) wallet.HangThanhVien = 4; // Kim Cương
            else if (wallet.TongNap >= 5000000) wallet.HangThanhVien = 3; // Vàng
            else if (wallet.TongNap >= 2000000) wallet.HangThanhVien = 2; // Bạc

            _viTienRepo.Update(wallet);

            // Ghi nhận lịch sử thanh toán (Nạp tiền)
            var logNap = new Room_LichSuThanhToan
            {
                Id = Guid.NewGuid(),
                MaGiaoDich = gd.MaGiaoDich,
                UserId = gd.UserId,
                LoaiGiaoDich = 1, // Nạp tiền
                SoTien = gd.SoTienNap,
                SoDuChinhTruoc = sdChinhTruoc,
                SoDuChinhSau = wallet.SoDuChinh,
                SoDuKmTruoc = sdKmTruoc,
                SoDuKmSau = wallet.SoDuKhuyenMai,
                NguonTien = 1,
                NoiDung = $"Nạp tiền vào tài khoản thành công qua {gd.PhuongThuc}",
                TrangThai = 1,
                CreatedDate = DateTime.Now
            };
            _lichSuThanhToanRepo.Add(logNap);

            // Ghi nhận lịch sử khuyến mãi (nếu có)
            if (gd.TienKhuyenMai > 0)
            {
                var logKm = new Room_LichSuThanhToan
                {
                    Id = Guid.NewGuid(),
                    MaGiaoDich = $"KM{DateTime.Now:yyMMdd}{new Random().Next(1000, 9999)}",
                    UserId = gd.UserId,
                    LoaiGiaoDich = 2, // Thưởng khuyến mãi
                    SoTien = gd.TienKhuyenMai,
                    SoDuChinhTruoc = wallet.SoDuChinh,
                    SoDuChinhSau = wallet.SoDuChinh,
                    SoDuKmTruoc = sdKmTruoc,
                    SoDuKmSau = wallet.SoDuKhuyenMai,
                    NguonTien = 2,
                    NoiDung = $"Thưởng khuyến mãi {gd.TienKhuyenMai:N0}đ cho giao dịch nạp tiền #{gd.MaGiaoDich}",
                    TrangThai = 1,
                    CreatedDate = DateTime.Now.AddSeconds(1)
                };
                _lichSuThanhToanRepo.Add(logKm);
            }

            await _viTienRepo.SaveAsync();
            return true;
        }

        public async Task<KetQuaThanhToanDto> ThanhToanDichVu(ThanhToanDichVuRequest request, Guid userId)
        {
            var wallet = await _viTienRepo.GetQueryable().FirstOrDefaultAsync(x => x.UserId == userId && !x.IsDeleted);
            if (wallet == null || (wallet.SoDuChinh + wallet.SoDuKhuyenMai) < request.SoTien)
            {
                decimal currentTotal = wallet != null ? (wallet.SoDuChinh + wallet.SoDuKhuyenMai) : 0;
                return new KetQuaThanhToanDto
                {
                    Success = false,
                    Message = $"Số dư tài khoản ({currentTotal:N0}đ) không đủ để thanh toán ({request.SoTien:N0}đ). Vui lòng nạp thêm tiền!",
                    SoDuConLai = currentTotal
                };
            }

            var phongTro = await _phongTroRepo.GetQueryable().FirstOrDefaultAsync(x => x.Id == request.PhongTroId && !x.IsDeleted);
            if (phongTro == null)
            {
                return new KetQuaThanhToanDto
                {
                    Success = false,
                    Message = "Không tìm thấy tin đăng phòng trọ tương ứng.",
                    SoDuConLai = wallet.SoDuChinh + wallet.SoDuKhuyenMai
                };
            }

            decimal sdChinhTruoc = wallet.SoDuChinh;
            decimal sdKmTruoc = wallet.SoDuKhuyenMai;

            // Quy tắc trừ tiền: ưu tiên trừ tài khoản khuyến mãi trước, sau đó trừ tài khoản chính
            decimal deductKm = Math.Min(wallet.SoDuKhuyenMai, request.SoTien);
            decimal deductChinh = request.SoTien - deductKm;

            wallet.SoDuKhuyenMai -= deductKm;
            wallet.SoDuChinh -= deductChinh;
            wallet.TongChi += request.SoTien;
            wallet.UpdatedDate = DateTime.Now;
            _viTienRepo.Update(wallet);

            // Cập nhật dịch vụ phòng trọ
            string tenDichVu = "Dịch vụ phòng trọ";
            int nguonTien = (deductKm > 0 && deductChinh > 0) ? 3 : (deductKm > 0 ? 2 : 1);

            switch (request.LoaiDichVu)
            {
                case 1: // Nâng VIP
                    int goi = request.GoiTin ?? 1;
                    phongTro.GoiTin = goi;
                    phongTro.IsNoiBat = true;
                    if (request.SoNgay.HasValue && request.SoNgay.Value > 0)
                    {
                        var baseDate = phongTro.NgayHetHan.HasValue && phongTro.NgayHetHan.Value > DateTime.Now
                            ? phongTro.NgayHetHan.Value
                            : DateTime.Now;
                        phongTro.NgayHetHan = baseDate.AddDays(request.SoNgay.Value);
                        phongTro.TrangThaiDuyet = 1;
                    }
                    tenDichVu = $"Nâng cấp tin VIP {(goi == 3 ? "Nổi bật" : (goi == 2 ? "VIP 2" : "VIP 1"))} ({request.SoNgay ?? 30} ngày)";
                    break;

                case 2: // Đẩy tin
                    phongTro.NgayDayTin = DateTime.Now;
                    phongTro.SoLuotDayTin = phongTro.SoLuotDayTin + 1;
                    tenDichVu = "Đẩy tin lên đầu trang";
                    break;

                case 3: // Thêm ngày (Gia hạn)
                    int addDays = request.SoNgay ?? 7;
                    var startGiaHan = phongTro.NgayHetHan.HasValue && phongTro.NgayHetHan.Value > DateTime.Now
                        ? phongTro.NgayHetHan.Value
                        : DateTime.Now;
                    phongTro.NgayHetHan = startGiaHan.AddDays(addDays);
                    phongTro.TrangThaiDuyet = 1;
                    tenDichVu = $"Gia hạn thời gian hiển thị (+{addDays} ngày)";
                    break;
            }

            phongTro.UpdatedDate = DateTime.Now;
            _phongTroRepo.Update(phongTro);

            // Ghi nhật ký lịch sử thanh toán
            string maGiaoDich = $"PAY{DateTime.Now:yyMMdd}{new Random().Next(1000, 9999)}";
            var logThanhToan = new Room_LichSuThanhToan
            {
                Id = Guid.NewGuid(),
                MaGiaoDich = maGiaoDich,
                UserId = userId,
                LoaiGiaoDich = 3, // Thanh toán dịch vụ
                LoaiDichVu = request.LoaiDichVu,
                PhongTroId = phongTro.Id,
                MaTin = phongTro.MaPhong ?? phongTro.Id.ToString().Substring(0, 8),
                TieuDeTin = phongTro.TieuDe,
                SoTien = -request.SoTien, // Số âm thể hiện trừ tiền
                SoDuChinhTruoc = sdChinhTruoc,
                SoDuChinhSau = wallet.SoDuChinh,
                SoDuKmTruoc = sdKmTruoc,
                SoDuKmSau = wallet.SoDuKhuyenMai,
                NguonTien = nguonTien,
                NoiDung = request.MoTa ?? $"{tenDichVu} cho tin #{phongTro.MaPhong ?? phongTro.Id.ToString().Substring(0, 8)}",
                TrangThai = 1,
                CreatedDate = DateTime.Now
            };

            _lichSuThanhToanRepo.Add(logThanhToan);
            await _viTienRepo.SaveAsync();

            return new KetQuaThanhToanDto
            {
                Success = true,
                Message = $"Thanh toán thành công {request.SoTien:N0}đ cho {tenDichVu}!",
                SoDuConLai = wallet.SoDuChinh + wallet.SoDuKhuyenMai,
                MaGiaoDich = maGiaoDich
            };
        }

        public async Task<List<GiaoDichNapTienDto>> GetLichSuNapTien(Guid userId, int? trangThai = null)
        {
            var query = _giaoDichNapRepo.GetQueryable()
                .Where(x => x.UserId == userId && !x.IsDeleted);

            if (trangThai.HasValue)
            {
                query = query.Where(x => x.TrangThai == trangThai.Value);
            }

            var list = await query.OrderByDescending(x => x.CreatedDate).ToListAsync();
            var bank = await GetThongTinNganHangDefault();

            return list.Select(x =>
            {
                string qrUrl = string.Empty;
                if (bank != null && x.TrangThai == 0)
                {
                    string encodedMemo = Uri.EscapeDataString(x.NoiDungChuyenKhoan);
                    string accountName = Uri.EscapeDataString(bank.ChuTaiKhoan);
                    qrUrl = $"https://img.vietqr.io/image/{bank.NganHangCode}-{bank.SoTaiKhoan}-compact2.png?amount={(long)x.SoTienNap}&addInfo={encodedMemo}&accountName={accountName}";
                }

                return new GiaoDichNapTienDto
                {
                    Id = x.Id,
                    MaGiaoDich = x.MaGiaoDich,
                    UserId = x.UserId,
                    SoTienNap = x.SoTienNap,
                    TienKhuyenMai = x.TienKhuyenMai,
                    TongNhan = x.TongNhan,
                    PhuongThuc = x.PhuongThuc,
                    NoiDungChuyenKhoan = x.NoiDungChuyenKhoan,
                    TrangThai = x.TrangThai,
                    MaGiaoDichDoiTac = x.MaGiaoDichDoiTac,
                    ThoiGianThanhToan = x.ThoiGianThanhToan,
                    GhiChu = x.GhiChu,
                    QrCodeUrl = qrUrl,
                    CreatedDate = x.CreatedDate
                };
            }).ToList();
        }

        public async Task<List<LichSuThanhToanDto>> GetLichSuThanhToan(Guid userId)
        {
            var list = await _lichSuThanhToanRepo.GetQueryable()
                .Where(x => x.UserId == userId && !x.IsDeleted)
                .OrderByDescending(x => x.CreatedDate)
                .ToListAsync();

            return list.Select(x => new LichSuThanhToanDto
            {
                Id = x.Id,
                MaGiaoDich = x.MaGiaoDich,
                UserId = x.UserId,
                LoaiGiaoDich = x.LoaiGiaoDich,
                LoaiDichVu = x.LoaiDichVu,
                PhongTroId = x.PhongTroId,
                MaTin = x.MaTin,
                TieuDeTin = x.TieuDeTin,
                SoTien = x.SoTien,
                SoDuChinhTruoc = x.SoDuChinhTruoc,
                SoDuChinhSau = x.SoDuChinhSau,
                SoDuKmTruoc = x.SoDuKmTruoc,
                SoDuKmSau = x.SoDuKmSau,
                NguonTien = x.NguonTien,
                NoiDung = x.NoiDung,
                TrangThai = x.TrangThai,
                CreatedDate = x.CreatedDate
            }).ToList();
        }

        public async Task<List<Room_CauHinhKhuyenMaiNap>> GetDanhSachKhuyenMai()
        {
            return await _khuyenMaiRepo.GetQueryable()
                .Where(x => x.IsActive && !x.IsDeleted)
                .OrderBy(x => x.ThuTu)
                .ToListAsync();
        }

        public async Task<Room_ThongTinNganHang?> GetThongTinNganHangDefault()
        {
            return await _nganHangRepo.GetQueryable()
                .FirstOrDefaultAsync(x => x.IsDefault && x.IsActive && !x.IsDeleted)
                ?? await _nganHangRepo.GetQueryable().FirstOrDefaultAsync(x => x.IsActive && !x.IsDeleted);
        }
    }
}
