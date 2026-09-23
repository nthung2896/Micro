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
import KPI_VanBanDiDetail from "./detail";
import Search from "./search";
import AutoBreadcrumb from "@/components/util-compenents/Breadcrumb";
import {
  KPI_VanBanDiSearchType,
  KPI_VanBanDiType,
} from "@/types/kPI_VanBanDi/kPI_VanBanDi";
import kPI_VanBanDiService from "@/services/kPI_VanBanDi/kPI_VanBanDiService";
import KPI_VanBanDiCreateOrUpdate from "./createOrUpdate";

const KPI_VanBanDiPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [data, setData] = useState<ResponsePageList<KPI_VanBanDiType[]>>();
  const [pageSize, setPageSize] = useState<number>(20);
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [isPanelVisible, setIsPanelVisible] = useState<boolean>(false);
  const [searchValues, setSearchValues] = useState<KPI_VanBanDiSearchType | null>(
    null
  );
  const loading = useSelector((state) => state.general.isLoading);
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [currentItem, setCurentItem] = useState<KPI_VanBanDiType | null>(null);
  const [isOpenDetail, setIsOpenDetail] = useState<boolean>(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const tableColumns: TableProps<KPI_VanBanDiType>["columns"] = [
    {
      title: "STT",
      dataIndex: "index",
      key: "index",
      align: "center",
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: "Số hiệu",
      dataIndex: "soHieu",
      render: (_: any, record: KPI_VanBanDiType) => (
        <span>{record.soHieu}</span>
      ),
    },
    {
      title: "Loại văn bản",
      dataIndex: "loaiVanBan",
      render: (_: any, record: KPI_VanBanDiType) => (
        <span>{record.loaiVanBan}</span>
      ),
    },
    {
      title: "Trích yếu",
      dataIndex: "trichYeu",
      render: (_: any, record: KPI_VanBanDiType) => (
        <span>{record.trichYeu}</span>
      ),
    },
    {
      title: "Ngày ban hành",
      dataIndex: "ngayBanHanh",
      render: (_: any, record: KPI_VanBanDiType) => (
        <span>{extensions.toDateString(record.ngayBanHanh)}</span>
      ),
    },
    {
      title: "Hạn xử lý",
      dataIndex: "hanXuLy",
      render: (_: any, record: KPI_VanBanDiType) => (
        <span>{extensions.toDateString(record.hanXuLy)}</span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "trangThai",
      render: (_: any, record: KPI_VanBanDiType) => (
        <span>{record.trangThai}</span>
      ),
    },
    {
      title: "Thao tác",
      dataIndex: "actions",
      fixed: "right",
      align: "center",
      render: (_: any, record: KPI_VanBanDiType) => {
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

  const hanleCreateEditSuccess = () => {
    handleLoadData();
    setCurentItem(null);
  };

  const handleDelete = async () => {
    const response = await kPI_VanBanDiService.delete(confirmDeleteId ?? "");
    if (response.status) {
      toast.success("Xóa thành công");
      handleLoadData();
    }
    setConfirmDeleteId(null);
  };

  const toggleSearch = () => {
    setIsPanelVisible(!isPanelVisible);
  };

  const onFinishSearch: FormProps<KPI_VanBanDiSearchType>["onFinish"] = async (
    values
  ) => {
    try {
      setSearchValues(values);
      setPageIndex(1);
      await handleLoadData(values);
    } catch (error) {
      console.error("Lỗi khi lưu dữ liệu:", error);
    }
  };

  const handleLoadData = useCallback(
    async (searchDataOverride?: KPI_VanBanDiSearchType) => {
      dispatch(setIsLoading(true));

      const searchData = {
        pageIndex: searchDataOverride ? 1 : pageIndex,
        pageSize,
        ...(searchValues || {}),
        ...(searchDataOverride || {}),
      };
      const response = await kPI_VanBanDiService.getData(searchData);
      if (response != null && response.data != null) {
        const data = response.data;
        setData(data);
      }
      dispatch(setIsLoading(false));
    },
    [dispatch, pageIndex, pageSize, searchValues]
  );

  const handleShowModal = (isEdit?: boolean, item?: KPI_VanBanDiType) => {
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
        className="mb-2"
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
            <KPI_VanBanDiCreateOrUpdate
              onSuccess={hanleCreateEditSuccess}
              onClose={handleClose}
              item={currentItem}
            />
          )}
        </Space>
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
        <KPI_VanBanDiDetail item={currentItem} onClose={handleCloseDetail} />
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
            components={{
              header: {
                cell: (props: any) => (
                  <th {...props} style={{ ...props.style, textAlign: 'center', background: '#2256c0', color: '#fff' }}>
                    {props.children}
                  </th>
                ),
              },
            }}
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

export default withAuthorization(KPI_VanBanDiPage, "");
