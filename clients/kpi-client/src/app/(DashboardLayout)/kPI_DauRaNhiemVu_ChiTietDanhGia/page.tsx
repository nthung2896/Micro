"use client";
import { useCallback, useEffect, useState } from "react";
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
import KPI_DauRaNhiemVu_ChiTietDanhGiaDetail from "./detail";
import Search from "./search";
import AutoBreadcrumb from "@/components/util-compenents/Breadcrumb";
import {
  KPI_DauRaNhiemVu_ChiTietDanhGiaSearchType,
  KPI_DauRaNhiemVu_ChiTietDanhGiaType,
} from "@/types/kPI_DauRaNhiemVu_ChiTietDanhGia/kPI_DauRaNhiemVu_ChiTietDanhGia";
import kPI_DauRaNhiemVu_ChiTietDanhGiaService from "@/services/kPI_DauRaNhiemVu_ChiTietDanhGia/kPI_DauRaNhiemVu_ChiTietDanhGiaService";
import KPI_DauRaNhiemVu_ChiTietDanhGiaCreateOrUpdate from "./createOrUpdate";


const KPI_DauRaNhiemVu_ChiTietDanhGiaPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [data, setData] = useState<ResponsePageList<KPI_DauRaNhiemVu_ChiTietDanhGiaType[]>>();
  const [pageSize, setPageSize] = useState<number>(20);
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [isPanelVisible, setIsPanelVisible] = useState<boolean>(false);
  const [searchValues, setSearchValues] = useState<KPI_DauRaNhiemVu_ChiTietDanhGiaSearchType | null>(
    null
  );
  const loading = useSelector((state) => state.general.isLoading);
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [currentItem, setCurentItem] = useState<KPI_DauRaNhiemVu_ChiTietDanhGiaType | null>(null);
  const [isOpenDetail, setIsOpenDetail] = useState<boolean>(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const tableColumns: TableProps<KPI_DauRaNhiemVu_ChiTietDanhGiaType>["columns"] = [
    {
      title: "STT",
      dataIndex: "index",
      key: "index",
      align: "center",
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
			title: "",
			dataIndex: "idDauRaNhiemVu",
			render: (_: any, record: KPI_DauRaNhiemVu_ChiTietDanhGiaType) => (
				<span>{record.idDauRaNhiemVu}</span>
			),
		},
		{
			title: "",
			dataIndex: "idPhieuDanhGia",
			render: (_: any, record: KPI_DauRaNhiemVu_ChiTietDanhGiaType) => (
				<span>{record.idPhieuDanhGia}</span>
			),
		},
		{
			title: "",
			dataIndex: "vaiTroDanhGia",
			render: (_: any, record: KPI_DauRaNhiemVu_ChiTietDanhGiaType) => (
				<span>{record.vaiTroDanhGia}</span>
			),
		},
		{
			title: "",
			dataIndex: "nguoiDanhGiaId",
			render: (_: any, record: KPI_DauRaNhiemVu_ChiTietDanhGiaType) => (
				<span>{record.nguoiDanhGiaId}</span>
			),
		},
		{
			title: "",
			dataIndex: "chamDiemSoLuong_HoanThanh",
			render: (_: any, record: KPI_DauRaNhiemVu_ChiTietDanhGiaType) => (
				<span>{record.chamDiemSoLuong_HoanThanh}</span>
			),
		},
		{
			title: "",
			dataIndex: "chamDiemSoLuong_KhongHoanThanh",
			render: (_: any, record: KPI_DauRaNhiemVu_ChiTietDanhGiaType) => (
				<span>{record.chamDiemSoLuong_KhongHoanThanh}</span>
			),
		},
		{
			title: "",
			dataIndex: "chamDiemSoLuong_Diem",
			render: (_: any, record: KPI_DauRaNhiemVu_ChiTietDanhGiaType) => (
				<span>{record.chamDiemSoLuong_Diem}</span>
			),
		},
		{
			title: "",
			dataIndex: "chamDiemChatLuong_KhongDat",
			render: (_: any, record: KPI_DauRaNhiemVu_ChiTietDanhGiaType) => (
				<span>{record.chamDiemChatLuong_KhongDat}</span>
			),
		},
		{
			title: "",
			dataIndex: "chamDiemChatLuong_SoDiemConLai",
			render: (_: any, record: KPI_DauRaNhiemVu_ChiTietDanhGiaType) => (
				<span>{record.chamDiemChatLuong_SoDiemConLai}</span>
			),
		},
		{
			title: "",
			dataIndex: "chamDiemChatLuong_Diem",
			render: (_: any, record: KPI_DauRaNhiemVu_ChiTietDanhGiaType) => (
				<span>{record.chamDiemChatLuong_Diem}</span>
			),
		},
		{
			title: "",
			dataIndex: "chamDiemTienDo_KhongDat",
			render: (_: any, record: KPI_DauRaNhiemVu_ChiTietDanhGiaType) => (
				<span>{record.chamDiemTienDo_KhongDat}</span>
			),
		},
		{
			title: "",
			dataIndex: "chamDiemTienDo_SoDiemConLai",
			render: (_: any, record: KPI_DauRaNhiemVu_ChiTietDanhGiaType) => (
				<span>{record.chamDiemTienDo_SoDiemConLai}</span>
			),
		},
		{
			title: "",
			dataIndex: "chamDiemTienDo_Diem",
			render: (_: any, record: KPI_DauRaNhiemVu_ChiTietDanhGiaType) => (
				<span>{record.chamDiemTienDo_Diem}</span>
			),
		},
		{
			title: "",
			dataIndex: "ghiChu",
			render: (_: any, record: KPI_DauRaNhiemVu_ChiTietDanhGiaType) => (
				<span>{record.ghiChu}</span>
			),
		},
    {
      title: "Thao tác",
      dataIndex: "actions",
      fixed: "right",
      align: "center",
      render: (_: any, record: KPI_DauRaNhiemVu_ChiTietDanhGiaType) => {
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
                size="small"
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

  const hanleCreateEditSuccess = () => {
    handleLoadData();
    setCurentItem(null);
  };

  const handleDelete = async () => {
    const response = await kPI_DauRaNhiemVu_ChiTietDanhGiaService.delete(confirmDeleteId ?? "");
    if (response.status) {
      toast.success("Xóa thành công");
      handleLoadData();
    }
    setConfirmDeleteId(null);
  };

  const toggleSearch = () => {
    setIsPanelVisible(!isPanelVisible);
  };

  const onFinishSearch: FormProps<KPI_DauRaNhiemVu_ChiTietDanhGiaSearchType>["onFinish"] = async (
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
    async (searchDataOverride?: KPI_DauRaNhiemVu_ChiTietDanhGiaSearchType) => {
      dispatch(setIsLoading(true));

      const searchData = searchDataOverride || {
        pageIndex,
        pageSize,
        ...(searchValues || {}),
      };
      const response = await kPI_DauRaNhiemVu_ChiTietDanhGiaService.getData(searchData);
      if (response != null && response.data != null) {
        const data = response.data;
        setData(data);
      }
      dispatch(setIsLoading(false));
    },
    [dispatch, pageIndex, pageSize, searchValues]
  );

  const handleShowModal = (isEdit?: boolean, item?: KPI_DauRaNhiemVu_ChiTietDanhGiaType) => {
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
            size="small"
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
            size="small"
          >
            Thêm mới
          </Button>
          {isOpenModal && (
            <KPI_DauRaNhiemVu_ChiTietDanhGiaCreateOrUpdate
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
        />
      )}
      {isOpenDetail && (
        <KPI_DauRaNhiemVu_ChiTietDanhGiaDetail item={currentItem} onClose={handleCloseDetail} />
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
            columns={tableColumns}
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
          size="small"
          align="end"
        />
      </Card>
    </>
  );
};

export default withAuthorization(KPI_DauRaNhiemVu_ChiTietDanhGiaPage, "");
