import { buildFileUrl } from "@/utils/file";
import { RoomListing } from "./types";

export const formatVnd = (num?: number): string => {
  if (!num && num !== 0) return "0 đ";
  return new Intl.NumberFormat("vi-VN").format(num) + " đ";
};

export const formatPriceVnd = (num?: number): string => {
  if (!num || num === 0) return "Thỏa thuận";
  if (num >= 1000000) {
    const tr = num / 1000000;
    return `${Number.isInteger(tr) ? tr : tr.toFixed(1)} triệu/tháng`;
  }
  return formatVnd(num) + "/tháng";
};

export const getProvincePriority = (label: string, code: string): number => {
  const l = (label || "").toLowerCase();
  const c = String(code || "");
  if (c === "01" || l.includes("hà nội")) return 1;
  if (c === "79" || l.includes("hồ chí minh") || l.includes("hcm")) return 2;
  if (c === "31" || l.includes("hải phòng")) return 3;
  if (c === "48" || l.includes("đà nẵng")) return 4;
  return 999;
};

export const mapPhongTroToRoom = (p: any): RoomListing => {
  const rawImg = p.hinhAnhDaiDien || p.danhSachHinhAnh?.split(/[;,]/)[0]?.trim();
  const avatar = rawImg
    ? buildFileUrl(rawImg)
    : "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=60";

  const imgList: string[] = [];
  const rawTaiLieu = p.danhSachTaiLieu;
  if (rawTaiLieu && Array.isArray(rawTaiLieu) && rawTaiLieu.length > 0) {
    rawTaiLieu.forEach((tl: any) => {
      const full = buildFileUrl(tl.duongDanFile);
      if (full && !imgList.includes(full)) imgList.push(full);
    });
  } else if (p.danhSachHinhAnh) {
    p.danhSachHinhAnh
      .split(/[;,]/)
      .map((s: string) => s.trim())
      .filter(Boolean)
      .forEach((s: string) => {
        const full = buildFileUrl(s);
        if (full && !imgList.includes(full)) imgList.push(full);
      });
  }
  if (imgList.length === 0 && avatar) {
    imgList.push(avatar);
  }

  let goiTinStr: "VIP_KIMCUONG" | "VIP_1" | "VIP_2" | "THUONG" = "THUONG";
  if (p.goiTin === 3) goiTinStr = "VIP_KIMCUONG";
  else if (p.goiTin === 2) goiTinStr = "VIP_2";
  else if (p.goiTin === 1) goiTinStr = "VIP_1";

  // Lọc địa chỉ tránh trùng lặp
  const parts: string[] = [];
  if (p.diaChi) parts.push(p.diaChi);
  if (p.tenXa && !p.diaChi?.toLowerCase().includes(p.tenXa.toLowerCase())) parts.push(p.tenXa);
  if (p.tenHuyen && !p.diaChi?.toLowerCase().includes(p.tenHuyen.toLowerCase())) parts.push(p.tenHuyen);
  if (p.tenTinh && !p.diaChi?.toLowerCase().includes(p.tenTinh.toLowerCase())) parts.push(p.tenTinh);
  const fullDiaChi = parts.length > 0 ? parts.join(", ") : "Quận Cầu Giấy, Thành phố Hà Nội";

  return {
    id: p.id,
    tieuDe: p.tieuDe || "Phòng trọ tiện nghi, sạch sẽ",
    maPhong: p.maPhong,
    loaiPhong: p.loaiPhong || "Phòng trọ",
    diaChi: fullDiaChi,
    tenTinh: p.tenTinh || "Thành phố Hà Nội",
    maTinh: p.maTinh || "01",
    tenHuyen: p.tenHuyen || "Quận Cầu Giấy",
    maHuyen: p.maHuyen || "005",
    tenXa: p.tenXa || "",
    maXa: p.maXa || "",
    dienTich: p.dienTich || 25,
    giaChoThue: p.giaChoThue || 0,
    tienCoc: p.tienCoc || 0,
    giaDien: p.giaDien || 3800,
    donViDien: p.donViDien || "Số",
    giaNuoc: p.giaNuoc || 30000,
    donViNuoc: p.donViNuoc || "Khối",
    giaInternet: p.giaInternet || 100000,
    donViInternet: p.donViInternet || "Phòng",
    giaDichVuChung: p.giaDichVuChung || 50000,
    donViDichVuChung: p.donViDichVuChung || "Người",
    giaGuiXe: p.giaGuiXe || 0,
    giaVeSinh: p.giaVeSinh || 0,
    gioGiacTuDo: p.gioGiacTuDo ?? true,
    coMayGiat: p.coMayGiat ?? false,
    coDieuHoa: p.coDieuHoa ?? true,
    coNongLanh: p.coNongLanh ?? true,
    coTuLanh: p.coTuLanh ?? false,
    coGiuongTu: p.coGiuongTu ?? true,
    coKeBep: p.coKeBep ?? true,
    coBanCong: p.coBanCong ?? false,
    coThangMay: p.coThangMay ?? false,
    khongChungChu: p.khongChungChu ?? true,
    coChoDeXe: p.coChoDeXe ?? true,
    coKhoaVanTay: p.coKhoaVanTay ?? false,
    quyDinhGioGiac: p.quyDinhGioGiac || "",
    tienNghiKhac: p.tienNghiKhac || "",
    hinhAnhDaiDien: avatar,
    danhSachHinhAnh: imgList,
    tenLienHe: p.tenLienHe || "Chủ nhà",
    soDienThoaiLienHe: p.soDienThoaiLienHe || "0869590916",
    zaloLienHe: p.zaloLienHe || p.soDienThoaiLienHe || "0869590916",
    goiTin: goiTinStr,
    isNoiBat: !!p.isNoiBat || p.goiTin === 3 || p.goiTin === 1,
    ngayDang: p.createdDate ? new Date(p.createdDate).toLocaleDateString("vi-VN") : "Hôm nay",
    luotXem: p.luotXem || 0,
    moTa: p.moTa || "",
    quyDinh: p.quyDinh || "",
  };
};
