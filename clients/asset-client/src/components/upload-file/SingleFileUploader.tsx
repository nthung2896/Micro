"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Button,
  Modal,
  Popover,
  Space,
  Tag,
  Tooltip,
  Typography,
  Upload,
  message,
} from "antd";
import {
  CheckCircleFilled,
  CloseCircleFilled,
  DeleteOutlined,
  ExclamationCircleFilled,
  EyeOutlined,
  InfoCircleOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import type { RcFile, UploadProps } from "antd/es/upload";
import fileServerService from "@/libs/file-uploader/fileServer.service";
import { TaiLieuDinhKemType } from "@/types/taiLieuDinhKem/dto";

const { Text } = Typography;

const DEFAULT_ACCEPT = ".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx";

export interface SingleFileUploaderProps {
  // ===== Controlled file value =====
  value?: TaiLieuDinhKemType | null;
  onChange?: (file: TaiLieuDinhKemType | null) => void;

  // ===== Upload context (chuyển thẳng vào fileServerService.uploadFiles) =====
  category: string; // 1 trong FileCategoryConstant
  subCategory?: string;
  taxCode?: string;
  itemId?: string;
  // Mã loại tài liệu (vd. "PLATFORM_OWNER") — phân biệt nhiều file cùng itemId.
  loaiTaiLieu?: string;
  serialNumber?: string;
  includeExportInfo?: boolean;
  requiredKySo?: boolean;

  // ===== UI overrides =====
  // Danh sách đuôi file cho phép, ngăn cách dấu phẩy. BẮT BUỘC có dấu chấm
  // ở đầu mỗi entry (vd: ".pdf,.jpg"). Dùng để vừa lọc dialog chọn file vừa
  // validate ở beforeUpload (chặn cả drag-drop / bypass "All files").
  accept?: string; // mặc định: .jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx
  maxMB?: number; // mặc định 50
  uploadLabel?: string; // text nút upload
  readOnly?: boolean; // disable upload + delete
  size?: "small" | "middle" | "large";
  typeBtn?: "primary" | "default" | "dashed" | "link" | "text";

  // ===== Behavior =====
  // Có gọi API delete khi user xác nhận xoá không (mặc định true).
  // Set false nếu muốn chỉ clear khỏi state (file vẫn nằm trên server, xoá ở bước save form).
  deleteOnConfirm?: boolean;

  onUploadSuccess?: (file: TaiLieuDinhKemType) => void;
  onUploadError?: (err: unknown) => void;
  onDeleteSuccess?: () => void;
}

// Component upload 1 file (single) với 3 trạng thái:
//   - Chưa có → nút Upload
//   - Đang upload → loading
//   - Có file → Tag ext + tên + size + nút Xem / Xoá (kèm modal xác nhận)
//
// Sử dụng fileServerService.uploadFiles() đã chuẩn hoá theo spec lưu tài liệu.
const SingleFileUploader: React.FC<SingleFileUploaderProps> = ({
  value,
  onChange,
  category,
  subCategory,
  taxCode,
  itemId,
  loaiTaiLieu,
  serialNumber,
  includeExportInfo,
  requiredKySo,
  accept = DEFAULT_ACCEPT,
  maxMB = 50,
  uploadLabel = "Tải lên tài liệu",
  readOnly = false,
  size = "middle",
  typeBtn,
  deleteOnConfirm = true,
  onUploadSuccess,
  onUploadError,
  onDeleteSuccess,
}) => {
  const [uploading, setUploading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const file = value ?? null;

  const setFile = (f: TaiLieuDinhKemType | null) => onChange?.(f);
  useEffect(() => {
    console.log(file);
  }, [file]);
  // Auto-fetch file đã upload theo (itemId, loaiTaiLieu) khi mount/đổi context.
  // Chỉ chạy khi parent chưa truyền value (tránh ghi đè state parent đang giữ).
  // hasFetchedRef chỉ được set SAU khi fetch resolve thành công — tránh race
  // với StrictMode (effect chạy 2 lần) khiến lần 2 bị skip và kết quả lần 1
  // bị cancel → file không bao giờ được set.
  const hasFetchedRef = useRef<string>("");
  useEffect(() => {
    if (!itemId || file) return;
    const key = `${itemId}|${loaiTaiLieu ?? ""}`;
    if (hasFetchedRef.current === key) return;
    let cancelled = false;
    (async () => {
      try {
        const tl = await fileServerService.getLatestByItemId(itemId, loaiTaiLieu);
        if (cancelled) return;
        hasFetchedRef.current = key;
        if (tl) setFile(tl);
      } catch {
        /* im lặng — uploader đơn giản, không cần báo lỗi load */
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemId, loaiTaiLieu]);

  const uploadProps: UploadProps = {
    name: "file",
    multiple: false,
    showUploadList: false,
    accept,
    beforeUpload: (f) => {
      // Validate đuôi file dựa trên prop `accept`.
      // Quy ước: mỗi entry phải bắt đầu bằng "." (vd ".pdf,.jpg").
      // Cần check ở đây vì `accept` của <input type=file> chỉ lọc dialog,
      // không chặn drag-drop hay khi user chọn "All files".
      const allowedExts = (accept || "")
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter((s) => s.startsWith("."));
      if (allowedExts.length > 0) {
        const dot = f.name.lastIndexOf(".");
        const fileExt = dot >= 0 ? f.name.slice(dot).toLowerCase() : "";
        if (!fileExt || !allowedExts.includes(fileExt)) {
          message.error(`Chỉ chấp nhận file: ${allowedExts.join(", ")}`);
          return Upload.LIST_IGNORE;
        }
      }
      if (maxMB > 0 && f.size > maxMB * 1024 * 1024) {
        message.error(`File vượt quá ${maxMB}MB`);
        return Upload.LIST_IGNORE;
      }
      return true;
    },
    customRequest: async ({ file: rawFile, onSuccess, onError }) => {
      const rcFile = rawFile as RcFile;
      setUploading(true);
      try {
        const resp = await fileServerService.uploadFiles([rcFile as File], {
          category,
          subCategory,
          taxCode,
          itemId,
          loaiTaiLieu,
          serialNumber,
          requiredKySo,
          includeExportInfo,
        });
        if (resp?.data && resp.data.length > 0) {
          const uploaded = resp.data[0];
          setFile(uploaded);
          onUploadSuccess?.(uploaded);
          message.success("Upload thành công");
          onSuccess?.(uploaded);
        } else {
          throw new Error(resp?.message || "Upload thất bại");
        }
      } catch (err: any) {
        const msg =
          typeof err === "string"
            ? err
            : err?.message || err?.title || "Upload thất bại";
        message.error(msg);
        console.error("Upload error:", err);
        onUploadError?.(err);
        onError?.(err);
      } finally {
        setUploading(false);
      }
    },
  };

  const handlePreview = () => {
    if (!file) return;
    window.open(file.duongDanFile, "_blank", "noopener,noreferrer");
  };

  const handleConfirmDelete = async () => {
    if (!file) return;

    try {
      if (deleteOnConfirm) {
        const resp = await fileServerService.delete([file.id]);
        if (!resp?.status) {
          message.error(resp?.message || "Xoá thất bại");
          return;
        }
        message.success("Xoá file thành công");
      }
      setFile(null);
      onDeleteSuccess?.();
    } catch (err: any) {
      message.error(err?.message || "Xoá thất bại");
    } finally {
      setConfirmDelete(false);
    }
  };

  // ===== Render =====
  if (!file) {
    return (
      <Upload {...uploadProps} disabled={readOnly}>
        <Button
          type={typeBtn ?? "primary"}
          icon={<UploadOutlined />}
          size={size}
          loading={uploading}
          disabled={readOnly}
        >
          {uploading ? "Đang upload..." : uploadLabel}
        </Button>
      </Upload>
    );
  }

  return (
    <Space direction="vertical" size="small" style={{ width: "100%" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 12px",
          border: "1px solid #f0f0f0",
          borderRadius: 8,
          background: "#fafafa",
        }}
      >
        {/* Bên trái: info file (chiếm hết space còn lại) */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: 8,
            minWidth: 0,
          }}
        >
          <Tag color="blue" style={{ margin: 0 }}>
            {file.extension?.toUpperCase()}
          </Tag>
          <Text
            strong
            ellipsis
            style={{ flex: 1, minWidth: 0 }}
            title={file.tenTaiLieu}
          >
            {file.tenTaiLieu}
          </Text>
          {typeof file.kichThuoc === "number" && (
            <Text type="secondary" style={{ fontSize: 12, flexShrink: 0 }}>
              ({Math.round(file.kichThuoc)} KB)
            </Text>
          )}
          <KySoBadge file={file} requiredKySo={requiredKySo} />
        </div>

        {/* Bên phải: actions dạng icon */}
        <Space size={4} style={{ flexShrink: 0 }}>
          <Tooltip title="Xem file">
            <Button
              type="text"
              icon={<EyeOutlined />}
              size={size}
              onClick={handlePreview}
            />
          </Tooltip>
          {!readOnly && (
            <Tooltip title="Xoá file">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                size={size}
                onClick={() => setConfirmDelete(true)}
              />
            </Tooltip>
          )}
        </Space>
      </div>

      <KySoAlert file={file} requiredKySo={requiredKySo} />

      <Modal
        title="Xác nhận xoá file"
        open={confirmDelete}
        onOk={handleConfirmDelete}
        onCancel={() => setConfirmDelete(false)}
        okText="Xoá"
        cancelText="Huỷ"
        okButtonProps={{ danger: true }}
      >
        <p>
          Bạn có chắc chắn muốn xoá file <strong>{file.tenTaiLieu}</strong>{" "}
          không? Hành động này không thể hoàn tác.
        </p>
      </Modal>
    </Space>
  );
};

export default SingleFileUploader;

// =====================================================================
// ===== KySoBadge / KySoAlert: cảnh báo trạng thái ký số ============
// =====================================================================
// Quy ước trạng thái dựa vào 2 cờ BE trả về sau upload:
//   coChuKySo = file PDF có chứa chữ ký số hay không (BE scan bằng iText)
//   isKySo    = chữ ký số đó có hợp lệ (chứng chỉ còn hạn, không bị tamper)
//
// Khi requiredKySo=false → vẫn hiển thị badge nếu có chữ ký, nhưng không
// hiện Alert đỏ. Đảm bảo dev luôn nhìn thấy thông tin ký số nếu có.

type KySoProps = {
  file: TaiLieuDinhKemType;
  requiredKySo?: boolean;
};

const KySoBadge: React.FC<KySoProps> = ({ file, requiredKySo }) => {
  // Chưa có dữ liệu ký số trả về (file ảnh / office / BE chưa scan) → ẩn.
  if (file.coChuKySo == null && file.isKySo == null) return null;

  // Có ký số + hợp lệ
  if (file.coChuKySo && file.isKySo) {
    const content = (
      <div style={{ minWidth: 240, fontSize: 13 }}>
        <div>
          <strong>Người ký:</strong> {file.nguoiKy || "—"}
        </div>
        <div>
          <strong>Đơn vị phát hành:</strong> {file.donViPhatHanh || "—"}
        </div>
        <div>
          <strong>Ngày ký:</strong>{" "}
          {file.ngayKy ? new Date(file.ngayKy).toLocaleString("vi-VN") : "—"}
        </div>
      </div>
    );
    return (
      <Popover title="Thông tin chữ ký số" content={content} trigger="hover">
        <Tag
          icon={<CheckCircleFilled />}
          color="success"
          style={{ cursor: "help" }}
        >
          Đã ký số <InfoCircleOutlined style={{ marginLeft: 4 }} />
        </Tag>
      </Popover>
    );
  }

  // Có ký số nhưng KHÔNG hợp lệ (cert hết hạn / file bị sửa sau ký / …)
  if (file.coChuKySo && file.isKySo === false) {
    return (
      <Tag icon={<CloseCircleFilled />} color="error">
        Chữ ký số không hợp lệ
      </Tag>
    );
  }

  // Không có ký số. Chỉ cảnh báo (vàng) nếu requiredKySo, không thì im.
  if (!file.coChuKySo && requiredKySo) {
    return (
      <Tag icon={<ExclamationCircleFilled />} color="warning">
        Chưa có chữ ký số
      </Tag>
    );
  }

  return null;
};

const KySoAlert: React.FC<KySoProps> = ({ file, requiredKySo }) => {
  if (!requiredKySo) return null;

  // Đã ký + hợp lệ → không cần alert.
  if (file.coChuKySo && file.isKySo) return null;

  if (file.coChuKySo && file.isKySo === false) {
    return (
      <Alert
        type="error"
        showIcon
        message="Chữ ký số không hợp lệ"
        description="File có chữ ký số nhưng chứng chỉ đã hết hạn, không khớp người ký, hoặc file đã bị chỉnh sửa sau khi ký. Vui lòng ký lại bằng chứng thư còn hiệu lực và upload lại."
      />
    );
  }

  if (!file.coChuKySo) {
    return (
      <Alert
        type="warning"
        showIcon
        message="Chưa có chữ ký số"
        description="File này yêu cầu phải ký số trước khi gửi. Hãy ký file PDF bằng USB Token hoặc chứng thư số đã đăng ký, sau đó upload lại."
      />
    );
  }

  return null;
};
