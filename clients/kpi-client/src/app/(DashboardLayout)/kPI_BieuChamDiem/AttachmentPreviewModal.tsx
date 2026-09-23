"use client";

import React from "react";
import { Alert, Button, Modal, Spin, Typography } from "antd";
import {
  CloseOutlined,
  DownloadOutlined,
  FileExcelOutlined,
  FileImageOutlined,
  FilePdfOutlined,
  FilePptOutlined,
  FileTextOutlined,
  FileWordOutlined,
} from "@ant-design/icons";
import taiLieuDinhKemService from "@/services/taiLieuDinhKem/taiLieuDinhKem.service";

export type PreviewAttachment =
  | { kind: "existing"; file: any }
  | { kind: "new"; file: File };

type Props = {
  attachment: PreviewAttachment | null;
  onClose: () => void;
  officeCache: React.MutableRefObject<Map<File, string>>;
};

export const formatAttachmentSize = (size?: number) => {
  if (!size || size < 1) return "0 B";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const getDetails = (attachment: PreviewAttachment | null) => {
  if (!attachment) return { name: "", extension: "", size: 0 };
  const name = attachment.kind === "new" ? attachment.file.name : attachment.file.tenTaiLieu;
  const rawExtension = attachment.kind === "new"
    ? name.split(".").pop()
    : attachment.file.extension || name?.split(".").pop();
  return {
    name,
    extension: rawExtension?.replace(".", "").toLowerCase() || "",
    size: attachment.kind === "new" ? attachment.file.size : Number(attachment.file.kichThuoc || 0),
  };
};

const triggerDownload = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  // Giữ URL đủ lâu để Edge/Chrome bắt đầu đọc dữ liệu tải xuống.
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
};

const imageExtensions = new Set(["jpg", "jpeg", "png", "gif", "bmp", "webp"]);
const textExtensions = new Set(["txt", "csv"]);
const officeExtensions = new Set(["doc", "docx", "xls", "xlsx", "ppt", "pptx"]);

