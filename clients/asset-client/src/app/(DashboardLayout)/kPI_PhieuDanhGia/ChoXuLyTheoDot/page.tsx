"use client";
import React, { useCallback, useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Flex from "@/components/shared-components/Flex";
import withAuthorization from "@/libs/authentication";
import { setIsLoading } from "@/store/general/GeneralSlice";
import { useSelector } from "@/store/hooks";
import { AppDispatch } from "@/store/store";
import * as extensions from "@/utils/extensions";
import {
  ApartmentOutlined,
  BankOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  EditOutlined,
  RollbackOutlined,
  SendOutlined,
  DownOutlined,
  HistoryOutlined,
  SearchOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Dropdown,
  MenuProps,
  Modal,
  Space,
  Table,
  TableProps,
  Tag,
  Collapse,
  Typography,
} from "antd";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import KPI_PhieuDanhGiaDetail from "../detail";
import AutoBreadcrumb from "@/components/util-compenents/Breadcrumb";
import kPI_PhieuDanhGiaService from "@/services/kPI_PhieuDanhGia/kPI_PhieuDanhGiaService";
import ChonNguoiXuLyModal from "../ChonNguoiXuLyModal";
import LichSuXuLyModal from "../LichSuXuLyModal";
import KPI_BoTieuChiChungDetail from "../../kPI_BoTieuChiChung/detail";
import KPI_BoTieuChiDonViDetail from "../../kPI_BoTieuChiDonVi/detail";
import kPI_BoTieuChiChungService from "@/services/kPI_BoTieuChiChung/kPI_BoTieuChiChungService";
import kPI_BoTieuChiDonViService from "@/services/kPI_BoTieuChiDonVi/kPI_BoTieuChiDonViService";

const { Title, Text } = Typography;
const { Panel } = Collapse;

const renderTrangThaiPhieu = (trangThai?: string) => {
  const tagStyle = { borderRadius: "12px", padding: "2px 10px", fontSize: "13px" };
  if (!trangThai) return <Tag color="default" style={tagStyle}>Chưa tạo phiếu</Tag>;
  switch (trangThai) {
    case "KhoiTao": return <Tag color="processing" style={tagStyle}>Khởi tạo</Tag>;
    case "GuiCap1": return <Tag color="warning" style={tagStyle}>Chờ cấp trên trực tiếp duyệt</Tag>;
    case "GuiCap2": return <Tag color="purple" style={tagStyle}>Chờ lãnh đạo đơn vị duyệt</Tag>;
    case "GuiPhoTruongPhong": return <Tag color="warning" style={tagStyle}>Chờ Phó Trưởng phòng duyệt</Tag>;
    case "GuiPhoVuTruong": return <Tag color="warning" style={tagStyle}>Chờ Phó Vụ trưởng duyệt</Tag>;
    case "GuiVuTruong": return <Tag color="purple" style={tagStyle}>Chờ Vụ trưởng duyệt</Tag>;
    case "GuiTruongPhong": return <Tag color="warning" style={tagStyle}>Chờ Trưởng phòng duyệt</Tag>;
    case "GuiPhoCucTruong": return <Tag color="purple" style={tagStyle}>Chờ Phó Cục trưởng duyệt</Tag>;
    case "GuiCucTruong": return <Tag color="purple" style={tagStyle}>Chờ Cục trưởng duyệt</Tag>;
    case "GuiPhoGiamDocTT": return <Tag color="warning" style={tagStyle}>Chờ Phó Giám đốc TT duyệt</Tag>;
    case "GuiGiamDocTT": return <Tag color="purple" style={tagStyle}>Chờ Giám đốc TT duyệt</Tag>;
    case "GuiPhoChanhVanPhong": return <Tag color="warning" style={tagStyle}>Chờ Phó Chánh Văn phòng duyệt</Tag>;
    case "GuiChanhVanPhong": return <Tag color="purple" style={tagStyle}>Chờ Chánh Văn phòng duyệt</Tag>;
    case "DaDuyet": return <Tag color="success" style={tagStyle} icon={<CheckCircleOutlined />}>Đã duyệt</Tag>;
    case "TuChoi": return <Tag color="error" style={tagStyle} icon={<CloseCircleOutlined />}>Từ chối</Tag>;
    case "TraVe": return <Tag color="error" style={tagStyle} icon={<RollbackOutlined />}>Trả về</Tag>;
    case "ThuHoi": return <Tag color="error" style={tagStyle} icon={<RollbackOutlined />}>Thu hồi</Tag>;
    default: return <Tag color="default" style={tagStyle}>{trangThai}</Tag>;
  }
};

const ChoXuLyTheoDotPage: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: any) => state.auth.User);
  const [data, setData] = useState<any[]>([]);
  const loading = useSelector((state: any) => state.general.isLoading);
  const [currentItem, setCurentItem] = useState<any | null>(null);
  const [isOpenDetail, setIsOpenDetail] = useState<boolean>(false);

  const [viewingTieuChiChung, setViewingTieuChiChung] = useState<any | null>(null);
  const [viewingTieuChiDonVi, setViewingTieuChiDonVi] = useState<any | null>(null);

  const handleViewTieuChiChung = async (e: React.MouseEvent, id?: string) => {
    e.stopPropagation();
    if (!id) return;
    try {
      dispatch(setIsLoading(true));
      const res = await kPI_BoTieuChiChungService.getById(id);
      if (res && res.data) {
        setViewingTieuChiChung(res.data);
      }
    } catch (err) {
      console.error(err);
      toast.error("Không thể lấy chi tiết bộ tiêu chí chung");
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  const handleViewTieuChiDonVi = async (e: React.MouseEvent, id?: string) => {
    e.stopPropagation();
    if (!id) return;
    try {
      dispatch(setIsLoading(true));
      const res = await kPI_BoTieuChiDonViService.getById(id);
      if (res && res.data) {
        setViewingTieuChiDonVi(res.data);
      }
    } catch (err) {
      console.error(err);
      toast.error("Không thể lấy chi tiết bộ tiêu chí nhiệm vụ");
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  const [workflowModalState, setWorkflowModalState] = useState<{
    visible: boolean;
    idPhieuDanhGia: string;
    chucVuNguoiXuLy?: string | null;
    tenButton: string;
    canChonNguoiXuLy?: boolean;
    isTuChoi?: boolean;
  }>({
    visible: false,
    idPhieuDanhGia: "",
    chucVuNguoiXuLy: "",
    tenButton: "",
    canChonNguoiXuLy: true,
    isTuChoi: false,
  });

  const [lichSuModalState, setLichSuModalState] = useState<{
    visible: boolean;
    idPhieuDanhGia: string | null;
  }>({
    visible: false,
    idPhieuDanhGia: null,
  });

  const handleWorkflowSubmit = async (idNguoiXuLy: string, ghiChu?: string) => {
    if (!user?.id) return;
    if (!workflowModalState.idPhieuDanhGia) return;
    try {
      dispatch(setIsLoading(true));
      const response = await kPI_PhieuDanhGiaService.chuyenBuocLuong({
        idPhieuDanhGia: workflowModalState.idPhieuDanhGia,
        idNguoiGui: user.id,
        idNguoiXuLy: idNguoiXuLy || undefined,
        ghiChu,
        isTuChoi: workflowModalState.isTuChoi,
      });
      if (response && response.status) {
        toast.success(workflowModalState.isTuChoi ? "Từ chối phiếu đánh giá thành công!" : "Chuyển bước luồng thành công!");
        setWorkflowModalState((prev) => ({ ...prev, visible: false }));
        handleLoadData();
      } else {
        toast.error(response?.message || "Đã xảy ra lỗi khi thực hiện thao tác.");
      }
    } catch (error: any) {
      console.error("Lỗi khi xử lý luồng:", error);
      toast.error(error?.message || "Đã xảy ra lỗi hệ thống.");
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  const handleLoadData = useCallback(async () => {
    if (!user?.id) return;
    dispatch(setIsLoading(true));
    try {
      const searchData = {
        pageIndex: 1,
        pageSize: 10000,
        idNguoiXuLy: user?.id,
        isXuLy: false,
        isKhacHoanThanh: true,
      };
      const response = await kPI_PhieuDanhGiaService.getDotDanhGiaWithPhieu(user.id, searchData);
      if (response != null && response.data != null && response.data.items) {
        setData(response.data.items);
      }
    } catch (err) {
      console.error(err);
    } finally {
      dispatch(setIsLoading(false));
    }
  }, [dispatch, user?.id]);

  useEffect(() => {
    handleLoadData();
  }, [handleLoadData]);

  const groupedData = useMemo(() => {
    const groups: { [key: string]: any } = {};
    data.forEach((item) => {
      const dotId = item.idDotDanhGia || "no-dot";
      if (!groups[dotId]) {
        groups[dotId] = {
          idDotDanhGia: item.idDotDanhGia,
          tenDotDanhGia: item.tenDotDanhGia || "Đợt chưa xác định",
          thoiGianBatDau: item.thoiGianBatDau,
          thoiGianKetThuc: item.thoiGianKetThuc,
          items: [],
        };
      }
      groups[dotId].items.push(item);
    });
    // Sort groups by thoiGianBatDau DESC
    return Object.values(groups).sort((a, b) => {
      const timeA = a.thoiGianBatDau ? new Date(a.thoiGianBatDau).getTime() : 0;
      const timeB = b.thoiGianBatDau ? new Date(b.thoiGianBatDau).getTime() : 0;
      return timeB - timeA;
    });
  }, [data]);

  const tableColumns: TableProps<any>["columns"] = [
    {
      title: "STT",
      dataIndex: "index",
      key: "index",
      align: "center",
      width: 50,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: "Nhân sự gửi lên",
      dataIndex: "tenChuPhieu",
      key: "tenChuPhieu",
      width: 190,
      render: (_: any, record: any) => {
        return (
          <div>
            <div style={{ fontWeight: 600, color: "#1e3a8a" }}>
              {record.tenChuPhieu || "Chưa có"}
            </div>
            {record.phongBanChuPhieu && (
              <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                {record.phongBanChuPhieu}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: "Chức vụ",
      dataIndex: "chucVuChuPhieu",
      key: "chucVuChuPhieu",
      width: 150,
      render: (chucVuChuPhieu: string) => {
        return (
          <div style={{ color: "#475569", fontWeight: 500 }}>
            {chucVuChuPhieu || "---"}
          </div>
        );
      }
    },
    {
      title: "Bộ tiêu chí",
      dataIndex: "boTieuChi",
      width: 320,
      render: (_: any, record: any) => (
        <Space direction="vertical" size={4} style={{ width: "100%" }}>
          {record.tenBoTieuChiChung && (
            <div style={{ display: "flex", alignItems: "flex-start", gap: "6px" }}>
              <BankOutlined style={{ color: "#0284c7", marginTop: "3px" }} />
              <div>
                <span style={{ fontSize: "12px", color: "#64748b" }}>Tiêu chí chung: </span>
                <span 
                  style={{ fontWeight: 600, color: "#0891b2", cursor: "pointer", textDecoration: "underline" }}
                  onClick={(e) => handleViewTieuChiChung(e, record.idBoTieuChiChung)}
                >
                  {record.tenBoTieuChiChung}
                </span>
              </div>
            </div>
          )}
          {record.tenBoTieuChiNhiemVu && (
            <div style={{ display: "flex", alignItems: "flex-start", gap: "6px" }}>
              <ApartmentOutlined style={{ color: "#0d9488", marginTop: "3px" }} />
              <div>
                <span style={{ fontSize: "12px", color: "#64748b" }}>Nhiệm vụ: </span>
                <span 
                  style={{ fontWeight: 600, color: "#0355a2", cursor: "pointer", textDecoration: "underline" }}
                  onClick={(e) => handleViewTieuChiDonVi(e, record.idBoTieuChiNhiemVu)}
                >
                  {record.tenBoTieuChiNhiemVu}
                </span>
              </div>
            </div>
          )}
        </Space>
      ),
    },

    {
      title: "Điểm đánh giá",
      dataIndex: "diemDanhGia",
      key: "diemDanhGia",
      align: "center",
      width: 150,
      render: (_: any, record: any) => {
        if (!record.daDanhGia && !record.tongDiem && !record.diemTieuChiChung && !record.diemThucHienNhiemVu) {
          return <span style={{ color: "#9ca3af" }}>-</span>;
        }

        const calculatedDiemNhiemVu = record.diemThucHienNhiemVu != null
          ? record.diemThucHienNhiemVu
          : (record.tongDiem != null && record.diemTieuChiChung != null)
            ? Number(record.tongDiem) - Number(record.diemTieuChiChung)
            : null;

        return (
          <Space direction="vertical" size={1} style={{ width: "100%", alignItems: "center" }}>
            <div style={{ fontSize: "12px" }}>
              <span style={{ color: "#64748b" }}>TC chung: </span>
              <span style={{ fontWeight: 600, color: "#0284c7" }}>
                {record.diemTieuChiChung != null ? Number(record.diemTieuChiChung).toFixed(2).replace(/\.00$/, '') : "-"}
              </span>
            </div>
            <div style={{ fontSize: "12px" }}>
              <span style={{ color: "#64748b" }}>Nhiệm vụ: </span>
              <span style={{ fontWeight: 600, color: "#0d9488" }}>
                {calculatedDiemNhiemVu != null ? Number(calculatedDiemNhiemVu).toFixed(2).replace(/\.00$/, '') : "-"}
              </span>
            </div>
            <div style={{ fontSize: "13px", marginTop: "2px" }}>
              <Tag color="purple" style={{ fontWeight: 700, margin: 0 }}>
                Tổng: {record.tongDiem != null ? Number(record.tongDiem).toFixed(2).replace(/\.00$/, '') : "-"}
              </Tag>
            </div>
          </Space>
        );
      },
    },
    {
      title: "Trạng thái phiếu",
      dataIndex: "trangThai",
      key: "trangThai",
      align: "center",
      width: 130,
      render: (_: any, record: any) => renderTrangThaiPhieu(record.trangThai),
    },
    {
      title: "Thao tác",
      dataIndex: "actions",
      fixed: "right",
      align: "center",
      width: 110,
      render: (_: any, record: any) => {
        const items: MenuProps["items"] = [
          {
            label: "Xem phiếu",
            key: "1",
            icon: <EyeOutlined />,
            onClick: () => {
              if (record.idPhieuDanhGia) {
                setCurentItem(record);
                setIsOpenDetail(true);
              } else {
                toast.warning("Phiếu chưa được đánh giá");
              }
            },
          },
          {
            label: <span style={{ color: "#0284c7", fontWeight: "600" }}>Đánh giá & Chấm điểm</span>,
            key: "action_danhgia_multicap",
            icon: <EditOutlined style={{ color: "#0284c7" }} />,
            onClick: () => {
              const targetId = record.idPhieuDanhGia || record.idDotDanhGia;
              router.push(`/kPI_PhieuDanhGia/DanhGiaMultiCap/${targetId}?idDotDanhGia=${record.idDotDanhGia}&idPhieu=${record.idPhieuDanhGia || ""}&idLyLich=${record.idLyLich || ""}`);
            },
          }
        ];

        const isKhoiTaoOrTraVe = !record.trangThai || record.trangThai === "KhoiTao" || record.trangThai === "TraVe";

        if (record.isShowButton && record.buttonLuong && record.daDanhGia && !!record.idPhieuDanhGia) {
          items.push({
            label: record.buttonLuong.tenButton,
            key: "action_next",
            icon: record.buttonLuong.canChonNguoiXuLy ? <SendOutlined style={{ color: "#1890ff" }} /> : <CheckCircleOutlined style={{ color: "green" }} />,
            onClick: () => {
              if (!record.idPhieuDanhGia || !record.daDanhGia) {
                toast.warning("Vui lòng tạo phiếu đánh giá trước khi gửi!");
                return;
              }
              setWorkflowModalState({
                visible: true,
                idPhieuDanhGia: record.idPhieuDanhGia,
                chucVuNguoiXuLy: record.buttonLuong?.chucVuNguoiXuLy,
                tenButton: record.buttonLuong?.tenButton || "Xử lý phiếu",
                canChonNguoiXuLy: record.buttonLuong?.canChonNguoiXuLy ?? true,
                isTuChoi: false,
              });
            },
          });
        }

        if (record.isShowButton && record.trangThai && !isKhoiTaoOrTraVe) {
          items.push({
            label: "Trả về",
            key: "action_return",
            icon: <RollbackOutlined style={{ color: "#faad14" }} />,
            danger: true,
            onClick: () => {
              setWorkflowModalState({
                visible: true,
                idPhieuDanhGia: record.idPhieuDanhGia || "",
                chucVuNguoiXuLy: null,
                tenButton: "Trả về phiếu đánh giá",
                canChonNguoiXuLy: false,
                isTuChoi: true,
              });
            },
          });
        }

        if (record.idPhieuDanhGia) {
          items.push({
            label: "Quá trình xử lý",
            key: "action_history",
            icon: <HistoryOutlined style={{ color: "#1890ff" }} />,
            onClick: () => setLichSuModalState({ visible: true, idPhieuDanhGia: record.idPhieuDanhGia }),
          });
        }

        return (
          <Space size="small">
            <Dropdown menu={{ items }} trigger={["click"]}>
              <Button onClick={(e) => e.preventDefault()} type="default">
                <Space>Thao tác<DownOutlined /></Space>
              </Button>
            </Dropdown>
          </Space>
        );
      },
    },
  ];

  const styledColumns = useMemo(() => tableColumns.map((col) => ({
    ...col,
    onHeaderCell: () => ({ style: { backgroundColor: "#0355a2", color: "#ffffff", fontWeight: 600, textAlign: "center" as any } }),
  })), [tableColumns]);

  return (
    <>
      <Flex alignItems="center" justifyContent="space-between" className="mb-2">
        <AutoBreadcrumb />
      </Flex>
      <Card className="customCardShadow">
        <Title level={4} style={{ color: "#002766", marginBottom: 24 }}>Danh sách Phiếu đánh giá Chờ xử lý</Title>
        
        {loading ? (
          <div>Đang tải dữ liệu...</div>
        ) : groupedData.length > 0 ? (
          <Collapse defaultActiveKey={groupedData.map((_, i) => i.toString())}>
            {groupedData.map((group, index) => (
              <Panel
                key={index.toString()}
                header={
                  <Space>
                    <span style={{ fontWeight: "bold", fontSize: 16 }}>{group.tenDotDanhGia}</span>
                    <Tag color="orange" style={{ borderRadius: 10, fontWeight: "bold" }}>
                      {group.items.length} phiếu
                    </Tag>
                  </Space>
                }
              >
                <div className="table-responsive">
                  <Table
                    columns={styledColumns}
                    bordered
                    dataSource={group.items}
                    rowKey={(r, i) => r.idPhieuDanhGia || r.idDotDanhGia + (i || 0)}
                    scroll={{ x: "max-content" }}
                    pagination={false}
                  />
                </div>
              </Panel>
            ))}
          </Collapse>
        ) : (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <Text type="secondary">Không có mục chờ xử lý nào</Text>
          </div>
        )}
      </Card>
      {isOpenDetail && <KPI_PhieuDanhGiaDetail item={currentItem} onClose={() => setIsOpenDetail(false)} />}
      <ChonNguoiXuLyModal
        visible={workflowModalState.visible}
        idPhieuDanhGia={workflowModalState.idPhieuDanhGia}
        chucVuNguoiXuLy={workflowModalState.chucVuNguoiXuLy}
        tenButton={workflowModalState.tenButton}
        canChonNguoiXuLy={workflowModalState.canChonNguoiXuLy}
        onClose={() => setWorkflowModalState((prev) => ({ ...prev, visible: false }))}
        onSubmit={handleWorkflowSubmit}
        isTuChoi={workflowModalState.isTuChoi}
      />
      <LichSuXuLyModal
        visible={lichSuModalState.visible}
        idPhieuDanhGia={lichSuModalState.idPhieuDanhGia || ""}
        onClose={() => setLichSuModalState({ visible: false, idPhieuDanhGia: null })}
      />
      
      {viewingTieuChiChung && (
        <KPI_BoTieuChiChungDetail
          item={viewingTieuChiChung}
          onClose={() => setViewingTieuChiChung(null)}
        />
      )}
      {viewingTieuChiDonVi && (
        <KPI_BoTieuChiDonViDetail
          item={viewingTieuChiDonVi}
          onClose={() => setViewingTieuChiDonVi(null)}
        />
      )}
    </>
  );
};

export default withAuthorization(ChoXuLyTheoDotPage, "");
