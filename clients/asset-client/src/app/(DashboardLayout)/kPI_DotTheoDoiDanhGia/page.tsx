"use client";
import { useCallback, useEffect, useState, useMemo } from "react";
import Flex from "@/components/shared-components/Flex";
import { ResponsePageList } from "@/types/general";
import withAuthorization from "@/libs/authentication";
import { setIsLoading } from "@/store/general/GeneralSlice";
import { useSelector } from "@/store/hooks";
import { AppDispatch } from "@/store/store";
import * as extensions from "@/utils/extensions";
import {
  CloseOutlined,
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  EyeOutlined,
  PlusCircleOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  StopOutlined,
  SettingOutlined,
  RightOutlined,
  CopyOutlined,
} from "@ant-design/icons";
import ExpandedDonViTable from "./ExpandedDonViTable";
import {
  Button,
  Card,
  Dropdown,
  FormProps,
  MenuProps,
  Modal,
  Pagination,
  Space,
  Table,
  Tag,
  TableProps,
  ConfigProvider,
} from "antd";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import KPI_DotTheoDoiDanhGiaDetail from "./detail";
import Search from "./search";
import AutoBreadcrumb from "@/components/util-compenents/Breadcrumb";
import {
  KPI_DotTheoDoiDanhGiaSearchType,
  KPI_DotTheoDoiDanhGiaType,
} from "@/types/kPI_DotTheoDoiDanhGia/kPI_DotTheoDoiDanhGia";
import kPI_DotTheoDoiDanhGiaService from "@/services/kPI_DotTheoDoiDanhGia/kPI_DotTheoDoiDanhGiaService";
import KPI_DotTheoDoiDanhGiaCreateOrUpdate from "./createOrUpdate";
import ModalCauHinhDanhGia from "./ModalCauHinhDanhGia";


const KPI_DotTheoDoiDanhGiaPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [data, setData] = useState<ResponsePageList<KPI_DotTheoDoiDanhGiaType[]>>();
  const [pageSize, setPageSize] = useState<number>(20);
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [isPanelVisible, setIsPanelVisible] = useState<boolean>(false);
  const [searchValues, setSearchValues] = useState<KPI_DotTheoDoiDanhGiaSearchType | null>(
    null
  );
  const loading = useSelector((state) => state.general.isLoading);
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [currentItem, setCurentItem] = useState<KPI_DotTheoDoiDanhGiaType | null>(null);
  const [isOpenDetail, setIsOpenDetail] = useState<boolean>(false);
  const [isOpenCauHinhModal, setIsOpenCauHinhModal] = useState<boolean>(false);
  const [isCloneModal, setIsCloneModal] = useState<boolean>(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);
  const [refreshExpandedKey, setRefreshExpandedKey] = useState<number>(0);

  const toggleExpandRow = (id: React.Key) => {
    setExpandedRowKeys((prev) =>
      prev.includes(id) ? prev.filter((k) => k !== id) : [...prev, id]
    );
  };

  const tableColumns: TableProps<KPI_DotTheoDoiDanhGiaType>["columns"] = [
    {
      title: "STT",
      dataIndex: "index",
      key: "index",
      align: "center",
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: "Tên đợt theo dõi đánh giá",
      dataIndex: "tenDotTheoDoiDanhGia",
      render: (_: any, record: KPI_DotTheoDoiDanhGiaType) => {
        const isExpanded = record.id ? expandedRowKeys.includes(record.id) : false;
        return (
          <Space
            style={{ cursor: "pointer" }}
            onClick={(e) => {
              e.stopPropagation();
              if (record.id) toggleExpandRow(record.id);
            }}
          >
            <RightOutlined
              style={{
                fontSize: "12px",
                color: "#1890ff",
                transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                transition: "transform 0.2s ease-in-out",
              }}
            />
            <span className="font-semibold text-blue-600 hover:text-blue-800" title="Nhấn để xem/ẩn danh sách phòng ban & bộ tiêu chí">
              {record.tenDotTheoDoiDanhGia}
            </span>
          </Space>
        );
      },
    },
    {
      title: "Tháng",
      dataIndex: "thang",
      align: "center",
      render: (_: any, record: KPI_DotTheoDoiDanhGiaType) => (
        <span>{record.type === "TapThe" || !record.thang ? "-" : record.thang}</span>
      ),
    },
    {
      title: "Quý",
      dataIndex: "quy",
      align: "center",
      render: (_: any, record: KPI_DotTheoDoiDanhGiaType) => (
        <span>{record.type === "TapThe" || !record.quy ? "-" : record.quy}</span>
      ),
    },
    {
      title: "Năm",
      dataIndex: "nam",
      align: "center",
      render: (_: any, record: KPI_DotTheoDoiDanhGiaType) => (
        <span style={{ fontWeight: 600 }}>{record.nam || "-"}</span>
      ),
    },
    {
      title: "Thời gian bắt đầu",
      dataIndex: "thoiGianBatDau",
      render: (_: any, record: KPI_DotTheoDoiDanhGiaType) => (
        <span>{extensions.toDateString(record.thoiGianBatDau)}</span>
      ),
    },
    {
      title: "Thời gian kết thúc",
      dataIndex: "thoiGianKetThuc",
      render: (_: any, record: KPI_DotTheoDoiDanhGiaType) => (
        <span>{extensions.toDateString(record.thoiGianKetThuc)}</span>
      ),
    },
    {
      title: "Loại đợt",
      dataIndex: "type",
      align: "center",
      render: (_: any, record: KPI_DotTheoDoiDanhGiaType) => {
        if (record.type === "CaNhan") {
          return (
            <Tag color="blue" style={{ borderRadius: "12px", padding: "2px 10px", fontSize: "13px" }}>
              Cá nhân
            </Tag>
          );
        }
        if (record.type === "TapThe") {
          return (
            <Tag color="purple" style={{ borderRadius: "12px", padding: "2px 10px", fontSize: "13px" }}>
              Tập thể
            </Tag>
          );
        }
        return <Tag color="default" style={{ borderRadius: "12px", padding: "2px 10px", fontSize: "13px" }}>{record.type || "Chưa phân loại"}</Tag>;
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "trangThai",
      render: (_: any, record: KPI_DotTheoDoiDanhGiaType) => {
        if (record.trangThai === "ACTIVE" || record.trangThai === "Đang hoạt động") {
          return (
            <Tag color="success" style={{ borderRadius: "12px", padding: "2px 10px", fontSize: "13px" }} icon={<CheckCircleOutlined />}>
              Đang hoạt động
            </Tag>
          );
        }
        if (record.trangThai === "CLOSED" || record.trangThai === "Đã đóng/Kết thúc") {
          return (
            <Tag color="default" style={{ borderRadius: "12px", padding: "2px 10px", fontSize: "13px" }} icon={<StopOutlined />}>
              Đã đóng/Kết thúc
            </Tag>
          );
        }
        return <Tag color="default" style={{ borderRadius: "12px", padding: "2px 10px", fontSize: "13px" }}>{record.trangThai || "Chưa xác định"}</Tag>;
      },
    },
    {
      title: "Thao tác",
      dataIndex: "actions",
      align: "center",
      render: (_: any, record: KPI_DotTheoDoiDanhGiaType) => {
        const isClosed = record.trangThai === "CLOSED" || record.trangThai === "Đã đóng/Kết thúc";
        
        let items: MenuProps["items"] = [
          {
            label: "Chi tiết",
            key: "2",
            icon: <EyeOutlined />,
            onClick: () => {
              setCurentItem(record);
              setIsOpenDetail(true);
            },
          },
          !isClosed ? {
            label: "Chỉnh sửa",
            key: "3",
            icon: <EditOutlined />,
            onClick: () => {
              setIsCloneModal(false);
              handleShowModal(true, record);
            },
          } : null,
          {
            label: "Sao chép đợt đánh giá",
            key: "clone",
            icon: <CopyOutlined />,
            onClick: () => {
              setCurentItem(record);
              setIsCloneModal(true);
              setIsOpenModal(true);
            },
          },
          !isClosed ? {
            label: "Cấu hình đánh giá",
            key: "cauhinh",
            icon: <SettingOutlined />,
            onClick: () => {
              setCurentItem(record);
              setIsOpenCauHinhModal(true);
            },
          } : null,
          !isClosed ? {
            type: "divider",
          } : null,
          !isClosed ? {
            label: "Xóa",
            key: "4",
            danger: true,
            icon: <DeleteOutlined />,
            onClick: () => setConfirmDeleteId(record.id ?? ""),
          } : null,
        ].filter(Boolean) as MenuProps["items"];
        return (
          <>
            <Dropdown menu={{ items }} trigger={["click"]}>
              <Button
                onClick={(e) => e.preventDefault()}
                type="default"

              >
                <Space>
                  Thao tác
                  <DownOutlined />
                </Space>
              </Button>
            </Dropdown>
          </>
        );
      },
    },
  ];

  const styledColumns = useMemo(
    () =>
      tableColumns.map((col) => ({
        ...col,
        onHeaderCell: () => ({
          style: {
            backgroundColor: "#0355a2",
            color: "#ffffff",
            fontWeight: 600,
            borderRight: "1px solid rgba(255, 255, 255, 0.25)",
          },
        }),
      })),
    [tableColumns]
  );

  const hanleCreateEditSuccess = () => {
    handleLoadData();
    setCurentItem(null);
  };

  const handleDelete = async () => {
    const response = await kPI_DotTheoDoiDanhGiaService.delete(confirmDeleteId ?? "");
    if (response.status) {
      toast.success("Xóa thành công");
      handleLoadData();
    }
    setConfirmDeleteId(null);
  };

  const toggleSearch = () => {
    setIsPanelVisible(!isPanelVisible);
  };

  const onFinishSearch: FormProps<KPI_DotTheoDoiDanhGiaSearchType>["onFinish"] = async (
    values
  ) => {
    try {
      setSearchValues(values);
      setPageIndex(1);
      await handleLoadData({ ...values, pageIndex: 1, pageSize });
    } catch (error) {
      console.error("Lỗi khi lưu dữ liệu:", error);
    }
  };

  const handleLoadData = useCallback(
    async (searchDataOverride?: KPI_DotTheoDoiDanhGiaSearchType) => {
      dispatch(setIsLoading(true));

      const searchData = {
        pageIndex,
        pageSize,
        ...(searchValues || {}),
        ...(searchDataOverride || {}),
      };
      const response = await kPI_DotTheoDoiDanhGiaService.getData(searchData);
      if (response != null && response.data != null) {
        const data = response.data;
        setData(data);
      }
      dispatch(setIsLoading(false));
    },
    [dispatch, pageIndex, pageSize, searchValues]
  );

  const handleShowModal = (isEdit?: boolean, item?: KPI_DotTheoDoiDanhGiaType) => {
    setIsCloneModal(false);
    setIsOpenModal(true);
    if (isEdit) {
      setCurentItem(item ?? null);
    } else {
      setCurentItem(null);
    }
  };

  const handleClose = () => {
    setIsOpenModal(false);
    setIsCloneModal(false);
    setCurentItem(null);
  };

  const handleCloseDetail = () => {
    setIsOpenDetail(false);
  };

  useEffect(() => {
    handleLoadData();
  }, [handleLoadData]);

  return (
    <>
      <Flex
        alignItems="center"
        justifyContent="space-between"
        className="mb-2 page-header-wrap"
      >
        <AutoBreadcrumb />
        <Space className="btn-group" style={{ gap: "10px" }}>
          <Button
            onClick={() => toggleSearch()}
            type="primary"

            icon={isPanelVisible ? <CloseOutlined /> : <SearchOutlined />}
          >
            {isPanelVisible ? "Ẩn tìm kiếm" : "Tìm kiếm"}
          </Button>
          <Button
            onClick={() => {
              handleShowModal();
            }}
            type="primary"
            icon={<PlusCircleOutlined />}

          >
            Thêm mới
          </Button>
          {isOpenModal && (
            <KPI_DotTheoDoiDanhGiaCreateOrUpdate
              onSuccess={hanleCreateEditSuccess}
              onClose={() => {
                setIsOpenModal(false);
                setIsCloneModal(false);
              }}
              item={currentItem}
              isClone={isCloneModal}
            />
          )}
        </Space>
      </Flex>
      {isPanelVisible && (
        <Search
          onFinish={onFinishSearch}
          pageIndex={pageIndex}
          pageSize={pageSize}
        />
      )}
      {isOpenDetail && (
        <KPI_DotTheoDoiDanhGiaDetail item={currentItem} onClose={handleCloseDetail} />
      )}

      {isOpenCauHinhModal && (
        <ModalCauHinhDanhGia 
          item={currentItem} 
          onClose={() => setIsOpenCauHinhModal(false)} 
          onSuccess={() => setRefreshExpandedKey(prev => prev + 1)}
        />
      )}

      {confirmDeleteId && (
        <Modal
          title="Xác nhận xóa"
          open={true}
          onOk={handleDelete}
          onCancel={() => setConfirmDeleteId(null)}
          okText="Xóa"
          cancelText="Hủy"
        >
          <p>Bạn có chắc chắn muốn xóa mục này?</p>
        </Modal>
      )}
      <style jsx global>{`
        .ant-table-wrapper .kpi-bordered-table .ant-table-thead > tr > th {
          background-color: #0355a2 !important;
          color: #ffffff !important;
          font-weight: 600 !important;
          border-right: 1px solid rgba(255, 255, 255, 0.3) !important;
          border-bottom: 1px solid #d9d9d9 !important;
        }
        .ant-table-wrapper .kpi-bordered-table .ant-table-tbody > tr > td,
        .ant-table-wrapper .kpi-bordered-table .ant-table-tbody > tr.ant-table-row-expanded > td,
        .ant-table-wrapper .kpi-bordered-table .ant-table-tbody > tr.ant-table-expanded-row > td {
          border-right: 1px solid #d9d9d9 !important;
          border-bottom: 1px solid #d9d9d9 !important;
        }
        .ant-table-wrapper .kpi-bordered-table .ant-table-container {
          border-left: 1px solid #d9d9d9 !important;
          border-top: 1px solid #d9d9d9 !important;
        }
        .ant-table-wrapper .kpi-bordered-table .ant-table-cell-fix-right,
        .ant-table-wrapper .kpi-bordered-table .ant-table-cell-fix-right-first,
        .ant-table-wrapper .kpi-bordered-table tr.ant-table-row-expanded > td.ant-table-cell-fix-right,
        .ant-table-wrapper .kpi-bordered-table tr.ant-table-row-expanded > td.ant-table-cell-fix-right-first {
          border-left: 1px solid #d9d9d9 !important;
        }
      `}</style>
      <Card className={"customCardShadow"}>
        <div className="table-responsive">
          <ConfigProvider
            theme={{
              components: {
                Table: {
                  headerBg: "#0355a2",
                  headerColor: "#ffffff",
                  borderColor: "#d9d9d9",
                },
              },
            }}
          >
            <Table
              className="kpi-bordered-table"
              columns={styledColumns}
              bordered
              size="small"
              dataSource={data?.items}
              rowKey="id"
              scroll={{ x: "max-content" }}
              pagination={false}
              loading={loading}
              expandable={{
                showExpandColumn: false,
                expandedRowRender: (record) => (
                  <ExpandedDonViTable
                    item={record}
                    refreshKey={refreshExpandedKey}
                    onOpenCauHinh={(itemToConfig) => {
                      setCurentItem(itemToConfig);
                      setIsOpenCauHinhModal(true);
                    }}
                  />
                ),
                expandedRowKeys: expandedRowKeys,
                onExpandedRowsChange: (newKeys) => setExpandedRowKeys(newKeys as React.Key[]),
              }}
            />
          </ConfigProvider>
        </div>
        <Pagination
          className="mt-2"
          total={data?.totalCount}
          showTotal={(total, range) =>
            `${range[0]}-${range[1]} trong ${total} dữ liệu`
          }
          pageSize={pageSize}
          defaultCurrent={1}
          onChange={(e) => {
            setPageIndex(e);
          }}
          onShowSizeChange={(current, pageSize) => {
            setPageIndex(current);
            setPageSize(pageSize);
          }}
          align="end"
        />
      </Card>
    </>
  );
};

export default withAuthorization(KPI_DotTheoDoiDanhGiaPage, "");
