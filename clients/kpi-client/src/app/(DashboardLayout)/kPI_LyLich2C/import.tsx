import React, { useState } from "react";
import { Modal, Upload, Button, Select } from "antd";
import { UploadOutlined, DownloadOutlined } from "@ant-design/icons";
import type { UploadFile, UploadProps } from "antd/es/upload/interface";
import kPI_LyLich2CService from "@/services/kPI_LyLich2C/kPI_LyLich2CService";
import departmentService from "@/services/department/department.service";
import { DropdownOption } from "@/types/general";
import { toast } from "react-toastify";

interface KPI_LyLich2CImportProps {
  onClose: () => void;
  onSuccess: () => void;
}

const KPI_LyLich2CImport: React.FC<KPI_LyLich2CImportProps> = ({
  onClose,
  onSuccess,
}) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [donViList, setDonViList] = useState<DropdownOption[]>([]);
  const [selectedDonVi, setSelectedDonVi] = useState<string | null>(null);

  React.useEffect(() => {
    const fetchDonVi = async () => {
      try {
        // Import cần danh sách đơn vị sử dụng, không phải danh sách phòng ban
        // cấp dưới của đơn vị đang đăng nhập.
        const res = await departmentService.getDropdownDonVi();
        if (res?.data) {
          setDonViList(res.data);
        }
      } catch (error) {
        console.error("Lỗi khi tải danh sách Đơn vị", error);
      }
    };
    fetchDonVi();
  }, []);

  const handleUpload = async () => {
    if (fileList.length === 0) {
      toast.warning("Vui lòng chọn file để import");
      return;
    }

    if (!selectedDonVi) {
      toast.warning("Vui lòng chọn đơn vị mặc định");
      return;
    }

    const formData = new FormData();
    fileList.forEach((file) => {
      formData.append("file", file as unknown as File);
    });

    setUploading(true);
    try {
      const res = await kPI_LyLich2CService.importData(formData, selectedDonVi);
      if (res.status) {
        toast.success("Import dữ liệu thành công!");
        onSuccess();
        onClose();
      } else {
        toast.error(res.message || "Import dữ liệu thất bại!");
      }
    } catch (error: any) {
      toast.error(error?.message || "Có lỗi xảy ra trong quá trình import!");
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const res = await kPI_LyLich2CService.exportTemplateImport();
      if (res.status && res.data) {
        toast.info("Đang tải file mẫu...");
        if (typeof res.data === "string") {
           window.open(res.data, '_blank');
        }
      } else {
        toast.error("Không tìm thấy file mẫu");
      }
    } catch (error) {
       toast.error("Không tải được file mẫu");
    }
  };

  const uploadProps: UploadProps = {
    onRemove: (file) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: (file) => {
      setFileList([file]);
      return false;
    },
    fileList,
    maxCount: 1,
    accept: ".xlsx, .xls",
  };

  return (
    <Modal
      title="Nhập dữ liệu từ Excel"
      open={true}
      onCancel={onClose}
      footer={[
        <Button key="back" onClick={onClose}>
          Đóng
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={uploading}
          onClick={handleUpload}
          disabled={fileList.length === 0}
        >
          {uploading ? "Đang xử lý..." : "Bắt đầu Import"}
        </Button>,
      ]}
    >
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center bg-blue-50 p-3 rounded-md">
           <span className="text-gray-700">Tải file excel mẫu chuẩn để nhập liệu</span>
           <Button icon={<DownloadOutlined />} onClick={handleDownloadTemplate} size="small">
              Tải file mẫu
           </Button>
        </div>
        
        <div className="flex flex-col gap-2">
          <p className="font-medium">Đơn vị mặc định:</p>
          <Select
            placeholder="Chọn đơn vị"
            value={selectedDonVi}
            onChange={(value) => setSelectedDonVi(value)}
            options={donViList}
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
          />
        </div>
        
        <div>
          <p className="mb-2 font-medium">Chọn file dữ liệu cần import:</p>
          <Upload {...uploadProps}>
            <Button icon={<UploadOutlined />}>Chọn file Excel</Button>
          </Upload>
        </div>
      </div>
    </Modal>
  );
};

export default KPI_LyLich2CImport;
