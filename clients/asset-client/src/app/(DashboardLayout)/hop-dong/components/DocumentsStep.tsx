import SingleFileUploader from "@/components/upload-file/SingleFileUploader";
import FileUploader from "@/libs/file-uploader";
import {  UseFileUploaderReturnType } from "@/libs/file-uploader/types";
import { Alert, Card, Space, Typography } from "antd";
import FileCategoryConstant from "@/constants/FileCategoryConstant";
import LoaiTaiLieuContractConstant from "@/constants/LoaiTaiLieuContractConstant";
import { useState } from "react";
import { TaiLieuDinhKemType } from "@/types/taiLieuDinhKem/dto";

const { Text } = Typography;

interface DocumentsStepProps {
  documentUploader: UseFileUploaderReturnType;
  extraDocumentUploader: UseFileUploaderReturnType;
  taxCode: string;
  contractId: string;
}

const DocumentsStep: React.FC<DocumentsStepProps> = ({
  documentUploader,
  extraDocumentUploader,
  taxCode,
  contractId,
}) => {
  const [file, setFile] = useState<TaiLieuDinhKemType | null>(null);
  console.log("DocumentUploader state:", contractId);
  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <Card title="4.1 Tài liệu hồ sơ chứng thực" size="small">
        <Text type="secondary">
          Tải lên các tài liệu chính liên quan đến hồ sơ chứng thực hợp đồng
          điện tử.
        </Text>
        <div style={{ marginTop: 12 }}>
          <SingleFileUploader
            value={file}
            onChange={setFile}
            category={FileCategoryConstant.Contract}
            taxCode={taxCode}
            subCategory="AuthenticationContract"
            itemId={contractId}
            loaiTaiLieu={LoaiTaiLieuContractConstant.ChungMinhTenMien}
            accept=".pdf"
            requiredKySo
          />
        </div>
      </Card>   
      {!taxCode && (
        <Alert
          type="warning"
          showIcon
          message="Chưa có mã số thuế doanh nghiệp nên chưa thể tải tài liệu lên."
        />
      )}
    </Space>
  );
};

export default DocumentsStep;
