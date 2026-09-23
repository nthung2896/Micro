"use client";
import Flex from "@/components/shared-components/Flex";
import AutoBreadcrumb from "@/components/util-compenents/Breadcrumb";
import withAuthorization from "@/libs/authentication";
import moduleService from "@/services/module/module.service";
import { setIsLoading } from "@/store/general/GeneralSlice";
import { useSelector } from "@/store/hooks";
import { AppDispatch } from "@/store/store";
import { DropdownOption, ResponsePageInfo } from "@/types/general";
import { ModuleType } from "@/types/module/dto";
import { ModuleSearchType } from "@/types/module/request";
import { buildFileUrl, buildMinioFileUrl } from "@/utils/file";
import {
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
  Image,
  MenuProps,
  Pagination,
  Popconfirm,
  Space,
  Table,
  TableProps,
  Tag,
  message,
} from "antd";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import CreateOrUpdate from "./createOrUpdate";
import QLModuleDetail from "./detail";
import classes from "./page.module.css";
import Search from "./search";

const QLModule: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [listModule, setListModule] = useState<ModuleType[]>([]);
  const [dataPage, setDataPage] = useState<ResponsePageInfo>();
  const [pageSize, setPageSize] = useState<number>(20);
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [isPanelVisible, setIsPanelVisible] = useState<boolean>(false);
  const [searchValues, setSearchValues] = useState<ModuleSearchType | null>(
    null,
  );
  const [dropVaiTros, setDropVaiTros] = useState<DropdownOption[]>([]);
  const loading = useSelector((state) => state.general.isLoading);
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);

  const [currentModule, setCurrentModule] = useState<ModuleType | null>();
  const [currentDetailModule, setCurrentDetailModule] = useState<ModuleType>();
  const [isOpenDetail, setIsOpenDetail] = useState<boolean>(false);
  const [openPopconfirmId, setOpenPopconfirmId] = useState<string | null>(null);

  const tableColumns: TableProps<ModuleType>["columns"] = [
    {
      title: "STT",
      width: 70,
      align: "center",
      dataIndex: "index",
      key: "index",
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: "Mã chức năng",
      dataIndex: "code",
      render: (_: any, record: ModuleType) => <span>{record.code}</span>,
    },
    {
      title: "Tên chức năng",
      dataIndex: "name",

      render: (_: any, record: ModuleType) => <span>{record.name}</span>,
    },
    {
      title: "Thứ tự",
      dataIndex: "order",
      width: "100px",
      render: (_: any, record: ModuleType) => <span>{record.order}</span>,
    },
    {
      title: "Trạng thái",
      dataIndex: "isShow",
      render: (_: any, record: ModuleType) => (
        <Tag
          bordered={false}
          color={record.isShow ? "green" : "red"}
          style={{ fontSize: "12px" }}
        >
          {record.isShow ? "Hiển thị" : "Không hiển thị"}
        </Tag>
      ),
    },
    {
      title: "Phạm vi",
      dataIndex: "allowFilterScope",
      render: (_: any, record: ModuleType) => (
        // <span style={{ color: record.allowFilterScope ? "" : "red" }}>
        //   {record.allowFilterScope ?? "Không"}
        // </span>
        <Tag
          bordered={false}
          color={record.allowFilterScope ? "green" : "red"}
          style={{ fontSize: "12px" }}
        >
          {record.allowFilterScope ?? "Không"}
        </Tag>
      ),
    },
    {
      title: "Icon",
      dataIndex: "icon",
      render: (_: any, record: ModuleType) => {
        if (record.icon && (record.icon.startsWith("<") || !record.icon.includes("."))) {
          return <span>{record.icon}</span>;
        }
        return (
          <div>
            <Image
              style={{ width: "50px" }}
              className="img-fluid"
              src={record.icon ? buildMinioFileUrl(record.icon) : "/logo.png"}
              alt=""
              preview={false}
            />
          </div>
        );
      },
    },
    {
      title: "Class Css",
      dataIndex: "classCss",
      render: (_: any, record: ModuleType) => <span>{record.classCss}</span>,
    },
    {
      title: "Style Css",
      dataIndex: "styleCss",
      render: (_: any, record: ModuleType) => <span>{record.styleCss}</span>,
    },
    {
      title: "",
      dataIndex: "actions",
      fixed: "right",
      width: 150,
      render: (_: any, record: ModuleType) => {
        const items: MenuProps["items"] = [
          {
            label: "Quản lý chức năng",
            key: "1",
            icon: <SettingOutlined />,
            onClick: () => {
              sessionStorage.setItem("moduleId", record.id ?? "");
              router.push(`/QLOperation/`);
            },
          },
          {
            label: "Chi tiết",
            key: "2",
            icon: <EyeOutlined />,
            onClick: () => {
              setCurrentDetailModule(record);
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
              description="Bạn có muốn xóa chức năng này?"
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
      const response = await moduleService.delete(id);
      if (response.status) {
        message.success("Xóa chức năng thành công");
        handleGetListModule();
      } else {
        message.error("Xóa chức năng thất bại");
      }
    } catch (error) {
      message.error("Xóa chức năng thất bại");
    }
  };

  const toggleSearch = () => {
    setIsPanelVisible(!isPanelVisible);
  };

  const onFinishSearch: FormProps<ModuleSearchType>["onFinish"] = async (
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
    async (searchDataOverride?: ModuleSearchType) => {
      dispatch(setIsLoading(true));
      try {
        const searchData = searchDataOverride || {
          pageIndex,
          pageSize,
          ...(searchValues || {}),
        };
        const response = await moduleService.getData(searchData);
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

  const handleShowModal = (isEdit?: boolean, module?: ModuleType) => {
    setIsOpenModal(true);
    if (isEdit) {
      setCurrentModule(module);
    }
  };

  const handleClose = () => {
    setIsOpenModal(false);
    setCurrentModule(null);
  };

  const handleCloseDetail = () => {
    setIsOpenDetail(false);
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
            module={currentModule}
          />
        </div>
      </Flex>
      {isPanelVisible && <Search onFinish={onFinishSearch} />}
      <QLModuleDetail
        module={currentDetailModule}
        isOpen={isOpenDetail}
        onClose={handleCloseDetail}
      />
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

export default withAuthorization(QLModule, "QLModule");
