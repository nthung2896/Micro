"use client";
import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Flex from "@/components/shared-components/Flex";
import { ResponsePageList } from "@/types/general";
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
  UploadOutlined,
  SyncOutlined,
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
  Upload,
} from "antd";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import KPI_NhomTieuChiDetail from "./detail";
import Search from "./search";
import AutoBreadcrumb from "@/components/util-compenents/Breadcrumb";
import {
  KPI_NhomTieuChiSearchType,
  KPI_NhomTieuChiType,
} from "@/types/kPI_NhomTieuChi/kPI_NhomTieuChi";
import kPI_NhomTieuChiService from "@/services/kPI_NhomTieuChi/kPI_NhomTieuChiService";
import KPI_NhomTieuChiCreateOrUpdate from "./createOrUpdate";
import KPI_NhomTieuChiImportModal from "./importModal";
import kPI_BoTieuChiDonViService from "@/services/kPI_BoTieuChiDonVi/kPI_BoTieuChiDonViService";


interface Props {
  params?: any;
  searchParams?: any;
}

const KPI_NhomTieuChiPage: React.FC<Props> = (props: Props) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const idBoTieuChiDonViParam = searchParams?.get("idBoTieuChiDonVi") || undefined;
  const dispatch = useDispatch<AppDispatch>();
  const [boTieuChiName, setBoTieuChiName] = useState<string>('');
  const [data, setData] = useState<ResponsePageList<KPI_NhomTieuChiType[]>>();
  const [pageSize, setPageSize] = useState<number>(20);
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [isPanelVisible, setIsPanelVisible] = useState<boolean>(false);
  const [searchValues, setSearchValues] = useState<KPI_NhomTieuChiSearchType | null>(
    null
  );
  const loading = useSelector((state) => state.general.isLoading);
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [isOpenImportModal, setIsOpenImportModal] = useState<boolean>(false);
  const [currentItem, setCurentItem] = useState<KPI_NhomTieuChiType | null>(null);
  const [isOpenDetail, setIsOpenDetail] = useState<boolean>(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const tableColumns: TableProps<KPI_NhomTieuChiType>["columns"] = [
    {
      title: "STT",
      dataIndex: "index",
      key: "index",
      align: "center",
      width: 60,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: "Tên nhóm",
      dataIndex: "tenNhomTieuChi",
      key: "tenNhomTieuChi",
      width: 250,
    },
    {
      title: "Công việc chi tiết",
      dataIndex: "congViecChiTiet",
      key: "congViecChiTiet",
      width: 350,
    },
    {
      title: "Sản phẩm đầu ra",
      dataIndex: "sanPhamDauRa",
      key: "sanPhamDauRa",
    },
    {
      title: "Phân nhóm",
      dataIndex: "phanNhom",
      key: "phanNhom",
    },
    {
      title: "Khung điểm",
      dataIndex: "khungDiemToiDa",
      key: "khungDiemToiDa",
    },
    {
      title: "Điểm",
      dataIndex: "diem",
      key: "diem",
    },
    {
      title: "Hệ số",
      dataIndex: "heSoQuyDoi",
      key: "heSoQuyDoi",
    },
    {
      title: "Ghi chú",
      dataIndex: "ghiChu",
      key: "ghiChu",
    },
    {
      title: "Thao tác",
      dataIndex: "actions",
      fixed: "right",
      align: "center",
      render: (_: any, record: KPI_NhomTieuChiType) => {
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

  const hanleCreateEditSuccess = () => {
    handleLoadData();
    setCurentItem(null);
  };

  const handleDelete = async () => {
    const response = await kPI_NhomTieuChiService.delete(confirmDeleteId ?? "");
    if (response.status) {
      toast.success("Xóa thành công");
      handleLoadData();
    }
    setConfirmDeleteId(null);
  };

  const handleImportExcel = async (options: any) => {
    const { file, onSuccess, onError } = options;
    try {
      const res = await kPI_NhomTieuChiService.importExcelDirect(file as File);
      if (res.status) {
        toast.success(res.message || "Import thành công");
        onSuccess("Ok");
        handleLoadData();
      } else {
        toast.error(res.message || "Import thất bại");
        onError(new Error(res.message));
      }
    } catch (err: any) {
      toast.error("Lỗi khi import");
      onError(err);
    }
  };

  const toggleSearch = () => {
    setIsPanelVisible(!isPanelVisible);
  };

  const onFinishSearch: FormProps<KPI_NhomTieuChiSearchType>["onFinish"] = async (
    values
  ) => {
    try {
      setSearchValues(values);
      await handleLoadData(values);
    } catch (error) {
      console.error("Lỗi khi lưu dữ liệu:", error);
    }
  };

  const handleSyncElastic = async () => {
    dispatch(setIsLoading(true));
    try {
      const response = await kPI_NhomTieuChiService.syncToElastic({});
      if (response.status) {
        toast.success(response.message || "Đồng bộ lên Elastic thành công");
      } else {
        toast.error(response.message || "Đồng bộ lên Elastic thất bại");
      }
    } catch (error: any) {
      toast.error("Lỗi khi đồng bộ Elastic");
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  const handleLoadData = useCallback(
    async (searchDataOverride?: KPI_NhomTieuChiSearchType) => {
      dispatch(setIsLoading(true));

      const searchData = searchDataOverride || {
        pageIndex,
        pageSize,
        idBoTieuChiDonVi: idBoTieuChiDonViParam,
        ...(searchValues || {}),
      };

      const response = await kPI_NhomTieuChiService.getData(searchData);

      if (idBoTieuChiDonViParam) {
        const resboTieuChi = await kPI_BoTieuChiDonViService.getById(idBoTieuChiDonViParam);
        console.log("BTC:", resboTieuChi);
        if (resboTieuChi?.status && resboTieuChi?.data) {
          setBoTieuChiName(resboTieuChi.data.tenBoTieuChiDonVi || "");
        }
      }

      if (response != null && response.data != null) {
        const data = response.data;
        setData(data);
      }
      dispatch(setIsLoading(false));
    },
    [dispatch, pageIndex, pageSize, searchValues, idBoTieuChiDonViParam]
  );

  const handleShowModal = (isEdit?: boolean, item?: KPI_NhomTieuChiType) => {
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
  }, [handleLoadData, idBoTieuChiDonViParam]);

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
          <Button
            onClick={() => {
              handleShowModal();
            }}
            type="primary"
            icon={<PlusCircleOutlined />}
          >
            Thêm mới
          </Button>
          <Button
            type="primary"
            style={{ backgroundColor: "#1890ff", borderColor: "#1890ff" }}
            icon={<UploadOutlined />}
            onClick={() => setIsOpenImportModal(true)}
          >
            Import Excel
          </Button>
          <Link href={`/kPI_NhomTieuChi/treeView${idBoTieuChiDonViParam ? `?idBoTieuChiDonVi=${idBoTieuChiDonViParam}` : ""}`}>
            <Button type="primary" style={{ backgroundColor: "#722ed1", borderColor: "#722ed1" }}>
              Xem dạng Tree
            </Button>
          </Link>
          <Button
            type="primary" style={{ backgroundColor: "#fa8c16", borderColor: "#fa8c16" }}
            icon={<SyncOutlined />}
            onClick={handleSyncElastic}
          >
            Update to Elastic
          </Button>
          {isOpenModal && (
            <KPI_NhomTieuChiCreateOrUpdate
              onSuccess={hanleCreateEditSuccess}
              onClose={handleClose}
              item={currentItem}
            />
          )}
          <KPI_NhomTieuChiImportModal
            isOpen={isOpenImportModal}
            onClose={() => setIsOpenImportModal(false)}
            onSuccess={() => handleLoadData()}
          >
          </KPI_NhomTieuChiImportModal>
        </Space>
      </Flex>
      {idBoTieuChiDonViParam && (
        <Card
          className="mb-3 customCardShadow"
          styles={{ body: { padding: "12px 16px" } }}
          style={{ borderLeft: "4px solid #1890ff", backgroundColor: "#e6f7ff" }}
        >
          <Flex justifyContent="space-between" alignItems="center" className="flex-wrap gap-2">
            <div>
              <span className="font-semibold text-base text-blue-800">
                {boTieuChiName ? (`Danh sách Nhóm Tiêu Chí thuộc Bộ Tiêu Chí Đơn Vị - ${boTieuChiName}`) : ""}
              </span>
            </div>
            <Button
              type="default"
              icon={<ArrowLeftOutlined />}
              onClick={() => router.push("/kPI_BoTieuChiDonVi")}
              style={{ fontWeight: 500 }}
            >
              Quay lại danh sách Bộ Tiêu Chí
            </Button>
          </Flex>
        </Card>
      )}
      {isPanelVisible && (
        <Search
          onFinish={onFinishSearch}
          pageIndex={pageIndex}
          pageSize={pageSize}
        />
      )}
      {isOpenDetail && (
        <KPI_NhomTieuChiDetail item={currentItem} onClose={handleCloseDetail} />
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
              columns={tableColumns}
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

          align="end"
        />
      </Card>
    </>
  );
};

export default withAuthorization(KPI_NhomTieuChiPage, "");






