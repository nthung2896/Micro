using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Hinet.Service.Constant
{
    public class DanhMucConstantBase
    {
        public static string QuocGia = "QUOCGIA";

        public static string ChucVu = "CHUCVUVNU";

        public static string NEWS_STATUS = "NEWS_STATUS";

        public static string DOCUMENT_LEGAL_STATUS = "DOCUMENT_LEGAL_STATUS";

        public static string DOCUMENT_DATA_STATUS = "DOCUMENT_DATA_STATUS";

        public static string VietNam = "VN";

        public static string ChucVuDang = "CHUCVUDANG";

        public static string DM_NGHIENCUKHOAHOC = "DM_NGHIENCUKHOAHOC";

        public static string PRODUCT_TYPE = "PRODUCT_TYPE";

        public static string DM_NHANSUDIHOC = "DM_NHANSUDIHOC";

        public static string LinhVuc = "LinhVuc";

        public static string TYPEVBPQ = "TYPEVBPQ";

        public static string DonViKetNoi = "DonViKetNoi";

        public static string DM_LoaiDonXinDiHoc = "DM_LoaiDonXinDiHoc";

        public static string DM_LoaiThoiGianDaoTao = "DM_LoaiThoiGianDaoTao";

        //Lý lịch
        public static string DM_HinhThucHuong = "DM_HinhThucHuong";

        public static string DM_LoaiPhuCap = "DM_LoaiPhuCap";

        public static string GioiTinh = "GIOITINH";

        public static string TTHN = "TTHN";

        public static string ChucVuDoan = "THAMGIADOANTN";

        public static string GDPT = "GDPT";

        public static string CHUCDANHKHOAHOC = "CHUCDANHKHOAHOC";

        public static string CHUYENNGANHDAOTAO = "CHUYENNGANHDAOTAO";

        public static string LoaiHoSo = "LOAIHOSO";

        public static string DanToc = "DM_DanToc";

        public static string TONGIAO = "TONGIAO_V2"; //Mã cũ: TONGIAO

        public static string BANGCAP = "BANGCAP";

        public static string GIADINHCHINHSACH = "GIADINHCHINHSACH";

        public static string NHOMMAU = "NHOMMAU";

        public static string TRINHDOMAX = "TRINHDOMAX";

        public static string ToChucChinhTriXaHoi = "ToChucChinhTriXaHoi";

        public static string LYLUANCT = "LYLUANCT";

        public static string QUANLYNHANUOC = "QUANLYNHANUOC";

        public static string LOAI_DANHMUC_ANPHAM = "LOAI_DANHMUC_ANPHAM";
        public static string LOAITRUC = "LOAITRUC";
        public static string LOAIBAOTRUC = "LOAIBAOTRUC";
        public static string LOAITRUCDIENTU = "LOAITRUCDIENTU";
        public static string THOIHANHOPDONG = "THOIHANHOPDONG";
        public static string THOIHANTHUVIEC = "THOIHANTHUVIEC";

        //public static string CHUCVU = "CHUCVU";
        public static string DanhHieuKhenThuong = "DANHHIEUKHENTHUONG";
        public static string HinhThucKhenThuong = "HinhThucKhenThuong";
        public static string TypeKhenThuong = "TypeKhenThuong";
        public static string HINHTHUCKYLUAT = "HINHTHUCKYLUAT";

        public static string TRANGTHAITAISAN = "TRANGTHAITAISAN";
        public static string DMHOSO = "DMHOSO";

        public static string TIEUCHIUNGVIEN = "TIEUCHIUNGVIEN";
        public static string VITRITUYENDUNG = "VITRITUYENDUNG";

        public static string DM_QUANHAM = "DM_QUANHAM";
        public static string NhomCongChucVienChuc = "NHOMCONGCHUCVIENCHUC";
        public static string DM_NHAO = "DM_NHAO";
        public static string TrinhDoQuanLyNhaNuoc = "TrinhDoQuanLyNhaNuoc";
        public static string DM_MucDanhGiaKienThucKyNang = "DM_MucDanhGiaKienThucKyNang";

        #region Danh mục hệ bác sĩ
        public static string HEBACSI = "HEBACSI";
        public static string HECUNHAN = "HECUNHAN";
        public static string BSNOITRU = "BSNOITRU";
        public static string VITRIKHAC = "VITRIKHAC";

        #endregion

        #region Danh mục hiển thị chức danh
        public static string DM_CHUCDANH_HIENTHI { get; set; } = "DM_CHUCDANH_HIENTHI";
        #endregion

        #region Bảng Danh muc hệ thống cũ
        //Mã cũ là những mà danh mục cũ
        public const string DM_DanToc = "DM_DANTOC_V2"; //Mã cũ: DM_DanToc
        public const string DM_NoiCapCMND = "DM_NoiCapCMND";
        public const string DM_HocHam = "DM_HocHam";
        public const string DM_HocVi = "DM_HocVi";
        public const string DM_ChucVu = "DM_ChucVu";
        public const string DM_DHPhongTang = "DM_DHPhongTang";
        public const string DM_DoiTuongChinhSach = "DM_DoiTuongChinhSach";
        public const string DM_ChucDanhChuyenMon = "DM_ChucDanhChuyenMon";
        public const string DM_LoaiQuyetDinh = "DM_LoaiQuyetDinh";

        public const string DM_CoQuanBanHanh = "DM_CoQuanBanHanh";
        public const string DM_ToChucChinhTri = "DM_ToChucChinhTri";

        public const string DM_NoiDung = "DM_NoiDung";
        public const string DM_NhomNgachLuong = "DM_NhomNgachLuong";
        public const string DM_QuanHeGiaDinh = "DM_QuanHeGiaDinh";

        public const string DM_QuanHam = "DM_QuanHam";

        public const string DM_MOIQUANHE = "DM_MOIQUANHE";
        public const string TrinhDoLyLuanChinhTri = "TrinhDoLyLuanChinhTri";

        public const string DM_HinhThucDaoTao = "DM_HinhThucDaoTao";
        //public const string DM_ChuyenNganhDaoTao = "DM_ChuyenNganhDaoTao";

        public const string DM_VanBang = "DM_VanBang";
        public const string DM_LoaiVanBang = "DM_LoaiVanBang";
        public const string DM_TruongDaoTao = "DM_TruongDaoTao";
        public const string DM_LopHoc = "DM_LopHoc";
        public const string DM_XepLoai = "DM_XepLoai";

        public const string DM_HinhThucKhenThuongKyLuat = "DM_HinhThucKhenThuongKyLuat";
        public const string DM_HinhThucToChucKhenThuong = "DM_HinhThucToChucKhenThuong";
        public const string DM_DanhGiaCanBo = "DM_DanhGiaCanBo";
        public const string DM_DanhHieuThiDua = "DM_DanhHieuThiDua";
        public const string DM_ChucVuTuongDuong = "DM_ChucVuTuongDuong";
        public const string DM_NhomKhenThuong = "DM_NhomKhenThuong";
        #endregion

        #region
        public static string LOAIVONGTUYENDUNG = "LOAIVONGTUYENDUNG";
        #endregion

        public static string DM_NGHIDINH = "DM_NGHIDINH";

        public static string DM_TINHOC = "TrinhDoTinHoc";
        public static string TINHTRANGSUCKHOE = "TINHTRANGSUCKHOE";
        public static string DM_TIENGANH = "DM_TIENGANH";
        public static string DM_NGOAINGUKHAC = "DM_NGOAINGUKHAC";
        public static string NGOAINGU = "NGOAINGU";

        public static string DM_TENTRUONGGIAYTOBONHIEM = "DM_TENTRUONGGIAYTOBONHIEM";



        //23/05
        public static string DM_NHOMQUYHOACH = "DM_NHOMQUYHOACH";
        public static string DM_NHOMDANHGIA = "DM_NHOMDANHGIA";



        //29/05/2023
        public static string DM_LyDoNghiViec = "DM_LyDoNghiViec";                   //19
        public static string DM_LyDoGianDoan = "DM_LyDoGianDoan";                   //20
        public static string DM_ThanhPhanGiaDinh = "DM_ThanhPhanGiaDinh";           //24
        public static string DM_LoaiDieuChinhLuong = "DM_LoaiDieuChinhLuong";       //25
        public static string DM_HinhThucKhenThuong = "DM_HinhThucKhenThuong";       //27
        public static string DM_TiengDanToc = "DM_TiengDanToc";                     //28
        public static string DM_DanhHieuPhongTang = "DM_DanhHieuPhongTang";         //29
        public static string DM_LoaiKhenThuongKyLuat = "DM_LoaiKhenThuongKyLuat";   //32
        public static string DM_LoaiDonViCongTac = "DM_LoaiDonViCongTac";           //33
        public static string DM_NganhDaoTao = "DM_NganhDaoTao";                     //34




        // Thêm mới hộ toàn
        public static string DM_KETQUADANHGIA = "KETQUADANHGIA";


        public static string KQDG_XEPLOAI_CHATLUONG = "KQDG_XEPLOAI_CHATLUONG";



        public static string DM_LOAIHOSO = "LOAIHOSO";
        public static string DM_TRINHDODAOTAO = "TRINHDODAOTAO";
        public static string DM_CHUCVUNEW = "CHUCVU";
        public static string DM_CHUYENNGANHDAOTAO = "CHUYENNGANHDAOTAO";

        public static string DM_NhiemVu = "DM_NhiemVu";

        public static string DM_LoaiDaoTao = "DM_LoaiDaoTao";
        public static string CHUCVUBOTHONGTIN = "CHUCVUBOTHONGTIN";
        public static string CHUCVU = "CHUCVUVNU";
        public static string DM_LOAIHINHBONHIEM = "DM_LOAIHINHBONHIEM";
        public static string COSOBNV = "COSOBNV";
        public static string DM_THOIVIEC = "DM_THOIVIEC";
        public static string CoSoDaoTao = "COSODAOTAO_V2";


        public static string APIDONGBO = "APIDONGBO";

        // Chấm công
        public static string DM_LoaiChamCong = "DM_LoaiChamCong";
        public static string DM_ThoiGianChamCong = "DM_ThoiGianChamCong";

        // Loại cảnh báo
        public static string DM_LoaiCanhBao { get; set; } = "DM_LoaiCanhBao";
        public static string TRINHDOPHUCVUNANGLUONG { get; set; } = "TRINHDOPHUCVUNANGLUONG";
        public static string DM_CauThanhTNTT { get; set; } = "DM_CauThanhTNTT";
        public static string DM_NhomBoNhiem { get; set; } = "DM_NhomBoNhiem";
        public static string CHUCVUVNU { get; set; } = "CHUCVUVNU";

        // Trạng thái tự đánh giá
        public static string TrangThaiDanhGiaPhieuDanhGia = "TrangThaiDanhGiaPhieuDanhGia";
        public static string TrangThaiHocViec = "TrangThaiHocViec";




        public static string DOITUONGTIEPNHANVIENCHUC = "DOITUONGTIEPNHANVIENCHUC";
    }
}
