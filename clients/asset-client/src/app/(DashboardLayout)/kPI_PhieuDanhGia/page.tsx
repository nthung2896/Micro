"use client";
import { useCallback, useEffect, useState, useMemo } from "react";
import Flex from "@/components/shared-components/Flex";
import { ResponsePageList } from "@/types/general";
import withAuthorization from "@/libs/authentication";
import { setIsLoading } from "@/store/general/GeneralSlice";
import { AppDispatch } from "@/store/store";
import {
  CloseOutlined,
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  EyeOutlined,
  PlusCircleOutlined,
  SearchOutlined,
} from "@ant-design/icons";
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
  TableProps,
} from "antd";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import KPI_PhieuDanhGiaDetail from "./detail";
import Search from "./search";
import AutoBreadcrumb from "@/components/util-compenents/Breadcrumb";
import {
  KPI_PhieuDanhGiaSearchType,
  KPI_PhieuDanhGiaType,
} from "@/types/kPI_PhieuDanhGia/kPI_PhieuDanhGia";
import kPI_PhieuDanhGiaService from "@/services/kPI_PhieuDanhGia/kPI_PhieuDanhGiaService";
import KPI_PhieuDanhGiaCreateOrUpdate from "./createOrUpdate";
import { useSelector } from "@/store/hooks";


const formatDisplayScore = (value: any) => {
  if (value === null || value === undefined || value === "") return "-";
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) return String(value);
  return Number(numberValue.toFixed(2)).toString();
};

