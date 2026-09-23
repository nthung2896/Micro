"use client";
import { useCallback, useEffect, useState } from "react";
import Flex from "@/components/shared-components/Flex";
import { PagedList } from "@/types/general";
import withAuthorization from "@/libs/authentication";
import { setIsLoading } from "@/store/general/GeneralSlice";
import { useSelector } from "@/store/hooks";
import { AppDispatch } from "@/store/store";
import { useRouter } from "next/navigation";
import * as extensions from "@/utils/extensions";
import {
  ApartmentOutlined,
  CloseOutlined,
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  EnvironmentOutlined,
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
  message,
} from "antd";
import { useDispatch } from "react-redux";
import TinhDetail from "./detail";
import Search from "./search";
import AutoBreadcrumb from "@/components/util-compenents/Breadcrumb";
import { TinhSearchType } from "@/types/tinh/request";
import tinhService from "@/services/tinh/tinh.service";
import TinhCreateOrUpdate from "./createOrUpdate";
import ImportExcelButton from "@/components/ImportExcel-components/ImportExcelButton";
import { tinhImportAdapter } from "@/services/adapters/tinhImport.adapter";
import { useSearchParams } from "next/navigation";
import { TinhType } from "@/types/tinh/dto";

const TinhPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [data, setData] = useState<PagedList<TinhType>>();
  const [pageSize, setPageSize] = useState<number>(20);
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [isPanelVisible, setIsPanelVisible] = useState<boolean>(false);
  const [searchValues, setSearchValues] = useState<TinhSearchType | null>(null);
  const loading = useSelector((state) => state.general.isLoading);
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [currentItem, setCurentItem] = useState<TinhType | null>(null);
  const [isOpenDetail, setIsOpenDetail] = useState<boolean>(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [edit, setEdit] = useState<boolean>(false);
  const searchParams = useSearchParams();
  const maTinhFromUrl = searchParams.get("maTinh") || "";
  const router = useRouter();
  const tableColumns: TableProps<TinhType>["columns"] = [
    {
      title: "STT",
      width: 70,
      align: "center",
      dataIndex: "index",
      key: "index",
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: "Tên Tỉnh",
      dataIndex: "tenTinh",
      render: (_: any, record: TinhType) => (
        <Button
          type="link"
          style={{ padding: 0 }}
          onClick={() => {
            router.push(
              `/huyen?maTinh=${encodeURIComponent(record.maTinh ?? "")}`,
            );
          }}
        >
          {record.tenTinh}
        </Button>
      ),
    },
    {
      title: "Mã Tỉnh",
      dataIndex: "maTinh",
      width: 120,
      render: (_: any, record: TinhType) => <span>{record.maTinh}</span>,
    },
    {
      title: "Danh sách Xã",
      key: "xemXa",
      align: "center",
      width: 140,
      render: (_: any, record: TinhType) => (
        <Button
          size="small"
          icon={<EnvironmentOutlined />}
          style={{
            backgroundColor: "#e6f4ff",
            color: "#0958d9",
            borderColor: "#91caff",
            fontWeight: 600,
          }}
          onClick={() => {
            router.push(
              `/xa?maTinh=${encodeURIComponent(record.maTinh ?? "")}`,
            );
          }}
        >
          DS Xã
        </Button>
      ),
    },
    {
      title: "Thao tác",
      dataIndex: "actions",
      fixed: "right",
      width: 140,
      align: "center",
      render: (_: any, record: TinhType) => {
        const items: MenuProps["items"] = [
          {
            label: "Xem DS Huyện",
            key: "dsHuyen",
            icon: <ApartmentOutlined />,
            onClick: () => {
              router.push(
                `/huyen?maTinh=${encodeURIComponent(record.maTinh ?? "")}`,
              );
            },
          },
          {
            label: "Xem DS Xã",
            key: "dsXa",
            icon: <EnvironmentOutlined />,
            onClick: () => {
              router.push(
                `/xa?maTinh=${encodeURIComponent(record.maTinh ?? "")}`,
              );
            },
          },
          {
            type: "divider",
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
              <Button onClick={(e) => e.preventDefault()} color="primary">
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
    const response = await tinhService.delete(confirmDeleteId ?? "");
    if (response.status) {
      message.success("Xóa thành công");
      handleLoadData();
    }
    setConfirmDeleteId(null);
  };

  const toggleSearch = () => {
    setIsPanelVisible(!isPanelVisible);
  };

  const onFinishSearch: FormProps<TinhSearchType>["onFinish"] = async (
    values,
  ) => {
    try {
      setSearchValues(values);
      await handleLoadData(values);
    } catch (error) {
      console.error("Lỗi khi lưu dữ liệu:", error);
    }
  };

  const handleLoadData = useCallback(
    async (searchDataOverride?: TinhSearchType) => {
      dispatch(setIsLoading(true));

      const cleanedSearchValues = Object.fromEntries(
        Object.entries(searchValues || {}).filter(
          ([_, value]) => value !== "" && value !== null && value !== undefined,
        ),
      );

      const searchData = searchDataOverride || {
        pageIndex,
        pageSize,
        ...cleanedSearchValues,
      };
      console.log(searchData);
      const response = await tinhService.getData(searchData);
      if (response != null && response.data != null) {
        const data = response.data;
        setData(data);
      }
      dispatch(setIsLoading(false));
    },
    [dispatch, pageIndex, pageSize, searchValues],
  );

  const handleShowModal = (isEdit?: boolean, item?: TinhType) => {
    setIsOpenModal(true);
    setEdit(false);
    if (isEdit) {
      setCurentItem(item ?? null);
      setEdit(true);
    }
  };

  const handleClose = () => {
    setIsOpenModal(false);
    setCurentItem(null);
  };

  const handleCloseDetail = () => {
    setIsOpenDetail(false);
    setCurentItem(null);
  };
  useEffect(() => {
    if (maTinhFromUrl) {
      const nextSearch: any = {
        ...(searchValues ?? {}),
        maTinh: maTinhFromUrl,
      };
      setSearchValues(nextSearch);
      setPageIndex(1);
      handleLoadData({ ...nextSearch, pageIndex: 1, pageSize });
    } else {
      handleLoadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maTinhFromUrl, pageSize]);

  useEffect(() => {
    handleLoadData();
  }, [handleLoadData]);

  return (
    <>
      <Flex
        alignItems="center"
        justifyContent="space-between"
        className="mb-2 flex-wrap justify-content-end"
      >
        <AutoBreadcrumb />
        <div className="btn-group w-fit flex items-center" style={{ gap: 12 }}>
          <ImportExcelButton
            service={tinhImportAdapter}
            collectionName="Tinh"
            onSuccess={() => handleLoadData()}
          />
          <Button
            onClick={() => toggleSearch()}
            type="primary"
            size="middle"
            icon={isPanelVisible ? <CloseOutlined /> : <SearchOutlined />}
          >
            {isPanelVisible ? "Ẩn tìm kiếm" : "Tìm kiếm"}
          </Button>
          <Button
            onClick={() => {
              handleShowModal();
            }}
            type="primary"
            style={{ backgroundColor: "#16a34a", borderColor: "#16a34a" }}
            className="btn-green"
            icon={<PlusCircleOutlined />}
            size="middle"
          >
            Thêm mới
          </Button>
          {isOpenModal && (
            <TinhCreateOrUpdate
              onSuccess={hanleCreateEditSuccess}
              onClose={handleClose}
              item={currentItem}
              pageIndex={pageIndex}
              pageSize={pageSize}
              isEdit={edit}
              open={true}
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
        <TinhDetail item={currentItem} onClose={handleCloseDetail} />
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
        <div
          style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}
        >
          <Pagination
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
        </div>
      </Card>
    </>
  );
};

export default withAuthorization(TinhPage, "");
