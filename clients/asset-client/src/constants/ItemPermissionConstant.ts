import { createConstant } from "./Constant";

const ItemPermissionConstant = createConstant(
  {
    READ: "READ",
    WRITE: "WRITE",
    DELETE: "DELETE",
    DOWNLOAD: "DOWNLOAD",
    FOLDER: "FOLDER",
    FILE: "FILE",
    ICON_FOLDER: "ICON_FOLDER",
    ICON_FILE: "ICON_FILE",
    ICON_PDF: "ICON_PDF",
    ICON_WORD: "ICON_WORD",
    ICON_EXCEL: "ICON_EXCEL",
    ICON_POWERPOINT: "ICON_POWERPOINT",
    ICON_IMAGE: "ICON_IMAGE",
    ICON_VIDEO: "ICON_VIDEO",
    ICON_AUDIO: "ICON_AUDIO",
    ICON_ARCHIVE: "ICON_ARCHIVE",
    ICON_TEXT: "ICON_TEXT",
  } as const,
  {
    READ: { displayName: "Quyền xem" },
    WRITE: { displayName: "Quyền sửa" },
    DELETE: { displayName: "Quyền xóa" },
    DOWNLOAD: { displayName: "Quyền tải về" },
    FOLDER: { displayName: "Thư mục" },
    FILE: { displayName: "File" },
    ICON_FOLDER: { displayName: "" },
    ICON_FILE: { displayName: "" },
    ICON_PDF: { displayName: "" },
    ICON_WORD: { displayName: "" },
    ICON_EXCEL: { displayName: "" },
    ICON_POWERPOINT: { displayName: "" },
    ICON_IMAGE: { displayName: "" },
    ICON_VIDEO: { displayName: "" },
    ICON_AUDIO: { displayName: "" },
    ICON_ARCHIVE: { displayName: "" },
    ICON_TEXT: { displayName: "" },
  }
);

export default ItemPermissionConstant;
