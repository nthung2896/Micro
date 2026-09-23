import { createConstant } from "./Constant";

const TaiLieuConstant = createConstant(
  {
    UploadConfigStep: "UploadConfigStep",
    UploadConfigKey: "UploadConfigKey",
    MauCO: "MauCO",
  } as const,
  {
    UploadConfigStep: { displayName: "" },
    UploadConfigKey: { displayName: "" },
    MauCO: { displayName: "" },
  }
);

export default TaiLieuConstant;
