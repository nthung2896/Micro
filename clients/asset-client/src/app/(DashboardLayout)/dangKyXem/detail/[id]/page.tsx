"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { Tabs, Card, Descriptions, Tag, Timeline, Empty, Space, Typography, Spin, Button, Modal, message, Input, Table, Tooltip } from "antd";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeftOutlined,
  EditOutlined,
  SendOutlined,
  CheckOutlined,
  CloseOutlined,
  AppstoreAddOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import Flex from "@/components/shared-components/Flex";
import dangKyXemService from "@/services/dangKyXem/dangKyXem.service";
import { DangKyXemType } from "@/types/dang-ky-xem/dto";
import DangKyXemStatusConstant from "@/constants/DangKyXemStatusConstant";
import dayjs from "dayjs";
import DangKyXemNenTangList from "../../DangKyXemNenTangList";
import { dangKyXemLogService } from "@/services/dangKyXemLog/dangKyXemLog.service";
import { DangKyXemLogType } from "@/types/dang-ky-xem-log/dto";
import { TaiLieuDinhKemType } from "@/types/taiLieuDinhKem/dto";
import taiLieuDinhKemService from "@/services/taiLieuDinhKem/taiLieuDinhKem.service";
import { EyeOutlined } from "@ant-design/icons";
import AutoBreadcrumb from "@/components/util-compenents/Breadcrumb";
import { useDispatch } from "react-redux";
import { useSelector } from "@/store/hooks";
import { AppDispatch } from "@/store/store";
import { setIsLoading } from "@/store/general/GeneralSlice";
import RoleConstant from "@/constants/RoleConstant";
import duLieuDanhMucService from "@/services/duLieuDanhMuc/duLieuDanhMuc.service";
import DigitalSignatureModal from "@/components/sign-components/DigitalSignatureModal";
import DangKyXemCreateOrUpdate from "../../createOrUpdate";

const { Text } = Typography;

const DangKyXemDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [data, setData] = useState<DangKyXemType | null>(null);
  const [logs, setLogs] = useState<DangKyXemLogType[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const authState = useSelector((state: any) => state.auth);
  const currentUser = authState?.User;
  const userRoles: string[] = authState?.User?.listRole || authState?.ListRole || [];
  const isChuyenVienSo = userRoles.includes(RoleConstant.ChuyenVienSo);
  const isChuyenVienCuc = userRoles.includes(RoleConstant.ChuyenVienCuc);
  const canApprove = isChuyenVienSo || isChuyenVienCuc;

  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [edit, setEdit] = useState<boolean>(false);
  const [rejectItem, setRejectItem] = useState<DangKyXemType | null>(null);
  const [rejectReason, setRejectReason] = useState<string>("");
  const [attachItem, setAttachItem] = useState<DangKyXemType | null>(null);
  const [isSignDangKyXem, setIsSignDangKyXem] = useState<boolean>(false);
  const isSignDangKyXemRef = useRef<boolean>(false);
  const [isSignModalOpen, setIsSignModalOpen] = useState<boolean>(false);
  const [signIds, setSignIds] = useState<string[]>([]);
  const [refreshCount, setRefreshCount] = useState<number>(0);
  const [attachedFiles, setAttachedFiles] = useState<TaiLieuDinhKemType[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await dangKyXemService.get(id);
      setData(res.data);
      // Tải danh sách tệp đính kèm
      if (res.data?.id) {
        try {
          const filesRes = await taiLieuDinhKemService.getByItemId(res.data.id, "TepDinhKem");
          if (filesRes.data) {
            setAttachedFiles(filesRes.data);
          }
        } catch (err) {
          console.error("Không lấy được tệp đính kèm:", err);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await dangKyXemLogService.getData({
        itemId: id,
        pageIndex: 1,
        pageSize: 100,
      });
      setLogs(res.items);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingLogs(false);
    }
  };

  const getIsSignDangKyXem = useCallback(async () => {
    try {
      const res = await duLieuDanhMucService.getAllByGroupCode("CAUHINH_SIGN_NENTANG");
      if (res.status && res.data?.length) {
        const signConfig = res.data.find(
          (item: any) => item.code === "SIGN_DANGKYXEMNENTANG"
        );
        const val = Number(signConfig?.priority) === 1;
        setIsSignDangKyXem(val);
        isSignDangKyXemRef.current = val;
      }
    } catch (error) {
      console.error("Lỗi khi tải cấu hình ký số:", error);
    }
  }, []);

  useEffect(() => {
    if (id) {
      loadData();
      loadLogs();
      getIsSignDangKyXem();
    }
  }, [id, getIsSignDangKyXem]);

  const handleRefresh = () => {
    setRefreshCount((prev) => prev + 1);
    loadData();
    loadLogs();
  };

  const handleApprove = async (id: string) => {
    dispatch(setIsLoading(true));
    try {
      const res = await dangKyXemService.approve(id);
      if (res.status) {
        message.success("Phê duyệt thành công");
        handleRefresh();
      } else {
        message.error(res.message || "Lỗi khi phê duyệt");
      }
    } catch (error: any) {
      message.error("Đã xảy ra lỗi");
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  const submitReject = async () => {
    if (!rejectReason.trim()) {
      message.error("Vui lòng nhập lý do từ chối");
      return;
    }
    dispatch(setIsLoading(true));
    try {
      const res = await dangKyXemService.reject({ ...rejectItem!, lyDoTuChoi: rejectReason });
      if (res.status) {
        message.success("Từ chối thành công");
        setRejectItem(null);
        setRejectReason("");
        handleRefresh();
      } else {
        message.error(res.message || "Lỗi khi từ chối");
      }
    } catch (error: any) {
      message.error("Đã xảy ra lỗi");
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  const handleGuiDuyet = async (record: DangKyXemType) => {
    dispatch(setIsLoading(true));
    try {
      const payload = {
        ...record,
        trangThai: 1,
      };
      const res = await dangKyXemService.update(payload);
      if (res.status) {
        message.success("Gửi duyệt thành công!");
        handleRefresh();
      } else {
        message.error(res.message || "Gửi duyệt thất bại!");
      }
    } catch (error: any) {
      message.error(error?.message || "Đã xảy ra lỗi");
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  const handleDelete = async () => {
    dispatch(setIsLoading(true));
    try {
      const response = await dangKyXemService.delete(confirmDeleteId ?? "");
      if (response.status) {
        message.success("Xóa thành công");
        router.push("/dangKyXem");
      } else {
        message.error(response.message || "Xóa thất bại");
      }
    } catch (error: any) {
      message.error(error?.message || "Đã xảy ra lỗi");
    } finally {
      dispatch(setIsLoading(false));
      setConfirmDeleteId(null);
    }
  };

  const handleShowModal = (isEdit?: boolean) => {
    setIsOpenModal(true);
    setEdit(false);
    if (isEdit) {
      setEdit(true);
    }
  };

  const handleClose = () => {
    setIsOpenModal(false);
  };

  const handleCreateEditSuccess = () => {
    handleRefresh();
  };

  const handleSignSuccess = async (result: any[], certificate: any) => {
    dispatch(setIsLoading(true));
    try {
      const responseSign = await dangKyXemService.sign({
        signResultItems: result,
        certificateInfo: certificate,
      });

      if (!responseSign.status) {
        message.error(responseSign.message || "Lỗi ký số hồ sơ");
        return;
      }

      if (data) {
        const payload = {
          ...data,
          trangThai: 1,
        };
        const res = await dangKyXemService.update(payload);
        if (res.status) {
          message.success("Ký số và gửi duyệt đăng ký xem thành công!");
          handleRefresh();
        } else {
          message.error(res.message || "Ký số thành công nhưng gửi duyệt thất bại");
        }
      }
    } catch (error: any) {
      message.error(error?.message || "Lỗi trong quá trình ký số và gửi duyệt");
    } finally {
      dispatch(setIsLoading(false));
      setIsSignModalOpen(false);
    }
  };

  if (!data) return null;

  const getFileUrl = (record: TaiLieuDinhKemType): string => {
    if (!record.duongDanFile) return "";
    return taiLieuDinhKemService.getUrl(record.id || "", record.tenTaiLieu || "", record.duongDanFile);
  };

  const timelineItems = logs.map((record, index) => {
    const actionColor = "#0355a2"; // Hoặc có thể tạo constant màu cho từng hành động
    
    return {
      key: index,
      color: actionColor,
      children: (
        <div
          style={{
            border: "1px solid #f0f0f0",
            borderRadius: 8,
            padding: 12,
            background: "#fff",
          }}
        >
          <Space
            align="start"
            style={{ width: "100%", justifyContent: "space-between" }}
          >
            <Space direction="vertical" size={4}>
              <Space wrap>
                <Tag color={actionColor}>{(record.hanhDong || "Thao tác").replace(/ đăng ký xem/gi, "")}</Tag>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "2px 8px",
                    borderRadius: 6,
                    background: "#f5f5f5",
                    border: "1px solid #f0f0f0",
                  }}
                >
                  <Text strong>{dayjs(record.createdDate).format("DD/MM/YYYY")}</Text>
                  <Text type="secondary">{dayjs(record.createdDate).format("HH:mm")}</Text>
                </div>
              </Space>
              <Text strong>{record.createdBy || "System"}</Text>
            </Space>
            <Space wrap>
              {record.trangThaiCu !== undefined && record.trangThaiCu !== null && (
                <Tag color={DangKyXemStatusConstant.getColor(record.trangThaiCu)}>
                  {DangKyXemStatusConstant.getDisplayName(record.trangThaiCu)}
                </Tag>
              )}
              {record.trangThaiCu !== undefined && record.trangThaiCu !== null && record.trangThaiMoi !== undefined && record.trangThaiMoi !== null && (
                <Text type="secondary">-&gt;</Text>
              )}
              {record.trangThaiMoi !== undefined && record.trangThaiMoi !== null && (
                <Tag color={DangKyXemStatusConstant.getColor(record.trangThaiMoi)}>
                  {DangKyXemStatusConstant.getDisplayName(record.trangThaiMoi)}
                </Tag>
              )}
            </Space>
          </Space>

          {record.noiDung && (
            <div style={{ marginTop: 10 }}>
              <Text>{record.noiDung}</Text>
            </div>
          )}
        </div>
      ),
    };
  });

  return (
    <>
      <Flex alignItems="center" justifyContent="space-between" className="mb-2 flex-wrap justify-content-end">
        <AutoBreadcrumb items={[{ title: "Trang chủ", href: "/" }, { title: "Đăng ký xem nền tảng", href: "/dangKyXem" }, { title: "Chi tiết đăng ký xem" }]} />
        <Space style={{ gap: 8 }} wrap>
          {data.createdId === currentUser?.id && (data.trangThai === 0 || data.trangThai === 3) && (
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => handleShowModal(true)}
            >
              Chỉnh sửa
            </Button>
          )}

          {data.createdId === currentUser?.id && data.trangThai === 0 && (
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={() => {
                Modal.confirm({
                  title: "Xác nhận gửi duyệt",
                  content: "Bạn có chắc chắn muốn gửi duyệt đăng ký xem này?",
                  onOk: () => {
                    if (isSignDangKyXemRef.current) {
                      setSignIds([data.id!]);
                      setIsSignModalOpen(true);
                    } else {
                      handleGuiDuyet(data);
                    }
                  },
                });
              }}
            >
              Gửi duyệt
            </Button>
          )}

          {data.trangThai === 1 && canApprove && (
            <>
              <Button
                type="primary"
                style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
                icon={<CheckOutlined />}
                onClick={() => {
                  Modal.confirm({
                    title: "Xác nhận phê duyệt",
                    content: "Bạn có chắc chắn muốn phê duyệt đề xuất này?",
                    onOk: () => handleApprove(data.id!),
                  });
                }}
              >
                Phê duyệt
              </Button>
              <Button
                danger
                icon={<CloseOutlined />}
                onClick={() => setRejectItem(data)}
              >
                Từ chối
              </Button>
            </>
          )}

          {data.trangThai === 2 && canApprove && (
            <Button
              type="primary"
              icon={<AppstoreAddOutlined />}
              onClick={() => setAttachItem(data)}
            >
              Gắn nền tảng
            </Button>
          )}

          {data.createdId === currentUser?.id && (data.trangThai === 0 || data.trangThai === 3) && (
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => setConfirmDeleteId(data.id ?? "")}
            >
              Xóa
            </Button>
          )}

          <Button onClick={() => router.push("/dangKyXem")} icon={<ArrowLeftOutlined />}>
            Trở về
          </Button>
        </Space>
      </Flex>
      <Card className="customCardShadow mt-3">
        <Tabs defaultActiveKey="1">
          <Tabs.TabPane tab="Thông tin chung" key="1">
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Nền tảng đăng ký xem">{data.nenTangMuonXem || "—"}</Descriptions.Item>
              <Descriptions.Item label="Loại gửi đề xuất">{data.typeGuiDeXuat_txt || "—"}</Descriptions.Item>
              <Descriptions.Item label="Người đề xuất">{data.hoTen || "—"}</Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={DangKyXemStatusConstant.getColor(data.trangThai!)}>
                  {DangKyXemStatusConstant.getDisplayName(data.trangThai!)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Từ ngày">
                {data.tuNgay ? dayjs(data.tuNgay).format("DD/MM/YYYY") : "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Đến ngày">
                {data.denNgay ? dayjs(data.denNgay).format("DD/MM/YYYY") : "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Nội dung muốn xem" span={2}>
                {data.noiDungMuonXem || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">
                {data.createdDate ? dayjs(data.createdDate).format("DD/MM/YYYY") : "—"}
              </Descriptions.Item>
              {data.trangThai === 3 && (
                <Descriptions.Item label="Lý do từ chối" span={2}>
                  <span style={{ color: "red" }}>{data.lyDoTuChoi}</span>
                </Descriptions.Item>
              )}
            </Descriptions>

            {/* Tệp đính kèm */}
            {attachedFiles.length > 0 && (
              <div className="mt-3">
                <h4 style={{ marginBottom: 8, fontWeight: 600 }}>Tệp đính kèm</h4>
                <Table
                  columns={[
                    { title: "STT", width: 55, align: "center", render: (_: any, __: any, index: number) => index + 1 },
                    { title: "Tên tài liệu", dataIndex: "tenTaiLieu", ellipsis: true },
                    {
                      title: "Xem", width: 70, align: "center",
                      render: (_: any, record: TaiLieuDinhKemType) => {
                        const url = getFileUrl(record);
                        if (!url) return "—";
                        return (
                          <Tooltip title="Xem file">
                            <Button type="text"  icon={<EyeOutlined />}
                              onClick={() => window.open(url, "_blank", "noopener,noreferrer")} />
                          </Tooltip>
                        );
                      },
                    },
                  ]}
                  dataSource={attachedFiles}
                  rowKey="id"
                  bordered
                  size="small"
                  pagination={false}
                  locale={{ emptyText: "Không có tài liệu đính kèm nào." }}
                />
              </div>
            )}

            <div className="mt-3">
              <DangKyXemNenTangList key={`${data.id}_${refreshCount}`} dangKyXemId={data.id!} readOnly={true} />
            </div>
          </Tabs.TabPane>
          <Tabs.TabPane tab="Lịch sử xử lý" key="2">
            <Spin spinning={loadingLogs}>
              {logs.length > 0 ? (
                <Timeline items={timelineItems} style={{ marginTop: 16 }} />
              ) : (
                <Empty description="Chưa có dữ liệu lịch sử xử lý" />
              )}
            </Spin>
          </Tabs.TabPane>
        </Tabs>
      </Card>

      {confirmDeleteId && (
        <Modal
          title="Xác nhận xóa"
          open={true}
          onOk={handleDelete}
          onCancel={() => setConfirmDeleteId(null)}
          okText="Xóa"
          cancelText="Hủy"
        >
          <p>Bạn có chắc chắn muốn xóa dữ liệu này?</p>
        </Modal>
      )}

      {isOpenModal && (
        <DangKyXemCreateOrUpdate
          onSuccess={handleCreateEditSuccess}
          onClose={handleClose}
          item={data}
          isEdit={edit}
          open={true}
        />
      )}

      {rejectItem && (
        <Modal
          title="Từ chối phê duyệt"
          open={true}
          onOk={submitReject}
          onCancel={() => {
            setRejectItem(null);
            setRejectReason("");
          }}
          okText="Xác nhận từ chối"
          cancelText="Hủy"
        >
          <p>Nhập lý do từ chối:</p>
          <Input.TextArea
            rows={4}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Lý do từ chối..."
          />
        </Modal>
      )}

      {attachItem && (
        <Modal
          title="Gắn nền tảng"
          open={true}
          onCancel={() => setAttachItem(null)}
          footer={null}
          width={900}
        >
          <DangKyXemNenTangList dangKyXemId={attachItem.id!} readOnly={false} onChange={handleRefresh} />
        </Modal>
      )}

      <DigitalSignatureModal
        ids={signIds}
        open={isSignModalOpen}
        onCancel={() => setIsSignModalOpen(false)}
        onSignSuccess={handleSignSuccess}
        signerService={dangKyXemService}
      />
    </>
  );
};

export default DangKyXemDetailPage;
