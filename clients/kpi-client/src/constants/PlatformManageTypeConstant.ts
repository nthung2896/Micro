import { createConstant } from "./Constant";

const PlatformManageTypeConstant = createConstant(
  {
    NTThongBaoKD: "NTThongBaoKD",
    NTDangKyKDNuocNgoai: "NTDangKyKDNuocNgoai",
    NTTichHop: "NTTichHop",
    NTTichHopNuocNgoai: "NTTichHopNuocNgoai",
  } as const,
  {
    NTThongBaoKD: { displayName: "Nền tảng TMĐT kinh doanh trực tiếp có chức năng đặt hàng trực tuyến" },
    NTDangKyKDNuocNgoai: { displayName: "Nền tảng TMĐT kinh doanh trực tiếp nước ngoài có chức năng đặt hàng trực tuyến có hoạt động TMĐT tại Việt Nam" },
    NTTichHop: { displayName: "Nền tảng TMĐT trung gian, mạng xã hội hoạt động TMĐT, nền tảng TMĐT tích hợp" },
    NTTichHopNuocNgoai: { displayName: "Nền tảng TMĐT trung gian nước ngoài, mạng xã hội hoạt động TMĐT nước ngoài, nền tảng TMĐT tích hợp nước ngoài" },
  }
);

export default PlatformManageTypeConstant;
