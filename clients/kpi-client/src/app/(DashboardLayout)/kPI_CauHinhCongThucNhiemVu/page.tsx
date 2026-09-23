"use client";
import withAuthorization from "@/libs/authentication";
import { setIsLoading } from "@/store/general/GeneralSlice";
import { AppDispatch } from "@/store/store";
import { ResponsePageList } from "@/types/general";
import Flex from "@/components/shared-components/Flex";
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
import { useSelector } from "@/store/hooks";
import { toast } from "react-toastify";
import KPI_CauHinhCongThucNhiemVuDetail from "./detail";
import Search from "./search";
import AutoBreadcrumb from "@/components/util-compenents/Breadcrumb";
import {
  KPI_CauHinhCongThucNhiemVuSearchType,
  KPI_CauHinhCongThucNhiemVuType,
} from "@/types/kPI_CauHinhCongThucNhiemVu/kPI_CauHinhCongThucNhiemVu";
import kPI_CauHinhCongThucNhiemVuService from "@/services/kPI_CauHinhCongThucNhiemVu/kPI_CauHinhCongThucNhiemVuService";
import KPI_CauHinhCongThucNhiemVuCreateOrUpdate from "./createOrUpdate";
import { useCallback, useEffect, useState } from "react";

const KPI_CauHinhCongThucNhiemVuPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [data, setData] = useState<ResponsePageList<KPI_CauHinhCongThucNhiemVuType[]>>();
  const [pageSize, setPageSize] = useState<number>(20);
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [isPanelVisible, setIsPanelVisible] = useState<boolean>(false);
  const [searchValues, setSearchValues] = useState<KPI_CauHinhCongThucNhiemVuSearchType | null>(
    null
  );
  const loading = useSelector((state: any) => state.general.isLoading);
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [currentItem, setCurentItem] = useState<KPI_CauHinhCongThucNhiemVuType | null>(null);
  const [isOpenDetail, setIsOpenDetail] = useState<boolean>(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const tableColumns: TableProps<KPI_CauHinhCongThucNhiemVuType>["columns"] = [
    {
      title: "STT",
      dataIndex: "index",
      key: "index",
      align: "center",
      render: (_: any, __: any, index: number) => index + 1,
    },
		{
			title: "Đơn vị",
			dataIndex: "tenDonVi",
			render: (_: any, record: KPI_CauHinhCongThucNhiemVuType) => (
				<span>{record.tenDonVi || record.idDonVi}</span>
			),
		},
		{
			title: "Đợt đánh giá",
			dataIndex: "tenDotDanhGia",
			render: (_: any, record: KPI_CauHinhCongThucNhiemVuType) => (
				<span>{record.tenDotDanhGia || record.idDotDanhGia}</span>
			),
		},
		{
			title: "Bảng đích",
			dataIndex: "targetTable",
			render: (_: any, record: KPI_CauHinhCongThucNhiemVuType) => (
				<span>{record.targetTable}</span>
			),
		},
		{
			title: "Cột đích",
			dataIndex: "targetColumn",
			render: (_: any, record: KPI_CauHinhCongThucNhiemVuType) => (
				<span>{record.targetColumn}</span>
			),
		},
		{
			title: "Công thức",
			dataIndex: "fomula",
			render: (_: any, record: KPI_CauHinhCongThucNhiemVuType) => (
				<span>{record.fomula}</span>
			),
		},
		{
			title: "Loại cấu hình",
			dataIndex: "type",
			render: (_: any, record: KPI_CauHinhCongThucNhiemVuType) => (
				<span style={{ fontWeight: 'bold', color: record.type === 'MACDINH' ? '#1890ff' : '#52c41a' }}>
					{record.type === 'MACDINH' ? 'Mặc định' : record.type === 'TUYCHINH' ? 'Tùy chỉnh' : record.type}
				</span>
			),
		},
    {
      title: "Thao tác",
      dataIndex: "actions",
      fixed: "right",
      align: "center",
      render: (_: any, record: KPI_CauHinhCongThucNhiemVuType) => {
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

  const hanleCreateEditSuccess = () => {
    handleLoadData();
    setCurentItem(null);
  };

  const handleDelete = async () => {
    const response = await kPI_CauHinhCongThucNhiemVuService.delete(confirmDeleteId ?? "");
    if (response.status) {
      toast.success("Xóa thành công");
      handleLoadData();
    }
    setConfirmDeleteId(null);
  };

  const toggleSearch = () => {
    setIsPanelVisible(!isPanelVisible);
  };

  const onFinishSearch: FormProps<KPI_CauHinhCongThucNhiemVuSearchType>["onFinish"] = async (
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
    async (searchDataOverride?: KPI_CauHinhCongThucNhiemVuSearchType) => {
      dispatch(setIsLoading(true));

      const searchData = searchDataOverride || {
        pageIndex,
        pageSize,
        ...(searchValues || {}),
      };
      const response = await kPI_CauHinhCongThucNhiemVuService.getData(searchData);
      if (response != null && response.data != null) {
        const data = response.data;
        setData(data as any);
      }
      dispatch(setIsLoading(false));
    },
    [dispatch, pageIndex, pageSize, searchValues]
  );

  const handleShowModal = (isEdit?: boolean, item?: KPI_CauHinhCongThucNhiemVuType) => {
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
            <KPI_CauHinhCongThucNhiemVuCreateOrUpdate
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
        <KPI_CauHinhCongThucNhiemVuDetail item={currentItem} onClose={handleCloseDetail} />
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

export default withAuthorization(KPI_CauHinhCongThucNhiemVuPage, "");
