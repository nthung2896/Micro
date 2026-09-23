// Template engine tối giản kiểu Mustache, đủ dùng cho block trang chủ.
// Hỗ trợ:
//   {{var}}                                — thay biến (escape HTML)
//   {{{var}}}                              — thay biến (không escape, dùng cho HTML đã tin cậy)
//   {{#each list}} ... {{/each}}           — lặp mảng. Trong loop dùng {{this.field}} hoặc {{field}}
//                                            Có thêm biến đặc biệt: {{@index}} (0-based), {{@number}} (1-based)
//   {{#if var}} ... {{/if}}                — render nếu var truthy
//
// Không có toán tử, không có nested loop nâng cao. Đủ cho 95% template trang chủ.

function escapeHtml(s: any): string {
  if (s === null || s === undefined) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getValue(ctx: Record<string, any>, path: string): any {
  if (path === "this") return ctx.this;
  if (path.startsWith("this.")) {
    return path
      .slice(5)
      .split(".")
      .reduce((acc: any, k) => (acc == null ? acc : acc[k]), ctx.this);
  }
  return path.split(".").reduce((acc: any, k) => (acc == null ? acc : acc[k]), ctx);
}

function renderVars(tpl: string, ctx: Record<string, any>): string {
  // {{{raw}}}
  tpl = tpl.replace(/\{\{\{\s*([\w.@]+)\s*\}\}\}/g, (_, key) => {
    const v = getValue(ctx, key);
    return v === undefined || v === null ? "" : String(v);
  });
  // {{escaped}}
  tpl = tpl.replace(/\{\{\s*([\w.@]+)\s*\}\}/g, (_, key) => {
    if (key === "@index" || key === "@number") return String(ctx[key] ?? "");
    const v = getValue(ctx, key);
    return escapeHtml(v);
  });
  return tpl;
}

function renderBlocks(tpl: string, ctx: Record<string, any>): string {
  // QUAN TRỌNG: xử lý {{#each}} TRƯỚC {{#if}} để inner {{#if}} bên trong loop
  // được evaluate trong scope của từng item (có biến của item), không bị
  // engine ăn ở scope ngoài (không có biến → luôn falsy → bị strip mất).

  // {{#each list}}...{{/each}}
  tpl = tpl.replace(
    /\{\{#each\s+([\w.]+)\s*\}\}([\s\S]*?)\{\{\/each\}\}/g,
    (_, key, inner) => {
      const list = getValue(ctx, key);
      if (!Array.isArray(list)) return "";
      return list
        .map((item, i) => {
          const itemCtx = {
            ...ctx,
            this: item,
            "@index": i,
            "@number": i + 1,
          };
          // cho phép truy cập field trực tiếp như {{name}} thay vì {{this.name}}
          const merged =
            item && typeof item === "object" ? { ...itemCtx, ...item } : itemCtx;
          return renderVars(renderBlocks(inner, merged), merged);
        })
        .join("");
    },
  );

  // {{#if x}}...{{/if}} — chạy sau, xử lý các if còn lại ở scope ngoài
  tpl = tpl.replace(
    /\{\{#if\s+([\w.]+)\s*\}\}([\s\S]*?)\{\{\/if\}\}/g,
    (_, key, inner) => {
      const v = getValue(ctx, key);
      return v ? renderBlocks(inner, ctx) : "";
    },
  );
  return tpl;
}

import { renderIcon } from "./iconRegistry";

// Parse attribute string từ JSX tag, vd `name="X" className="Y"` → { name: "X", class: "Y" }
function parseAttrs(s: string): Record<string, string> {
  const out: Record<string, string> = {};
  const re = /(\w+)\s*=\s*"([^"]*)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s)) !== null) {
    const key = m[1] === "className" ? "class" : m[1];
    out[key] = m[2];
  }
  return out;
}

