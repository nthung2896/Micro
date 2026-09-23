"use client";
import { useRouter } from "next/navigation";
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
  UnorderedListOutlined,
  CopyOutlined,
  UploadOutlined,
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
  ConfigProvider,
  Tag,
} from "antd";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import KPI_BoTieuChiChungDetail from "./detail";
import Search from "./search";
import AutoBreadcrumb from "@/components/util-compenents/Breadcrumb";
import {
  KPI_BoTieuChiChungSearchType,
  KPI_BoTieuChiChungType,
} from "@/types/kPI_BoTieuChiChung/kPI_BoTieuChiChung";
import KPI_BoTieuChiChungService from "@/services/kPI_BoTieuChiChung/kPI_BoTieuChiChungService";
import KPI_BoTieuChiChungCreateOrUpdate from "./createOrUpdate";
import KPI_BoTieuChiChungImportModal from "./importModal";
import KPI_BoTieuChiChungTypeConstant, {
  getKPI_BoTieuChiChungTypeLabel,
} from "@/constants/KPI_BoTieuChiChungTypeConstant";

const KPI_BoTieuChiChungPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const [data, setData] = useState<ResponsePageList<KPI_BoTieuChiChungType[]>>();
  const [pageSize, setPageSize] = useState<number>(20);
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [isPanelVisible, setIsPanelVisible] = useState<boolean>(false);
  const [searchValues, setSearchValues] = useState<KPI_BoTieuChiChungSearchType | null>(null);
  const loading = useSelector((state: any) => state.general.isLoading);
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [isOpenImportModal, setIsOpenImportModal] = useState<boolean>(false);
  const [currentItem, setCurentItem] = useState<KPI_BoTieuChiChungType | null>(null);
  const [isOpenDetail, setIsOpenDetail] = useState<boolean>(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isClone, setIsClone] = useState<boolean>(false);
  const isAdmin = data?.items?.[0]?.isAdmin ?? data?.items?.[0]?.IsAdmin ?? false;

  const tableColumns: TableProps<KPI_BoTieuChiChungType>["columns"] = [
    {
      title: "STT",
      dataIndex: "index",
      key: "index",
      align: "center",
      width: 60,
      render: (_: any, __: any, index: number) => (pageIndex - 1) * pageSize + index + 1,
    },
    {
      title: "Số quyết định",
      dataIndex: "soQuyetDinh",
      key: "soQuyetDinh",
      render: (_: any, record: KPI_BoTieuChiChungType) => (
        <span className="font-medium text-blue-600">{record.soQuyetDinh || "---"}</span>
      ),
    },
    {
      title: "Tên bộ tiêu chí",
      dataIndex: "tenBoTieuChiDonVi",
      key: "tenBoTieuChiDonVi",
      width: 360,
      render: (_: any, record: KPI_BoTieuChiChungType) => (
        <span
          style={{
            display: "block",
            whiteSpace: "normal",
            overflowWrap: "anywhere",
          }}
        >
          {record.tenBoTieuChiDonVi || "---"}
        </span>
      ),
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      width: 130,
      align: "center",
      render: (_: any, record: KPI_BoTieuChiChungType) => (
        <Tag
          color={
            record.type === KPI_BoTieuChiChungTypeConstant.TapThe
              ? "green"
              : record.type
                ? "blue"
                : "default"
          }
        >
          {getKPI_BoTieuChiChungTypeLabel(record.type)}
        </Tag>
      ),
    },

    {
      title: "Đơn vị",
      dataIndex: "tenDonVi",
      key: "tenDonVi",
      render: (_: any, record: KPI_BoTieuChiChungType) => (
        <span>{record.tenDonVi || "---"}</span>
      ),
    },
    {
      title: "Ngày quyết định",
      dataIndex: "ngayQuyetDinh",
      key: "ngayQuyetDinh",
      render: (_: any, record: KPI_BoTieuChiChungType) => (
        <span>{extensions.toDateString(record.ngayQuyetDinh)}</span>
      ),
    },

    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      align: "center",
      width: 130,
      render: (_: any, record: KPI_BoTieuChiChungType) => (
        <Tag color={record.isActive ? "success" : "default"}>
          {record.isActive ? "Đang áp dụng" : "Chưa áp dụng"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      dataIndex: "actions",
      fixed: "right",
      align: "center",
      width: 130,
      render: (_: any, record: KPI_BoTieuChiChungType) => {
        const items: MenuProps["items"] = [
          {
            label: "Xem danh sách tiêu chí chung",
            key: "5",
            icon: <UnorderedListOutlined />,
            onClick: () => {
              router.push(`/kPI_TieuChiChung?IdBoTieuChiChung=${record.id}`);
            },
          },
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
            label: "Sao chép bộ tiêu chí",
            key: "clone",
            icon: <CopyOutlined />,
            onClick: () => {
              handleShowModal(false, record, true);
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

  const styledColumns = tableColumns.map((column) => ({
    ...column,
    onHeaderCell: () => ({
      style: {
        textAlign: "center" as const,
      },
    }),
  }));

  const hanleCreateEditSuccess = () => {
    handleLoadData();
    setCurentItem(null);
  };

  const handleDelete = async () => {
    const response = await KPI_BoTieuChiChungService.delete(confirmDeleteId ?? "");
    if (response.status) {
      toast.success("Xóa thành công");
      handleLoadData();
    }
    setConfirmDeleteId(null);
  };

  const toggleSearch = () => {
    setIsPanelVisible(!isPanelVisible);
  };

  const onFinishSearch: FormProps<KPI_BoTieuChiChungSearchType>["onFinish"] = async (
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
    async (searchDataOverride?: KPI_BoTieuChiChungSearchType) => {
      dispatch(setIsLoading(true));

      const searchData = searchDataOverride || {
        pageIndex,
        pageSize,
        ...(searchValues || {}),
      };

      const response = await KPI_BoTieuChiChungService.getData(searchData);

      if (response != null && response.data != null) {
        const data = response.data;
        setData(data as any);
      }
      dispatch(setIsLoading(false));
    },
    [dispatch, pageIndex, pageSize, searchValues]
  );

  const handleShowModal = (isEdit?: boolean, item?: KPI_BoTieuChiChungType, isCloneAction?: boolean) => {
    setIsOpenModal(true);
    setIsClone(!!isCloneAction);
    if (isEdit || isCloneAction) {
      setCurentItem(item ?? null);
    }
  };

  const handleClose = () => {
    setIsOpenModal(false);
    setIsClone(false);
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
        className="mb-2 flex-wrap"
        gap={16}
      >
        <AutoBreadcrumb />
        <Space size={4} className="btn-group flex-wrap" style={{ marginLeft: "auto" }}>
          <Button
            onClick={() => toggleSearch()}
            type="primary" style={{ backgroundColor: "#13c2c2", borderColor: "#13c2c2" }}
            icon={isPanelVisible ? <CloseOutlined /> : <SearchOutlined />}
          >
            {isPanelVisible ? "Ẩn tìm kiếm" : "Tìm kiếm"}
          </Button>
          {isAdmin && (
            <Button
              onClick={() => {
                handleShowModal();
              }}
              type="primary"
              icon={<PlusCircleOutlined />}
            >
              Thêm mới
            </Button>
          )}
          <Button
            type="primary"
            style={{ backgroundColor: "#1890ff", borderColor: "#1890ff" }}
            icon={<UploadOutlined />}
            onClick={() => setIsOpenImportModal(true)}
          >
            Import Excel
          </Button>
          {isOpenModal && (
            <KPI_BoTieuChiChungCreateOrUpdate
              onSuccess={hanleCreateEditSuccess}
              onClose={handleClose}
              item={currentItem}
              isClone={isClone}
            />
          )}
          <KPI_BoTieuChiChungImportModal
            isOpen={isOpenImportModal}
            onClose={() => setIsOpenImportModal(false)}
            onSuccess={() => handleLoadData()}
          />
        </Space>
      </Flex>
      {isPanelVisible && (
        <Search
          onFinish={onFinishSearch}
        />
      )}
      {isOpenDetail && (
        <KPI_BoTieuChiChungDetail item={currentItem} onClose={handleCloseDetail} />
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
          <ConfigProvider
            theme={{
              components: {
                Table: {
                  headerBg: "#0355a2",
                  headerColor: "white",
                  headerBorderRadius: 0,
                },
              },
            }}
          >
            <Table
              columns={styledColumns}
              bordered
              dataSource={data?.items}
              rowKey="id"
              scroll={{ x: "max-content" }}
              pagination={false}
              loading={loading}
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
          size="small"
          align="end"
        />
      </Card>
    </>
  );
};

export default withAuthorization(KPI_BoTieuChiChungPage, "");