const KPI_PhieuDanhGiaPage: React.FC = () => {
  const userInfo = useSelector((state) => state.auth.User);
  const dispatch = useDispatch<AppDispatch>();
  const [data, setData] = useState<ResponsePageList<KPI_PhieuDanhGiaType[]>>();
  const [pageSize, setPageSize] = useState<number>(20);
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [isPanelVisible, setIsPanelVisible] = useState<boolean>(false);
  const [searchValues, setSearchValues] = useState<KPI_PhieuDanhGiaSearchType | null>(
    null
  );
  const loading = useSelector((state) => state.general.isLoading);
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [currentItem, setCurentItem] = useState<KPI_PhieuDanhGiaType | null>(null);
  const [isOpenDetail, setIsOpenDetail] = useState<boolean>(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const tableColumns: TableProps<KPI_PhieuDanhGiaType>["columns"] = [
    {
      title: "STT",
      dataIndex: "index",
      key: "index",
      align: "center",
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: "Họ và tên",
      dataIndex: "hoTen",
      render: (_: any, record: KPI_PhieuDanhGiaType) => (
        <span>{record.hoTen || record.idLyLich}</span>
      ),
    },
    {
      title: "Đơn vị",
      dataIndex: "donVi",
      render: (_: any, record: KPI_PhieuDanhGiaType) => (
        <span>{record.tenDonVi || (record.donVi && record.donVi !== "00000000-0000-0000-0000-000000000000" ? record.donVi : "")}</span>
      ),
    },
    {
      title: "Phòng ban",
      dataIndex: "phongBan",
      render: (_: any, record: KPI_PhieuDanhGiaType) => (
        <span>{record.tenPhongBan || (record.phongBan && record.phongBan !== "00000000-0000-0000-0000-000000000000" ? record.phongBan : "")}</span>
      ),
    },
    {
      title: "Điểm tiêu chí chung",
      dataIndex: "diemTieuChiChung",
      render: (_: any, record: KPI_PhieuDanhGiaType) => (
        <span>{formatDisplayScore(record.diemTieuChiChung)}</span>
      ),
    },
    {
      title: "Điểm thực hiện nhiệm vụ",
      dataIndex: "diemThucHienNhiemVu",
      render: (_: any, record: KPI_PhieuDanhGiaType) => (
        <span>{formatDisplayScore(record.diemThucHienNhiemVu)}</span>
      ),
    },
    {
      title: "Tổng điểm",
      dataIndex: "tongDiem",
      render: (_: any, record: KPI_PhieuDanhGiaType) => (
        <span>{formatDisplayScore(record.tongDiem)}</span>
      ),
    },
    {
      title: "Ưu điểm",
      dataIndex: "uuDiem",
      render: (_: any, record: KPI_PhieuDanhGiaType) => (
        <span>{record.uuDiem}</span>
      ),
    },
    {
      title: "Hạn chế",
      dataIndex: "hanChe",
      render: (_: any, record: KPI_PhieuDanhGiaType) => (
        <span>{record.hanChe}</span>
      ),
    },
    {
      title: "Ý kiến nhận xét",
      dataIndex: "yKienNhanXet",
      render: (_: any, record: KPI_PhieuDanhGiaType) => (
        <span>{record.yKienNhanXet}</span>
      ),
    },
    {
      title: "Thao tác",
      dataIndex: "actions",
      fixed: "right",
      align: "center",
      render: (_: any, record: KPI_PhieuDanhGiaType) => {
        const items: MenuProps["items"] = [
          {
            label: "Chi tiết",
            key: "2",
            icon: <EyeOutlined />,
            onClick: () => {
              setCurentItem(record);
              setIsOpenDetail(true);
            },
          },
          {
            label: "Chỉnh sửa",
            key: "3",
            icon: <EditOutlined />,
            onClick: () => {
              handleShowModal(true, record);
            },
          },
          {
            type: "divider",
          },
          {
            label: "Xóa",
            key: "4",
            danger: true,
            icon: <DeleteOutlined />,
            onClick: () => setConfirmDeleteId(record.id ?? ""),
          },
        ];
        return (
          <>
            <Dropdown menu={{ items }} trigger={["click"]}>
              <Button
                onClick={(e) => e.preventDefault()}
                color="primary"

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
    const response = await kPI_PhieuDanhGiaService.delete(confirmDeleteId ?? "");
    if (response.status) {
      toast.success("Xóa thành công");
      handleLoadData();
    }
    setConfirmDeleteId(null);
  };

  const toggleSearch = () => {
    setIsPanelVisible(!isPanelVisible);
  };

  const onFinishSearch: FormProps<KPI_PhieuDanhGiaSearchType>["onFinish"] = async (
    values
  ) => {
    try {
      setSearchValues(values);
      await handleLoadData(values);
    } catch (error) {
      console.error("Lỗi khi lưu dữ liệu:", error);
    }
  };

  const handleLoadData = useCallback(
    async (searchDataOverride?: KPI_PhieuDanhGiaSearchType) => {
      dispatch(setIsLoading(true));

      const searchData = searchDataOverride || {
        pageIndex,
        pageSize,
        ...(searchValues || {}),
      };
      const response = await kPI_PhieuDanhGiaService.getData(searchData);
      if (response != null && response.data != null) {
        const data = response.data;
        setData(data);
      }
      dispatch(setIsLoading(false));
    },
    [dispatch, pageIndex, pageSize, searchValues]
  );

  const handleShowModal = (isEdit?: boolean, item?: KPI_PhieuDanhGiaType) => {
    setIsOpenModal(true);
    if (isEdit) {
      setCurentItem(item ?? null);
    }
  };

  const handleClose = () => {
    setIsOpenModal(false);
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
        className="mb-2 "
      >
        <AutoBreadcrumb />
        <div className="btn-group">
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
            <KPI_PhieuDanhGiaCreateOrUpdate
              onSuccess={hanleCreateEditSuccess}
              onClose={handleClose}
              item={currentItem}
            />
          )}
        </div>
      </Flex>
      {isPanelVisible && (
        <Search
          onFinish={onFinishSearch}
          pageIndex={pageIndex}
          pageSize={pageSize}
          columns={tableColumns}
        />
      )}
      {isOpenDetail && (
        <KPI_PhieuDanhGiaDetail item={currentItem} onClose={handleCloseDetail} />
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
      <Card className={"customCardShadow"}>
        <div className="table-responsive">
          <Table
            columns={styledColumns}
            bordered
            dataSource={data?.items}
            rowKey="id"
            scroll={{ x: "max-content" }}
            pagination={false}
            loading={loading}
          />
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

export default withAuthorization(KPI_PhieuDanhGiaPage, "");
