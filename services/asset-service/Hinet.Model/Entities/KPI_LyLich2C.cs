using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Hinet.Model.Entities
{
    [Table("KPI_LyLich2C")]
    public class KPI_LyLich2C : AuditableEntity
    {
        public Guid DonViSuDungId { get; set; }
        public Guid PhongBanId { get; set; }
        public string? ChucVuHienTai { get; set; }
        public string? MaCanBo { get; set; }
        public Guid? UserId { get; set; }
        public string HoTen { get; set; }
        public Guid? Avatar { get; set; }
        public int? GioiTinh { get; set; }
        public string? SoHieuCCVC { get; set; }
        public DateTime? NgayBoNhiem { get; set; }
        public DateTime? NgayBoNhiemLai { get; set; }
        public DateTime? Ngaysinh { get; set; }
        public string? Email { get; set; }
        public string? Status { get; set; }
        public string? TinhTrangHonNhan { get; set; }
        public string? TenKhac { get; set; }
        public string? Phone { get; set; }
        public string? LoaiHopDong { get; set; }
        public string? SoCMND { get; set; }
        public DateTime? NgayCapCMND { get; set; }
        public string? NoiCapCMND { get; set; }
        public string? NoiSinhTinh { get; set; }
        public string? NoiSinhXa { get; set; }
        public bool? IsNoiSinh { get; set; }
        public string? NoiSinh { get; set; }
        public string? QueQuanGoc { get; set; }
        public string? QueQuanTinh { get; set; }
        public string? QueQuanXa { get; set; }
        public string? QueQuan { get; set; }
        public string? DanToc { get; set; }
        public string? TonGiao { get; set; }
        public string? QuocTich { get; set; }
        public string? HoKhauThuongTru_Tinh { get; set; }
        public string? HoKhauThuongTru_Xa { get; set; }
        public string? NoiDangKyHKTT { get; set; }
        public string? NoiOHienNay_Tinh { get; set; }
        public string? NoiOHienNay_Xa { get; set; }
        public string? DiaChiHienTai { get; set; }
        public string? CoQuanTuyenDung { get; set; }
        public DateTime? NgayTuyenDung { get; set; }
        public DateTime? NVaoCoQuanHienDangCongTac { get; set; }
        public string? CongViecChinh { get; set; }
        public string? SoTruongCongTac { get; set; }
        public string? CongViecLamLauNhat { get; set; }
        public string? ChucDanh {  get; set; }
        public string? ChucDanhQuyHoach { get; set; }
        public string? LoaiHinhDaoTao { get; set; }
        public string? BoiDuongLanhDaoCapVu { get; set; }
        public string? QuanLyNN { get; set; }

        public string? TrinhDoGiaoDucPhoThong { get; set; }
        public string? TrinhDoMax { get; set; }
        public string? TrinhDo { get; set; }
        public string? ViTriViecLam { get; set; }
        public string? NoteTrinhDoCM { get; set; }
        public string? LyLuanChinhTri { get; set; }
        public string? QuanLyNhaNuoc { get; set; }
        public string? QuanLyNganh { get; set; }
        public string? TinHoc { get; set; }
        public string? ThongTinTinHoc { get; set; }
        public string? TiengAnh { get; set; }
        public string? ThongTinTiengAnh { get; set; }
        public string? NgoaiNgu { get; set; }
        public string? ThongTinNgoaiNgu { get; set; }
        public string? TiengDanToc { get; set; }
        public string? ThongTinTiengDanToc { get; set; }
        public DateTime? NgayVaoDang { get; set; }
        public DateTime? NgayVaoDangChinhThucTxt { get; set; }
        public string? NoiKetNapDang { get; set; }
        public string? ChucVuDangHienTai { get; set; }
        public string? ChiBoSinhHoatDang { get; set; }
        public string? DaiBieuHoiDongNhanDan { get; set; }
        public DateTime? NgayVaoDoan { get; set; }
        public string? NoiKetNapDoan { get; set; }
        public string? ChucVuDoan { get; set; }
        public DateTime? NgayNhapNgu { get; set; }
        public string? DanhHieuPhongTang { get; set; }
        public string? DanhHieuMax { get; set; }
        public string? HocHam { get; set; }
        public DateTime? NamPhongHocHam { get; set; }
        public DateTime? NamPhongChucDanhKhoaHoc { get; set; }
        public string? ChuyenNganhHocHam { get; set; }
        public string? ChucDanhKhoaHoc { get; set; }
        public string? LevelThuongBinh { get; set; }
        public string? LaConGiaDinhChinhSach { get; set; }
        public string? SoBaoHiemXH { get; set; }
        public string? TPhanGiaDinhXuatThan { get; set; }
        public string? TPhanBanThanXuatThan { get; set; }
        public DateTime? NgayThamGiaCachMang { get; set; }
        public string? DoiTuongChinhSach { get; set; }
        public string? Luong { get; set; }
        public string? NguonThuKhac { get; set; }
        public string? NhanXetDanhGia { get; set; }
        public DateTime? NgayKyQuyetDinh { get; set; }
        public DateTime? NgayHieuLuc { get; set; }
        public string? LyDo { get; set; }
        public string? SoQuyetDinh { get; set; }
        public string? NguoiKy { get; set; }

        // Ngạch bậc
        public DateTime? NgayHuongLuong { get; set; }
        public string? MaNgach { get; set; }
        public double? HeSoLuong { get; set; }
        public int? BacLuong { get; set; }
        public Guid? NgachCongVienChuc { get; set; }
        public Guid? IdBacLuong { get; set; }
        public string? LoaiDieuChinhLuongLyLich { get; set; }
        public string? LoaiLuong { get; set; }
        public long? SoTienLuongThoaThuan { get; set; }
        public DateTime? NgayBoNhiemChucDanh { get; set; }
        public double? PhanTramHuong { get; set; }
        public DateTime? NgayHuongPhuCapThamNienVuotKhung { get; set; }
        public double? VuotKhung { get; set; }
    }
}
