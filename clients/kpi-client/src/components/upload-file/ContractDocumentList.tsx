import React, { useEffect, useState, useMemo } from "react";
import { Form, Space, Spin, Tag, Typography, Row, Col } from "antd";
import FileCategoryConstant from "@/constants/FileCategoryConstant";
import fileServerService from "@/libs/file-uploader/fileServer.service";
import { TaiLieuDinhKemType } from "@/types/taiLieuDinhKem/dto";
import SingleFileUploader from "./SingleFileUploader";

const { Text } = Typography;

export type ContractDocumentMap = Record<string, TaiLieuDinhKemType | null>;

export interface ContractDocument {
  code: string;
  label: string;
  required: boolean;
  requiredKySo: boolean;
  accept?: string;
  maxMB?: number;
}

export const CONTRACT_DOCS: ContractDocument[] = [
  {
    code: "DangKyChungThuc",
    label: "Tài liệu đăng ký chứng thực",
    required: true,
    accept: ".pdf",
    requiredKySo: true,
  },
  {
    code: "HuongDanDichVu",
    label: "Tài liệu hướng dẫn dịch vụ",
    required: true,
    accept: ".pdf",
    requiredKySo: true,
  },
  {
    code: "ChungMinhTenMien",
    label: "Tài liệu chứng minh sở hữu tên miền",
    required: true,
    accept: ".pdf",
    requiredKySo: true,
  },
];

export interface ContractDocumentListProps {
  contractId: string;       // GUID hồ sơ hợp đồng
  taxCode: string;          // MST DN chủ quản
  value?: ContractDocumentMap;
  onChange?: (next: ContractDocumentMap) => void;
  readOnly?: boolean;       // disable upload + xoá
  requiredKySo?: boolean;   // bật scan ký số cho mọi uploader
}

const ContractDocumentList: React.FC<ContractDocumentListProps> = ({
  contractId,
  taxCode,
  value,
  onChange,
  readOnly = false,
  requiredKySo = true,
}) => {
  const [internalMap, setInternalMap] = useState<ContractDocumentMap>({});
  const [loading, setLoading] = useState(false);

  const isControlled = value !== undefined && onChange !== undefined;
  const fileMap = isControlled ? value : internalMap;

  const setFileMap = (next: ContractDocumentMap) => {
    if (isControlled) onChange!(next);
    else setInternalMap(next);
  };

  // Tự động fetch file cũ nếu có contractId và không controlled
  useEffect(() => {
    if (isControlled || !contractId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fileServerService.getByItemId(contractId);
        if (cancelled) return;
        const grouped: ContractDocumentMap = {};
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
  }, [isControlled, contractId]);

  const half = Math.ceil(CONTRACT_DOCS.length / 2);
  const leftDocs = CONTRACT_DOCS.slice(0, half);
  const rightDocs = CONTRACT_DOCS.slice(half);

  const renderTable = (tableDocs: typeof CONTRACT_DOCS, startIndex: number) => (
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
                  category={FileCategoryConstant.Contract}
                  taxCode={taxCode}
                  itemId={contractId}
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
        <Col xs={24} lg={12}>
          {renderTable(rightDocs, half)}
        </Col>
      </Row>
    </Spin>
  );
};

export default ContractDocumentList;

export const validateContractDocs = (
  fileMap: ContractDocumentMap,
): string[] => {
  return CONTRACT_DOCS
    .filter((d) => d.required && !fileMap[d.code])
    .map((d) => d.label);
};
