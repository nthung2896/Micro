import { createConstant } from "./Constant";

const LogLevelConstant = createConstant(
  {
    Info: "Info",
    Warning: "Warning",
    Error: "Error",
  } as const,
  {
    Info: { displayName: "Thông báo" },
    Warning: { displayName: "Cảnh báo" },
    Error: { displayName: "Lỗi" },
  }
);

export default LogLevelConstant;
