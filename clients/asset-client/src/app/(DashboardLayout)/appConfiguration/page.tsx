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
  TableColumnsType,
  Tag,
  Switch,
  Popconfirm,
  Image,
} from "antd";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { buildFileUrl } from "@/utils/file";
import { setAppConfig } from "@/store/general/GeneralSlice";
import AppConfigurationDetail from "./detail";
import Search from "./search";
import AutoBreadcrumb from "@/components/util-compenents/Breadcrumb";
import {
  AppConfigurationSearchType,
  AppConfigurationType,
} from "@/types/appConfiguration/appConfiguration";
import appConfigurationService from "@/services/appConfiguration/appConfigurationService";
import AppConfigurationCreateOrUpdate from "./createOrUpdate";


const AppConfigurationPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [data, setData] = useState<PagedList<AppConfigurationType>>();
  const [pageSize, setPageSize] = useState<number>(20);
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [isPanelVisible, setIsPanelVisible] = useState<boolean>(false);
  const [searchValues, setSearchValues] = useState<AppConfigurationSearchType | null>(
    null
  );
  const loading = useSelector((state) => state.general.isLoading);
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [currentItem, setCurentItem] = useState<AppConfigurationType | null>(null);
  const [isOpenDetail, setIsOpenDetail] = useState<boolean>(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const tableColumns: TableProps<AppConfigurationType>["columns"] = [
    {
      title: "STT",
      dataIndex: "index",
      key: "index",
      align: "center",
      width: 60,
      render: (_: any, __: any, index: number) => (pageIndex - 1) * pageSize + index + 1,
    },
    {
      title: "Tên ứng dụng",
      dataIndex: "tenApp",
      key: "tenApp",
      render: (_: any, record: AppConfigurationType) => (
        <span style={{ fontWeight: 600 }}>{record.tenApp || "-"}</span>
      ),
    },
    {
      title: "Tên doanh nghiệp / Đơn vị",
      dataIndex: "tenDoanhNghiep",
      key: "tenDoanhNghiep",
      render: (_: any, record: AppConfigurationType) => (
        <span>{record.tenDoanhNghiep || "-"}</span>
      ),
    },
    {
      title: "Địa chỉ",
      dataIndex: "diaChi",
      key: "diaChi",
      render: (_: any, record: AppConfigurationType) => (
        <span>{record.diaChi || "-"}</span>
      ),
    },
    {
      title: "Số điện thoại",
      dataIndex: "soDienThoai",
      key: "soDienThoai",
      render: (_: any, record: AppConfigurationType) => (
        <span>{record.soDienThoai || "-"}</span>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (_: any, record: AppConfigurationType) => (
        <span>{record.email || "-"}</span>
      ),
    },
    {
      title: "Logo",
      dataIndex: "logoLink",
      key: "logoLink",
      align: "center",
      render: (_: any, record: AppConfigurationType) => (
        record.logoLink ? (
          <Image
            src={buildFileUrl(record.logoLink)}
            alt="Logo"
            width={36}
            height={36}
            style={{ objectFit: "contain", borderRadius: 4 }}
            fallback="/img/no-image.png"
          />
        ) : (
          <span style={{ color: "#9ca3af" }}>-</span>
        )
      ),
    },
    // {
    //   title: "Ảnh nền đăng nhập",
    //   dataIndex: "loginBackgroundLink",
    //   key: "loginBackgroundLink",
    //   align: "center",
    //   render: (_: any, record: AppConfigurationType) => (
    //     record.loginBackgroundLink ? (
    //       <Image
    //         src={buildFileUrl(record.loginBackgroundLink)}
    //         alt="Background"
    //         width={50}
    //         height={32}
    //         style={{ objectFit: "cover", borderRadius: 4 }}
    //         fallback="/img/no-image.png"
    //       />
    //     ) : (
    //       <span style={{ color: "#9ca3af" }}>-</span>
    //     )
    //   ),
    // },
    // {
    //   title: "Ảnh modal đăng nhập",
    //   dataIndex: "loginModalImage",
    //   key: "loginModalImage",
    //   align: "center",
    //   render: (_: any, record: AppConfigurationType) => (
    //     record.loginModalImage ? (
    //       <Image
    //         src={buildFileUrl(record.loginModalImage)}
    //         alt="Modal Image"
    //         width={50}
    //         height={32}
    //         style={{ objectFit: "cover", borderRadius: 4 }}
    //         fallback="/img/no-image.png"
    //       />
    //     ) : (
    //       <span style={{ color: "#9ca3af" }}>-</span>
    //     )
    //   ),
    // },
    {
      title: "Màu chủ đạo",
      dataIndex: "primaryColor",
      key: "primaryColor",
      align: "center",
      width: 140,
      render: (_: any, record: AppConfigurationType) => {
        if (!record.primaryColor) {
          return <span style={{ color: "#9ca3af" }}>-</span>;
        }
        const raw = record.primaryColor.trim();
        const validColor = raw.startsWith("#") || raw.startsWith("rgb") || raw.startsWith("hsl")
          ? raw
          : /^[0-9A-Fa-f]{3,8}$/.test(raw)
            ? `#${raw}`
            : raw;

        return (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span
              style={{
                display: "inline-block",
                width: 18,
                height: 18,
                borderRadius: 4,
                backgroundColor: validColor,
                border: "1px solid rgba(0,0,0,0.18)",
                boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                verticalAlign: "middle",
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: 13, fontWeight: 600, color: "#374151", fontFamily: "monospace" }}>
              {validColor}
            </span>
          </div>
        );
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      align: "center",
      width: 130,
      render: (_: any, record: AppConfigurationType) => (
        <Popconfirm
          title="Xác nhận"
          description={
            record.isActive
              ? "Bạn có chắc muốn tắt kích hoạt cấu hình này?"
              : "Bạn có chắc muốn áp dụng cấu hình này cho toàn hệ thống?"
          }
          onConfirm={() => handleToggleActive(record.id ?? "")}
          okText="Đồng ý"
          cancelText="Hủy"
        >
          <Switch
            checked={!!record.isActive}
            checkedChildren="Áp dụng"
            unCheckedChildren="Tắt"
          />
        </Popconfirm>
      ),
    },
    {
      title: "Thao tác",
      dataIndex: "actions",
      fixed: "right",
      align: "center",
      width: 100,
      render: (_: any, record: AppConfigurationType) => {
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

  const handleToggleActive = async (id: string) => {
    try {
      const response = await appConfigurationService.toggleActive(id);
      if (response?.status) {
        toast.success(response.message || "Thay đổi trạng thái kích hoạt thành công");
        handleLoadData();
        const activeRes = await appConfigurationService.getActiveConfig();
        if (activeRes?.status && activeRes?.data) {
          dispatch(setAppConfig(activeRes.data));
        }
      } else {
        toast.error(response?.message || "Thay đổi trạng thái thất bại");
      }
    } catch (err: any) {
      toast.error(err?.message || "Đã xảy ra lỗi khi thay đổi trạng thái");
    }
  };

  const hanleCreateEditSuccess = () => {
    handleLoadData();
    setCurentItem(null);
  };

  const handleDelete = async () => {
    const response = await appConfigurationService.delete(confirmDeleteId ?? "");
    if (response.status) {
      toast.success("Xóa cấu hình thành công");
      handleLoadData();
    } else {
      toast.error(response.message || "Xóa cấu hình thất bại");
    }
    setConfirmDeleteId(null);
  };

  const toggleSearch = () => {
    setIsPanelVisible(!isPanelVisible);
  };

  const onFinishSearch: FormProps<AppConfigurationSearchType>["onFinish"] = async (
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
    async (searchDataOverride?: AppConfigurationSearchType) => {
      dispatch(setIsLoading(true));

      const searchData = searchDataOverride || {
        pageIndex,
        pageSize,
        ...(searchValues || {}),
      };
      const response = await appConfigurationService.getData(searchData);
      if (response != null && response.data != null) {
        const data = response.data;
        setData(data);
      }
      dispatch(setIsLoading(false));
    },
    [dispatch, pageIndex, pageSize, searchValues]
  );

  const handleShowModal = (isEdit?: boolean, item?: AppConfigurationType) => {
    if (isEdit) {
      setCurentItem(item ?? null);
    } else {
      setCurentItem(null);
    }
    setIsOpenModal(true);
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
            <AppConfigurationCreateOrUpdate
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
        <AppConfigurationDetail item={currentItem} onClose={handleCloseDetail} />
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
          <p>Bạn có chắc chắn muốn xóa cấu hình này?</p>
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

export default withAuthorization(AppConfigurationPage, "");
