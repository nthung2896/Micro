"use client";
import Editor from "@monaco-editor/react";

type Props = {
  value?: string;
  onChange?: (v: string) => void;
  height?: number | string;
  language?: string;
};

/**
 * Wrapper Monaco Editor để dùng trong AntD Form.Item.
 * - Hỗ trợ syntax highlight HTML/JSX, autocomplete tag, format Shift+Alt+F.
 * - Lazy-load Monaco bundle từ CDN (jsdelivr) khi component mount lần đầu.
 */
export default function CodeEditor({
  value = "",
  onChange,
  height = 400,
  language = "html",
}: Props) {
  return (
    <div
      style={{
        border: "1px solid #d9d9d9",
        borderRadius: 6,
        overflow: "hidden",
      }}
    >
      <Editor
        height={height}
        language={language}
        value={value}
        onChange={(v) => onChange?.(v ?? "")}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 13,
          tabSize: 2,
          wordWrap: "on",
          scrollBeyondLastLine: false,
          automaticLayout: true,
          formatOnPaste: true,
          formatOnType: true,
          padding: { top: 8, bottom: 8 },
        }}
      />
    </div>
  );
}
