import { TaiLieuDinhKemType } from "@/types/taiLieuDinhKem/dto";
import {
  DeleteOutlined,
  DownloadOutlined,
  EyeOutlined,
  MoreOutlined,
  PlusOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  Button,
  Drawer,
  Dropdown,
  Image,
  message,
  Modal,
  Tooltip,
  Upload,
  UploadFile,
} from "antd";
import { RcFile } from "antd/es/upload";
import { UploadProps } from "antd/lib";
import { useEffect, useState } from "react";
import {
  UseFileUploaderOptions,
  UseFileUploaderReturnType,
} from "./components/types";
import taiLieuDinhKemService from "@/services/taiLieuDinhKem/taiLieuDinhKem.service";
const allowedExtensions = [
  "jpg",
  "jpeg",
  "png",
  "gif",
  "bmp",
  "webp", // image
  "pdf", // PDF
  "doc",
  "docx",
  "xls",
  "xlsx",
  "ppt",
  "pptx", // Office
];

type FileUploaderProps = {
  controller: UseFileUploaderReturnType;
  readOnly?: boolean;
  typeBtn?: "primary" | "default" | "dashed" | "link" | "text";
  uploadLabel?: string;
  size?: "small" | "middle" | "large";
};

export interface UploadFileExtend extends UploadFile {
  isKySo?: boolean;
  id?: string;
  coChuKySo?: boolean;
}

const beforeUploadHandler = (file: UploadFile) => {
  const ext = (file.name.split(".").pop() || "").toLowerCase();

  if (!allowedExtensions.includes(ext)) {
    message.error(
      `File không hợp lệ. Chỉ cho phép: ${allowedExtensions.join(", ")}`,
    );
    return Upload.LIST_IGNORE;
  }

  return true;
};

