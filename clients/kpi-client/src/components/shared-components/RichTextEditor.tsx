"use client";
import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  ClockCircleOutlined,
  CodeOutlined,
  FileAddOutlined,
  FullscreenExitOutlined,
  FullscreenOutlined,
  MinusOutlined,
  PrinterOutlined,
  RedoOutlined,
  SearchOutlined,
  SmileOutlined,
  TableOutlined,
  UndoOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
}) as any;

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    [{ font: [] }],
    [{ size: ["small", false, "large", "huge"] }],
    ["bold", "italic", "underline", "strike"],
    [{ script: "sub" }, { script: "super" }],
    [{ color: [] }, { background: [] }],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ indent: "-1" }, { indent: "+1" }],
    ["blockquote", "code-block", "code"],
    [{ align: [] }],
    [{ direction: "rtl" }],
    ["link", "image", "video"],
    ["clean"],
  ],
  history: { delay: 1000, maxStack: 100, userOnly: true },
};

const SPECIAL_CHARS = [
  "©", "®", "™", "€", "£", "¥", "§", "¶", "°", "±", "×", "÷",
  "≈", "≠", "≤", "≥", "∞", "√", "∑", "π", "Ω", "α", "β", "γ",
  "✓", "✗", "★", "☆", "→", "←", "↑", "↓", "•", "…", "–", "—",
];

const EMOJIS = [
  "😀", "😂", "😍", "🙂", "😉", "😢", "😡", "👍", "👎", "🙏",
  "👏", "🎉", "🔥", "💡", "⚠️", "✅", "❌", "❓", "❗", "📌",
];

interface Props {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}

