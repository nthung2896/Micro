export const KyQuyConstant = {
  TamLuu: 0,
  ChoDuyet: 1,
  DeNghiChinhSua: 2,
  BiTuChoi: 3,
  DaDuyetDienTu: 4,
  DaXacNhan: 5,
  CanBoSungThongTin: 6,
  DaHuyDangKy: 8,
  DaReview: 26,
  CanBanGiay: 28,
};

export const KyQuyStatusNames: { [key: number]: string } = {
  [KyQuyConstant.TamLuu]: "Tạm lưu",
  [KyQuyConstant.ChoDuyet]: "Chờ duyệt",
  [KyQuyConstant.DeNghiChinhSua]: "Đề nghị chỉnh sửa",
  [KyQuyConstant.BiTuChoi]: "Bị từ chối",
  [KyQuyConstant.DaDuyetDienTu]: "Đã duyệt điện tử",
  [KyQuyConstant.DaXacNhan]: "Đã xác nhận",
  [KyQuyConstant.CanBoSungThongTin]: "Cần bổ sung thông tin",
  [KyQuyConstant.DaHuyDangKy]: "Đã huỷ đăng ký",
  [KyQuyConstant.DaReview]: "Đã review (Trình Lãnh đạo)",
  [KyQuyConstant.CanBanGiay]: "Cần bản giấy",
};

export const KyQuyStatusColors: { [key: number]: string } = {
  [KyQuyConstant.TamLuu]: "default",
  [KyQuyConstant.ChoDuyet]: "processing",
  [KyQuyConstant.DeNghiChinhSua]: "warning",
  [KyQuyConstant.BiTuChoi]: "error",
  [KyQuyConstant.DaDuyetDienTu]: "cyan",
  [KyQuyConstant.DaXacNhan]: "success",
  [KyQuyConstant.CanBoSungThongTin]: "orange",
  [KyQuyConstant.DaHuyDangKy]: "purple",
  [KyQuyConstant.DaReview]: "blue",
  [KyQuyConstant.CanBanGiay]: "geekblue",
};
