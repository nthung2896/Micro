// Khớp với Hinet.FileServer.Configuration.FileCategoryConstant ở backend.
// Bắt buộc dùng các giá trị này khi upload file qua fileServerService.

import { createConstant } from "./Constant";

const FileCategoryConstant = createConstant(
  {
    Platform: "platform",         // Tài liệu nền tảng TMĐT
    Contract: "contract",         // Tài liệu chứng thực HĐĐT
    Company: "company",           // ĐKKD, uỷ quyền của DN
    Avatar: "avatar",             // Ảnh đại diện user
    RutTienKyQuy: "RutTienKyQuy", // Tài liệu Rút tiền ký quỹ
    General: "general",           // Fallback
  } as const,
  {
    platform: { displayName: "Nền tảng TMĐT" },
    contract: { displayName: "Hợp đồng điện tử" },
    company: { displayName: "Hồ sơ doanh nghiệp" },
    avatar: { displayName: "Ảnh đại diện" },
    RutTienKyQuy: { displayName: "Rút tiền ký quỹ" },
    general: { displayName: "Tài liệu chung" },
  },
);

export default FileCategoryConstant;
