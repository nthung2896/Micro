import { createConstant } from "./Constant";

const ConstractStatusConstant = createConstant(
  {
    TamLuu: 0,
    ChoDuyet: 1,
    DeNghiChinhSua: 2,
    BiTuChoi: 3,
    DaDuyetDienTu: 4,
    DaXacNhan: 5,
    CanBoSungThongTin: 6,
    DaChamDutDangKy: 7,
    DaHuyDangKy: 8,
    DeNghiChamDutDangKy: 9,
    DaYeuCauGiaHan: 11,
    ChoGiaHan: 12,
    DaReview: 26,
    CanBanGiay: 28,
  } as const,
  {
    0: { displayName: "Tạm lưu", color: "#8c8c8c" },
    1: { displayName: "Chờ duyệt", color: "#0355a2" },
    2: { displayName: "Đề nghị chỉnh sửa", color: "#faad14" },
    3: { displayName: "Bị từ chối", color: "#ff4d4f" },
    4: { displayName: "Đã duyệt điện tử", color: "#52c41a" },
    5: { displayName: "Đã xác nhận", color: "#52c41a" },
    6: { displayName: "Cần bổ sung thông tin", color: "#faad14" },
    7: { displayName: "Đã chấm dứt đăng ký", color: "#d9d9d9" },
    8: { displayName: "Đã hủy đăng ký", color: "#d9d9d9" },
    9: { displayName: "Đề nghị chấm dứt đăng ký", color: "#faad14" },
    11: { displayName: "Đã yêu cầu gia hạn", color: "#13c2c2" },
    12: { displayName: "Chờ gia hạn", color: "#0355a2" },
    26: { displayName: "Đã review", color: "#52c41a" },
    28: { displayName: "Cần bản giấy", color: "#faad14" },
  },
);

export default ConstractStatusConstant;