function FileUploaderComponent({
  controller,
  readOnly = false,
  typeBtn,
  uploadLabel,
  size,
}: FileUploaderProps) {
  const {
    maxCount,
    uploadType,
    listType,
    itemId,
    uploadFileList,
    customRequest,
    handlePreview,
    handleRemove,
    handleCheckFile,

    // NEW NAME
    previewFileVisible,
    previewFileUrl,
    handleCancelPreviewFile,

    handleDownload,
    beforeUpload,

    // preview ảnh
    imagePreviewVisible,
    imagePreviewUrl,
    setImagePreviewVisible,
    uploading,
  } = controller;

  return (
    <>
      <Upload
        type={uploadType}
        listType={listType}
        fileList={uploadFileList}
        showUploadList={uploadFileList.length > 0}
        id={itemId}
        customRequest={readOnly ? undefined : customRequest}
        onPreview={handlePreview}
        multiple
        maxCount={maxCount}
        onRemove={readOnly ? undefined : handleRemove}
        disabled={readOnly}
        beforeUpload={beforeUpload ?? beforeUploadHandler}
        itemRender={(originNode, file: UploadFileExtend) => {
          const node = originNode as any;
          const children = node.props.children || [];
          const icon = children[0];
          // console.log('UploadFileExtend ----------->', file);
          // const deleteAction = children[2];
          const items = [
            {
              key: "preview",
              label: "Xem trước tập tin",
              icon: <EyeOutlined />,
              onClick: () => handlePreview(file),
            },
            {
              key: "download",
              label: "Tải xuống file",
              icon: <DownloadOutlined />,
              onClick: () => handleDownload(file),
            },
            ...(maxCount > 0 && !readOnly
              ? [
                  {
                    type: "divider" as const,
                  },
                  {
                    key: "delete",
                    icon: <DeleteOutlined />,
                    label: "Xóa file",
                    onClick: () => handleRemove(file),
                    danger: true,
                  },
                ]
              : []),
          ];

          //Get file href
          const getFileHref = (file: UploadFileExtend) => {
            const ext = (file.type || file.name.split(".").pop() || "")
              .replace(".", "")
              .toLowerCase();

            const fileUrl = taiLieuDinhKemService.getUrl(
              file.id ?? "",
              file.name,
              file.url ?? "",
            );
            // const fileUrl = "";

            if (["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(ext)) {
              return fileUrl;
            }

            if (ext === "pdf") {
              return fileUrl;
            }

            if (["doc", "docx", "xls", "xlsx", "ppt", "pptx"].includes(ext)) {
              return `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(
                fileUrl,
              )}`;
            }

            return fileUrl;
          };

          return (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-1.5 max-w-[90%] overflow-hidden">
                {icon}
                <Tooltip title={file.name}>
                  {/* <div
                    className="truncate text-left text-blue-500 cursor-pointer"
                    onClick={() => handlePreview(file)}
                  >
                    {file.name}
                  </div> */}
                  <a
                    href={getFileHref(file)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="truncate text-left text-blue-500 cursor-pointer"
                    onClick={(e) => {
                      // Click thường → preview
                      // Ctrl / Cmd / Middle click → browser tự xử
                      if (e.ctrlKey || e.metaKey || e.button === 1) {
                        return;
                      }

                      e.preventDefault();
                      handlePreview(file);
                    }}
                  >
                    {file.name}
                  </a>
                </Tooltip>

                {/* <CanhBaoFile file={file} /> */}
              </div>

              <div className="flex items-center gap-1">
                {/* ⬇ DOWNLOAD BUTTON */}
                <Tooltip title="Tải xuống">
                  <Button
                    type="text"
                    icon={<DownloadOutlined />}
                    onClick={(e) => {
                      e.stopPropagation(); // ❗ không mở preview
                      handleDownload(file);
                    }}
                  />
                </Tooltip>

                {/* ⋯ MORE BUTTON */}
                <Dropdown
                  trigger={["click"]}
                  menu={{ items }}
                  placement="bottomRight"
                >
                  <Button
                    type="text"
                    icon={<MoreOutlined />}
                    onClick={(e) => e.stopPropagation()}
                  />
                </Dropdown>
              </div>
            </div>
          );
        }}
      >
        {!readOnly &&
          uploadFileList.length < maxCount &&
          (listType !== "text" && listType !== "picture" ? (
            <div>
              <PlusOutlined />
              <div className="ant-upload-text">Upload</div>
            </div>
          ) : (
            <Button
              type={typeBtn}
              icon={<UploadOutlined />}
              loading={uploading}
              size={size}
            >
              {uploadLabel || "Upload"}
            </Button>
          ))}
      </Upload>

      {/* Drawer để preview PDF / Office */}
      <Drawer
        open={previewFileVisible}
        onClose={handleCancelPreviewFile}
        width={900}
        title={previewFileUrl ? "Xem trước tập tin" : ""}
      >
        {previewFileUrl.includes("view.officeapps.live.com") ? (
          <iframe
            src={previewFileUrl}
            className="shadow w-full border! border-gray-300! h-[calc(100vh-90px)]"
          />
        ) : previewFileUrl.match(/\.pdf$/i) ? (
          <iframe
            src={previewFileUrl}
            className="shadow w-full border! border-gray-300! h-[calc(100vh-90px)]"
          />
        ) : (
          <p>Không thể xem trước loại file này.</p>
        )}
      </Drawer>

      {/* 🖼 Preview ảnh bằng popup của Ant Design */}
      <Image
        style={{ display: "none" }}
        src={imagePreviewUrl}
        preview={{
          visible: imagePreviewVisible,
          src: imagePreviewUrl,
          onVisibleChange: (visible) => setImagePreviewVisible(visible),
        }}
      />
    </>
  );
}

/* ─────────────────────────────────────────── */

function useFileUploader(
  options: UseFileUploaderOptions,
): UseFileUploaderReturnType {
  const {
    maxCount = 2,
    initFiles = [],
    FileType,
    uploadType = "select",
    listType = "text",
    requiredKySo = false,
    itemId,
    beforeUpload,
    includeExportInfo = false,
    category,
    subCategory,
    taxCode,
  } = options;

  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<TaiLieuDinhKemType[]>(initFiles);
  const [uploadFileList, setUploadFileList] = useState<UploadFileExtend[]>([]);

  // Drawer preview file
  const [previewFileVisible, setPreviewFileVisible] = useState(false);
  const [previewFileUrl, setPreviewFileUrl] = useState("");

  // Preview ảnh
  const [imagePreviewVisible, setImagePreviewVisible] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");

  useEffect(() => {
    setUploadFileList(
      (files || []).map((f, idx) => ({
        uid: f.duongDanFile + idx,
        name: f.tenTaiLieu,
        status: "done",
        url: f.duongDanFile,
        type: f.extension,
        id: f.id,
      })),
    );
  }, [files]);

  /* ─────────────────────────────────────────── */
  // HANDLE PREVIEW

  const handlePreview = async (file: UploadFileExtend) => {
    const ext = (file.type || file.name.split(".").pop() || "")
      .replace(".", "")
      .toLowerCase();
    const fileUrl = taiLieuDinhKemService.getUrl(
      file.id ?? "",
      file.name,
      file.url ?? "",
    );
    // Image preview
    if (["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(ext)) {
      setImagePreviewUrl(fileUrl);
      setImagePreviewVisible(true);
      return;
    }

    // File khác
    let previewUrl = fileUrl;

    if (["doc", "docx", "xls", "xlsx", "ppt", "pptx"].includes(ext)) {
      if (file.coChuKySo) {
        handleDownload(file);
        return;
      } else {
        previewUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(
          previewUrl,
        )}`;
      }
    }

    //Pdf
    setPreviewFileUrl(previewUrl);
    setPreviewFileVisible(true);
  };

  const handleCancelPreviewFile = () => {
    setPreviewFileVisible(false);
  };

  /* ─────────────────────────────────────────── */

  const handleCheckFile = async () => {
    message.success("Đang kiểm tra file");
  };

  const handleRemove = async (file: UploadFileExtend) => {
    Modal.confirm({
      title: "Xác nhận",
      content: `Bạn có chắc muốn xoá file "${file.name}" không?`,
      okText: "Xoá",
      cancelText: "Huỷ",
      okType: "danger",
      onOk: async () => {
        const isGuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(file.id ?? "");
        
        if (!isGuid) {
          // File is just a path string (from mock createFileFromPath), no need to call API
          setFiles((prev) => prev.filter((f) => f.duongDanFile !== file.url && f.id !== file.id));
          message.success("Xoá file thành công");
          return;
        }

        try {
          const res = await taiLieuDinhKemService.delete(file.id ?? "");
          if (res.status) {
            setFiles((prev) => prev.filter((f) => f.duongDanFile !== file.url && f.id !== file.id));
          }
          message.success("Xoá file thành công");
        } catch (err) {
          message.error("Xoá file thất bại");
        }
      },
    });
  };

  const handleDownload = (file: UploadFileExtend) => {
    const fileUrl = taiLieuDinhKemService.getUrl(
      file.id ?? "",
      file.name,
      file.url ?? "",
    );
    window.open(fileUrl, "_blank");
  };

  const customRequest: UploadProps["customRequest"] = async (options) => {
    const { file: rawFile, onSuccess, onError } = options;
    const file = rawFile as RcFile;

    setUploading(true);

    const formData = new FormData();
    formData.append("Files", file);

    formData.append("FileType", String(FileType));
    formData.append("ItemId", itemId ?? "");
    formData.append("RequiredKySo", requiredKySo ? "true" : "false");
    formData.append("IncludeExportInfo", includeExportInfo ? "true" : "false");
    if (category) formData.append("Category", category);
    if (subCategory) formData.append("SubCategory", subCategory);
    if (taxCode) formData.append("TaxCode", taxCode);

    try {
      const isPdf =
        file.type === "application/pdf" ||
        file.name.toLowerCase().endsWith(".pdf");

      const result = await taiLieuDinhKemService.upload(formData);

      if (result.status && Array.isArray(result.data)) {
        setFiles((prev) => [...prev, ...result.data]);
        onSuccess?.(result);
        console.log("result------------->", result);
        message.success(`Upload file "${file.name}" thành công`);
      } else {
        onError?.(new Error("Upload failed"));
        const messageText = result.message || "Upload file thất bại";
      }
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error("Unknown error"));
      message.error(
        `Upload file "${file.name}" thất bại: ${
          error instanceof Error ? error.message : "Lỗi không xác định"
        }`,
      );
    } finally {
      setUploading(false);
    }
  };

  /* ─────────────────────────────────────────── */

  const getFiles = () => files;
  const getFileIds = () => files.map((f) => f.id);
  const resetFiles = () => setFiles([]);

  const setFilesByItemId = async (itemId: string, type?: string) => {
    try {
      const result = await taiLieuDinhKemService.getByItemId(itemId, type);
      if (result && Array.isArray(result.data)) {
        setFiles(result.data);
      } else {
        setFiles([]);
      }
    } catch (error) {
      setFiles([]);
    }
  };

  return {
    files,
    setFiles,
    getFiles,
    getFileIds,
    resetFiles,
    setFilesByItemId,
    maxCount,
    uploadType,
    listType,
    itemId,
    FileType,
    category,
    subCategory,
    taxCode,

    // Preview FILE  (PDF / Office)
    previewFileVisible,
    previewFileUrl,
    handleCancelPreviewFile,

    // Preview ẢNH
    imagePreviewVisible,
    imagePreviewUrl,
    setImagePreviewVisible,

    uploadFileList,
    handlePreview,
    handleCheckFile,
    handleRemove,
    customRequest,
    handleDownload,
    beforeUpload,

    readonly: false,
    uploading,
  };
}

export { useFileUploader };

const FileUploader = Object.assign(FileUploaderComponent, {
  useFileUploader,
});

export default FileUploader;
