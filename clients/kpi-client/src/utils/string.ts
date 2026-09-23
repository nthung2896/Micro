import { v4 as uuidv4 } from "uuid";

function createSlugPage(title: string): string {
  const slug = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Xóa dấu thanh (`̀ ́ ̣ ̉ ̃`)
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D") // Chuyển "đ" thành "d"
    .replace(/[^\w\s-]/g, "") // Xóa ký tự đặc biệt, giữ lại chữ, số, dấu cách, dấu '-'
    .replace(/\s+/g, "-") // Thay khoảng trắng bằng '-'
    .replace(/-+/g, "-") // Xóa dấu '-' dư thừa
    .toLowerCase();

  return slug;
}

class StringBuilder {
  private parts: string[] = [];

  append(text: string): StringBuilder {
    this.parts.push(text);
    return this;
  }

  toString(joinedCharacter: string = ""): string {
    return this.parts.join(joinedCharacter);
  }

  toReverseString(joinedCharacter: string = ""): string {
    return this.parts.reverse().join(joinedCharacter);
  }
}

const generateUUID = () => {
  if (typeof window !== "undefined" && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const isRomanNumeral = (val: any): boolean => {
  if (val == null) return false;
  const s = String(val).trim().replace(/\.$/, "");
  if (!s) return false;
  return /^(?=[MDCLXVI])M*(C[MD]|D?C{0,3})(X[CL]|L?X{0,3})(I[XV]|V?I{0,3})$/i.test(s);
};

export { createSlugPage, StringBuilder, generateUUID, isRomanNumeral };
