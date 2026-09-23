import { createConstant } from "./Constant";

const TypeNhiemVuConstant = createConstant(
  {
    PHATSINH: "PHATSINH",
    HETHONG: "HETHONG",
  } as const,
  {
    PHATSINH: { displayName: "Phát sinh", color: "#1890ff" },
    HETHONG: { displayName: "Hệ thống", color: "#52c41a" },
  }
);

export default TypeNhiemVuConstant;
