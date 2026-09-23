export const PlatformTypeConstant = {
  TrungGian: "TrungGian",
  MangXaHoi: "MangXaHoi",
  TichHop: "TichHop",

  getDropdownList: () => [
    { label: "Nền tảng thương mại điện tử trung gian", value: "TrungGian" },
    { label: "Mạng xã hội hoạt động thương mại điện tử", value: "MangXaHoi" },
    { label: "Nền tảng thương mại điện tử tích hợp", value: "TichHop" },
  ],

  getDisplayName: (code: string) => {
    switch (code) {
      case "TrungGian": return "Nền tảng thương mại điện tử trung gian";
      case "MangXaHoi": return "Mạng xã hội hoạt động thương mại điện tử";
      case "TichHop": return "Nền tảng thương mại điện tử tích hợp";
      default: return "Chưa xác định";
    }
  }
};

export default PlatformTypeConstant;