const AttachmentPreviewModal: React.FC<Props> = ({ attachment, onClose, officeCache }) => {
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [downloading, setDownloading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [previewText, setPreviewText] = React.useState<string | null>(null);
  const requestRef = React.useRef<{ sequence: number; controller?: AbortController }>({ sequence: 0 });
  const downloadInFlightRef = React.useRef(false);
  const details = getDetails(attachment);

  const releaseTransientUrl = React.useCallback((url: string | null) => {
    if (!url) return;
    const isCachedOffice = Array.from(officeCache.current.values()).includes(url);
    if (!isCachedOffice) URL.revokeObjectURL(url);
  }, [officeCache]);

  React.useEffect(() => {
    requestRef.current.controller?.abort();
    const sequence = requestRef.current.sequence + 1;
    requestRef.current.sequence = sequence;
    setError(null);
    setPreviewText(null);
    setPreviewUrl((oldUrl) => {
      releaseTransientUrl(oldUrl);
      return null;
    });
    if (!attachment) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    requestRef.current.controller = controller;
    const load = async () => {
      setLoading(true);
      try {
        let url: string;
        let contentBlob: Blob;
        if (attachment.kind === "new" && !officeExtensions.has(details.extension)) {
          contentBlob = attachment.file;
          url = URL.createObjectURL(contentBlob);
        } else if (attachment.kind === "new") {
          const cached = officeCache.current.get(attachment.file);
          if (cached) {
            url = cached;
            contentBlob = attachment.file;
          } else {
            contentBlob = await taiLieuDinhKemService.previewTemporary(attachment.file, controller.signal);
            url = URL.createObjectURL(contentBlob);
            officeCache.current.set(attachment.file, url);
          }
        } else {
          contentBlob = await taiLieuDinhKemService.getPreviewBlob(attachment.file.id, controller.signal);
          url = URL.createObjectURL(contentBlob);
        }

        if (textExtensions.has(details.extension)) {
          setPreviewText(await contentBlob.text());
        }

        if (requestRef.current.sequence !== sequence || controller.signal.aborted) {
          const cached = attachment.kind === "new" && officeCache.current.get(attachment.file) === url;
          if (!cached) URL.revokeObjectURL(url);
          return;
        }
        setPreviewUrl(url);
      } catch (requestError: any) {
        if (!controller.signal.aborted && requestRef.current.sequence === sequence) {
          setError(typeof requestError === "string" ? requestError : "Không thể tải nội dung xem trước.");
        }
      } finally {
        if (requestRef.current.sequence === sequence) setLoading(false);
      }
    };
    void load();

    return () => controller.abort();
  }, [attachment, details.extension, officeCache, releaseTransientUrl]);

  React.useEffect(() => () => {
    requestRef.current.sequence += 1;
    requestRef.current.controller?.abort();
  }, []);

  React.useEffect(() => () => releaseTransientUrl(previewUrl), [previewUrl, releaseTransientUrl]);

  const handleClose = () => {
    requestRef.current.sequence += 1;
    requestRef.current.controller?.abort();
    setPreviewUrl((url) => {
      releaseTransientUrl(url);
      return null;
    });
    onClose();
  };

  const handleDownload = async () => {
    if (!attachment || downloadInFlightRef.current) return;
    downloadInFlightRef.current = true;
    setDownloading(true);
    try {
      if (attachment.kind === "new") triggerDownload(attachment.file, attachment.file.name);
      else triggerDownload(await taiLieuDinhKemService.getDownloadBlob(attachment.file.id), details.name);
    } catch {
      setError("Không thể tải file gốc.");
    } finally {
      downloadInFlightRef.current = false;
      setDownloading(false);
    }
  };

  const fileIcon = details.extension === "pdf"
    ? <FilePdfOutlined style={{ color: "#dc2626", fontSize: 28 }} />
    : imageExtensions.has(details.extension)
      ? <FileImageOutlined style={{ color: "#ea580c", fontSize: 28 }} />
      : details.extension === "xls" || details.extension === "xlsx"
        ? <FileExcelOutlined style={{ color: "#16a34a", fontSize: 28 }} />
        : details.extension === "ppt" || details.extension === "pptx"
          ? <FilePptOutlined style={{ color: "#ea580c", fontSize: 28 }} />
          : textExtensions.has(details.extension)
            ? <FileTextOutlined style={{ color: "#64748b", fontSize: 28 }} />
            : <FileWordOutlined style={{ color: "#2563eb", fontSize: 28 }} />;

  return (
    <Modal
      open={Boolean(attachment)}
      onCancel={handleClose}
      footer={null}
      closable={false}
      keyboard
      maskClosable
      width="92vw"
      style={{ top: "5vh", maxWidth: 1500, paddingBottom: 0 }}
      styles={{ body: { height: "calc(90vh - 76px)", padding: 0, overflow: "hidden", background: "#f3f4f6" } }}
      title={
        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 12, paddingRight: 4 }}>
          {fileIcon}
          <div style={{ flex: 1, minWidth: 0, color: "#ffffff" }}>
            <Typography.Text strong ellipsis style={{ display: "block", fontSize: 17, color: "#ffffff" }}>{details.name}</Typography.Text>
            <Typography.Text style={{ color: "rgba(255, 255, 255, 0.78)" }}>{details.extension ? `.${details.extension} · ` : ""}{formatAttachmentSize(details.size)}</Typography.Text>
          </div>
          <Button icon={<DownloadOutlined />} loading={downloading} onClick={handleDownload}>Tải về</Button>
          <Button icon={<CloseOutlined />} onClick={handleClose}>Đóng</Button>
        </div>
      }
    >
      {loading && (
        <div style={{ height: "100%", display: "grid", placeItems: "center" }}>
          <Spin size="large" tip={officeExtensions.has(details.extension) ? "Đang xử lý file Office..." : "Đang tải tài liệu..."} />
        </div>
      )}
      {!loading && error && (
        <div style={{ padding: 24 }}>
          <Alert type="error" showIcon message="Không thể xem trước tài liệu" description={error} action={<Button onClick={handleDownload} loading={downloading}>Tải file gốc</Button>} />
        </div>
      )}
      {!loading && !error && previewUrl && imageExtensions.has(details.extension) && (
        <div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", padding: 16, background: "#111827" }}>
          <img src={previewUrl} alt={details.name} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
        </div>
      )}
      {!loading && !error && previewUrl && textExtensions.has(details.extension) && previewText !== null && (
        <pre style={{ width: "100%", height: "100%", margin: 0, padding: 24, overflow: "auto", whiteSpace: "pre-wrap", wordBreak: "break-word", background: "white", color: "#111827" }}>
          {previewText}
        </pre>
      )}
      {!loading && !error && previewUrl && !imageExtensions.has(details.extension) && !textExtensions.has(details.extension) && (
        <iframe title={`Xem trước ${details.name}`} src={previewUrl} style={{ width: "100%", height: "100%", border: 0, background: "white" }} />
      )}
    </Modal>
  );
};

export default AttachmentPreviewModal;
