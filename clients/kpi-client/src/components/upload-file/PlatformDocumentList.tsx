"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Alert, Empty, Form, Space, Spin, Tag, Typography, Row, Col } from "antd";
import FileCategoryConstant from "@/constants/FileCategoryConstant";
import {
  getPlatformDocs,
  PlatformDocument,
} from "@/constants/PlatformDocumentCatalog";
import fileServerService from "@/libs/file-uploader/fileServer.service";
import { TaiLieuDinhKemType } from "@/types/taiLieuDinhKem/dto";
import SingleFileUploader from "./SingleFileUploader";

const { Text } = Typography;

export type PlatformDocumentMap = Record<string, TaiLieuDinhKemType | null>;

export interface PlatformDocumentListProps {
  // ===== Context bắt buộc =====
  platformId: string;       // GUID hồ sơ nền tảng
  platformType: string;     // 1 trong PlatformManageTypeConstant
  taxCode: string;          // MST DN chủ quản

  // ===== Controlled value (optional) =====
  // Nếu truyền value/onChange → controlled, parent giữ state.
  // Nếu không → component tự fetch theo platformId.
  value?: PlatformDocumentMap;
  onChange?: (next: PlatformDocumentMap) => void;

  // ===== UI =====
  readOnly?: boolean;       // disable upload + xoá
  requiredKySo?: boolean;   // bật scan ký số cho mọi uploader

  // ===== Override catalog (test, custom) =====
  catalog?: PlatformDocument[];
}

// Render N SingleFileUploader theo danh mục PLATFORM_DOC_CATALOG[platformType].
// Mỗi uploader gắn 1 LoaiTaiLieu khác nhau (PLATFORM_OWNER / PLATFORM_PRODUCTS / ...)
// → cùng platformId, BE lưu N record TaiLieuDinhKem riêng biệt.
const PlatformDocumentList: React.FC<PlatformDocumentListProps> = ({
  platformId,
  platformType,
  taxCode,
  value,
  onChange,
  readOnly = false,
  requiredKySo = false,
  catalog,
}) => {
  const docs = useMemo(
    () => catalog ?? getPlatformDocs(platformType),
    [catalog, platformType],
  );

  const [internalMap, setInternalMap] = useState<PlatformDocumentMap>({});
  const [loading, setLoading] = useState(false);

  const isControlled = value !== undefined && onChange !== undefined;
  const fileMap = isControlled ? value : internalMap;

  const setFileMap = (next: PlatformDocumentMap) => {
    if (isControlled) onChange!(next);
    else setInternalMap(next);
  };

  // Khi không controlled, tự fetch các file đã upload theo platformId
  useEffect(() => {
    if (isControlled || !platformId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fileServerService.getByItemId(platformId);
        if (cancelled) return;
        const grouped: PlatformDocumentMap = {};
        (res.data ?? []).forEach((f) => {
          if (f.loaiTaiLieu) grouped[f.loaiTaiLieu] = f;
        });
        setInternalMap(grouped);
      } catch {
        if (!cancelled) setInternalMap({});
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isControlled, platformId]);

  if (!platformType) {
    return (
      <Alert
        type="warning"
        showIcon
        message="Chưa chọn loại hình nền tảng"
        description="Cần chọn PlatformManageType trước để xác định danh mục tài liệu yêu cầu."
      />
    );
  }

  if (docs.length === 0) {
    return (
      <Empty
        description={`Chưa cấu hình danh mục tài liệu cho loại "${platformType}"`}
      />
    );
  }

  const half = Math.ceil(docs.length / 2);
  const leftDocs = docs.slice(0, half);
  const rightDocs = docs.slice(half);

  const renderTable = (tableDocs: typeof docs, startIndex: number) => (
    <div style={{ overflowX: "auto", border: "1px solid #e2e8f0", borderRadius: 8 }}>
      <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
        <thead>
          <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
            <th style={{ padding: "10px 12px", fontWeight: 600, color: "#475569", width: "60px", textAlign: "center" }}>STT</th>
            <th style={{ padding: "10px 12px", fontWeight: 600, color: "#475569" }}>Tên tài liệu</th>
            <th style={{ padding: "10px 12px", fontWeight: 600, color: "#475569", width: "180px", textAlign: "center" }}>Tệp đính kèm</th>
          </tr>
        </thead>
        <tbody>
          {tableDocs.map((doc, idx) => (
            <tr key={doc.code} style={{ borderBottom: "1px solid #f1f5f9" }}>
              <td style={{ padding: "10px 12px", textAlign: "center", color: "#64748b", fontWeight: 500 }}>{startIndex + idx + 1}</td>
              <td style={{ padding: "10px 12px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <Text strong style={{ fontSize: "13px" }}>{doc.label}</Text>
                  <div>
                    {doc.required ? (
                      <Tag color="red" style={{ borderRadius: 4, margin: 0, fontSize: "11px", lineHeight: "16px" }}>Bắt buộc</Tag>
                    ) : (
                      <Tag style={{ borderRadius: 4, margin: 0, fontSize: "11px", lineHeight: "16px" }}>Không bắt buộc</Tag>
                    )}
                  </div>
                </div>
              </td>
              <td style={{ padding: "8px 12px" }}>
                <SingleFileUploader
                  value={fileMap[doc.code] ?? null}
                  onChange={(f) => setFileMap({ ...fileMap, [doc.code]: f })}
                  category={FileCategoryConstant.Platform}
                  subCategory={platformType}
                  taxCode={taxCode}
                  itemId={platformId}
                  loaiTaiLieu={doc.code}
                  accept={doc.accept}
                  maxMB={doc.maxMB}
                  readOnly={readOnly}
                  requiredKySo={requiredKySo}
                  typeBtn="default"
                  uploadLabel="Upload"
                  size="small"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <Spin spinning={loading}>
      <Row gutter={[12, 12]} style={{ marginTop: 12 }}>
        <Col xs={24} lg={12}>
          {renderTable(leftDocs, 0)}
        </Col>
        {rightDocs.length > 0 && (
          <Col xs={24} lg={12}>
            {renderTable(rightDocs, half)}
          </Col>
        )}
      </Row>
    </Spin>
  );
};

export default PlatformDocumentList;

// Helper validate cho parent form: trả về danh sách label các tài liệu required còn thiếu.
export const validatePlatformDocs = (
  platformType: string,
  fileMap: PlatformDocumentMap,
): string[] => {
  return getPlatformDocs(platformType)
    .filter((d) => d.required && !fileMap[d.code])
    .map((d) => d.label);
};
