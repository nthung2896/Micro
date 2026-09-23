import { createConstant } from "./Constant";

const FileSettingConstant = createConstant(
  {
    FileSetting: "FileSetting",
    AllowExtensions: "AllowExtensions",
    MaxSize: "MaxSize",
  } as const,
  {
    FileSetting: { displayName: "" },
    AllowExtensions: { displayName: "" },
    MaxSize: { displayName: "" },
  }
);

export default FileSettingConstant;
