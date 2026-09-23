"use client";
import { useCallback, useEffect, useState } from "react";
import Flex from "@/components/shared-components/Flex";
import { ResponsePageList } from "@/types/general";
import withAuthorization from "@/libs/authentication";
import { setIsLoading } from "@/store/general/GeneralSlice";
import { useSelector } from "@/store/hooks";
import { AppDispatch } from "@/store/store";
import * as extensions from "@/utils/extensions";
import { apiService } from "@/services";
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
  ConfigProvider,
} from "antd";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import KPI_CauHinhDiemTheoHeSoLanhDaoDetail from "./detail";
import Search from "./search";
import AutoBreadcrumb from "@/components/util-compenents/Breadcrumb";
import {
  KPI_CauHinhDiemTheoHeSoLanhDaoSearchType,
  KPI_CauHinhDiemTheoHeSoLanhDaoType,
} from "@/types/kPI_CauHinhDiemTheoHeSoLanhDao/kPI_CauHinhDiemTheoHeSoLanhDao";
import kPI_CauHinhDiemTheoHeSoLanhDaoService from "@/services/kPI_CauHinhDiemTheoHeSoLanhDao/kPI_CauHinhDiemTheoHeSoLanhDaoService";
import KPI_CauHinhDiemTheoHeSoLanhDaoCreateOrUpdate from "./createOrUpdate";
import kPI_BoTieuChiChungService from "@/services/kPI_BoTieuChiChung/kPI_BoTieuChiChungService";
import kPI_BoTieuChiDonViService from "@/services/kPI_BoTieuChiDonVi/kPI_BoTieuChiDonViService";


const KPI_CauHinhDiemTheoHeSoLanhDaoPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [data, setData] = useState<ResponsePageList<KPI_CauHinhDiemTheoHeSoLanhDaoType[]>>();
  const [pageSize, setPageSize] = useState<number>(20);
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [isPanelVisible, setIsPanelVisible] = useState<boolean>(false);
  const [searchValues, setSearchValues] = useState<KPI_CauHinhDiemTheoHeSoLanhDaoSearchType | null>(
    null
  );
  const loading = useSelector((state) => state.general.isLoading);
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [currentItem, setCurentItem] = useState<KPI_CauHinhDiemTheoHeSoLanhDaoType | null>(null);
  const [isOpenDetail, setIsOpenDetail] = useState<boolean>(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [chucVuOptions, setChucVuOptions] = useState<{ value: string; label: string }[]>([]);
  const [boTieuChiOptions, setBoTieuChiOptions] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    const fetchDropdown = async () => {
      try {
        const [resChucVu, resBoTieuChi, resBoTieuChiDonVi] = await Promise.all([
          apiService.get<any>("/DM_DuLieuDanhMuc/GetDropdownCode/CHUCVUVNU"),
          kPI_BoTieuChiChungService.getDropdown(),
          kPI_BoTieuChiDonViService.getDropdown()
        ]);
        if (resChucVu?.data) {
          setChucVuOptions(resChucVu.data);
        }
        let mergedBoTieuChi: {value: string, label: string}[] = [];
        if (resBoTieuChi?.data) {
          mergedBoTieuChi = [...mergedBoTieuChi, ...resBoTieuChi.data];
        }
        if (resBoTieuChiDonVi?.data) {
          mergedBoTieuChi = [...mergedBoTieuChi, ...resBoTieuChiDonVi.data];
        }
        setBoTieuChiOptions(mergedBoTieuChi);
      } catch (error) {
        console.error("Lỗi lấy danh mục:", error);
      }
    };
    fetchDropdown();
  }, []);

  const tableColumns: TableProps<KPI_CauHinhDiemTheoHeSoLanhDaoType>["columns"] = [
    {
      title: "STT",
      dataIndex: "index",
      key: "index",
      align: "center",
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: "Chức vụ",
      dataIndex: "chucVu",
      render: (_: any, record: KPI_CauHinhDiemTheoHeSoLanhDaoType) => {
        const label = chucVuOptions.find((x) => x.value === record.chucVu)?.label;
        return <span>{label || record.chucVu}</span>;
      },
    },
    {
      title: "Hệ số",
      dataIndex: "heSo",
      render: (_: any, record: KPI_CauHinhDiemTheoHeSoLanhDaoType) => (
        <span>{record.heSo}</span>
      ),
    },
    {
      title: "Bộ tiêu chí",
      dataIndex: "idBoTieuChi",
      render: (_: any, record: KPI_CauHinhDiemTheoHeSoLanhDaoType) => {
        // Ưu tiên dùng tenBoTieuChi từ backend Join, nếu không có thì fallback tìm trong dropdown
        const label = record.tenBoTieuChi || boTieuChiOptions.find((x) => x.value === record.idBoTieuChi)?.label;
        return <span>{label || record.idBoTieuChi || "-"}</span>;
      },
    },
    {
      title: "Thao tác",
      dataIndex: "actions",
      fixed: "right",
      align: "center",
      render: (_: any, record: KPI_CauHinhDiemTheoHeSoLanhDaoType) => {
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
    const response = await kPI_CauHinhDiemTheoHeSoLanhDaoService.delete(confirmDeleteId ?? "");
    if (response.status) {
      toast.success("Xóa thành công");
      handleLoadData();
    }
    setConfirmDeleteId(null);
  };

  const toggleSearch = () => {
    setIsPanelVisible(!isPanelVisible);
  };

  const onFinishSearch: FormProps<KPI_CauHinhDiemTheoHeSoLanhDaoSearchType>["onFinish"] = async (
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
    async (searchDataOverride?: KPI_CauHinhDiemTheoHeSoLanhDaoSearchType) => {
      dispatch(setIsLoading(true));

      const searchData = {
        pageIndex: searchDataOverride ? 1 : pageIndex,
        pageSize,
        ...(searchValues || {}),
        ...(searchDataOverride || {}),
      };
      const response = await kPI_CauHinhDiemTheoHeSoLanhDaoService.getData(searchData);
      if (response != null && response.data != null) {
        const data = response.data;
        setData(data);
      }
      dispatch(setIsLoading(false));
    },
    [dispatch, pageIndex, pageSize, searchValues]
  );

  const handleShowModal = (isEdit?: boolean, item?: KPI_CauHinhDiemTheoHeSoLanhDaoType) => {
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

  const styledColumns = tableColumns?.map((col) => ({
    ...col,
    onHeaderCell: () => ({
      style: {
        backgroundColor: "#0355a2",
        color: "#ffffff",
        fontWeight: 600,
      },
    }),
  }));

  return (
    <>
      <Flex
        alignItems="center"
        justifyContent="space-between"
        className="mb-2 page-header-wrap"
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
            <KPI_CauHinhDiemTheoHeSoLanhDaoCreateOrUpdate
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
          chucVuOptions={chucVuOptions}
          columns={tableColumns}
        />
      )}
      {isOpenDetail && (
        <KPI_CauHinhDiemTheoHeSoLanhDaoDetail item={currentItem} onClose={handleCloseDetail} />
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

export default withAuthorization(KPI_CauHinhDiemTheoHeSoLanhDaoPage, "");
