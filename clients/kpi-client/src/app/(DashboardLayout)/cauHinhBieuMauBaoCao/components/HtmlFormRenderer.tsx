"use client";

import { BCInputConfigType } from "@/types/bcFormTemplate/dto";
import { UploadOutlined } from "@ant-design/icons";
import {
  Button,
  Checkbox,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Radio,
  Select,
  Tooltip,
  Upload,
} from "antd";
import parse, { DOMNode } from "html-react-parser";
import { useMemo } from "react";
import DynamicSelect from "./DynamicSelect";

interface HtmlFormRendererProps {
  htmlContent: string;
  inputs: BCInputConfigType[];
  namePrefix?: (string | number)[];
}

export default function HtmlFormRenderer({
  htmlContent,
  inputs,
  namePrefix,
}: HtmlFormRendererProps) {
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

  const renderFormItem = (key: string, cfg?: BCInputConfigType) => {
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

    let formItemName = key;
    let radioSuffix = "";
    if (type === "RADIO") {
      const lastUnderscore = key.lastIndexOf("_");
      if (lastUnderscore !== -1) {
        formItemName = key.substring(0, lastUnderscore);
        radioSuffix = key.substring(lastUnderscore + 1);
      }
    }

    const placeholder = cfg?.placeHolder || cfg?.displayName || "";
    const displayName = cfg?.displayName || "";
    const isRequired = cfg?.required || false;

    let element = null;
    let valuePropName = "value";

    switch (type) {
      case "NUMBER":
        element = <InputNumber placeholder={placeholder} style={{ width: "100%" }} />;
        break;
      case "DATE":
        element = <DatePicker placeholder={placeholder} style={{ width: "100%" }} format="DD/MM/YYYY" />;
        break;
      case "TEXTAREA":
        element = <Input.TextArea placeholder={placeholder} rows={2} />;
        break;
      case "COMBOBOX":
        element = <DynamicSelect placeholder={placeholder} style={{ width: "100%" }} localOptions={cfg?.localOptions} globalCategoryCode={cfg?.globalCategoryCode} />;
        break;
      case "CHECKBOX":
        element = <Checkbox />;
        valuePropName = "checked";
        break;
      case "RADIO":
        element = <Radio />;
        valuePropName = "checked";
        break;
      case "FILE":
        element = (
          <Upload>
            <Button icon={<UploadOutlined />}>Tải file đính kèm</Button>
          </Upload>
        );
        valuePropName = "fileList";
        break;
      case "TEXT":
      default:
        element = <Input placeholder={placeholder} />;
        break;
    }

    // Determine layout for inline elements
    const isInline = type === "CHECKBOX" || type === "RADIO";

    const isRadioGroupItem = type === "RADIO" && radioSuffix !== "";

    return (
      <Form.Item
        name={namePrefix ? [...namePrefix, key] : key}
        rules={[{ required: isRequired, message: `Vui lòng nhập/chọn ${displayName}` }]}
        valuePropName={valuePropName}
        style={{
          display: isInline ? "inline-block" : "block",
          marginBottom: 0, // integrate smoothly with text
          marginRight: isInline ? 8 : 0,
          verticalAlign: "middle",
          minWidth: isInline ? "auto" : 120,
        }}
      >
        {element}
      </Form.Item>
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
                return <span key={index}>{renderFormItem(key, cfg)}</span>;
              }
              return part || null;
            })}
          </>
        );
      }
    },
  };

  return (
    <div className="html-form-renderer">
      {styleBlocks && (
        <style dangerouslySetInnerHTML={{ __html: styleBlocks }} />
      )}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .html-form-renderer {
              font-family: 'Times New Roman', serif;
              font-size: 14px;
              line-height: 1.6;
              background: #fff;
              padding: 24px;
              border-radius: 8px;
            }
            .html-form-renderer table {
              border-collapse: collapse;
              width: 100%;
            }
            .html-form-renderer td,
            .html-form-renderer th {
              border: 1px solid #d9d9d9;
              padding: 8px 10px;
            }
            .html-form-renderer p {
              margin-bottom: 8px;
            }
            /* Adjust antd form items inside text */
            .html-form-renderer .ant-form-item {
              margin-bottom: 0 !important;
              display: inline-block;
              vertical-align: middle;
            }
          `,
        }}
      />
      <div>{parse(bodyContent, replaceOptions)}</div>
    </div>
  );
}
