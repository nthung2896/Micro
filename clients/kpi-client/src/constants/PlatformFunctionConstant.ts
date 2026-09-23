export const PlatformFunctionConstant = {
  DatHang: "DatHang",
  Livestream: "Livestream",
  TuDongGiaoKet: "TuDongGiaoKet",
  LienLacTrucTuyen: "LienLacTrucTuyen",

  getOptions: () => [
    { label: "Nền tảng có chức năng đặt hàng trực tuyến", value: "DatHang" },
    { label: "Nền tảng có livestream bán hàng", value: "Livestream" },
    { label: "Nền tảng có tích hợp hệ thống thông tin tự động giao kết hợp đồng", value: "TuDongGiaoKet" },
    { label: "Nền tảng có chức năng liên lạc trực tuyến có tích hợp công cụ thông báo xác nhận giao kết hợp đồng hoặc các công cụ hỗ trợ giao kết hợp đồng khác", value: "LienLacTrucTuyen" },
  ],

  getDisplayNames: (codes: string) => {
    if (!codes) return [];
    const codeList = codes.split("@");
    const options = PlatformFunctionConstant.getOptions();
    return codeList.map(code => options.find(o => o.value === code)?.label).filter(Boolean);
  }
};

export default PlatformFunctionConstant;
