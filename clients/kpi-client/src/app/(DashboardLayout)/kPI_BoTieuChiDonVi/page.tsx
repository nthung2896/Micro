"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Flex from "@/components/shared-components/Flex";
import { ResponsePageList } from "@/types/general";
import withAuthorization from "@/libs/authentication";
import { setIsLoading } from "@/store/general/GeneralSlice";
import { useSelector } from "@/store/hooks";
import { AppDispatch } from "@/store/store";
import * as extensions from "@/utils/extensions";
import {
  CloseOutlined,
  CopyOutlined,
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  EyeOutlined,
  PlusCircleOutlined,
  SearchOutlined,
  UnorderedListOutlined,
  UploadOutlined,
  SyncOutlined,
  LockOutlined,
  UnlockOutlined,
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
import KPI_BoTieuChiDonViDetail from "./detail";
import Search from "./search";
import AutoBreadcrumb from "@/components/util-compenents/Breadcrumb";
import {
  KPI_BoTieuChiDonViSearchType,
  KPI_BoTieuChiDonViType,
} from "@/types/kPI_BoTieuChiDonVi/kPI_BoTieuChiDonVi";
import kPI_BoTieuChiDonViService from "@/services/kPI_BoTieuChiDonVi/kPI_BoTieuChiDonViService";
import KPI_BoTieuChiDonViCreateOrUpdate from "./createOrUpdate";
import KPI_NhomTieuChiImportModal from "../kPI_NhomTieuChi/importModal";
import KPI_BoTieuChiDonViImportModalV2 from "./importModalV2";
import kPI_NhomTieuChiService from "@/services/kPI_NhomTieuChi/kPI_NhomTieuChiService";
import { CauHinhDiemLanhDaoModal } from "./CauHinhDiemLanhDaoModal";
import CloneModal from "./cloneModal";

const KPI_BoTieuChiDonViPage: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [data, setData] = useState<ResponsePageList<KPI_BoTieuChiDonViType[]>>();
  const [pageSize, setPageSize] = useState<number>(20);
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [isPanelVisible, setIsPanelVisible] = useState<boolean>(false);
  const [searchValues, setSearchValues] = useState<KPI_BoTieuChiDonViSearchType | null>(
    null
  );
  const loading = useSelector((state) => state.general.isLoading);
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [isOpenImportModal, setIsOpenImportModal] = useState<boolean>(false);
  const [isOpenImportModalV2, setIsOpenImportModalV2] = useState<boolean>(false);
  const [currentItem, setCurentItem] = useState<KPI_BoTieuChiDonViType | null>(null);
  const [isOpenDetail, setIsOpenDetail] = useState<boolean>(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isOpenCauHinhDiemLanhDao, setIsOpenCauHinhDiemLanhDao] = useState<boolean>(false);
  const [cloneItem, setCloneItem] = useState<KPI_BoTieuChiDonViType | null>(null);

  const userInfo = useSelector((state: any) => state.auth.User);
  const isCucTruong = userInfo?.vaiTro?.includes("CucTruong") || userInfo?.listRole?.includes("CucTruong");
  const isAdmin = data?.items?.[0]?.isAdmin ?? data?.items?.[0]?.IsAdmin ?? false;

  const tableColumns: TableProps<KPI_BoTieuChiDonViType>["columns"] = [
    {
      title: "STT",
      dataIndex: "index",
      key: "index",
      align: "center",
      width: 60,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: "Tên bộ tiêu chí",
      dataIndex: "tenBoTieuChiDonVi",
      key: "tenBoTieuChiDonVi",
      width: 650,
      render: (_: any, record: KPI_BoTieuChiDonViType) => (
        <span className="font-medium text-blue-600">{record.tenBoTieuChiDonVi || "---"}</span>
      ),
    },
    {
      title: "Đơn vị áp dụng",
      dataIndex: "tenDonVi",
      key: "tenDonVi",
      width: 250,
      render: (_: any, record: KPI_BoTieuChiDonViType) => (
        <span>{record.tenDonVi || record.idDonVi || "---"}</span>
      ),
    },
    {
      title: "Cấu hình điểm lãnh đạo",
      dataIndex: "cauHinhDiemLanhDaoText",
      key: "cauHinhDiemLanhDaoText",
      width: 180,
      render: (_: any, record: KPI_BoTieuChiDonViType) => (
        <span style={{ whiteSpace: "pre-wrap" }} dangerouslySetInnerHTML={{ __html: record.cauHinhDiemLanhDaoText || "---" }}></span>
      ),
    },
    {
      title: "Số quyết định & Ngày quyết định",
      key: "quyetDinhInfo",
      width: 200,
      render: (_: any, record: KPI_BoTieuChiDonViType) => {
        const soQD = record.soQuyetDinh || "";
        const ngayQD = record.ngayQuyetDinh ? `Ngày ${extensions.toDateString(record.ngayQuyetDinh)}` : "";
        const combined = [soQD, ngayQD].filter(Boolean).join(" - ");
        return <span>{combined || "---"}</span>;
      },
    },
    {
      title: "Trạng thái",
      key: "is_locked",
      width: 120,
      align: "center",
      render: (_: any, record: KPI_BoTieuChiDonViType) => {
        const isLocked = record.is_locked;
        return isLocked ? (
          <Tag color="error" icon={<LockOutlined />} style={{ borderRadius: "12px", padding: "2px 10px", fontSize: "12px" }}>
            Đã khóa
          </Tag>
        ) : (
          <Tag color="success" icon={<UnlockOutlined />} style={{ borderRadius: "12px", padding: "2px 10px", fontSize: "12px" }}>
            Mở
          </Tag>
        );
      },
    },

    {
      title: "Thao tác",
      dataIndex: "actions",
      fixed: "right",
      align: "center",
      width: 130,
      render: (_: any, record: KPI_BoTieuChiDonViType) => {
        const items: MenuProps["items"] = [
          {
            label: "Xem nhóm tiêu chí",
            key: "1",
            icon: <UnorderedListOutlined />,
            onClick: () => {
              router.push(`/kPI_NhomTieuChi?idBoTieuChiDonVi=${record.id}`);
            },
          },
          {
            label: "Xem Tree view nhóm tiêu chí",
            key: "tree-view",
            icon: <UnorderedListOutlined />,
            onClick: () => {
              router.push(`/kPI_NhomTieuChi/treeView?idBoTieuChiDonVi=${record.id}`);
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
            disabled: record.is_locked,
            onClick: () => {
              if (record.is_locked) {
                toast.warning("Bộ tiêu chí này đã bị khóa (do đợt đánh giá đã kết thúc/đóng), không thể sửa.");
                return;
              }
              handleShowModal(true, record);
            },
          },
          {
            label: "Cấu hình điểm lãnh đạo",
            key: "cau-hinh-diem",
            icon: <UnorderedListOutlined />,
            onClick: () => {
              setCurentItem(record);
              setIsOpenCauHinhDiemLanhDao(true);
            },
          },
          {
            type: "divider",
          },
          {
            type: "divider",
          },
          {
            label: "Nhân bản",
            key: "clone",
            icon: <CopyOutlined />,
            onClick: () => {
              setCloneItem(record);
            },
          },
          {
            type: "divider",
          },
          {
            label: record.is_locked ? "Mở khóa bộ tiêu chí" : "Khóa bộ tiêu chí",
            key: "toggle-lock",
            icon: record.is_locked ? <UnlockOutlined style={{ color: "#52c41a" }} /> : <LockOutlined style={{ color: "#faad14" }} />,
            onClick: () => {
              handleToggleLock(record);
            },
          },
          {
            type: "divider",
          },
          {
            label: "Đồng bộ Elastic",
            key: "sync-elastic",
            icon: <SyncOutlined />,
            onClick: () => {
              handleSyncElasticSingle(record.id ?? "");
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
            // disabled: record.is_locked,
            onClick: () => {
              // if (record.is_locked) {
              //   toast.warning("Bộ tiêu chí này đã bị khóa (do đợt đánh giá đã kết thúc/đóng), không thể xóa.");
              //   return;
              // }
              setConfirmDeleteId(record.id ?? "");
            },
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

  const handleToggleLock = async (record: KPI_BoTieuChiDonViType) => {
    if (!record.id) return;
    dispatch(setIsLoading(true));
    try {
      const response = await kPI_BoTieuChiDonViService.toggleLock(record.id);
      if (response.status) {
        toast.success(response.message || (record.is_locked ? "Mở khóa thành công" : "Khóa thành công"));
        handleLoadData();
      } else {
        toast.error(response.message || "Thao tác thất bại");
      }
    } catch (error: any) {
      toast.error(error?.message || "Đã xảy ra lỗi khi thay đổi trạng thái");
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  const hanleCreateEditSuccess = () => {
    handleLoadData();
    setCurentItem(null);
  };

  const handleDelete = async () => {
    const response = await kPI_BoTieuChiDonViService.delete(confirmDeleteId ?? "");
    if (response.status) {
      toast.success("Xóa thành công");
      handleLoadData();
    } else {
      toast.error(response.message || "Xóa thất bại");
    }
    setConfirmDeleteId(null);
  };

  const handleClone = async (id: string) => {
    dispatch(setIsLoading(true));
    try {
      const response = await kPI_BoTieuChiDonViService.clone(id);
      if (response.status) {
        toast.success("Nhân bản thành công");
        handleLoadData();
      } else {
        toast.error(response.message || "Nhân bản thất bại");
      }
    } catch (error) {
      toast.error("Lỗi hệ thống khi nhân bản");
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  const toggleSearch = () => {
    setIsPanelVisible(!isPanelVisible);
  };

  const handleSyncElastic = async () => {
    dispatch(setIsLoading(true));
    try {
      const response = await kPI_NhomTieuChiService.syncToElastic({});
      if (response.status) {
        toast.success("Đồng bộ lên Elastic thành công");
      } else {
        toast.error(response.message || "Đồng bộ thất bại");
      }
    } catch (error) {
      toast.error("Lỗi khi đồng bộ Elastic");
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  const handleSyncRabbitMQ = async () => {
    dispatch(setIsLoading(true));
    try {
      const response = await kPI_NhomTieuChiService.syncToElasticRabbitMQ({});
      if (response.status) {
        toast.success("Đã đẩy yêu cầu đồng bộ ALL lên RabbitMQ thành công");
      } else {
        toast.error(response.message || "Gửi yêu cầu đồng bộ qua RabbitMQ thất bại");
      }
    } catch (error) {
      toast.error("Lỗi khi gửi yêu cầu đồng bộ qua RabbitMQ");
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  const handleSyncElasticSingle = async (id: string) => {
    if (!id) return;
    dispatch(setIsLoading(true));
    try {
      const response = await kPI_NhomTieuChiService.syncToElastic({ idBoTieuChiDonVi: id });
      if (response.status) {
        toast.success("Đồng bộ Elastic cho bộ tiêu chí thành công");
      } else {
        toast.error(response.message || "Đồng bộ thất bại");
      }
    } catch (error) {
      toast.error("Lỗi khi đồng bộ Elastic");
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  const onFinishSearch: FormProps<KPI_BoTieuChiDonViSearchType>["onFinish"] = async (
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
    async (searchDataOverride?: KPI_BoTieuChiDonViSearchType) => {
      dispatch(setIsLoading(true));

      const searchData = searchDataOverride || {
        pageIndex,
        pageSize,
        ...(searchValues || {}),
      };

      const response = await kPI_BoTieuChiDonViService.getData(searchData);

      console.log("Response:", response);

      if (response != null && response.data != null) {
        const data = response.data;
        setData(data);
        console.log("Data:", data);
      }
      dispatch(setIsLoading(false));
    },
    [dispatch, pageIndex, pageSize, searchValues]
  );

  const handleShowModal = (isEdit?: boolean, item?: KPI_BoTieuChiDonViType) => {
    setIsOpenModal(true);
    if (isEdit) {
      setCurentItem(item ?? null);
    } else {
      setCurentItem(null);
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
          {!isCucTruong && (
            <Button
              type="primary"
              style={{ backgroundColor: "#1890ff", borderColor: "#1890ff" }}
              icon={<UploadOutlined />}
              onClick={() => setIsOpenImportModal(true)}
            >
              Import Excel
            </Button>
          )}
          {!isCucTruong && (
            <Button
              type="primary"
              style={{ backgroundColor: "#217346", borderColor: "#217346" }}
              icon={<UploadOutlined />}
              onClick={() => setIsOpenImportModalV2(true)}
            >
              Import Excel v2
            </Button>
          )}
          {!isCucTruong && (
            <Button
              type="primary"
              style={{ backgroundColor: "#fa8c16", borderColor: "#fa8c16" }}
              icon={<SyncOutlined />}
              onClick={handleSyncElastic}
            >
              Đồng bộ Elastic ALL
            </Button>
          )}
          {!isCucTruong && (
            <Button
              type="primary"
              style={{ backgroundColor: "#722ed1", borderColor: "#722ed1" }}
              icon={<SyncOutlined />}
              onClick={handleSyncRabbitMQ}
            >
              Đồng bộ RabbitMQ ALL
            </Button>
          )}
          {isOpenModal && (
            <KPI_BoTieuChiDonViCreateOrUpdate
              onSuccess={hanleCreateEditSuccess}
              onClose={handleClose}
              item={currentItem}
            />
          )}
          <KPI_NhomTieuChiImportModal
            isOpen={isOpenImportModal}
            onClose={() => setIsOpenImportModal(false)}
            onSuccess={() => handleLoadData()}
          />
          <KPI_BoTieuChiDonViImportModalV2
            isOpen={isOpenImportModalV2}
            onClose={() => setIsOpenImportModalV2(false)}
            onSuccess={() => handleLoadData()}
          />
          <CauHinhDiemLanhDaoModal
            open={isOpenCauHinhDiemLanhDao}
            onClose={() => setIsOpenCauHinhDiemLanhDao(false)}
            boTieuChi={currentItem}
            onSuccess={() => handleLoadData()}
          />
        </Space>
      </Flex>
      {isPanelVisible && (
        <Search
          onFinish={onFinishSearch}
          pageIndex={pageIndex}
          pageSize={pageSize}
        />
      )}
      {isOpenDetail && (
        <KPI_BoTieuChiDonViDetail item={currentItem} onClose={handleCloseDetail} />
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
      <CloneModal
        item={cloneItem}
        open={!!cloneItem}
        onClose={() => setCloneItem(null)}
        onSuccess={() => {
          setCloneItem(null);
          handleLoadData();
        }}
      />
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
          size="small"
          align="end"
        />
      </Card>
    </>
  );
};

export default withAuthorization(KPI_BoTieuChiDonViPage, "");
