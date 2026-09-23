"use client";
import { PlayCircleOutlined } from "@ant-design/icons";
import { Alert, Button, Input, Modal, Select, Tag, message } from "antd";
import { useState } from "react";
import {
  CUSTOM_DATA_SOURCE_VALUE,
  DATA_SOURCE_OPTIONS,
  fetchDataSource,
} from "./dataSourceRegistry";

type Props = {
  value?: string;
  onChange?: (v: string) => void;
};

/**
 * Field kết hợp Select + Input.
 * - Select có thêm option "Tùy chọn (gõ API)" — value = CUSTOM_DATA_SOURCE_VALUE.
 * - Khi chọn option đó, hiện Input để gõ URL API. Giá trị form sẽ là URL.
 * - Khi load existing block: nếu value không khớp option có sẵn → coi là custom URL,
 *   tự chọn "Tùy chọn" và đổ URL vào Input.
 * - Có nút Test để gọi API và xem JSON trả về.
 */
export default function DataSourceField({ value, onChange }: Props) {
  const knownCodes = new Set(DATA_SOURCE_OPTIONS.map((o) => o.value));
  const isCustom = !!value && !knownCodes.has(value);
  const selectValue = isCustom ? CUSTOM_DATA_SOURCE_VALUE : value || "";

  const [testing, setTesting] = useState(false);
  const [testOpen, setTestOpen] = useState(false);
  const [testResult, setTestResult] = useState<{
    ok: boolean;
    raw: any;
    error?: string;
    ms: number;
  } | null>(null);

  const handleTest = async () => {
    if (!value) {
      message.warning("Chọn nguồn dữ liệu trước khi test");
      return;
    }
    setTesting(true);
    setTestOpen(true);
    setTestResult(null);
    const start = performance.now();
    try {
      // Custom URL → fetch raw để show đúng JSON gốc.
      // Registry source → gọi fetchDataSource (cũng chính là output mà engine sẽ thấy).
      if (isCustom) {
        const res = await fetch(value, { headers: { Accept: "application/json" } });
        const ms = Math.round(performance.now() - start);
        if (!res.ok) {
          setTestResult({
            ok: false,
            raw: null,
            error: `HTTP ${res.status} ${res.statusText}`,
            ms,
          });
        } else {
          const json = await res.json();
          setTestResult({ ok: true, raw: json, ms });
        }
      } else {
        const json = await fetchDataSource(value);
        const ms = Math.round(performance.now() - start);
        setTestResult({ ok: true, raw: json, ms });
      }
    } catch (e: any) {
      setTestResult({
        ok: false,
        raw: null,
        error: e?.message || "Fetch failed",
        ms: Math.round(performance.now() - start),
      });
    } finally {
      setTesting(false);
    }
  };

  // Gợi ý template path từ shape JSON trả về
  const suggestPath = (json: any): string[] => {
    if (Array.isArray(json)) return ["{{#each items}}"];
    if (!json || typeof json !== "object") return [];
    const hints: string[] = [];
    const scan = (obj: any, prefix: string, depth: number) => {
      if (depth > 3 || !obj || typeof obj !== "object") return;
      for (const k of Object.keys(obj)) {
        const path = prefix ? `${prefix}.${k}` : k;
        if (Array.isArray(obj[k])) {
          hints.push(`{{#each ${path}}}`);
        } else if (typeof obj[k] === "object") {
          scan(obj[k], path, depth + 1);
        }
      }
    };
    scan(json, "", 0);
    return hints.slice(0, 5);
  };

  const canTest =
    !!value &&
    selectValue !== "" &&
    !(selectValue === CUSTOM_DATA_SOURCE_VALUE && !isCustom);

  return (
    <>
      <div style={{ display: "flex", gap: 8 }}>
        <Select
          style={{ flex: 1 }}
          value={selectValue}
          onChange={(v) => {
            if (v === CUSTOM_DATA_SOURCE_VALUE) {
              onChange?.("/api/");
            } else {
              onChange?.(v);
            }
          }}
          options={[
            ...DATA_SOURCE_OPTIONS,
            {
              label: "Tùy chọn — gõ API tự do",
              value: CUSTOM_DATA_SOURCE_VALUE,
            },
          ]}
        />
        <Button
          icon={<PlayCircleOutlined />}
          loading={testing}
          onClick={handleTest}
          disabled={!canTest}
          title="Gọi thử nguồn dữ liệu để xem JSON trả về"
        >
          Test
        </Button>
      </div>
      {(isCustom || selectValue === CUSTOM_DATA_SOURCE_VALUE) && (
        <Input
          style={{ marginTop: 8 }}
          placeholder="VD: /api/Portal/MyData hoặc https://api.example.com/endpoint"
          value={isCustom ? value : ""}
          onChange={(e) => onChange?.(e.target.value)}
          allowClear
        />
      )}

      <Modal
        title={`Test nguồn dữ liệu: ${value || ""}`}
        open={testOpen}
        onCancel={() => setTestOpen(false)}
        footer={null}
        width={720}
        zIndex={2100}
      >
        {!testResult && <div>Đang gọi API...</div>}
        {testResult && testResult.ok && (
          <>
            <Alert
              type="success"
              showIcon
              message={`Thành công (${testResult.ms}ms)`}
              style={{ marginBottom: 12 }}
            />
            {suggestPath(testResult.raw).length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
                  Gợi ý path để lặp danh sách:
                </div>
                {suggestPath(testResult.raw).map((p) => (
                  <Tag
                    key={p}
                    color="blue"
                    style={{ cursor: "pointer", marginBottom: 4 }}
                    onClick={() => {
                      navigator.clipboard.writeText(p);
                      message.success("Đã copy");
                    }}
                  >
                    {p}
                  </Tag>
                ))}
              </div>
            )}
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
              JSON trả về:
            </div>
            <pre
              style={{
                background: "#0f172a",
                color: "#e2e8f0",
                padding: 12,
                borderRadius: 6,
                fontSize: 12,
                overflow: "auto",
                maxHeight: 420,
                margin: 0,
              }}
            >
              {JSON.stringify(testResult.raw, null, 2)}
            </pre>
          </>
        )}
        {testResult && !testResult.ok && (
          <Alert
            type="error"
            showIcon
            message="Gọi API thất bại"
            description={`${testResult.error} (${testResult.ms}ms)`}
          />
        )}
      </Modal>
    </>
  );
}
