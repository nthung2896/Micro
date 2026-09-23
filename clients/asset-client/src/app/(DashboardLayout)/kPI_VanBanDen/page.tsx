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
} from "@ant-design/icons";
import {
  Button,
  Card,
  ConfigProvider,
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
import KPI_VanBanDenDetail from "./detail";
import Search from "./search";
import AutoBreadcrumb from "@/components/util-compenents/Breadcrumb";
import {
  KPI_VanBanDenSearchType,
  KPI_VanBanDenType,
} from "@/types/kPI_VanBanDen/kPI_VanBanDen";
import kPI_VanBanDenService from "@/services/kPI_VanBanDen/kPI_VanBanDenService";
import KPI_VanBanDenCreateOrUpdate from "./createOrUpdate";


const KPI_VanBanDenPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [data, setData] = useState<ResponsePageList<KPI_VanBanDenType[]>>();
  const [pageSize, setPageSize] = useState<number>(20);
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [isPanelVisible, setIsPanelVisible] = useState<boolean>(false);
  const [searchValues, setSearchValues] = useState<KPI_VanBanDenSearchType | null>(
    null
  );
  const loading = useSelector((state) => state.general.isLoading);
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [currentItem, setCurentItem] = useState<KPI_VanBanDenType | null>(null);
  const [isOpenDetail, setIsOpenDetail] = useState<boolean>(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const tableColumns: TableProps<KPI_VanBanDenType>["columns"] = [
    {
      title: "STT",
      dataIndex: "index",
      key: "index",
      align: "center",
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
			title: "ID Đồng bộ",
			dataIndex: "idVanBanDongBo",
			render: (_: any, record: KPI_VanBanDenType) => (
				<span>{record.idVanBanDongBo}</span>
			),
		},
		{
			title: "Số văn bản",
			dataIndex: "soVanBan",
			render: (_: any, record: KPI_VanBanDenType) => (
				<span>{record.soVanBan}</span>
			),
		},
		{
			title: "Ngày văn bản",
			dataIndex: "ngayVanBan",
			render: (_: any, record: KPI_VanBanDenType) => (
				<span>{extensions.toDateString(record.ngayVanBan)}</span>
			),
		},
		{
			title: "Trích yếu",
			dataIndex: "trichYeu",
			render: (_: any, record: KPI_VanBanDenType) => (
				<span>{record.trichYeu}</span>
			),
		},
		{
			title: "Trạng thái",
			dataIndex: "trangThai",
			render: (_: any, record: KPI_VanBanDenType) => (
				<span>{record.trangThai}</span>
			),
		},
		{
			title: "Ngày hoàn thành",
			dataIndex: "ngayHoanThanh",
			render: (_: any, record: KPI_VanBanDenType) => (
				<span>{extensions.toDateString(record.ngayHoanThanh)}</span>
			),
		},
    {
      title: "Thao tác",
      dataIndex: "actions",
      fixed: "right",
      align: "center",
      render: (_: any, record: KPI_VanBanDenType) => {
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
                type="primary"
                
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
    const response = await kPI_VanBanDenService.delete(confirmDeleteId ?? "");
    if (response.status) {
      toast.success("Xóa thành công");
      handleLoadData();
    }
    setConfirmDeleteId(null);
  };

  const toggleSearch = () => {
    setIsPanelVisible(!isPanelVisible);
  };

  const onFinishSearch: FormProps<KPI_VanBanDenSearchType>["onFinish"] = async (
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
    async (searchDataOverride?: KPI_VanBanDenSearchType) => {
      dispatch(setIsLoading(true));

      const searchData = searchDataOverride || {
        pageIndex,
        pageSize,
        ...(searchValues || {}),
      };
      const response = await kPI_VanBanDenService.getData(searchData);
      if (response != null && response.data != null) {
        const data = response.data;
        setData(data);
      }
      dispatch(setIsLoading(false));
    },
    [dispatch, pageIndex, pageSize, searchValues]
  );

  const handleShowModal = (isEdit?: boolean, item?: KPI_VanBanDenType) => {
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
      <AutoBreadcrumb />

      {isOpenModal && (
        <KPI_VanBanDenCreateOrUpdate
          onSuccess={hanleCreateEditSuccess}
          onClose={handleClose}
          item={currentItem}
        />
      )}

      {isOpenDetail && (
        <KPI_VanBanDenDetail item={currentItem} onClose={handleCloseDetail} />
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

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <h2 className="text-lg font-bold text-gray-800 m-0">
            Quản lý KPI Văn bản đến
          </h2>
          <Space>
            <Button
              onClick={() => toggleSearch()}
              type="primary" style={{ backgroundColor: "#13c2c2", borderColor: "#13c2c2" }}
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
          </Space>
        </div>

        {isPanelVisible && (
          <div className="mb-3">
            <Search
              onFinish={onFinishSearch}
              pageIndex={pageIndex}
              pageSize={pageSize}
            />
          </div>
        )}

        <ConfigProvider
          theme={{
            components: {
              Table: {
                headerBg: "#0355a2",
                headerColor: "#ffffff",
              },
            },
          }}
        >
          <Table
            columns={styledColumns}
            bordered
            dataSource={data?.items}
            rowKey="id"
            scroll={{ x: 1100 }}
            pagination={false}
            loading={loading}
            size="middle"
          />
        </ConfigProvider>

        <Pagination
          className="mt-4"
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

export default withAuthorization(KPI_VanBanDenPage, "");