const RichTextEditor: React.FC<Props> = ({ value, onChange, placeholder }) => {
  const quillRef = useRef<any>(null);
  const [sourceMode, setSourceMode] = useState(false);
  const [sourceHtml, setSourceHtml] = useState("");
  const [fullscreen, setFullscreen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showSpecialChars, setShowSpecialChars] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [replaceTerm, setReplaceTerm] = useState("");
  const [lastIndex, setLastIndex] = useState(-1);

  const getEditor = () => quillRef.current?.getEditor?.();

  const toggleSource = () => {
    if (!sourceMode) {
      setSourceHtml(value || "");
    } else {
      onChange?.(sourceHtml);
    }
    setSourceMode((s) => !s);
  };

  const handleUndo = () => getEditor()?.history.undo();
  const handleRedo = () => getEditor()?.history.redo();

  const handleNewDocument = () => {
    if (!window.confirm("Xóa toàn bộ nội dung hiện tại?")) return;
    getEditor()?.setText("");
    onChange?.("");
  };

  const handlePrint = () => {
    const quill = getEditor();
    if (!quill) return;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(
      `<html><head><title>In nội dung</title></head><body>${quill.root.innerHTML}</body></html>`,
    );
    win.document.close();
    win.focus();
    win.print();
  };

  const handleInsertTable = () => {
    const quill = getEditor();
    if (!quill) return;
    const sel = quill.getSelection(true);
    const index = sel ? sel.index : quill.getLength();
    const cell = `<td style="border:1px solid #999;padding:6px">&nbsp;</td>`;
    const tableHtml = `<table style="border-collapse:collapse;width:100%"><tbody><tr>${cell}${cell}</tr><tr>${cell}${cell}</tr></tbody></table><p><br></p>`;
    quill.clipboard.dangerouslyPasteHTML(index, tableHtml, "user");
  };

  const insertSpecialChar = (ch: string) => {
    const quill = getEditor();
    if (!quill) return;
    const sel = quill.getSelection(true);
    const index = sel ? sel.index : quill.getLength();
    quill.insertText(index, ch, "user");
    quill.setSelection(index + ch.length, 0, "user");
    setShowSpecialChars(false);
  };

  const insertEmoji = (emoji: string) => {
    const quill = getEditor();
    if (!quill) return;
    const sel = quill.getSelection(true);
    const index = sel ? sel.index : quill.getLength();
    quill.insertText(index, emoji, "user");
    quill.setSelection(index + emoji.length, 0, "user");
    setShowEmoji(false);
  };

  const handleInsertHr = () => {
    const quill = getEditor();
    if (!quill) return;
    const sel = quill.getSelection(true);
    const index = sel ? sel.index : quill.getLength();
    quill.clipboard.dangerouslyPasteHTML(index, "<hr><p><br></p>", "user");
  };

  const handleInsertDateTime = () => {
    const quill = getEditor();
    if (!quill) return;
    const sel = quill.getSelection(true);
    const index = sel ? sel.index : quill.getLength();
    const text = dayjs().format("DD/MM/YYYY HH:mm");
    quill.insertText(index, text, "user");
    quill.setSelection(index + text.length, 0, "user");
  };

  const handleFindNext = () => {
    const quill = getEditor();
    if (!quill || !searchTerm) return;
    const text = quill.getText();
    let idx = text.indexOf(searchTerm, lastIndex + 1);
    if (idx === -1) idx = text.indexOf(searchTerm, 0);
    if (idx === -1) return;
    quill.setSelection(idx, searchTerm.length, "user");
    setLastIndex(idx);
  };

  const handleReplace = () => {
    const quill = getEditor();
    if (!quill) return;
    const sel = quill.getSelection();
    if (sel && sel.length > 0) {
      quill.deleteText(sel.index, sel.length, "user");
      quill.insertText(sel.index, replaceTerm, "user");
      quill.setSelection(sel.index + replaceTerm.length, 0, "user");
      setLastIndex(sel.index + replaceTerm.length - 1);
    }
    handleFindNext();
  };

  const handleReplaceAll = () => {
    const quill = getEditor();
    if (!quill || !searchTerm) return;
    let text = quill.getText();
    let idx = text.indexOf(searchTerm);
    while (idx !== -1) {
      quill.deleteText(idx, searchTerm.length, "user");
      quill.insertText(idx, replaceTerm, "user");
      text = quill.getText();
      idx = text.indexOf(searchTerm, idx + replaceTerm.length);
    }
    setLastIndex(-1);
  };

  const plainText = (value || "").replace(/<[^>]*>/g, " ");
  const charCount = plainText.replace(/\s+/g, "").length;
  const wordCount = plainText.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div
      className={
        fullscreen
          ? "fixed inset-0 z-[1000] bg-white p-3 flex flex-col"
          : "relative"
      }
    >
      <div className="flex flex-wrap justify-end gap-2 mb-1">
        <button
          type="button"
          onClick={handleUndo}
          title="Hoàn tác"
          disabled={sourceMode}
          className="px-2 py-1 text-xs border border-gray-300 rounded text-gray-600 disabled:opacity-40"
        >
          <UndoOutlined />
        </button>
        <button
          type="button"
          onClick={handleRedo}
          title="Làm lại"
          disabled={sourceMode}
          className="px-2 py-1 text-xs border border-gray-300 rounded text-gray-600 disabled:opacity-40"
        >
          <RedoOutlined />
        </button>
        <button
          type="button"
          onClick={() => setShowSearch((s) => !s)}
          title="Tìm kiếm & thay thế"
          disabled={sourceMode}
          className={`px-2 py-1 text-xs border rounded disabled:opacity-40 ${showSearch
            ? "bg-blue-50 border-blue-400 text-blue-600"
            : "border-gray-300 text-gray-600"
            }`}
        >
          <SearchOutlined />
        </button>
        <button
          type="button"
          onClick={handleInsertTable}
          title="Chèn bảng"
          disabled={sourceMode}
          className="px-2 py-1 text-xs border border-gray-300 rounded text-gray-600 disabled:opacity-40"
        >
          <TableOutlined />
        </button>
        <button
          type="button"
          onClick={() => setShowSpecialChars((s) => !s)}
          title="Ký tự đặc biệt"
          disabled={sourceMode}
          className={`px-2 py-1 text-xs border rounded disabled:opacity-40 ${showSpecialChars
            ? "bg-blue-50 border-blue-400 text-blue-600"
            : "border-gray-300 text-gray-600"
            }`}
        >
          Ω
        </button>
        <button
          type="button"
          onClick={() => setShowEmoji((s) => !s)}
          title="Emoji"
          disabled={sourceMode}
          className={`px-2 py-1 text-xs border rounded disabled:opacity-40 ${showEmoji
            ? "bg-blue-50 border-blue-400 text-blue-600"
            : "border-gray-300 text-gray-600"
            }`}
        >
          <SmileOutlined />
        </button>
        <button
          type="button"
          onClick={handleInsertHr}
          title="Chèn đường kẻ ngang"
          disabled={sourceMode}
          className="px-2 py-1 text-xs border border-gray-300 rounded text-gray-600 disabled:opacity-40"
        >
          <MinusOutlined />
        </button>
        <button
          type="button"
          onClick={handleInsertDateTime}
          title="Chèn ngày giờ"
          disabled={sourceMode}
          className="px-2 py-1 text-xs border border-gray-300 rounded text-gray-600 disabled:opacity-40"
        >
          <ClockCircleOutlined />
        </button>
        <button
          type="button"
          onClick={handlePrint}
          title="In"
          disabled={sourceMode}
          className="px-2 py-1 text-xs border border-gray-300 rounded text-gray-600 disabled:opacity-40"
        >
          <PrinterOutlined />
        </button>
        <button
          type="button"
          onClick={handleNewDocument}
          title="Tài liệu mới"
          disabled={sourceMode}
          className="px-2 py-1 text-xs border border-gray-300 rounded text-gray-600 disabled:opacity-40"
        >
          <FileAddOutlined />
        </button>
        <button
          type="button"
          onClick={toggleSource}
          title="Mã HTML"
          className={`px-2 py-1 text-xs border rounded ${sourceMode
            ? "bg-blue-50 border-blue-400 text-blue-600"
            : "border-gray-300 text-gray-600"
            }`}
        >
          <CodeOutlined /> Mã HTML
        </button>
        <button
          type="button"
          onClick={() => setFullscreen((f) => !f)}
          title="Toàn màn hình"
          className="px-2 py-1 text-xs border border-gray-300 rounded text-gray-600"
        >
          {fullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
        </button>
      </div>

      {showSearch && !sourceMode && (
        <div className="flex flex-wrap items-center gap-2 mb-1 p-2 border border-gray-200 rounded bg-gray-50">
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm..."
            className="px-2 py-1 text-xs border border-gray-300 rounded w-32"
          />
          <input
            value={replaceTerm}
            onChange={(e) => setReplaceTerm(e.target.value)}
            placeholder="Thay bằng..."
            className="px-2 py-1 text-xs border border-gray-300 rounded w-32"
          />
          <button
            type="button"
            onClick={handleFindNext}
            className="px-2 py-1 text-xs border border-gray-300 rounded text-gray-600"
          >
            Tìm tiếp
          </button>
          <button
            type="button"
            onClick={handleReplace}
            className="px-2 py-1 text-xs border border-gray-300 rounded text-gray-600"
          >
            Thay thế
          </button>
          <button
            type="button"
            onClick={handleReplaceAll}
            className="px-2 py-1 text-xs border border-gray-300 rounded text-gray-600"
          >
            Thay tất cả
          </button>
        </div>
      )}

      {showSpecialChars && !sourceMode && (
        <div className="flex flex-wrap gap-1 mb-1 p-2 border border-gray-200 rounded bg-gray-50">
          {SPECIAL_CHARS.map((ch) => (
            <button
              key={ch}
              type="button"
              onClick={() => insertSpecialChar(ch)}
              className="w-7 h-7 text-sm border border-gray-300 rounded hover:bg-gray-100"
            >
              {ch}
            </button>
          ))}
        </div>
      )}

      {showEmoji && !sourceMode && (
        <div className="flex flex-wrap gap-1 mb-1 p-2 border border-gray-200 rounded bg-gray-50">
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => insertEmoji(emoji)}
              className="w-7 h-7 text-base border border-gray-300 rounded hover:bg-gray-100"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {sourceMode ? (
        <textarea
          className="w-full border border-gray-300 rounded p-2 font-mono text-sm flex-1"
          style={{ minHeight: fullscreen ? undefined : 200 }}
          value={sourceHtml}
          onChange={(e) => setSourceHtml(e.target.value)}
        />
      ) : (
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={value || ""}
          onChange={(content: string) => onChange?.(content)}
          modules={modules}
          placeholder={placeholder || "Nhập nội dung..."}
          style={{ minHeight: 200, flex: fullscreen ? 1 : undefined }}
        />
      )}

      {!sourceMode && (
        <div className="text-[11px] text-gray-400 text-right mt-1">
          {wordCount} từ • {charCount} ký tự
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;
