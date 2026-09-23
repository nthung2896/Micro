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
  Tag,
} from "antd";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { useRouter, useSearchParams } from "next/navigation";
import XaDetail from "./detail";
import Search from "./search";
import AutoBreadcrumb from "@/components/util-compenents/Breadcrumb";
import {
  XaSearchType,
  XaType,
} from "@/types/xa/xa";
import xaService from "@/services/xa/xaService";
import XaCreateOrUpdate from "./createOrUpdate";

const XaPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const maTinhFromUrl = searchParams.get("maTinh") || "";
  const maHuyenFromUrl = searchParams.get("maHuyen") || "";

  const dispatch = useDispatch<AppDispatch>();
  const [data, setData] = useState<PagedList<XaType>>();
  const [pageSize, setPageSize] = useState<number>(20);
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [isPanelVisible, setIsPanelVisible] = useState<boolean>(false);
  const [searchValues, setSearchValues] = useState<XaSearchType | null>(null);
  const loading = useSelector((state) => state.general.isLoading);
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [currentItem, setCurentItem] = useState<XaType | null>(null);
  const [isOpenDetail, setIsOpenDetail] = useState<boolean>(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const tableColumns: TableProps<XaType>["columns"] = [
    {
      title: "STT",
      dataIndex: "index",
      key: "index",
      width: 70,
      align: "center",
      render: (_: any, __: any, index: number) => (pageIndex - 1) * pageSize + index + 1,
    },
    {
      title: "Tên Xã",
      dataIndex: "tenXa",
      key: "tenXa",
      render: (_: any, record: XaType) => (
        <span style={{ fontWeight: 600, color: "#0355a2" }}>
          {record.tenXa || "—"}
        </span>
      ),
    },
    {
      title: "Loại",
      dataIndex: "loai",
      key: "loai",
      width: 120,
      render: (_: any, record: XaType) => <span>{record.loai || "—"}</span>,
    },
    {
      title: "Mã Xã",
      dataIndex: "maXa",
      key: "maXa",
      width: 120,
      render: (_: any, record: XaType) => <span>{record.maXa || "—"}</span>,
    },
    {
      title: "Mã Huyện",
      dataIndex: "maHuyen",
      key: "maHuyen",
      width: 130,
      render: (_: any, record: XaType) => {
        const ma = record.maHuyen;
        return ma ? (
          <Button
            type="link"
            style={{ padding: 0 }}
            onClick={() => router.push(`/huyen?ma=${encodeURIComponent(ma)}`)}
          >
            {ma}
          </Button>
        ) : (
          <span>—</span>
        );
      },
    },
    {
      title: "Mã Tỉnh",
      dataIndex: "maTinh",
      key: "maTinh",
      width: 130,
      render: (_: any, record: XaType) => {
        const ma = record.maTinh;
        return ma ? (
          <Button
            type="link"
            style={{ padding: 0 }}
            onClick={() => router.push(`/tinh?maTinh=${encodeURIComponent(ma)}`)}
          >
            {ma}
          </Button>
        ) : (
          <span>—</span>
        );
      },
    },
    {
      title: "Thao tác",
      dataIndex: "actions",
      fixed: "right",
      width: 140,
      align: "center",
      render: (_: any, record: XaType) => {
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
          <Dropdown menu={{ items }} trigger={["click"]}>
            <Button
              onClick={(e) => e.preventDefault()}
              color="primary"
              size="middle"
            >
              <Space>
                Thao tác
                <DownOutlined />
              </Space>
            </Button>
          </Dropdown>
        );
      },
    },
  ];

  const hanleCreateEditSuccess = () => {
    handleLoadData();
    setCurentItem(null);
  };

  const handleDelete = async () => {
    const response = await xaService.delete(confirmDeleteId ?? "");
    if (response.status) {
      toast.success("Xóa thành công");
      handleLoadData();
    }
    setConfirmDeleteId(null);
  };

  const toggleSearch = () => {
    setIsPanelVisible(!isPanelVisible);
  };

  const onFinishSearch: FormProps<XaSearchType>["onFinish"] = async (
    values
  ) => {
    try {
      const mergedValues = {
        ...(values || {}),
        ...(maTinhFromUrl ? { maTinh: maTinhFromUrl } : {}),
        ...(maHuyenFromUrl ? { maHuyen: maHuyenFromUrl } : {}),
      };
      setSearchValues(mergedValues);
      setPageIndex(1);
      await handleLoadData({ ...mergedValues, pageIndex: 1, pageSize });
    } catch (error) {
      console.error("Lỗi khi tìm kiếm:", error);
    }
  };

  const handleLoadData = useCallback(
    async (searchDataOverride?: XaSearchType) => {
      dispatch(setIsLoading(true));

      const activeSearch = searchDataOverride || searchValues || {};
      const cleanedSearchValues = Object.fromEntries(
        Object.entries(activeSearch).filter(
          ([_, value]) => value !== "" && value !== null && value !== undefined,
        ),
      );

      const searchData = {
        pageIndex: searchDataOverride?.pageIndex ?? pageIndex,
        pageSize: searchDataOverride?.pageSize ?? pageSize,
        ...cleanedSearchValues,
      };

      try {
        const response: any = await xaService.getData(searchData);
        const resData: PagedList<XaType> | null =
          response?.data?.items != null
            ? response.data
            : response?.items != null
              ? response
              : null;

        if (resData != null) {
          setData(resData);
        }
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu xã:", err);
      } finally {
        dispatch(setIsLoading(false));
      }
    },
    [dispatch, pageIndex, pageSize, searchValues]
  );

  const handleShowModal = (isEdit?: boolean, item?: XaType) => {
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

  const handleGoBack = () => {
    if (maHuyenFromUrl) {
      router.push(`/huyen?ma=${encodeURIComponent(maHuyenFromUrl)}`);
    } else if (maTinhFromUrl) {
      router.push(`/tinh?maTinh=${encodeURIComponent(maTinhFromUrl)}`);
    } else if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/tinh");
    }
  };

  useEffect(() => {
    const nextSearch: any = {
      ...(maTinhFromUrl ? { maTinh: maTinhFromUrl } : {}),
      ...(maHuyenFromUrl ? { maHuyen: maHuyenFromUrl } : {}),
    };
    setSearchValues(nextSearch);
    setPageIndex(1);
    handleLoadData({ ...nextSearch, pageIndex: 1, pageSize });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maTinhFromUrl, maHuyenFromUrl, pageSize]);

  return (
    <>
      <Flex
        alignItems="center"
        justifyContent="space-between"
        className="mb-2 flex-wrap justify-content-end"
      >
        <AutoBreadcrumb />
        <div className="btn-group flex items-center" style={{ gap: 12 }}>
          <Button
            onClick={handleGoBack}
            icon={<ArrowLeftOutlined />}
            size="middle"
          >
            Quay lại
          </Button>
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
            <XaCreateOrUpdate
              onSuccess={hanleCreateEditSuccess}
              onClose={handleClose}
              item={currentItem}
            />
          )}
        </div>
      </Flex>

      {(maTinhFromUrl || maHuyenFromUrl) && (
        <div className="mb-3 flex items-center justify-between gap-2 flex-wrap" style={{ padding: "8px 12px", background: "#e6f4ff", borderRadius: 8, border: "1px solid #91caff" }}>
          <div className="flex items-center gap-2 flex-wrap">
            <span style={{ fontWeight: 600, color: "#0958d9" }}>Đang lọc dữ liệu:</span>
            {maTinhFromUrl && (
              <Tag
                color="blue"
                closable
                onClose={() => {
                  const params = new URLSearchParams(searchParams.toString());
                  params.delete("maTinh");
                  const qs = params.toString();
                  router.push(qs ? `/xa?${qs}` : "/xa");
                }}
              >
                Mã Tỉnh: <strong>{maTinhFromUrl}</strong>
              </Tag>
            )}
            {maHuyenFromUrl && (
              <Tag
                color="cyan"
                closable
                onClose={() => {
                  const params = new URLSearchParams(searchParams.toString());
                  params.delete("maHuyen");
                  const qs = params.toString();
                  router.push(qs ? `/xa?${qs}` : "/xa");
                }}
              >
                Mã Huyện: <strong>{maHuyenFromUrl}</strong>
              </Tag>
            )}
            <Button
              type="link"
              size="small"
              style={{ padding: 0 }}
              onClick={() => router.push("/xa")}
            >
              Xóa bộ lọc
            </Button>
          </div>

          <Button
            icon={<ArrowLeftOutlined />}
            size="small"
            onClick={handleGoBack}
            style={{
              backgroundColor: "#ffffff",
              color: "#0958d9",
              borderColor: "#91caff",
              fontWeight: 600,
            }}
          >
            Quay lại {maHuyenFromUrl ? "DS Huyện" : "DS Tỉnh"}
          </Button>
        </div>
      )}

      {isPanelVisible && (
        <Search
          onFinish={onFinishSearch}
          pageIndex={pageIndex}
          pageSize={pageSize}
        />
      )}
      {isOpenDetail && (
        <XaDetail item={currentItem} onClose={handleCloseDetail} />
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
        <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
          <Pagination
            total={data?.totalCount}
            showTotal={(total, range) =>
              `${range[0]}-${range[1]} trong ${total} dữ liệu`
            }
            pageSize={pageSize}
            defaultCurrent={1}
            current={pageIndex}
            onChange={(e) => {
              setPageIndex(e);
              handleLoadData({ pageIndex: e, pageSize });
            }}
            onShowSizeChange={(current, size) => {
              setPageIndex(current);
              setPageSize(size);
              handleLoadData({ pageIndex: current, pageSize: size });
            }}
            align="end"
          />
        </div>
      </Card>
    </>
  );
};

export default withAuthorization(XaPage, "");
