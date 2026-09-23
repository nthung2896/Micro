// MIME Type to File Extension Mapping (Windows 11 Style)
export const MIME_TO_EXTENSION: { [key: string]: string } = {
  // Documents
  "application/pdf": ".pdf",
  "application/msword": ".doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    ".docx",
  "application/vnd.ms-excel": ".xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",
  "application/vnd.ms-powerpoint": ".ppt",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation":
    ".pptx",

  // Text
  "text/plain": ".txt",
  "text/html": ".html",
  "text/css": ".css",
  "text/javascript": ".js",
  "text/csv": ".csv",
  "application/json": ".json",
  "application/xml": ".xml",

  // Images
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/gif": ".gif",
  "image/bmp": ".bmp",
  "image/webp": ".webp",
  "image/svg+xml": ".svg",
  "image/tiff": ".tiff",

  // Videos
  "video/mp4": ".mp4",
  "video/avi": ".avi",
  "video/mpeg": ".mpeg",
  "video/quicktime": ".mov",
  "video/x-msvideo": ".avi",
  "video/webm": ".webm",

  // Audio
  "audio/mpeg": ".mp3",
  "audio/wav": ".wav",
  "audio/x-wav": ".wav",
  "audio/ogg": ".ogg",

  // Archives
  "application/zip": ".zip",
  "application/x-rar-compressed": ".rar",
  "application/x-7z-compressed": ".7z",
  "application/x-tar": ".tar",
  "application/gzip": ".gz",

  // Others
  "application/octet-stream": ".bin",
};

// File Type Categories for Filtering (Windows 11 Style)
export const FILE_TYPE_FILTERS = [
  { label: "Tất cả", value: "all", extensions: [] as string[] },
  { label: "Thư mục", value: "folder", extensions: [] as string[] },
  {
    label: "Tài liệu",
    value: "document",
    extensions: [".doc", ".docx", ".pdf", ".txt", ".rtf", ".odt"],
  },
  {
    label: "Bảng tính",
    value: "spreadsheet",
    extensions: [".xls", ".xlsx", ".csv", ".ods"],
  },
  {
    label: "Bài trình chiếu",
    value: "presentation",
    extensions: [".ppt", ".pptx", ".odp"],
  },
  {
    label: "Hình ảnh",
    value: "image",
    extensions: [
      ".jpg",
      ".jpeg",
      ".png",
      ".gif",
      ".bmp",
      ".svg",
      ".webp",
      ".tiff",
    ],
  },
  {
    label: "Video",
    value: "video",
    extensions: [
      ".mp4",
      ".avi",
      ".mov",
      ".wmv",
      ".flv",
      ".mkv",
      ".webm",
      ".mpeg",
    ],
  },
  {
    label: "File nén",
    value: "archive",
    extensions: [".zip", ".rar", ".7z", ".tar", ".gz"],
  },
];

// Helper function to convert MIME type to file extension
export const mimeToExtension = (mimeType?: string): string => {
  if (!mimeType) return "";
  return MIME_TO_EXTENSION[mimeType] || "";
};

// Helper function to get file type from MIME type
export const getFileTypeCategory = (mimeType?: string): string => {
  if (!mimeType) return "other";

  const ext = mimeToExtension(mimeType);

  for (const filter of FILE_TYPE_FILTERS) {
    if (filter.extensions.includes(ext)) {
      return filter.value;
    }
  }

  return "other";
};
