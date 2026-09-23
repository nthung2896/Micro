/**
 * Chuyển đổi tiêu đề thành slug dạng uppercase không có dấu gạch ngang
 * @param title - Tiêu đề cần chuyển đổi
 * @returns Slug dạng uppercase không có dấu gạch ngang
 */
export function generateUppercaseSlug(title: string): string {
  if (typeof title !== "string" || !title.trim()) {
    return "";
  }

  // Bước 1: Xử lý các từ
  const words = title.toLowerCase().split(/\s+/);

  const cleanedWords = words.map((word) => {
    let cleanWord = word;
    cleanWord = cleanWord.replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, "a");
    cleanWord = cleanWord.replace(/[èéẹẻẽêềếệểễ]/g, "e");
    cleanWord = cleanWord.replace(/[ìíịỉĩ]/g, "i");
    cleanWord = cleanWord.replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, "o");
    cleanWord = cleanWord.replace(/[ùúụủũưừứựửữ]/g, "u");
    cleanWord = cleanWord.replace(/[ỳýỵỷỹ]/g, "y");
    cleanWord = cleanWord.replace(/đ/g, "d");
    // Loại bỏ ký tự không phải a-z, 0-9
    cleanWord = cleanWord.replace(/[^a-z0-9]/g, "");
    return cleanWord;
  });
  // Bước 2: Loại bỏ từ rỗng và nối thành một chuỗi liền nhau, sau đó chuyển thành uppercase
  return cleanedWords.filter(Boolean).join("").toUpperCase();
}

/**
 * Chuyển đổi tiêu đề thành slug
 * @param title - Tiêu đề cần chuyển đổi
 * @returns Slug đã được chuyển đổi
 */
export function generateSlug(title: string): string {
  if (typeof title !== "string" || !title.trim()) {
    return "";
  }

  // Bước 1: Xử lý các từ
  const words = title.toLowerCase().split(/\s+/);

  const cleanedWords = words.map((word) => {
    let cleanWord = word;
    cleanWord = cleanWord.replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, "a");
    cleanWord = cleanWord.replace(/[èéẹẻẽêềếệểễ]/g, "e");
    cleanWord = cleanWord.replace(/[ìíịỉĩ]/g, "i");
    cleanWord = cleanWord.replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, "o");
    cleanWord = cleanWord.replace(/[ùúụủũưừứựửữ]/g, "u");
    cleanWord = cleanWord.replace(/[ỳýỵỷỹ]/g, "y");
    cleanWord = cleanWord.replace(/đ/g, "d");
    // Loại bỏ ký tự không phải a-z, 0-9
    cleanWord = cleanWord.replace(/[^a-z0-9]/g, "");
    return cleanWord;
  });

  // Bước 2: Loại bỏ từ rỗng và nối bằng dấu gạch ngang
  return cleanedWords.filter(Boolean).join("-");
}

/**
 * Tạo slug từ tiêu đề với tùy chọn thêm timestamp
 * @param title - Tiêu đề cần chuyển đổi
 * @param addTimestamp - Có thêm timestamp vào cuối slug không
 * @returns Slug đã được chuyển đổi
 */
export function createSlug(
  title: string,
  addTimestamp: boolean = false,
): string {
  let slug = generateSlug(title);

  if (addTimestamp) {
    const timestamp = Date.now();
    slug = `${slug}-${timestamp}`;
  }

  return slug;
}