// Replace <Icon name="X" className="Y" /> bằng SVG string render từ AntD icon registry.
// Dùng [\s\S]*? để match qua nhiều dòng + cho phép ký tự `/` trong className (vd text-white/70).
function renderIconTags(s: string): string {
  return s.replace(/<Icon\s+([\s\S]*?)\/\s*>/g, (_, attrStr) => {
    const attrs = parseAttrs(attrStr);
    const name = attrs.name;
    if (!name) return "";
    const { name: _n, ...rest } = attrs;
    return renderIcon(name, rest);
  });
}

// Convert object style JSX → CSS string.
// VD: style={{ backgroundImage: "url('/x.png')", color: "red" }}
//   → style="background-image: url('/x.png'); color: red"
function camelToKebab(s: string): string {
  return s.replace(/([A-Z])/g, "-$1").toLowerCase();
}

function jsxStyleToCss(s: string): string {
  return s.replace(/style=\{\{([\s\S]*?)\}\}/g, (_, body) => {
    // Tách từng cặp key: value, ngắt bằng "," ở mức ngoài (không trong chuỗi)
    const pairs: string[] = [];
    let buf = "";
    let depth = 0;
    let inStr: string | null = null;
    for (let i = 0; i < body.length; i++) {
      const c = body[i];
      const prev = body[i - 1];
      if (inStr) {
        if (c === inStr && prev !== "\\") inStr = null;
        buf += c;
      } else if (c === '"' || c === "'") {
        inStr = c;
        buf += c;
      } else if (c === "(" || c === "[" || c === "{") {
        depth++;
        buf += c;
      } else if (c === ")" || c === "]" || c === "}") {
        depth--;
        buf += c;
      } else if (c === "," && depth === 0) {
        pairs.push(buf);
        buf = "";
      } else {
        buf += c;
      }
    }
    if (buf.trim()) pairs.push(buf);

    const css = pairs
      .map((p) => {
        const colonIdx = p.indexOf(":");
        if (colonIdx < 0) return "";
        const key = p.slice(0, colonIdx).trim().replace(/^["']|["']$/g, "");
        let val = p.slice(colonIdx + 1).trim();
        // bỏ dấu phẩy thừa cuối
        val = val.replace(/,$/, "").trim();
        // bỏ quote bao quanh string literal: "..." hoặc '...'
        if (
          (val.startsWith('"') && val.endsWith('"')) ||
          (val.startsWith("'") && val.endsWith("'"))
        ) {
          val = val.slice(1, -1);
        }
        if (!key || !val) return "";
        return `${camelToKebab(key)}: ${val}`;
      })
      .filter(Boolean)
      .join("; ");

    // escape " trong CSS value vì sắp đặt trong style="..."
    return `style="${css.replace(/"/g, "'")}"`;
  });
}

// Cho phép admin viết theo cú pháp JSX (className, htmlFor) → convert sang HTML attr chuẩn
// để dangerouslySetInnerHTML hiểu được.
function jsxToHtml(s: string): string {
  return s
    .replace(/\bclassName=/g, "class=")
    .replace(/\bhtmlFor=/g, "for=")
    // self-closing tag không hợp lệ trong HTML (<br/>, <hr/> vẫn ok, nhưng <div/> thì không)
    // (?=[\s/]) đảm bảo match đúng tên tag, tránh ăn nhầm prefix (vd "li" trong "line", "p" trong "polyline")
    .replace(/<(div|span|section|article|main|aside|header|footer|nav|ul|ol|li|p|h[1-6])(?=[\s/])([^>]*?)\/>/g, "<$1$2></$1>");
}

export function renderTemplate(
  template: string,
  data?: Record<string, any>,
): string {
  if (!template) return "";
  const ctx = { ...(data || {}) } as Record<string, any>;
  const withBlocks = renderBlocks(template, ctx);
  const rendered = renderVars(withBlocks, ctx);
  const withStyles = jsxStyleToCss(rendered);
  const withIcons = renderIconTags(withStyles);
  return jsxToHtml(withIcons);
}
