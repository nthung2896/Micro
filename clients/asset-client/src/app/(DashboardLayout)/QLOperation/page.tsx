"use client";
import Flex from "@/components/shared-components/Flex";
import withAuthorization from "@/libs/authentication";
import { setIsLoading } from "@/store/general/GeneralSlice";
import { useSelector } from "@/store/hooks";
import { AppDispatch } from "@/store/store";
import { DropdownOption, ResponsePageInfo } from "@/types/general";
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
import QLOperationDetail from "./detail";
import classes from "./page.module.css";
import Search from "./search";

import AutoBreadcrumb from "@/components/util-compenents/Breadcrumb";
import operationService from "@/services/operation/operation.service";
import { OperationType } from "@/types/operation/dto";
import { OperationSearchType } from "@/types/operation/request";

const QLOperation: React.FC = () => {
  const router = useRouter();
  const moduleId = sessionStorage.getItem("moduleId");

  const dispatch = useDispatch<AppDispatch>();
  const [listOperation, setListOperation] = useState<OperationType[]>([]);
  const [dataPage, setDataPage] = useState<ResponsePageInfo>();
  const [pageSize, setPageSize] = useState<number>(20);
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [isPanelVisible, setIsPanelVisible] = useState<boolean>(false);
  const [searchValues, setSearchValues] = useState<OperationSearchType | null>(
    null,
  );
  const loading = useSelector((state) => state.general.isLoading);
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [currentOperation, setCurrentOperation] =
    useState<OperationType | null>();
  const [currentDetailOperation, setCurrentDetailOperation] =
    useState<OperationType>();
  const [isOpenDetail, setIsOpenDetail] = useState<boolean>(false);
  const [dropModules, setDropModules] = useState<DropdownOption[]>([]);
  const [openPopconfirmId, setOpenPopconfirmId] = useState<string | null>(null);

  const tableColumns: TableProps<OperationType>["columns"] = [
    {
      title: "STT",
      width: 70,
      align: "center",
      dataIndex: "index",
      key: "index",
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: "Mã thao tác",
      dataIndex: "name",
      render: (_: any, record: OperationType) => <span>{record.code}</span>,
    },
    {
      title: "Tên thao tác",
      dataIndex: "code",
      render: (_: any, record: OperationType) => <span>{record.name}</span>,
    },
    {
      title: "Thứ tự",
      dataIndex: "order",
      width: "100px",
      render: (_: any, record: OperationType) => <span>{record.order}</span>,
    },
    {
      title: "Link",
      dataIndex: "url",
      render: (_: any, record: OperationType) => <span>{record.url}</span>,
    },
    {
      title: "Trạng thái",
      dataIndex: "isShow",
      render: (_: any, record: OperationType) => (
        // <span style={{ color: record.isShow ? "green" : "red" }}>
        //   {record.isShow ? "Hiển thị" : "Không hiển thị"}
        // </span>
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
      title: "",
      dataIndex: "actions",
      fixed: "right",
      render: (_: any, record: OperationType) => {
        const items: MenuProps["items"] = [
          {
            label: "Chi tiết",
            key: "1",
            icon: <EyeOutlined />,
            onClick: () => {
              setCurrentDetailOperation(record);
              setIsOpenDetail(true);
            },
          },
          {
            label: "Chỉnh sửa",
            key: "2",
            icon: <EditOutlined />,
            onClick: () => {
              handleShowModal(true, record);
            },
          },

          {
            label: "Xóa",
            key: "4",
            danger: true,
            icon: <DeleteOutlined />,
            onClick: () => setOpenPopconfirmId(record.id ?? ""),
          },
          {
            type: "divider",
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
            <Popconfirm
              title="Xác nhận xóa"
              description={<span>Bạn có muốn xóa thao tác này</span>}
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
      const response = await operationService.delete(id);
      if (response.status) {
        message.success("Xóa thao tác thành công");
        handleGetListModule();
      } else {
        message.error("Xóa thao tác thất bại");
      }
    } catch (error) {
      message.error("Xóa thao tác thất bại");
    }
  };

  const toggleSearch = () => {
    setIsPanelVisible(!isPanelVisible);
  };

  const onFinishSearch: FormProps<OperationSearchType>["onFinish"] = async (
    values,
  ) => {
    try {
      const payload: OperationSearchType = {
        pageIndex,
        pageSize,
        ...values,
        ...(moduleId ? { moduleId } : {}),
      };
      setSearchValues(payload);
      await handleGetListModule(payload);
    } catch (error) {
      console.error("Lỗi khi lưu dữ liệu:", error);
    }
  };

  const handleGetListModule = useCallback(
    async (searchDataOverride?: OperationSearchType) => {
      dispatch(setIsLoading(true));
      try {
        const searchData: OperationSearchType = {
          pageIndex,
          pageSize,
          ...(searchValues || {}),
          ...(searchDataOverride || {}),
        };
        if (moduleId) {
          searchData.moduleId = moduleId;
        }
        const response = await operationService.getData(searchData);

        if (response != null && response.data != null) {
          const data = response.data;
          const items = data.items;
          setListOperation(items);
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
    [pageIndex, pageSize, moduleId, searchValues, dispatch],
  );

  const handleShowModal = (isEdit?: boolean, module?: OperationType) => {
    setIsOpenModal(true);
    if (isEdit) {
      setCurrentOperation(module);
    }
  };

  const handleClose = () => {
    setIsOpenModal(false);
    setCurrentOperation(null);
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
            operation={currentOperation}
            moduleId={moduleId ?? ""}
            dropModules={dropModules}
            setDropModules={setDropModules}
          />
        </div>
      </Flex>
      {isPanelVisible && <Search onFinish={onFinishSearch} />}
      <QLOperationDetail
        operation={currentDetailOperation}
        isOpen={isOpenDetail}
        onClose={() => setIsOpenDetail(false)}
      />
      <Card style={{ padding: "0px" }} className={classes.customCardShadow}>
        <div className="table-responsive">
          <Table  
            columns={tableColumns}
            bordered
            dataSource={listOperation}
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
            current={pageIndex}
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

export default withAuthorization(QLOperation, "");
