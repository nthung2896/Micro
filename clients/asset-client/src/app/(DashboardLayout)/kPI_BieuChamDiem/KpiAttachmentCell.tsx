"use client";

import React from "react";
import { Badge, Button, List, Popover, Tooltip, Spin, message } from "antd";
import {
  DeleteOutlined,
  EyeOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FileImageOutlined,
  FileZipOutlined,
  FilePptOutlined,
  FileTextOutlined,
  PaperClipOutlined,
  PlusOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import AttachmentPreviewModal, { formatAttachmentSize, PreviewAttachment } from "./AttachmentPreviewModal";
import taiLieuDinhKemService from "@/services/taiLieuDinhKem/taiLieuDinhKem.service";

type KpiAttachmentCellProps = {
  product: any;
  canEdit: boolean;
  onFilesSelected: (files: File[]) => void;
  onAddUploadedAttachments?: (items: any[]) => void;
  onRemoveExisting: (id: string) => void;
  onRemoveNew: (file: File) => void;
  enablePreview?: boolean;
};

const extensionOf = (item: { kind: "existing" | "new"; file: any }) => {
  const raw = item.kind === "new" ? item.file.name.split(".").pop() : item.file.extension;
  return String(raw || "").replace(".", "").toLowerCase();
};

const previewableExtensions = new Set([
  "jpg", "jpeg", "png", "gif", "bmp", "webp",
  "pdf",
  "doc", "docx", "xls", "xlsx", "ppt", "pptx",
  "txt", "csv",
]);

const renderFileAvatar = (extension: string) => {
  switch (extension) {
    case "pdf":
      return <FilePdfOutlined style={{ color: "#dc2626", fontSize: 18 }} />;
    case "doc":
    case "docx":
      return <FileWordOutlined style={{ color: "#2563eb", fontSize: 18 }} />;
    case "xls":
    case "xlsx":
      return <FileExcelOutlined style={{ color: "#16a34a", fontSize: 18 }} />;
    case "png":
    case "jpg":
    case "jpeg":
    case "gif":
    case "bmp":
    case "webp":
      return <FileImageOutlined style={{ color: "#ea580c", fontSize: 18 }} />;
    case "ppt":
    case "pptx":
      return <FilePptOutlined style={{ color: "#ea580c", fontSize: 18 }} />;
    case "txt":
    case "csv":
      return <FileTextOutlined style={{ color: "#64748b", fontSize: 18 }} />;
    case "zip":
    case "rar":
    case "7z":
      return <FileZipOutlined style={{ color: "#ca8a04", fontSize: 18 }} />;
    default:
      return <PaperClipOutlined style={{ fontSize: 18 }} />;
  }
};

const KpiAttachmentCell: React.FC<KpiAttachmentCellProps> = ({
  product,
  canEdit,
  onFilesSelected,
  onAddUploadedAttachments,
  onRemoveExisting,
  onRemoveNew,
  enablePreview = false,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const officePreviewCacheRef = React.useRef<Map<File, string>>(new Map());
  const [previewAttachment, setPreviewAttachment] = React.useState<PreviewAttachment | null>(null);
  const [popoverOpen, setPopoverOpen] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);

  const existing = product?.existingAttachments || product?.taiLieuDinhKem || [];
  const keptIds = new Set(product?.keptAttachmentIds || existing.map((item: any) => item.id));
  const visibleExisting = existing.filter((item: any) => keptIds.has(item.id));
  const newFiles: File[] = product?.newFiles || [];
  const count = visibleExisting.length + newFiles.length;

  React.useEffect(() => {
    officePreviewCacheRef.current.forEach((url, file) => {
      if (!newFiles.includes(file)) {
        URL.revokeObjectURL(url);
        officePreviewCacheRef.current.delete(file);
      }
    });
    if (previewAttachment?.kind === "new" && !newFiles.includes(previewAttachment.file)) setPreviewAttachment(null);
    if (previewAttachment?.kind === "existing" && !visibleExisting.some((file: any) => file.id === previewAttachment.file.id)) setPreviewAttachment(null);
  }, [newFiles, previewAttachment, visibleExisting]);

  React.useEffect(() => () => {
    officePreviewCacheRef.current.forEach((url) => URL.revokeObjectURL(url));
    officePreviewCacheRef.current.clear();
  }, []);

  const handleFileInputChange = async (files: File[]) => {
    if (!files.length) return;

    // Validate dung lượng từng file (tối đa 50 MB)
    const tooLarge = files.find((f) => f.size > 50 * 1024 * 1024);
    if (tooLarge) {
      message.error(`File ${tooLarge.name} vượt quá dung lượng tối đa 50 MB.`);
      return;
    }

    const productId = product?.id || product?.Id || product?.idDauRaNhiemVu;
    // Nếu sản phẩm đã có ID trong database, upload trực tiếp lên MinIO
    if (productId && onAddUploadedAttachments) {
      setUploading(true);
      try {
        const formData = new FormData();
        files.forEach((f) => formData.append("Files", f, f.name));
        formData.append("FileType", "KPI_DAU_RA_NHIEM_VU");
        formData.append("ItemId", productId);

        const res = await taiLieuDinhKemService.upload(formData);
        if (res?.status && res?.data && res.data.length > 0) {
          onAddUploadedAttachments(res.data);
        } else {
          message.error(res?.message || "Upload tài liệu thất bại");
          onFilesSelected(files);
        }
      } catch (err: any) {
        console.error("Lỗi khi upload tài liệu lên MinIO:", err);
        message.error(err?.message || "Lỗi khi upload tài liệu lên MinIO");
        onFilesSelected(files);
      } finally {
        setUploading(false);
      }
    } else {
      // Nếu sản phẩm chưa có ID (dòng mới), lưu vào hàng đợi gửi kèm payload
      onFilesSelected(files);
    }
  };

  const items = [
    ...visibleExisting.map((file: any) => ({ kind: "existing" as const, file })),
    ...newFiles.map((file: File) => ({ kind: "new" as const, file })),
  ];

  const popoverContent = (
    <div style={{ width: 390, maxWidth: "80vw" }}>
      <List
        size="small"
        dataSource={items}
        locale={{ emptyText: "Chưa có tài liệu" }}
        renderItem={(item) => {
          const file = item.file;
          const name = item.kind === "new" ? file.name : file.tenTaiLieu;
          const extension = extensionOf(item);
          const size = item.kind === "new" ? file.size : file.kichThuoc;
          const canPreview = enablePreview && previewableExtensions.has(extension);
          const actions: React.ReactNode[] = [];
          if (canPreview) {
            actions.push(
              <Tooltip key="preview" title="Xem trước">
                <Button
                  type="text"
                  size="small"
                  icon={<EyeOutlined />}
                  disabled={Boolean(previewAttachment) || uploading}
                  onClick={() => {
                    setPopoverOpen(false);
                    setPreviewAttachment(item);
                  }}
                />
              </Tooltip>,
            );
          }
          actions.push(
            <Button
              key="remove"
              type="text"
              danger
              size="small"
              icon={<DeleteOutlined />}
              disabled={Boolean(previewAttachment) || uploading}
              onClick={() => item.kind === "new" ? onRemoveNew(file) : onRemoveExisting(file.id)}
            />,
          );
          return (
            <List.Item actions={actions.length ? actions : undefined}>
              <List.Item.Meta
                avatar={renderFileAvatar(extension)}
                title={name}
                description={`${extension ? `.${extension} · ` : ""}${formatAttachmentSize(size)}`}
              />
            </List.Item>
          );
        }}
      />
    </div>
  );

  return (
    <>
      <div className="kpi-attachment-cell" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
        {canEdit && (
          <Tooltip title="Đính kèm tài liệu (.pdf, Office, ảnh, .txt, .csv)">
            <span style={{ display: "inline-flex" }}>
              <input
                ref={fileInputRef}
                type="file"
                hidden
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.gif,.bmp,.webp,.txt,.csv"
                onChange={(event) => {
                  handleFileInputChange(Array.from(event.target.files || []));
                  event.currentTarget.value = "";
                }}
              />
              <Button
                size="small"
                type="primary"
                icon={uploading ? <LoadingOutlined /> : <PlusOutlined />}
                loading={uploading}
                style={{ backgroundColor: '#0f766e', borderColor: '#0f766e', color: '#ffffff' }}
                htmlType="button"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  fileInputRef.current?.click();
                }}
              />
            </span>
          </Tooltip>
        )}
        <Popover
          trigger="click"
          content={popoverContent}
          title="Tài liệu đính kèm"
          open={popoverOpen}
          onOpenChange={(open) => {
            if (!previewAttachment && !uploading) setPopoverOpen(open);
          }}
        >
          <Badge className="kpi-attachment-badge" count={count} showZero={false} size="small" offset={[2, -2]}>
            <Button className="kpi-attachment-list-button" size="small" type="default" icon={<PaperClipOutlined />} />
          </Badge>
        </Popover>
      </div>
      {enablePreview && <AttachmentPreviewModal attachment={previewAttachment} onClose={() => setPreviewAttachment(null)} officeCache={officePreviewCacheRef} />}
    </>
  );
};

export default KpiAttachmentCell;

