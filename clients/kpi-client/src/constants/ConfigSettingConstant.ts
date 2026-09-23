import { createConstant } from "./Constant";

const ConfigSettingConstant = createConstant(
  {
    Url: "Url",
    UserName: "UserName",
    MatKhau: "MatKhau",
    CAUHINHHETHONG: "CAUHINHHETHONG",
  } as const,
  {
    Url: { displayName: "" },
    UserName: { displayName: "" },
    MatKhau: { displayName: "" },
    CAUHINHHETHONG: { displayName: "" },
  }
);

export default ConfigSettingConstant;
