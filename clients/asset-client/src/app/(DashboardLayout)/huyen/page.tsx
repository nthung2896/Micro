"use client";
import { useCallback, useEffect, useState } from "react";
import Flex from "@/components/shared-components/Flex";
import { PagedList } from "@/types/general";
import withAuthorization from "@/libs/authentication";
import { setIsLoading } from "@/store/general/GeneralSlice";
import { useSelector } from "@/store/hooks";
import { AppDispatch } from "@/store/store";
import * as extensions from "@/utils/extensions";
import {
  ArrowLeftOutlined,
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
import HuyenDetail from "./detail";
import Search from "./search";
import AutoBreadcrumb from "@/components/util-compenents/Breadcrumb";
import { HuyenSearchType } from "@/types/huyen/request";
import huyenService from "@/services/huyen/huyen.service";
import HuyenCreateOrUpdate from "./createOrUpdate";
import { set } from "nprogress";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { huyenImportAdapter } from "@/services/adapters/huyenImport.adapter";
import ImportExcelButton from "@/components/ImportExcel-components/ImportExcelButton";
import { HuyenType } from "@/types/huyen/dto";
const HuyenPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [data, setData] = useState<PagedList<HuyenType>>();
  const [pageSize, setPageSize] = useState<number>(20);
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [isPanelVisible, setIsPanelVisible] = useState<boolean>(false);
  const [searchValues, setSearchValues] = useState<HuyenSearchType | null>(
    null,
  );
  const loading = useSelector((state) => state.general.isLoading);
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [currentItem, setCurentItem] = useState<HuyenType | null>(null);
  const [isOpenDetail, setIsOpenDetail] = useState<boolean>(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [edit, setEdit] = useState<boolean>(false);
  const router = useRouter();
  const tableColumns: TableProps<HuyenType>["columns"] = [
    {
      title: "STT",
      width: 70,
      align: "center",
      dataIndex: "index",
      key: "index",
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: "Loại huyện",
      dataIndex: "loaiHuyen",
      render: (_: any, record: HuyenType) => <span>{record.loaiHuyen}</span>,
    },
    {
      title: "Tên huyện",
      dataIndex: "tenHuyen",
      render: (_: any, record: HuyenType) => (
        <Button
          type="link"
          style={{ padding: 0 }}
          onClick={() => {
            const params = new URLSearchParams();
            if (record.ma) params.set("maHuyen", record.ma);
            if (record.maTinh) params.set("maTinh", record.maTinh);
            router.push(`/xa?${params.toString()}`);
          }}
        >
          {record.tenHuyen}
        </Button>
      ),
    },
    {
      title: "Mã",
      dataIndex: "ma",
      render: (_: any, record: HuyenType) => <span>{record.ma}</span>,
    },
    {
      title: "Tỉnh",
      dataIndex: "tenTinh",
      render: (_: any, record: HuyenType) => {
        const maTinh = record.maTinh ?? "";
        const tenTinh = record.tenTinh ?? "";

        // hiển thị 1 trong 2 khi có thôi
        const label = tenTinh || maTinh || "—";

        // chỉ truyền 1 cái (ưu tiên maTinh)
        const qs = maTinh
          ? `maTinh=${encodeURIComponent(maTinh)}`
          : tenTinh
            ? `tenTinh=${encodeURIComponent(tenTinh)}`
            : "";

        return (
          <Button
            type="link"
            style={{ padding: 0 }}
            disabled={!qs}
            onClick={() => router.push(`/tinh?${qs}`)}
          >
            {label}
          </Button>
        );
      },
    },

    {
      title: "Thao tác",
      dataIndex: "actions",
      fixed: "right",
      width: 140,
      align: "center",
      render: (_: any, record: HuyenType) => {
        const items: MenuProps["items"] = [
          {
            label: "Xem DS Xã",
            key: "dsXa",
            icon: <EnvironmentOutlined />,
            onClick: () => {
              const params = new URLSearchParams();
              if (record.ma) params.set("maHuyen", record.ma);
              if (record.maTinh) params.set("maTinh", record.maTinh);
              router.push(`/xa?${params.toString()}`);
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
    const response = await huyenService.delete(confirmDeleteId ?? "");
    if (response.status) {
      message.success("Xóa thành công");
      handleLoadData();
    }
    setConfirmDeleteId(null);
  };

  const toggleSearch = () => {
    setIsPanelVisible(!isPanelVisible);
  };

  const onFinishSearch: FormProps<HuyenSearchType>["onFinish"] = async (
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
    async (searchDataOverride?: HuyenSearchType) => {
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
      const response = await huyenService.getData(searchData);
      if (response != null && response.data != null) {
        const data = response.data;
        setData(data);
      }
      dispatch(setIsLoading(false));
    },
    [dispatch, pageIndex, pageSize, searchValues],
  );

  const handleShowModal = (isEdit?: boolean, item?: HuyenType) => {
    setIsOpenModal(true);
    setEdit(false);
    if (isEdit) {
      setEdit(true);
      setCurentItem(item ?? null);
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
  const searchParams = useSearchParams();
  const maTinhFromUrl = searchParams.get("maTinh"); // hoặc tinhId

  useEffect(() => {
    if (maTinhFromUrl) {
      // set vào state searchValues và load data luôn
      const nextSearch = {
        ...searchValues,
        maTinh: maTinhFromUrl,
        pageIndex: 1,
        pageSize,
      };
      setSearchValues(nextSearch);
      setPageIndex(1);
      handleLoadData(nextSearch);
    } else {
      handleLoadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maTinhFromUrl]);
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

        <div className="btn-group flex items-center" style={{ gap: 12 }}>
          {maTinhFromUrl && (
            <Button
              onClick={() => router.push("/tinh")}
              icon={<ArrowLeftOutlined />}
              size="middle"
            >
              Quay lại Tỉnh
            </Button>
          )}
          <ImportExcelButton
            service={huyenImportAdapter}
            collectionName="Huyen"
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
            icon={<PlusCircleOutlined />}
            size="middle"
          >
            Thêm mới
          </Button>
          {isOpenModal && (
            <HuyenCreateOrUpdate
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
        <HuyenDetail item={currentItem} onClose={handleCloseDetail} />
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

export default withAuthorization(HuyenPage, "");
