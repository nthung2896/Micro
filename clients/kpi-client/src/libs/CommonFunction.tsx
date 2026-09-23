// Hàm chuyển đổi chuỗi có dấu thành không dấu
export const removeAccents = (str: string): string => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
};

export function sanitizeInput<T>(raw: any, allowed: (keyof T)[]): Partial<T> {
  const clean: Partial<T> = {};

  for (const key in raw) {
    if (allowed.includes(key as keyof T)) {
      clean[key as keyof T] = raw[key];
    } else {
      console.warn(`⚠️ Field "${key}" không hợp lệ đã bị loại`);
    }
  }
  return clean;
}
