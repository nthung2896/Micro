import React, { useEffect, useState, useCallback } from "react";
import {
  Card,
  Descriptions,
  Badge,
  Button,
  Spin,
  message,
  Row,
  Col,
  Space,
  Affix,
  Flex,
  Tag,
  Modal,
  Select,
  Tabs,
  Table,
  Tooltip,
  Image,
  Input,
  Upload,
  Avatar,
} from "antd";
import { VuViecPhanAnhType } from "@/types/vu-viec-phan-anh/dto";
import { useSelector } from "@/store/hooks";
import { VuViecPhanAnhRequestType } from "@/types/vu-viec-phan-anh/request";
import vuViecPhanAnhService from "@/services/vuViecPhanAnh/vuViecPhanAnh.service";
import companyInfoService from "@/services/companyInfo/companyInfo.service";
import departmentService from "@/services/department/department.service";
import {
  ArrowLeftOutlined,
  EditOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  LinkOutlined,
  EyeOutlined,
  DownloadOutlined,
  SendOutlined,
  UploadOutlined,
  UserOutlined,
  IdcardOutlined,
  BankOutlined,
  PaperClipOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import fileServerService from "@/libs/file-uploader/fileServer.service";
import { TaiLieuDinhKemType } from "@/types/taiLieuDinhKem/dto";
import phanAnhNenTangService from "@/services/phanAnhNenTang/phanAnhNenTang.service";
import ProcessVuViecModal from "./ProcessVuViecModal";
import nenTangViPhamService from "@/services/nenTangViPham/nenTangViPham.service";
import { NenTangViPhamType } from "@/types/nen-tang-vi-pham/dto";
import vuViecTraoDoiService from "@/services/vuViecTraoDoi/vuViecTraoDoi.service";
import { VuViecTraoDoiType } from "@/types/vu-viec-trao-doi/dto";
import platformManageService from "@/services/platformManage/platformManage.service";
import SingleFileUploader from "@/components/upload-file/SingleFileUploader";
import duLieuDanhMucService from "@/services/duLieuDanhMuc/duLieuDanhMuc.service";
import FileCategoryConstant from "@/constants/FileCategoryConstant";

const sectionBoxStyle: React.CSSProperties = {
  border: "1px solid #e2e8f0",
  borderRadius: "12px",
  padding: "24px",
  backgroundColor: "#f8fafc",
  marginBottom: "24px",
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: "15px",
  fontWeight: 700,
  color: "#1e3a8a",
  marginBottom: "20px",
  display: "block",
};

interface Props {
  id: string | null;
  onClose: () => void;
  onEdit: (id: string) => void;
  onSuccess: () => void;
}

const getStatusTag = (status?: number, statusText?: string) => {
  const text = statusText || (
    status === 0 ? "Mới tạo" :
      status === 1 ? "Đang xử lý" :
        status === 2 ? "Đã xử lý" :
          status === 3 ? "Yêu cầu giải trình" :
            status === 4 ? "Đã giải trình" :
              status === 5 ? "Yêu cầu giải trình lại" : "Chưa xác định"
  );
  switch (status) {
    case 0:
      return <Tag color="default" style={{ borderRadius: "4px" }}>{text}</Tag>;
    case 1:
      return <Tag color="processing" style={{ borderRadius: "4px" }}>{text}</Tag>;
    case 2:
      return <Tag color="success" style={{ borderRadius: "4px" }}>{text}</Tag>;
    case 3:
      return <Tag color="warning" style={{ borderRadius: "4px" }}>{text}</Tag>;
    case 4:
      return <Tag color="cyan" style={{ borderRadius: "4px" }}>{text}</Tag>;
    case 5:
      return <Tag color="volcano" style={{ borderRadius: "4px" }}>{text}</Tag>;
    default:
      return <Tag color="default" style={{ borderRadius: "4px" }}>{text}</Tag>;
  }
};

const getKetLuanTag = (ketLuan?: number) => {
  switch (ketLuan) {
    case 1:
      return <Tag color="error" style={{ borderRadius: "4px" }}>Có vi phạm</Tag>;
    case 2:
      return <Tag color="success" style={{ borderRadius: "4px" }}>Không vi phạm</Tag>;
    default:
      return <Tag color="default" style={{ borderRadius: "4px" }}>Chưa kết luận</Tag>;
  }
};

const VuViecPhanAnhDetail: React.FC<Props> = (props: Props) => {
  const router = useRouter();
  const { TextArea } = Input;
  const [loadingData, setLoadingData] = useState(false);
  const [item, setItem] = useState<VuViecPhanAnhType | null>(null);
  const [isUpdateStatusOpen, setIsUpdateStatusOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<number>(1);
  const [newKetLuan, setNewKetLuan] = useState<number>(0);
  const [submittingStatus, setSubmittingStatus] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<TaiLieuDinhKemType[]>([]);
  const [originalComplaint, setOriginalComplaint] = useState<any | null>(null);
  const [originalComplaintFiles, setOriginalComplaintFiles] = useState<any[]>([]);
  const [complaintsList, setComplaintsList] = useState<any[]>([]);
  const [complaintFilesMap, setComplaintFilesMap] = useState<Record<string, any[]>>({});
  const [violationDetail, setViolationDetail] = useState<NenTangViPhamType | null>(null);
  const [isSelectDNOpen, setIsSelectDNOpen] = useState(false);
  const [isSelectSCTOpen, setIsSelectSCTOpen] = useState(false);
  const [isSelectNenTangOpen, setIsSelectNenTangOpen] = useState(false);

  const [traoDois, setTraoDois] = useState<VuViecTraoDoiType[]>([]);
  const [loadingTraoDoi, setLoadingTraoDoi] = useState(false);
  const [noiDungTraoDoi, setNoiDungTraoDoi] = useState("");
  const [sendingTraoDoi, setSendingTraoDoi] = useState(false);
  const [replyTo, setReplyTo] = useState<VuViecTraoDoiType | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const [isUploadDocOpen, setIsUploadDocOpen] = useState(false);
  const [uploadDocType, setUploadDocType] = useState("VuViecPhanAnh");
  const [uploadDocFileList, setUploadDocFileList] = useState<File[]>([]);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  const [isUploadGiaiTrinhOpen, setIsUploadGiaiTrinhOpen] = useState(false);
  const [uploadingGiaiTrinh, setUploadingGiaiTrinh] = useState(false);
  const [signGiaiTrinhEnabled, setSignGiaiTrinhEnabled] = useState(false);
  const [giaiTrinhUploadedFile, setGiaiTrinhUploadedFile] = useState<TaiLieuDinhKemType | null>(null);

  const authState = useSelector((state: any) => state.auth);
  const currentUser = authState?.User;
  const userRoles: string[] = currentUser?.listRole || authState?.ListRole || [];
  const isDoanhNghiepUser = userRoles.includes("DoanhNghiep");

  const fetchDetail = useCallback(async () => {
    if (props.id) {
      setLoadingData(true);
      setViolationDetail(null);
      try {
        const res = await vuViecPhanAnhService.get(props.id);
        if (res.status && res.data) {
          setItem(res.data);
          setNewStatus(res.data.trangThai);
          setNewKetLuan(res.data.ketLuan);
          try {
            const filesRes = await fileServerService.getByItemId(res.data.id);
            if (filesRes.data) {
              setAttachedFiles(filesRes.data);
            }
          } catch (err) {
            console.error("Không lấy được tài liệu vụ việc:", err);
          }

          if (res.data.phanAnhNenTangId) {
            try {
              const complaintRes = await phanAnhNenTangService.get(res.data.phanAnhNenTangId);
              if (complaintRes.status && complaintRes.data) {
                setOriginalComplaint(complaintRes.data);
              }
            } catch (err) {
              console.error("Không lấy được phản ánh gốc:", err);
            }
            try {
              const compFilesRes = await fileServerService.getByItemId(res.data.phanAnhNenTangId);
              if (compFilesRes.data) {
                setOriginalComplaintFiles(compFilesRes.data);
              }
            } catch (err) {
              console.error("Không lấy được tài liệu phản ánh gốc:", err);
            }
          }

          try {
            const listRes = await phanAnhNenTangService.getData({
              pageIndex: 1,
              pageSize: 100,
              vuViecId: props.id,
            });
            const list = listRes?.data?.items || [];
            setComplaintsList(list);

            const filesMap: Record<string, any[]> = {};
            await Promise.all(
              list.map(async (comp: any) => {
                try {
                  const filesRes = await fileServerService.getByItemId(comp.id);
                  if (filesRes.data) {
                    filesMap[comp.id] = filesRes.data;
                  }
                } catch (err) {
                  console.error(`Không lấy được tài liệu phản ánh ${comp.id}:`, err);
                }
              })
            );
            setComplaintFilesMap(filesMap);
          } catch (err) {
            console.error("Không lấy được danh sách phản ánh nền tảng:", err);
          }

          if (res.data.ketLuan === 1 && res.data.tenNenTang) {
            try {
              const violationRes = await nenTangViPhamService.getData({
                pageIndex: 1,
                pageSize: 1,
                tenNenTang: res.data.tenNenTang,
              });
              if (violationRes.status && violationRes.data && violationRes.data.items && violationRes.data.items.length > 0) {
                setViolationDetail(violationRes.data.items[0]);
              }
            } catch (err) {
              console.error("Không lấy được thông tin vi phạm:", err);
            }
          }
        } else {
          message.error(res.message || "Không thể tải dữ liệu vụ việc");
        }
      } catch (e) {
        console.error(e);
        message.error("Lỗi khi tải chi tiết vụ việc");
      } finally {
        setLoadingData(false);
      }
    }
  }, [props.id]);

  const fetchTraoDois = useCallback(async () => {
    if (props.id) {
      setLoadingTraoDoi(true);
      try {
        const res = await vuViecTraoDoiService.getListByVuViec(props.id);
        if (res.status && res.data) {
          setTraoDois(res.data);
        }
      } catch (err) {
        console.error("Không lấy được danh sách trao đổi:", err);
      } finally {
        setLoadingTraoDoi(false);
      }
    }
  }, [props.id]);

  useEffect(() => {
    fetchDetail();
    fetchTraoDois();
  }, [props.id, fetchDetail, fetchTraoDois]);

  // Fetch cấu hình yêu cầu ký số cho file giải trình
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const configRes = await duLieuDanhMucService.getListDataByGroupCode("SIGN_FILEGIAITRINH_PHANANH");
        if (configRes?.status && Array.isArray(configRes.data)) {
          const signConfig = configRes.data.find((x: any) => x.priority === 1);
          setSignGiaiTrinhEnabled(!!signConfig);
        }
      } catch (err) {
        console.error("Lỗi khi tải cấu hình ký số giải trình:", err);
      }
    };
    loadConfig();
  }, []);

  const handleSendTraoDoi = async () => {
    if (!noiDungTraoDoi.trim()) {
      message.warning("Vui lòng nhập nội dung trao đổi!");
      return;
    }
    if (!props.id) return;
    setSendingTraoDoi(true);
    try {
      const payload: VuViecTraoDoiType = {
        vuViecPhanAnhId: props.id,
        noiDung: noiDungTraoDoi.trim(),
        parentId: replyTo ? replyTo.id : undefined,
      };
      const res = await vuViecTraoDoiService.create(payload);
      if (res.status && res.data) {
        if (selectedFiles.length > 0) {
          try {
            await fileServerService.uploadFiles(selectedFiles, {
              category: "general",
              itemId: props.id,
              loaiTaiLieu: `TraoDoi_${res.data.id}`,
            });
          } catch (uploadErr) {
            console.error("Lỗi khi tải file đính kèm:", uploadErr);
            message.warning("Gửi trao đổi thành công nhưng tải file đính kèm thất bại");
          }
        }
        message.success("Gửi trao đổi thành công");
        setNoiDungTraoDoi("");
        setSelectedFiles([]);
        setReplyTo(null);
        fetchTraoDois();

        // Tải lại tài liệu đính kèm vụ việc
        try {
          const filesRes = await fileServerService.getByItemId(props.id);
          if (filesRes.data) {
            setAttachedFiles(filesRes.data);
          }
        } catch (err) {
          console.error("Không lấy được tài liệu vụ việc:", err);
        }
      } else {
        message.error(res.message || "Gửi trao đổi thất bại");
      }
    } catch (err) {
      console.error(err);
      message.error("Lỗi khi gửi trao đổi");
    } finally {
      setSendingTraoDoi(false);
    }
  };

  const uploadProps = {
    onRemove: (file: any) => {
      const index = selectedFiles.indexOf(file);
      const newFileList = selectedFiles.slice();
      newFileList.splice(index, 1);
      setSelectedFiles(newFileList);
    },
    beforeUpload: (file: File) => {
      setSelectedFiles((prev) => [...prev, file]);
      return false; // Ngăn tự động upload
    },
    fileList: selectedFiles as any,
  };

  const renderAttachmentsOfMessage = (msgId?: string) => {
    if (!msgId) return null;
    const msgFiles = attachedFiles.filter((x) => x.loaiTaiLieu === `TraoDoi_${msgId}`);
    if (msgFiles.length === 0) return null;
    return (
      <div style={{ marginTop: 8, padding: "8px 12px", backgroundColor: "#f1f5f9", borderRadius: "6px" }}>
        <div style={{ fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: 4 }}>
          Tài liệu đính kèm:
        </div>
        <Space direction="vertical" size={4} style={{ width: "100%" }}>
          {msgFiles.map((f, i) => {
            const url = getFileUrl(f);
            return (
              <a
                key={i}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  color: "#2563eb",
                  fontWeight: 500,
                  fontSize: "13px"
                }}
              >
                <DownloadOutlined />
                {f.tenTaiLieu || f.tenTaiLieuText || "Tài liệu"}
              </a>
            );
          })}
        </Space>
      </div>
    );
  };

  const formatTimeVietnamese = (dateStr?: string) => {
    if (!dateStr) return "";
    const d = dayjs(dateStr);
    const hour = d.hour();
    const minute = d.minute().toString().padStart(2, '0');
    const period = hour >= 12 ? "CH" : "SA";
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${d.format("DD/MM/YYYY")} ${displayHour}:${minute} ${period}`;
  };

  const renderMessageNode = (msg: VuViecTraoDoiType, level = 0) => {
    const children = traoDois
      .filter((x) => x.parentId === msg.id)
      .sort((a, b) => {
        const dateA = a.createdDate ? new Date(a.createdDate).getTime() : 0;
        const dateB = b.createdDate ? new Date(b.createdDate).getTime() : 0;
        return dateA - dateB;
      });
    const msgFiles = attachedFiles.filter((x) => x.loaiTaiLieu === `TraoDoi_${msg.id}`);

    return (
      <div key={msg.id} style={{ marginLeft: level > 0 ? 40 : 0, marginTop: 16 }}>
        <div style={{ display: "flex", gap: 12 }}>
          {/* Avatar */}
          <div style={{ flexShrink: 0 }}>
            <Avatar
              icon={<UserOutlined />}
              style={{ backgroundColor: "#fed7aa", color: "#ea580c" }}
            />
          </div>

          {/* Nội dung bình luận */}
          <div style={{ flexGrow: 1 }}>
            <div style={{
              display: "inline-block",
              backgroundColor: "#f1f5f9",
              borderRadius: "12px",
              padding: "8px 16px",
              maxWidth: "100%"
            }}>
              {/* Dòng 2: Tên người gửi + Nội dung tin nhắn */}
              <div style={{ fontSize: "14px", lineHeight: "1.5" }}>
                <span style={{ fontWeight: 600, color: "#1d4ed8", marginRight: 8 }}>
                  {msg.tenNguoiGui}
                </span>
                <span style={{ color: "#1e293b", whiteSpace: "pre-line", wordBreak: "break-word" }}>
                  {msg.noiDung}
                </span>
              </div>
            </div>

            {/* Dòng action phía dưới bong bóng */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 4, fontSize: "12px", color: "#64748b" }}>
              <span
                onClick={() => setReplyTo(msg)}
                style={{ color: "#2563eb", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontWeight: 500 }}
              >
                <ArrowLeftOutlined style={{ fontSize: "10px" }} /> Trả lời
              </span>

              {msgFiles.map((f, i) => {
                const url = getFileUrl(f);
                return (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#2563eb", display: "flex", alignItems: "center", gap: 4, fontWeight: 500 }}
                  >
                    <DownloadOutlined /> Tải file đính kèm
                  </a>
                );
              })}

              <span>
                {formatTimeVietnamese(msg.createdDate)}
              </span>
            </div>

            {/* Render con */}
            {children.map((child) => renderMessageNode(child, level + 1))}
          </div>
        </div>
      </div>
    );
  };

  const handleSelectDoanhNghiep = async (dnId: string) => {
    if (!item) return;
    try {
      const payload: VuViecPhanAnhRequestType = {
        ...item,
        doanhNghiepId: dnId,
      };
      const res = await vuViecPhanAnhService.update(payload);
      if (res.status) {
        message.success("Gán doanh nghiệp thành công");
        setIsSelectDNOpen(false);
        fetchDetail();
      } else {
        message.error(res.message || "Gán doanh nghiệp thất bại");
      }
    } catch (e) {
      console.error(e);
      message.error("Đã xảy ra lỗi");
    }
  };

  const handleSelectSoCongThuong = async (sctId: string) => {
    if (!item) return;
    try {
      const payload: VuViecPhanAnhRequestType = {
        ...item,
        soCongThuongId: sctId,
      };
      const res = await vuViecPhanAnhService.update(payload);
      if (res.status) {
        message.success("Gán Sở Công Thương thành công");
        setIsSelectSCTOpen(false);
        fetchDetail();
      } else {
        message.error(res.message || "Gán Sở Công Thương thất bại");
      }
    } catch (e) {
      console.error(e);
      message.error("Đã xảy ra lỗi");
    }
  };

  const handleSelectNenTang = async (ntId: string) => {
    if (!item) return;
    try {
      const payload: VuViecPhanAnhRequestType = {
        ...item,
        nenTangLienKetId: ntId,
      };
      const res = await vuViecPhanAnhService.update(payload);
      if (res.status) {
        message.success("Gán nền tảng liên kết thành công");
        setIsSelectNenTangOpen(false);
        fetchDetail();
      } else {
        message.error(res.message || "Gán nền tảng liên kết thất bại");
      }
    } catch (e) {
      console.error(e);
      message.error("Đã xảy ra lỗi");
    }
  };

  const getLoaiTaiLieuDisplayName = (code?: string) => {
    if (!code) return "—";
    if (code === "AnhCCCD") return "Ảnh CMND/CCCD/Passport";
    if (code === "TepDinhKem") return "Tài liệu phản ánh đính kèm";
    return code;
  };

  const getFileUrl = (record: TaiLieuDinhKemType): string => {
    if (!record.duongDanFile) return "";
    const path = record.duongDanFile;
    if (/^https?:\/\//i.test(path)) return path;
    try {
      return fileServerService.getUrl(record);
    } catch {
      return path;
    }
  };

  const handleStartProcess = () => {
    if (!props.id) return;
    Modal.confirm({
      title: "Xác nhận bắt đầu xử lý",
      content: "Bạn có chắc chắn muốn bắt đầu xử lý vụ việc phản ánh này không?",
      okText: "Xác nhận",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          setLoadingData(true);
          const response = await vuViecPhanAnhService.changeStatus(props.id!, 1);
          if (response.status) {
            message.success("Bắt đầu xử lý vụ việc thành công");
            fetchDetail();
            props.onSuccess();
          } else {
            message.error(response.message || "Không thể bắt đầu xử lý");
          }
        } catch (e) {
          message.error("Lỗi khi cập nhật trạng thái");
        } finally {
          setLoadingData(false);
        }
      },
    });
  };

  const handleRequestExplanation = () => {
    if (!props.id || !item) return;
    const isReRequest = item.trangThai === 4;
    Modal.confirm({
      title: isReRequest ? "Xác nhận yêu cầu giải trình lại" : "Xác nhận yêu cầu giải trình",
      content: isReRequest
        ? "Bạn có chắc chắn muốn yêu cầu doanh nghiệp giải trình lại vụ việc này không?"
        : "Bạn có chắc chắn muốn gửi yêu cầu giải trình cho doanh nghiệp này không?",
      okText: "Xác nhận",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          setLoadingData(true);
          const targetStatus = isReRequest ? 5 : 3;
          const response = await vuViecPhanAnhService.changeStatus(props.id!, targetStatus);
          if (response.status) {
            message.success(isReRequest ? "Yêu cầu giải trình lại thành công" : "Gửi yêu cầu giải trình thành công");
            fetchDetail();
            props.onSuccess();
          } else {
            message.error(response.message || (isReRequest ? "Không thể yêu cầu giải trình lại" : "Không thể yêu cầu giải trình"));
          }
        } catch (e) {
          message.error("Lỗi khi cập nhật trạng thái");
        } finally {
          setLoadingData(false);
        }
      },
    });
  };

  const handleUploadGiaiTrinh = async () => {
    // SingleFileUploader đã upload file tự động, chỉ cần chuyển trạng thái
    if (!props.id) return;
    if (!giaiTrinhUploadedFile) {
      message.warning("Vui lòng tải lên tài liệu giải trình!");
      return;
    }
    setUploadingGiaiTrinh(true);
    try {
      const changeStatusRes = await vuViecPhanAnhService.changeStatus(props.id, 4);
      if (changeStatusRes.status) {
        message.success("Nộp tài liệu giải trình thành công. Vụ việc đã chuyển sang trạng thái Đã giải trình.");
      } else {
        message.warning("Tải lên tài liệu thành công nhưng không thể tự động chuyển trạng thái vụ việc.");
      }
      setIsUploadGiaiTrinhOpen(false);
      setGiaiTrinhUploadedFile(null);
      fetchDetail();
      props.onSuccess();
    } catch (err) {
      console.error(err);
      message.error("Lỗi khi nộp tài liệu giải trình");
    } finally {
      setUploadingGiaiTrinh(false);
    }
  };

  const handleDelete = () => {
    if (!props.id) return;
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa vụ việc phản ánh này?",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          const res = await vuViecPhanAnhService.delete(props.id!);
          if (res.status) {
            message.success("Xóa vụ việc phản ánh thành công");
            props.onClose();
          } else {
            message.error(res.message || "Xóa vụ việc thất bại");
          }
        } catch (e) {
          message.error("Lỗi khi xóa vụ việc");
        }
      },
    });
  };

  const handleUploadDoc = async () => {
    if (uploadDocFileList.length === 0) {
      message.warning("Vui lòng chọn ít nhất một tài liệu!");
      return;
    }
    if (!props.id) return;
    setUploadingDoc(true);
    try {
      await fileServerService.uploadFiles(uploadDocFileList, {
        category: "general",
        itemId: props.id,
        loaiTaiLieu: uploadDocType,
      });
      message.success("Tải lên tài liệu thành công");
      setIsUploadDocOpen(false);
      setUploadDocFileList([]);
      // Tải lại tài liệu vụ việc
      try {
        const filesRes = await fileServerService.getByItemId(props.id);
        if (filesRes.data) {
          setAttachedFiles(filesRes.data);
        }
      } catch (err) {
        console.error("Không lấy được tài liệu vụ việc:", err);
      }
    } catch (err) {
      console.error(err);
      message.error("Lỗi khi tải lên tài liệu");
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleDeleteDoc = (record: TaiLieuDinhKemType) => {
    if (!record.id || !props.id) return;
    Modal.confirm({
      title: "Xác nhận xóa tài liệu",
      content: `Bạn có chắc chắn muốn xóa tài liệu "${record.tenTaiLieu || record.tenTaiLieuText || "Tài liệu"}"?`,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          const res = await fileServerService.delete([record.id!]);
          if (res.status) {
            message.success("Xóa tài liệu thành công");
            // Tải lại tài liệu vụ việc
            const filesRes = await fileServerService.getByItemId(props.id!);
            if (filesRes.data) {
              setAttachedFiles(filesRes.data);
            }
          } else {
            message.error(res.message || "Xóa tài liệu thất bại");
          }
        } catch (err) {
          console.error(err);
          message.error("Lỗi khi xóa tài liệu");
        }
      },
    });
  };

  if (loadingData || !item) {
    return (
      <Card style={{ borderRadius: "16px", border: "1px solid #e2e8f0" }}>
        <div style={{ textAlign: "center", padding: "40px" }}><Spin size="large" /></div>
      </Card>
    );
  }

  const renderMessageTree = () => {
    const roots = traoDois
      .filter((x) => !x.parentId)
      .sort((a, b) => {
        const dateA = a.createdDate ? new Date(a.createdDate).getTime() : 0;
        const dateB = b.createdDate ? new Date(b.createdDate).getTime() : 0;
        return dateB - dateA;
      });

    if (roots.length === 0) {
      return (
        <div style={{ textAlign: "center", color: "#94a3b8", padding: "40px 0" }}>
          Chưa có nội dung trao đổi nào. Hãy gửi nội dung đầu tiên ở khu bên trên!
        </div>
      );
    }

    return roots.map((root) => renderMessageNode(root, 0));
  };

  const tabItems = [
    {
      key: "info",
      label: "Thông tin vụ việc",
      children: (
        <div>
          <div style={sectionBoxStyle}>
            <span style={sectionTitleStyle}>1. Thông tin nền tảng, ứng dụng bị phản ánh</span>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Tên nền tảng">
                <strong>{item.tenNenTang || "—"}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Tên ứng dụng">
                {item.tenUngDung || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Địa bàn (Tỉnh/Thành phố)">
                {item.tenTinh || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Nền tảng liên kết">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", width: "100%" }}>
                  <span>
                    {item.nenTangLienKetId ? (
                      <span
                        style={{ color: "#0143DF", fontWeight: "bold", cursor: "pointer", textDecoration: "underline" }}
                        onClick={() => router.push(`/QLPlatform/detail/${item.nenTangLienKetId}`)}
                      >
                        {item.tenNenTangLienKet}
                      </span>
                    ) : (
                      item.tenNenTangLienKet || <span style={{ color: "#94a3b8", fontStyle: "italic" }}>Chưa liên kết</span>
                    )}
                  </span>
                  {!isDoanhNghiepUser && (
                    <Button  type="primary" ghost onClick={() => setIsSelectNenTangOpen(true)}>
                      {item.tenNenTangLienKet ? "Thay đổi" : "Gán nền tảng"}
                    </Button>
                  )}
                </div>
              </Descriptions.Item>
            </Descriptions>
          </div>

          <div style={sectionBoxStyle}>
            <span style={sectionTitleStyle}>2. Thông tin doanh nghiệp, thương nhân chủ quản</span>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Tên thương nhân / tổ chức" span={2}>
                <strong>{item.tenThuongNhan || "—"}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Mã số doanh nghiệp">
                {item.maSoDoanhNghiep || "Chưa cập nhật"}
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại liên hệ">
                {item.dienThoai || "Chưa cập nhật"}
              </Descriptions.Item>
              <Descriptions.Item label="Email liên hệ">
                {item.email || "Chưa cập nhật"}
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ trụ sở">
                {item.diaChi || "Chưa cập nhật"}
              </Descriptions.Item>
              <Descriptions.Item label="Hồ sơ doanh nghiệp liên kết">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", width: "100%" }}>
                  <span>{item.tenDoanhNghiep || <span style={{ color: "#94a3b8", fontStyle: "italic" }}>Chưa liên kết</span>}</span>
                  {!isDoanhNghiepUser && (
                    <Button  type="primary" ghost onClick={() => setIsSelectDNOpen(true)}>
                      {item.tenDoanhNghiep ? "Thay đổi" : "Gán doanh nghiệp"}
                    </Button>
                  )}
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Sở Công Thương quản lý">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", width: "100%" }}>
                  <span>{item.tenSoCongThuong || <span style={{ color: "#94a3b8", fontStyle: "italic" }}>Chưa liên kết</span>}</span>
                  {!isDoanhNghiepUser && (
                    <Button  type="primary" ghost onClick={() => setIsSelectSCTOpen(true)}>
                      {item.tenSoCongThuong ? "Thay đổi" : "Gán Sở"}
                    </Button>
                  )}
                </div>
              </Descriptions.Item>
            </Descriptions>
          </div>

          <div style={{ marginTop: "16px", color: "#64748b", fontSize: "13px" }}>
            <div>Khởi tạo lúc: <strong>{item.createdDate ? dayjs(item.createdDate).format("HH:mm DD/MM/YYYY") : "—"}</strong>, bởi <strong>{item.createdBy || "—"}</strong></div>
            {item.updatedDate && (
              <div style={{ marginTop: "4px" }}>Thay đổi lần cuối lúc: <strong>{dayjs(item.updatedDate).format("HH:mm DD/MM/YYYY")}</strong>, bởi <strong>{item.updatedBy || "—"}</strong></div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "complaints",
      label: "Danh sách phản ánh",
      children: (
        <div style={{ marginTop: 8 }}>
          <Table
            columns={[
              {
                title: "STT",
                width: 55,
                align: "center",
                render: (_: any, __: any, index: number) => index + 1,
              },
              {
                title: "Người phản ánh",
                key: "applicant",
                render: (_: any, record: any) => (
                  <div>
                    <div>- <strong>Họ tên:</strong> {record.hoTen || "—"}</div>
                    <div style={{ marginTop: 4 }}>- <strong>Ngày sinh:</strong> {record.ngaySinh ? dayjs(record.ngaySinh).format("DD/MM/YYYY") : "—"}</div>
                  </div>
                ),
              },
              {
                title: "Thông tin liên hệ",
                key: "contact",
                render: (_: any, record: any) => (
                  <div>
                    <div>- <strong>Điện thoại:</strong> {record.soDienThoai || "—"}</div>
                    <div style={{ marginTop: 4 }}>- <strong>Email:</strong> {record.email || "—"}</div>
                  </div>
                ),
              },
              {
                title: "CMND/CCCD",
                key: "cccd",
                render: (_: any, record: any) => {
                  const cccdFiles = (complaintFilesMap[record.id] || []).filter(f => f.loaiTaiLieu === "AnhCCCD");
                  return (
                    <div>
                      <div>- <strong>CMND/CCCD:</strong> {record.soCCCD || "—"}</div>
                      {cccdFiles.length > 0 && (
                        <Space style={{ marginTop: 8 }} size={8}>
                          {cccdFiles.map((f, i) => {
                            const url = getFileUrl(f);
                            return (
                              <Image
                                key={i}
                                src={url}
                                alt="Ảnh CCCD"
                                width={60}
                                height={60}
                                style={{ objectFit: "cover", borderRadius: 4, border: "1px solid #d9d9d9" }}
                              />
                            );
                          })}
                        </Space>
                      )}
                    </div>
                  );
                }
              },
              {
                title: "Tệp đính kèm",
                key: "attachments",
                render: (_: any, record: any) => {
                  const tepFiles = (complaintFilesMap[record.id] || []).filter(f => f.loaiTaiLieu === "TepDinhKem");
                  if (tepFiles.length === 0) return "—";
                  return (
                    <Space direction="vertical" size={4}>
                      {tepFiles.map((f, i) => {
                        const url = getFileUrl(f);
                        return (
                          <a key={i} href={url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 4, color: "#1890ff", fontWeight: 500 }}>
                            <DownloadOutlined />
                            {f.tenTaiLieu || f.tenTaiLieuText || "Tài liệu"}
                          </a>
                        );
                      })}
                    </Space>
                  );
                }
              },
              {
                title: "Loại phản ánh",
                dataIndex: "tenLoaiPhanAnh",
                width: 250,
                render: (val: string) => val || "—",
              },
              {
                title: "Nội dung",
                dataIndex: "noiDungPhanAnh",
                render: (val: string) => (
                  <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{val}</div>
                ),
              },
            ]}
            dataSource={complaintsList.length > 0 ? complaintsList : (originalComplaint ? [originalComplaint] : [])}
            rowKey="id"
            bordered
            size="small"
            pagination={false}
            locale={{ emptyText: "Không có phản ánh nào được liên kết." }}
          />
        </div>
      ),
    },
    {
      key: "communication",
      label: "Trao đổi thông tin",
      children: (
        <div style={{ marginTop: 8, maxWidth: "900px", margin: "0 auto" }}>
          {/* 1. Khung gửi trao đổi thông tin (ở trên) */}
          <div style={{ ...sectionBoxStyle, padding: "16px", backgroundColor: "#ffffff", marginBottom: "16px" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              {/* Avatar người gửi */}
              <div style={{ flexShrink: 0 }}>
                <Avatar
                  icon={<UserOutlined />}
                  style={{ backgroundColor: "#fed7aa", color: "#ea580c" }}
                />
              </div>

              {/* Khung input nhập */}
              <div style={{ flexGrow: 1, display: "flex", alignItems: "center", gap: 12 }}>
                <Input
                  value={noiDungTraoDoi}
                  onChange={(e) => setNoiDungTraoDoi(e.target.value)}
                  onPressEnter={handleSendTraoDoi}
                  placeholder={replyTo ? `Đang trả lời ${replyTo.tenNguoiGui}...` : "Viết bình luận..."}
                  style={{
                    borderRadius: "20px",
                    borderColor: "#ea580c",
                    height: "40px",
                    fontSize: "14px"
                  }}
                />

                {/* Icons: Kẹp giấy + Gửi */}
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <Upload {...uploadProps} showUploadList={false} multiple>
                    <Tooltip title="Đính kèm tài liệu">
                      <PaperClipOutlined
                        style={{ fontSize: "18px", color: "#3b82f6", cursor: "pointer" }}
                      />
                    </Tooltip>
                  </Upload>

                  <Tooltip title="Gửi trao đổi">
                    <SendOutlined
                      onClick={handleSendTraoDoi}
                      style={{
                        fontSize: "18px",
                        color: noiDungTraoDoi.trim() ? "#3b82f6" : "#cbd5e1",
                        cursor: noiDungTraoDoi.trim() ? "pointer" : "not-allowed",
                      }}
                    />
                  </Tooltip>
                </div>
              </div>
            </div>

            {/* Thông báo đang trả lời */}
            {replyTo && (
              <div style={{
                marginLeft: 48,
                marginTop: 8,
                backgroundColor: "#f0f9ff",
                border: "1px solid #bae6fd",
                borderRadius: "6px",
                padding: "4px 12px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                maxWidth: "fit-content"
              }}>
                <span style={{ fontSize: "12px", color: "#0369a1" }}>
                  Đang trả lời <strong>{replyTo.tenNguoiGui}</strong>
                </span>
                <Button type="link"  danger onClick={() => setReplyTo(null)} style={{ padding: "0 0 0 8px", height: "auto" }}>
                  Hủy
                </Button>
              </div>
            )}

            {/* Danh sách file đính kèm chờ gửi */}
            {selectedFiles.length > 0 && (
              <div style={{ marginLeft: 48, marginTop: 8, display: "flex", flexWrap: "wrap", gap: 8 }}>
                {selectedFiles.map((file, idx) => (
                  <Tag
                    key={idx}
                    closable
                    onClose={() => {
                      const newFiles = selectedFiles.filter((_, i) => i !== idx);
                      setSelectedFiles(newFiles);
                    }}
                    style={{ borderRadius: "12px", backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", color: "#1e40af" }}
                  >
                    <PaperClipOutlined style={{ marginRight: 4 }} /> {file.name}
                  </Tag>
                ))}
              </div>
            )}
          </div>

          {/* 2. Danh sách tin nhắn trao đổi (ở dưới) */}
          <Spin spinning={loadingTraoDoi}>
            <div style={{
              ...sectionBoxStyle,
              maxHeight: "550px",
              overflowY: "auto",
              padding: "16px",
              backgroundColor: "#ffffff",
            }}>
              {renderMessageTree()}
            </div>
          </Spin>
        </div>
      ),
    },
    {
      key: "documents",
      label: "Tài liệu",
      children: (
        <div style={{ marginTop: 8 }}>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
            <Button
              type="primary"
              icon={<UploadOutlined />}
              onClick={() => setIsUploadDocOpen(true)}
            >
              Thêm tài liệu
            </Button>
          </div>
          <Table
            columns={[
              {
                title: "STT",
                width: 55,
                align: "center",
                render: (_: any, __: any, index: number) => index + 1,
              },
              {
                title: "Tên tài liệu",
                dataIndex: "tenTaiLieu",
                ellipsis: true,
                render: (name: string, record: TaiLieuDinhKemType) => {
                  const displayName = name || record.tenTaiLieuText || "Tài liệu";
                  const ext = record.extension?.toUpperCase();
                  return (
                    <Space size={8}>
                      {ext && (
                        <Tag color="blue" style={{ margin: 0, fontSize: 11 }}>
                          {ext}
                        </Tag>
                      )}
                      <span style={{ fontWeight: 500 }}>{displayName}</span>
                    </Space>
                  );
                },
              },
              {
                title: "Ký số",
                width: 120,
                align: "center",
                render: (_: any, record: TaiLieuDinhKemType) => {
                  if (record.coChuKySo && record.isKySo) {
                    return <Tag color="success">Đã ký số</Tag>;
                  }
                  if (record.coChuKySo && record.isKySo === false) {
                    return <Tag color="error">Ký số không hợp lệ</Tag>;
                  }
                  return <Tag>Chưa ký</Tag>;
                },
              },
              {
                title: "Thao tác",
                width: 110,
                align: "center",
                render: (_: any, record: TaiLieuDinhKemType) => {
                  const url = getFileUrl(record);
                  return (
                    <Space size={8}>
                      {url && (
                        <Tooltip title="Xem file">
                          <Button
                            type="text"
                            
                            icon={<EyeOutlined />}
                            onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
                          />
                        </Tooltip>
                      )}
                      <Tooltip title="Xóa file">
                        <Button
                          type="text"
                          
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => handleDeleteDoc(record)}
                        />
                      </Tooltip>
                    </Space>
                  );
                },
              },
            ]}
            dataSource={attachedFiles.filter((x) => !x.loaiTaiLieu?.startsWith("TraoDoi_"))}
            rowKey="id"
            bordered
            size="small"
            pagination={false}
            locale={{ emptyText: "Không có tài liệu nào." }}
          />
        </div>
      ),
    },
    {
      key: "explanation",
      label: "Lịch sử giải trình",
      children: (
        <div style={{ marginTop: 8 }}>
          {isDoanhNghiepUser && (item.trangThai === 3 || item.trangThai === 5) && (
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
              <Button
                type="primary"
                icon={<UploadOutlined />}
                onClick={() => setIsUploadGiaiTrinhOpen(true)}
              >
                Nộp tài liệu giải trình
              </Button>
            </div>
          )}
          <Table
            columns={[
              {
                title: "STT",
                width: 55,
                align: "center",
                render: (_: any, __: any, index: number) => index + 1,
              },
              {
                title: "Tên tài liệu giải trình",
                dataIndex: "tenTaiLieu",
                ellipsis: true,
                render: (name: string, record: TaiLieuDinhKemType) => {
                  const displayName = name || record.tenTaiLieuText || "Tài liệu";
                  const ext = record.extension?.toUpperCase();
                  return (
                    <Space size={8}>
                      {ext && (
                        <Tag color="blue" style={{ margin: 0, fontSize: 11 }}>
                          {ext}
                        </Tag>
                      )}
                      <span style={{ fontWeight: 500 }}>{displayName}</span>
                    </Space>
                  );
                },
              },
              {
                title: "Ngày nộp",
                width: 150,
                align: "center",
                render: (_: any, record: TaiLieuDinhKemType) => {
                  return record.createdDate ? dayjs(record.createdDate).format("DD/MM/YYYY HH:mm") : "—";
                }
              },
              {
                title: "Ký số",
                width: 120,
                align: "center",
                render: (_: any, record: TaiLieuDinhKemType) => {
                  if (record.coChuKySo && record.isKySo) {
                    return <Tag color="success">Đã ký số</Tag>;
                  }
                  if (record.coChuKySo && record.isKySo === false) {
                    return <Tag color="error">Ký số không hợp lệ</Tag>;
                  }
                  return <Tag>Chưa ký</Tag>;
                },
              },
              {
                title: "Thao tác",
                width: 110,
                align: "center",
                render: (_: any, record: TaiLieuDinhKemType) => {
                  const url = getFileUrl(record);
                  return (
                    <Space size={8}>
                      {url && (
                        <Tooltip title="Xem file">
                          <Button
                            type="text"
                            
                            icon={<EyeOutlined />}
                            onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
                          />
                        </Tooltip>
                      )}
                      {isDoanhNghiepUser && (item.trangThai === 3 || item.trangThai === 5) && (
                        <Tooltip title="Xóa file">
                          <Button
                            type="text"
                            
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => handleDeleteDoc(record)}
                          />
                        </Tooltip>
                      )}
                    </Space>
                  );
                },
              },
            ]}
            dataSource={attachedFiles.filter((x) => x.loaiTaiLieu === "GiaiTrinh")}
            rowKey="id"
            bordered
            size="small"
            pagination={false}
            locale={{ emptyText: "Không có tài liệu giải trình nào." }}
          />
        </div>
      ),
    },
    {
      key: "results",
      label: "Kết quả xử lý",
      children: (
        <div style={sectionBoxStyle}>
          <span style={sectionTitleStyle}>Thông tin kết quả xử lý</span>
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Trạng thái">
              {getStatusTag(item.trangThai, item.trangThai_txt)}
            </Descriptions.Item>
            <Descriptions.Item label="Kết luận">
              {getKetLuanTag(item.ketLuan)}
            </Descriptions.Item>
            {item.ketLuan === 1 && violationDetail && (
              <>
                <Descriptions.Item label="Loại vi phạm" span={2}>
                  {violationDetail.tenLoaiViPham || "Chưa xác định"}
                </Descriptions.Item>
                <Descriptions.Item label="Nội dung vi phạm" span={2}>
                  <div style={{ whiteSpace: "pre-line" }}>
                    {violationDetail.noiDung || "Không có nội dung"}
                  </div>
                </Descriptions.Item>
              </>
            )}
            <Descriptions.Item label="Ngày xử lý">
              {item.createdDate ? dayjs(item.createdDate).format("DD/MM/YYYY HH:mm") : "—"}
            </Descriptions.Item>
            <Descriptions.Item label="Người xử lý">
              {item.createdBy || "Chưa cập nhật"}
            </Descriptions.Item>
          </Descriptions>
        </div>
      ),
    },
  ];

  const filteredTabItems = tabItems.filter(tab => {
    if (isDoanhNghiepUser) {
      return tab.key !== "communication" && tab.key !== "documents";
    }
    return true;
  });

  return (
    <>
      <Card
        title={
          <span style={{ fontSize: "16px", fontWeight: 700, color: "#1e3a8a" }}>
            📂 Chi tiết vụ việc phản ánh
          </span>
        }
        extra={
          <Affix offsetTop={80}>
            <Flex style={{ gap: 12 }}>
              <Button size="large" type="default" icon={<ArrowLeftOutlined />} onClick={props.onClose}>
                Quay lại danh sách
              </Button>
              {item.trangThai === 0 && !isDoanhNghiepUser && (
                <Button
                  size="large"
                  type="primary"
                  icon={<PlayCircleOutlined />}
                  onClick={handleStartProcess}
                  style={{ backgroundColor: "#10b981", borderColor: "#10b981" }}
                >
                  Bắt đầu xử lý
                </Button>
              )}
              {(item.trangThai === 1 || item.trangThai === 4) && !isDoanhNghiepUser && (
                <Button
                  size="large"
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  onClick={() => setIsUpdateStatusOpen(true)}
                  style={{ backgroundColor: "#10b981", borderColor: "#10b981" }}
                >
                  Xử lý vụ việc
                </Button>
              )}
              {item.doanhNghiepId && (item.trangThai === 0 || item.trangThai === 1 || item.trangThai === 4) && !isDoanhNghiepUser && (
                <Button
                  size="large"
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={handleRequestExplanation}
                  style={{ backgroundColor: "#fa8c16", borderColor: "#fa8c16" }}
                >
                  {item.trangThai === 4 ? "Yêu cầu giải trình lại" : "Yêu cầu giải trình"}
                </Button>
              )}
              {!isDoanhNghiepUser && (
                <Button
                  size="large"
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => props.onEdit(item.id!)}
                  style={{ backgroundColor: "#0143DF", borderColor: "#0143DF" }}
                >
                  Chỉnh sửa
                </Button>
              )}
              {!isDoanhNghiepUser && (
                <Button
                  size="large"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={handleDelete}
                >
                  Xóa vụ việc
                </Button>
              )}
            </Flex>
          </Affix>
        }
        style={{ borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.03)" }}
      >
        <Tabs
          defaultActiveKey="info"
          items={filteredTabItems}
          className="custom-tabs"
        />
      </Card>

      {/* MODAL CẬP NHẬT KẾT QUẢ XỬ LÝ */}
      <ProcessVuViecModal
        open={isUpdateStatusOpen}
        onCancel={() => setIsUpdateStatusOpen(false)}
        onSuccess={() => {
          setIsUpdateStatusOpen(false);
          fetchDetail();
          props.onSuccess();
        }}
        item={item}
      />

      {/* MODAL CHỌN DOANH NGHIỆP LIÊN KẾT */}
      <SelectDoanhNghiepModal
        visible={isSelectDNOpen}
        onClose={() => setIsSelectDNOpen(false)}
        onSelect={handleSelectDoanhNghiep}
        currentId={item.doanhNghiepId}
      />

      {/* MODAL CHỌN SỞ CÔNG THƯƠNG QUẢN LÝ */}
      <SelectSoCongThuongModal
        visible={isSelectSCTOpen}
        onClose={() => setIsSelectSCTOpen(false)}
        onSelect={handleSelectSoCongThuong}
        currentId={item.soCongThuongId}
      />

      {/* MODAL CHỌN NỀN TẢNG LIÊN KẾT */}
      <SelectNenTangModal
        visible={isSelectNenTangOpen}
        onClose={() => setIsSelectNenTangOpen(false)}
        onSelect={handleSelectNenTang}
        currentId={item.nenTangLienKetId}
      />

      {/* MODAL THÊM TÀI LIỆU ĐÍNH KÈM */}
      <Modal
        title="Thêm tài liệu đính kèm"
        open={isUploadDocOpen}
        onOk={handleUploadDoc}
        onCancel={() => {
          setIsUploadDocOpen(false);
          setUploadDocFileList([]);
        }}
        confirmLoading={uploadingDoc}
        okText="Tải lên"
        cancelText="Hủy"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 16 }}>
          <div>
            <div style={{ marginBottom: 6, fontWeight: 500 }}>Chọn file tài liệu:</div>
            <Upload
              beforeUpload={(file) => {
                setUploadDocFileList((prev) => [...prev, file]);
                return false;
              }}
              onRemove={(file) => {
                const idx = uploadDocFileList.indexOf(file as any);
                const newList = uploadDocFileList.slice();
                newList.splice(idx, 1);
                setUploadDocFileList(newList);
              }}
              fileList={uploadDocFileList as any}
            >
              <Button icon={<UploadOutlined />}>Chọn file</Button>
            </Upload>
          </div>
        </div>
      </Modal>

      {/* MODAL THÊM TÀI LIỆU GIẢI TRÌNH */}
      <Modal
        title="Nộp tài liệu giải trình"
        open={isUploadGiaiTrinhOpen}
        onOk={handleUploadGiaiTrinh}
        onCancel={() => {
          setIsUploadGiaiTrinhOpen(false);
          setGiaiTrinhUploadedFile(null);
        }}
        confirmLoading={uploadingGiaiTrinh}
        okText="Nộp giải trình"
        cancelText="Hủy"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 16 }}>
          <div>
            <div style={{ marginBottom: 6, fontWeight: 500 }}>Chọn file tài liệu giải trình:</div>
            <SingleFileUploader
              value={giaiTrinhUploadedFile}
              onChange={(file) => setGiaiTrinhUploadedFile(file)}
              category={FileCategoryConstant.General}
              itemId={props.id || undefined}
              loaiTaiLieu="GiaiTrinh"
              requiredKySo={signGiaiTrinhEnabled}
              uploadLabel={signGiaiTrinhEnabled ? "Chọn file giải trình (có ký số)" : "Chọn file giải trình"}
            />
          </div>
        </div>
      </Modal>
    </>
  );
};

// COMPONENT CHỌN DOANH NGHIỆP LIÊN KẾT
interface SelectDoanhNghiepModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (id: string) => void;
  currentId?: string;
}

const SelectDoanhNghiepModal: React.FC<SelectDoanhNghiepModalProps> = ({ visible, onClose, onSelect, currentId }) => {
  const [options, setOptions] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | undefined>(currentId);
  const [loading, setLoading] = useState(false);

  const fetchDoanhNghiep = async () => {
    setLoading(true);
    try {
      const res = await companyInfoService.getData({
        pageIndex: 1,
        pageSize: 1000,
        keyword: "",
      } as any);
      if (res.status && res.data?.items) {
        setOptions(res.data.items.map((x: any) => ({
          label: x.taxCode ? `${x.name} (${x.taxCode})` : x.name,
          value: x.id,
        })));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      setSelectedId(currentId);
      fetchDoanhNghiep();
    }
  }, [visible, currentId]);

  const handleOk = () => {
    if (!selectedId) {
      message.warning("Vui lòng chọn doanh nghiệp");
      return;
    }
    onSelect(selectedId);
  };

  return (
    <Modal
      title="Chọn doanh nghiệp liên kết"
      open={visible}
      onOk={handleOk}
      onCancel={onClose}
      okText="Xác nhận"
      cancelText="Hủy"
    >
      <div style={{ padding: "12px 0" }}>
        <Select
          showSearch
          placeholder="Nhập tên hoặc mã số thuế doanh nghiệp để tìm kiếm..."
          value={selectedId}
          onChange={(val) => setSelectedId(val)}
          filterOption={(input, option) =>
            (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
          }
          loading={loading}
          style={{ width: "100%" }}
          options={options}
        />
      </div>
    </Modal>
  );
};

// COMPONENT CHỌN SỞ CÔNG THƯƠNG QUẢN LÝ
interface SelectSoCongThuongModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (id: string) => void;
  currentId?: string;
}

const SelectSoCongThuongModal: React.FC<SelectSoCongThuongModalProps> = ({ visible, onClose, onSelect, currentId }) => {
  const [options, setOptions] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | undefined>(currentId);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSCT = async () => {
      setLoading(true);
      try {
        const res = await departmentService.getDropdownDonVi();
        if (res.status && res.data) {
          setOptions(res.data.map((x: any) => ({
            label: x.label,
            value: x.value,
          })));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    if (visible) {
      setSelectedId(currentId);
      fetchSCT();
    }
  }, [visible, currentId]);

  const handleOk = () => {
    if (!selectedId) {
      message.warning("Vui lòng chọn Sở Công Thương");
      return;
    }
    onSelect(selectedId);
  };

  return (
    <Modal
      title="Chọn Sở Công Thương quản lý"
      open={visible}
      onOk={handleOk}
      onCancel={onClose}
      okText="Xác nhận"
      cancelText="Hủy"
    >
      <div style={{ padding: "12px 0" }}>
        <Select
          showSearch
          placeholder="Chọn Sở Công Thương..."
          value={selectedId}
          onChange={(val) => setSelectedId(val)}
          filterOption={(input, option) =>
            (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
          }
          loading={loading}
          style={{ width: "100%" }}
          options={options}
        />
      </div>
    </Modal>
  );
};

// COMPONENT CHỌN NỀN TẢNG LIÊN KẾT
interface SelectNenTangModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (id: string) => void;
  currentId?: string;
}

const SelectNenTangModal: React.FC<SelectNenTangModalProps> = ({ visible, onClose, onSelect, currentId }) => {
  const [options, setOptions] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | undefined>(currentId);
  const [loading, setLoading] = useState(false);

  const fetchNenTang = async () => {
    setLoading(true);
    try {
      const res = await platformManageService.getData({
        pageIndex: 1,
        pageSize: 1000,
        query: "",
      } as any);
      if (res.status && res.data?.items) {
        setOptions(res.data.items.map((x: any) => ({
          label: x.name ? `${x.name} (${x.domain || x.appOS || ""})` : x.domain || "Nền tảng",
          value: x.id,
        })));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      setSelectedId(currentId);
      fetchNenTang();
    }
  }, [visible, currentId]);

  const handleOk = () => {
    if (!selectedId) {
      message.warning("Vui lòng chọn nền tảng");
      return;
    }
    onSelect(selectedId);
  };

  return (
    <Modal
      title="Chọn nền tảng liên kết"
      open={visible}
      onOk={handleOk}
      onCancel={onClose}
      okText="Xác nhận"
      cancelText="Hủy"
    >
      <div style={{ padding: "12px 0" }}>
        <Select
          showSearch
          placeholder="Nhập tên hoặc tên miền nền tảng để tìm kiếm..."
          value={selectedId}
          onChange={(val) => setSelectedId(val)}
          filterOption={(input, option) =>
            (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
          }
          loading={loading}
          style={{ width: "100%" }}
          options={options}
        />
      </div>
    </Modal>
  );
};

export default VuViecPhanAnhDetail;
