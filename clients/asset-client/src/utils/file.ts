/** Lấy tiền tố API chuẩn (tránh bị double /api/api khi NEXT_PUBLIC_API_URL="/api") */
export const getApiPrefix = (): string => {
  const apiBase = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
  if (!apiBase) return "/api";
  if (apiBase === "/api" || apiBase.endsWith("/api")) {
    return apiBase;
  }
  return `${apiBase}/api`;
};

/** Ghép URL file tĩnh hoặc MinIO — phục vụ Menu và toàn hệ thống */
export const buildFileUrl = (path?: string | null): string => {
  if (!path?.trim()) return "";

  let normalized = path.trim().replace(/\\/g, "/");

  // 1. Nếu là URL localhost (do lưu từ môi trường test/dev trước đó) -> bóc tách bỏ host localhost
  if (/^https?:\/\/localhost(:\d+)?/i.test(normalized)) {
    normalized = normalized.replace(/^https?:\/\/localhost(:\d+)?/i, "");
  }

  // 2. Nếu là URL bên ngoài (Unsplash, CDN, FileServer ngoại vi...) -> giữ nguyên
  if (/^https?:\/\//i.test(normalized)) {
    return normalized;
  }

  const apiPrefix = getApiPrefix();

  // 3. Nếu là đường dẫn MinIO view
  if (normalized.includes("/Minio/view/") || normalized.includes("/minio/view/")) {
    const objectPath = normalized.replace(/^.*\/[Mm]inio\/view\//, "");
    return `${apiPrefix}/Minio/view/${objectPath}`;
  }

  // 4. Nếu là objectName trên MinIO (thuộc folder phong-tro hoặc tương đương)
  if (
    normalized.startsWith("phong-tro/") ||
    normalized.startsWith("/phong-tro/") ||
    normalized.includes("/phong-tro/")
  ) {
    const relative = normalized.replace(/^\/?(api\/Minio\/view\/)?/, "");
    return `${apiPrefix}/Minio/view/${relative}`;
  }

  // 5. Nếu là file tĩnh trong /uploads/
  if (normalized.startsWith("/uploads/")) {
    const rootBase = apiPrefix.replace(/\/api$/, "");
    return `${rootBase}${normalized}`;
  }
  if (normalized.startsWith("uploads/")) {
    const rootBase = apiPrefix.replace(/\/api$/, "");
    return `${rootBase}/${normalized}`;
  }

  const relative = normalized.replace(/^\//, "").replace(/^api\//, "");
  return `${apiPrefix}/${relative}`;
};

/** Ghép URL file từ MinIO qua MinioController */
export const buildMinioFileUrl = (path?: string | null): string => {
  if (!path?.trim()) return "";

  let normalized = path.trim().replace(/\\/g, "/");

  // Gỡ bỏ localhost nếu có
  if (/^https?:\/\/localhost(:\d+)?/i.test(normalized)) {
    normalized = normalized.replace(/^https?:\/\/localhost(:\d+)?/i, "");
  }

  // Nếu là URL bên ngoài -> giữ nguyên
  if (/^https?:\/\//i.test(normalized)) {
    return normalized;
  }

  const apiPrefix = getApiPrefix();
  const relative = normalized
    .replace(/^.*\/[Mm]inio\/view\//, "")
    .replace(/^\//, "")
    .replace(/^uploads\//i, "");

  return `${apiPrefix}/Minio/view/${relative}`;
};

/** Ghép URL file tĩnh từ FILE_SERVER (port 8872) — dùng cho logo/ảnh cần đồng bộ qua FileServer */
export const buildFileServerUrl = (path?: string | null): string => {
  if (!path?.trim()) return "";

  const normalized = path.trim().replace(/\\/g, "/");
  // Nếu đã là full URL từ FileServer → giữ nguyên
  if (/^https?:\/\//i.test(normalized)) return normalized;

  const fsBase = (process.env.NEXT_PUBLIC_FILE_SERVER_URL || "").replace(/\/$/, "");
  if (!fsBase) return normalized;

  const relative = normalized.replace(/^\//, "");
  return `${fsBase}/${relative}`;
};
