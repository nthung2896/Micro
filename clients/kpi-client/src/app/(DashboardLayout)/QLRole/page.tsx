"use client";
import Flex from "@/components/shared-components/Flex";
import AutoBreadcrumb from "@/components/util-compenents/Breadcrumb";
import withAuthorization from "@/libs/authentication";
import roleService from "@/services/role/role.service";
import { setIsLoading } from "@/store/general/GeneralSlice";
import { useSelector } from "@/store/hooks";
import { AppDispatch } from "@/store/store";
import { ResponsePageInfo } from "@/types/general";
import { RoleType } from "@/types/role/dto";
import { RoleSearchType } from "@/types/role/request";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  CloseOutlined,
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  EyeOutlined,
  PlusCircleOutlined,
  SearchOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Dropdown,
  FormProps,
  MenuProps,
  Pagination,
  Popconfirm,
  Space,
  Table,
  TableProps,
  message,
} from "antd";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import CreateOrUpdate from "./createOrUpdate";
import EditRoleApiPermission from "./editRoleApiPermission";
import EditRoleOperation from "./editRoleOperation";
import classes from "./page.module.css";
import Search from "./search";

const QLRole: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [listModule, setListModule] = useState<RoleType[]>([]);
  const [dataPage, setDataPage] = useState<ResponsePageInfo>();
  const [pageSize, setPageSize] = useState<number>(20);
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [isPanelVisible, setIsPanelVisible] = useState<boolean>(false);
  const [searchValues, setSearchValues] = useState<RoleSearchType | null>(null);
  const loading = useSelector((state) => state.general.isLoading);
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);

  const [currentRole, setCurrentRole] = useState<RoleType | null>();
  const [currentDetailRole, setCurrentDetailRole] = useState<RoleType>();
  const [isOpenDetail, setIsOpenDetail] = useState<boolean>(false);
  const [isEditRoleOperation, setIsEditRoleOperation] =
    useState<boolean>(false);
  const [openPopconfirmId, setOpenPopconfirmId] = useState<string | null>(null);

  const [itemRoleApiPermission, setItemRoleApiPermission] =
    useState<RoleType | null>(null);

  const tableColumns: TableProps<RoleType>["columns"] = [
    {
      title: "STT",
      width: 70,
      align: "center",
      dataIndex: "index",
      key: "index",
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: "Mã nhóm quyền",
      dataIndex: "code",
      render: (_: any, record: RoleType) => <span>{record.code}</span>,
    },
    {
      title: "Tên nhóm quyền",
      dataIndex: "code",
      render: (_: any, record: RoleType) => <span>{record.name}</span>,
    },
    {
      title: "Hiệu lực",
      dataIndex: "isActive",
      render: (_: any, record: RoleType) => (
        <span
          style={{
            fontSize: "25px",
            color: record.isActive ? "green" : "red",
          }}
        >
          {record.isActive ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
        </span>
      ),
    },
    {
      title: "",
      dataIndex: "actions",
      fixed: "right",
      width: 150,
      render: (_: any, record: RoleType) => {
        const items: MenuProps["items"] = [
          {
            label: `${
              record.isActive ? "Khóa nhóm quyền" : "Mở khóa nhóm quyền"
            }`,
            key: "1",
            icon: <SettingOutlined />,
            onClick: () => {
              handleSwitchActiveRole(record.id);
            },
          },
          {
            label: "Thiết lập",
            key: "2",
            icon: <EyeOutlined />,
            onClick: () => {
              setCurrentDetailRole(record);
              setIsEditRoleOperation(true);
            },
          },
          {
            label: "Thiết lập api",
            key: "3",
            icon: <EyeOutlined />,
            onClick: () => {
              setItemRoleApiPermission(record);
            },
          },
          {
            label: "Chỉnh sửa",
            key: "4",
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
            key: "5",
            danger: true,
            icon: <DeleteOutlined />,
            onClick: () => setOpenPopconfirmId(record.id ?? ""),
          },
        ];
        return (
          <>
            <Dropdown menu={{ items }} trigger={["click"]}>
              <Button
                onClick={(e) => e.preventDefault()}
                color="primary"
                icon={<DownOutlined />}
              >
                <Space>Thao tác</Space>
              </Button>
            </Dropdown>
            <Popconfirm
              title="Xác nhận xóa"
              description="Bạn có muốn xóa nhóm quyền này?"
              okText="Xóa"
              cancelText="Hủy"
              open={openPopconfirmId === record.id}
              onConfirm={() => {
                handleDeleteModule(record.id || "");
                setOpenPopconfirmId(null);
              }}
              onCancel={() => setOpenPopconfirmId(null)}
            ></Popconfirm>
          </>
        );
      },
    },
  ];

  const hanleCreateEditSuccess = () => {
    handleGetListModule();
  };

  const handleDeleteModule = async (id: string) => {
    try {
      const response = await roleService.delete(id);

      if (response.status) {
        message.success("Xóa nhóm quyền thành công");
        handleGetListModule();
      } else {
        message.error("Xóa nhóm quyền thất bại");
      }
    } catch (error) {
      message.error("Có lỗi xảy ra: " + error);
    }
  };

  const toggleSearch = () => {
    setIsPanelVisible(!isPanelVisible);
  };

  const onFinishSearch: FormProps<RoleSearchType>["onFinish"] = async (
    values,
  ) => {
    try {
      setSearchValues(values);
      await handleGetListModule(values);
    } catch (error) {
      console.error("Lỗi khi lưu dữ liệu:", error);
    }
  };

  const handleGetListModule = useCallback(
    async (searchDataOverride?: RoleSearchType) => {
      dispatch(setIsLoading(true));
      try {
        const searchData = searchDataOverride || {
          pageIndex,
          pageSize,
          ...(searchValues || {}),
        };
        const response = await roleService.getData(searchData);

        if (response != null && response.data != null) {
          const data = response.data;
          const items = data.items;
          setListModule(items);
          setDataPage({
            pageIndex: data.pageIndex,
            pageSize: data.pageSize,
            totalCount: data.totalCount,
            totalPage: data.totalPage,
          });
          dispatch(setIsLoading(false));
        }
      } catch (error) {
        dispatch(setIsLoading(false));
      }
    },
    [pageIndex, pageSize],
  );

  const handleShowModal = (isEdit?: boolean, module?: RoleType) => {
    setIsOpenModal(true);
    if (isEdit) {
      setCurrentRole(module);
    }
  };

  const handleClose = () => {
    setIsOpenModal(false);
    setCurrentRole(null);
  };

  const handleCloseDetail = () => {
    setIsOpenDetail(false);
  };

  const handleSwitchActiveRole = async (id: string) => {
    try {
      const response = await roleService.switchActiveRole(id);
      if (response.status) {
        message.success(
          `${
            response.data?.isActive
              ? "Mở khóa nhóm quyền thành công"
              : "Khóa nhóm quyền thành công"
          } `,
        );
        handleGetListModule();
      } else {
        message.error(response.message);
      }
    } catch (error) {
      message.error("Có lỗi xảy ra: " + error);
    }
  };

  useEffect(() => {
    handleGetListModule();
  }, [handleGetListModule]);

  return (
    <>
      <Flex
        alignItems="center"
        justifyContent="space-between"
        className="mb-2 flex-wrap justify-content-end"
      >
        <AutoBreadcrumb />
        <div>
          <Button
            onClick={() => toggleSearch()}
            type="primary"
            icon={isPanelVisible ? <CloseOutlined /> : <SearchOutlined />}
            className={classes.mgright5}
          >
            {isPanelVisible ? "Ẩn tìm kiếm" : "Tìm kiếm"}
          </Button>
          {/* <Link href="/QLModule/Import">
            <Button
              color="pink"
              variant="solid"
              icon={<VerticalAlignTopOutlined />}
              
              className={`${classes.mgright5} ${classes.colorKetXuat}`}
            >
              Import
            </Button>
          </Link> */}

          <Button
            onClick={() => {
              handleShowModal();
            }}
            type="primary"
            icon={<PlusCircleOutlined />}
          >
            Thêm mới
          </Button>
          <CreateOrUpdate
            isOpen={isOpenModal}
            onSuccess={hanleCreateEditSuccess}
            onClose={handleClose}
            role={currentRole}
          />
        </div>
      </Flex>
      {isPanelVisible && <Search onFinish={onFinishSearch} />}
      {/* <QLModuleDetail
        user={currentDetailModule}
        isOpen={isOpenDetail}
        onClose={handleCloseDetail}
      /> */}
      <EditRoleOperation
        roleId={currentDetailRole?.id ?? ""}
        isOpen={isEditRoleOperation}
        onClose={() => setIsEditRoleOperation(false)}
      />

      {itemRoleApiPermission && (
        <EditRoleApiPermission
          roleId={itemRoleApiPermission?.id ?? ""}
          onClose={() => setItemRoleApiPermission(null)}
        />
      )}
      <Card style={{ padding: "0px" }} className={classes.customCardShadow}>
        <div className="table-responsive">
          <Table
            columns={tableColumns}
            bordered
            dataSource={listModule}
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
        <div
          style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}
        >
          <Pagination
            total={dataPage?.totalCount}
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

export default withAuthorization(QLRole, "ROLE_MANAGEMENT");
