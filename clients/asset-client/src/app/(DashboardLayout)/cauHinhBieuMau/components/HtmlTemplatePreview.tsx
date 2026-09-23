"use client";

import { BCInputConfigType } from "@/types/bcFormTemplate/dto";
import { EditOutlined, UploadOutlined } from "@ant-design/icons";
import {
  Button,
  Checkbox,
  DatePicker,
  Input,
  InputNumber,
  Radio,
  Select,
  Tooltip,
} from "antd";
import parse, { DOMNode } from "html-react-parser";
import { useMemo } from "react";
import DynamicSelect from "./DynamicSelect";

interface HtmlTemplatePreviewProps {
  htmlContent: string;
  inputs: BCInputConfigType[];
  activeInputKey?: string | null;
  onClickPlaceholder?: (inputKey: string) => void;
}

export default function HtmlTemplatePreview({
  htmlContent,
  inputs,
  activeInputKey,
  onClickPlaceholder,
}: HtmlTemplatePreviewProps) {
  /** Quick lookup map */
  const inputMap = useMemo(() => {
    const m = new Map<string, BCInputConfigType>();
    inputs.forEach((inp) => m.set(inp.inputKey, inp));
    return m;
  }, [inputs]);

  /** Extract <style> blocks and body content from the HTML */
  const { styleBlocks, bodyContent } = useMemo(() => {
    const styles = [...htmlContent.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)]
      .map((m) => m[1])
      .join("\n");

    const body = htmlContent
      .replace(/<!DOCTYPE[^>]*>/i, "")
      .replace(/<html[^>]*>/i, "")
      .replace(/<\/html>/i, "")
      .replace(/<head[\s\S]*?<\/head>/i, "")
      .replace(/<body[^>]*>/i, "")
      .replace(/<\/body>/i, "")
      .trim();

    return { styleBlocks: styles, bodyContent: body };
  }, [htmlContent]);

  const renderInputUI = (key: string, cfg?: BCInputConfigType) => {
    let type = cfg?.dataType;
    if (cfg?.isCombobox) {
      type = "COMBOBOX";
    }
    const lowerKey = key.toLowerCase();
    if (!type || type === "TEXT") {
      if (lowerKey.startsWith("ck.")) type = "CHECKBOX";
      else if (lowerKey.startsWith("rbn.")) type = "RADIO";
      else if (!type) type = "TEXT";
    }

    const placeholder = cfg?.placeHolder || cfg?.displayName || "";
    const displayName = cfg?.displayName || "";
    let element = null;

    switch (type) {
      case "NUMBER":
        element = (
          <InputNumber placeholder={placeholder || key} style={{ width: "100%" }} />
        );
        break;
      case "DATE":
        element = (
          <DatePicker placeholder={placeholder || key} style={{ width: "100%" }} />
        );
        break;
      case "TEXTAREA":
        element = <Input.TextArea placeholder={placeholder || key} rows={2} />;
        break;
      case "COMBOBOX":
        element = <DynamicSelect placeholder={placeholder || key} style={{ width: "100%" }} localOptions={cfg?.localOptions} globalCategoryCode={cfg?.globalCategoryCode} />;
        break;
      case "CHECKBOX":
        element = <Checkbox>{displayName || key}</Checkbox>;
        break;
      case "RADIO":
        element = <Radio>{displayName || key}</Radio>;
        break;
      case "FILE":
        element = <Button icon={<UploadOutlined />}>Tải file đính kèm</Button>;
        break;
      case "TEXT":
      default:
        element = <span style={{ color: "#0355a2", fontWeight: 500, padding: "0 4px" }}>[{displayName || key}]</span>;
        break;
    }

    const isActive = activeInputKey === key;
    const isInline = type === "CHECKBOX" || type === "RADIO" || type === "FILE" || type === "TEXT";

    return (
      <Tooltip
        title={
          cfg
            ? `Cấu hình: ${cfg.displayName}`
            : `Click để cấu hình trường: ${key}`
        }
      >
        <span
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClickPlaceholder?.(key);
          }}
          style={{
            display: isInline ? "inline-block" : "block",
            position: "relative",
            minWidth: isInline ? "auto" : 120,
            cursor: "pointer",
            border: isActive
              ? "2px solid #0355a2"
              : "1px dashed rgba(0,0,0,0.2)",
            borderRadius: 6,
            padding: 4,
            margin: "4px 2px",
            transition: "all 0.3s",
            background: isActive ? "rgba(22, 119, 255, 0.05)" : "transparent",
            verticalAlign: "middle",
          }}
          className="preview-input-wrapper"
        >
          {/* pointerEvents: none helps pass the click to the wrapper */}
          <div style={{ pointerEvents: "none", display: "inline-flex", alignItems: "center", width: "100%" }}>
            {element}
            {cfg?.required && (
              <span style={{ color: "#ff4d4f", marginLeft: 4, fontWeight: "bold" }} title="Bắt buộc nhập">*</span>
            )}
          </div>

          {/* Always show edit icon next to the element */}
          <div
            style={{
              position: "absolute",
              top: -8,
              right: -8,
              background: isActive ? "#0355a2" : "#fff",
              color: isActive ? "#fff" : "#0355a2",
              border: "1px solid #0355a2",
              borderRadius: "50%",
              width: 20,
              height: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 10,
              zIndex: 10,
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              cursor: "pointer",
            }}
          >
            <EditOutlined />
          </div>
        </span>
      </Tooltip>
    );
  };

  const replaceOptions = {
    replace: (domNode: DOMNode) => {
      if (domNode.type === "text") {
        const text = domNode.data;
        const regex = /\[\[(.*?)\]\]/g;
        if (!regex.test(text)) return;

        const parts = text.split(/\[\[(.*?)\]\]/);
        return (
          <>
            {parts.map((part, index) => {
              if (index % 2 === 1) {
                const key = part.trim();
                const cfg = inputMap.get(key);
                return <span key={index}>{renderInputUI(key, cfg)}</span>;
              }
              return part || null;
            })}
          </>
        );
      }
    },
  };

  return (
    <div className="html-template-preview">
      {styleBlocks && (
        <style dangerouslySetInnerHTML={{ __html: styleBlocks }} />
      )}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .html-template-preview {
              font-family: 'Times New Roman', serif;
              font-size: 14px;
              line-height: 1.6;
              background: #fff;
              padding: 24px;
              border-radius: 8px;
              border: 1px solid #f0f0f0;
              min-height: 400px;
            }
            .html-template-preview table {
              border-collapse: collapse;
              width: 100%;
            }
            .html-template-preview td,
            .html-template-preview th {
              border: 1px solid #d9d9d9;
              padding: 8px 10px;
            }
            .preview-input-wrapper:hover {
              border-color: #0355a2 !important;
              background: rgba(22, 119, 255, 0.05) !important;
            }
          `,
        }}
      />
      <div>{parse(bodyContent, replaceOptions)}</div>
    </div>
  );
}
