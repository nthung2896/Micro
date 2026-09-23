"use client";
import Flex from "@/components/shared-components/Flex";
import { DropdownOption, ResponsePageInfo } from "@/types/general";
import withAuthorization from "@/libs/authentication";
import { setIsLoading } from "@/store/general/GeneralSlice";
import { useSelector } from "@/store/hooks";
import { AppDispatch } from "@/store/store";
import {
  CloseOutlined,
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  EyeOutlined,
  InsertRowRightOutlined,
  PlusCircleOutlined,
  SearchOutlined,
  ArrowRightOutlined,
  PrinterOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Drawer,
  Dropdown,
  Image,
  MenuProps,
  Pagination,
  Popconfirm,
  Space,
  Table,
  TableColumnsType,
  Typography,
  Tag,
  Switch,
  message,
} from "antd";
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import classes from "./page.module.css";
import CreateUpdateForm from "./CreateUpdateForm";
import Search from "./Search";

import Detail from "./detail";
import AutoBreadcrumb from "@/components/util-compenents/Breadcrumb";
import notificationService from "@/services/notification/notification.service";
import userService from "@/services/user/user.service";
import { NotificationSearchType as NotificationSearch } from "@/types/notification/request";
import { NotificationType as Notification } from "@/types/notification/dto";

const StaticFileUrl = process.env.NEXT_PUBLIC_STATIC_FILE_BASE_URL;

const Page: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [notificationList, setNotificationList] = useState<Notification[]>([]);
  const [pageSizeInfo, setPageSizeInfo] = useState("loading...");
  //xử lý chuyển trang
  const [dataPage, setDataPage] = useState<ResponsePageInfo>();
  const [pageSize, setPageSize] = useState<number>(20);
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [userList, setUserList] = useState<DropdownOption[]>([]);
  //xử lý hiện modal
  const [isPanelVisible, setIsPanelVisible] = useState<boolean>(false);
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [isOpenDetail, setIsOpenDetail] = useState<boolean>(false);
  const [isOpenSendEmail, setIsOpenSendEmail] = useState<boolean>(false);
  const [isOpenDanhSachGui, setIsOpenDanhSachGui] = useState<boolean>(false);
  //xử lý search
  const [searchValues, setSearchValues] = useState<NotificationSearch | null>(
    null,
  );
  const loading = useSelector((state) => state.general.isLoading);
  const [currentNotification, setCurrentNotification] = useState<
    Notification | undefined
  >();
  const [openPopconfirmId, setOpenPopconfirmId] = useState<string | null>(null);

  const tableColumns: TableColumnsType<Notification> = [
    {
      title: "STT",
      width: 70,
      align: "center",
      dataIndex: "index",
      key: "index",
      render: (_: any, __: Notification, index: number) =>
        pageSize * (pageIndex - 1) + index + 1,
    },
    {
      title: "Người gửi",
      dataIndex: "fromUser",
      width: 140,
      align: "center",
      render: (_: any, record: Notification) => {
        const status = userList.find((item) => item.value === record.fromUser);
        return <span>{status ? status.label : ""}</span>;
      },
    },
    {
      title: "Người nhận",
      dataIndex: "toUser",
      width: 140,
      align: "center",
      render: (_: any, record: Notification) => {
        const status = userList.find((item) => item.value === record.toUser);
        return <span>{status ? status.label : ""}</span>;
      },
    },
    {
      title: "Doanh nghiệp",
      dataIndex: "productName",
      width: 160,
      align: "center",
      render: (_: any, record: Notification) => (
        <span>{record.productName}</span>
      ),
    },
    {
      title: "Tiêu đề",
      dataIndex: "tieuDe",
      width: 220,
      align: "center",
      render: (_: any, record: Notification) => {
        return <span>{record.tieuDe}</span>;
      },
    },
    {
      title: "Người tạo",
      dataIndex: "createdBy",
      width: 140,
      align: "center",
      render: (_: any, record: Notification) => {
        return <span>{record.createdBy}</span>;
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdDate",
      width: 110,
      align: "center",
      render: (_: any, record: Notification) => (
        <span>
          {record.createdDate
            ? new Date(record.createdDate).toLocaleDateString("vi-VN")
            : ""}
        </span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "isXuatBan",
      width: 110,
      align: "center",
      render: (_: any, record: Notification) => (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          <Popconfirm
            key={`Lock${record.id}`}
            title="Xác nhận"
            description={
              <span>
                Bạn có chắc chắn muốn {record.isXuatBan ? "Khóa" : "Mở khóa"}?
              </span>
            }
            okText="Đồng ý"
            cancelText="Hủy"
            onConfirm={() => {
              handleToggleLock(record.id || "");
            }}
            trigger="click"
            forceRender
          >
            <Switch
              checkedChildren="Mở"
              unCheckedChildren="Khóa"
              checked={record.isXuatBan}
            />
          </Popconfirm>
        </div>
      ),
    },
    {
      title: "Thông báo",
      dataIndex: "message",
      width: 240,
      align: "center",
      render: (_: any, record: Notification) => <span>{record.message}</span>,
    },
    {
      title: "Thao tác",
      dataIndex: "actions",
      align: "center",
      width: 100,
      fixed: "right",
      render: (_: any, record: Notification) => {
        const items: MenuProps["items"] = [
          {
            label: "Chi tiết",
            key: "4",
            icon: <EyeOutlined />,
            onClick: () => {
              setCurrentNotification(record);
              setIsOpenDetail(true);
            },
          },
          {
            label: "Chỉnh sửa",
            key: "1",
            icon: <EditOutlined />,
            onClick: () => {
              handleShowModal(record);
            },
          },
          {
            label: "Gửi email thông báo",
            key: "3",
            icon: <PrinterOutlined />,
            onClick: () => {
              setCurrentNotification(record);
              setIsOpenSendEmail(true);
            },
          },
          {
            label: "Thống kê tin đã gửi",
            key: "5",
            icon: <InsertRowRightOutlined />,
            onClick: () => {
              setCurrentNotification(record);
              setIsOpenDanhSachGui(true);
            },
          },
          {
            label: "Xóa",
            key: "6",
            icon: <DeleteOutlined />,
            danger: true,
            onClick: () => setOpenPopconfirmId(record.id ?? ""),
          },
          // {
          //   label: (
          //     <Popconfirm
          //       key={`Delete${record.id}`}
          //       title="Xác nhận xóa"
          //       description={
          //         <span>
          //           Bạn có muốn xóa thông báo này không? <br /> Sau khi xóa sẽ
          //           không thể khôi phục.
          //         </span>
          //       }
          //       okText="Xóa"
          //       cancelText="Hủy"
          //       onConfirm={() => {
          //         handleDelete(record.id)
          //       }}
          //       trigger="click"
          //       forceRender
          //     >
          //       <span>Xóa</span>
          //     </Popconfirm>
          //   ),
          //   key: '2',
          //   icon: <DeleteOutlined />,
          //   danger: true,
          // },
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
              description={
                <span>
                  Bạn có muốn xóa danh mục này không? <br /> Sau khi xóa sẽ
                  không thể khôi phục.
                </span>
              }
              okText="Xóa"
              cancelText="Hủy"
              open={openPopconfirmId === record.id}
              onConfirm={() => {
                handleDelete(record.id || "");
                setOpenPopconfirmId(null);
              }}
              onCancel={() => setOpenPopconfirmId(null)}
            ></Popconfirm>
          </>
        );
      },
    },
  ];

  const handleCreateEditSuccess = () => {
    handleFetch();
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await notificationService.delete(id);
      if (response.status) {
        message.success("Xóa thành công");
        handleFetch();
      } else {
        message.error("Xóa thất bại");
      }
    } catch (error) {
      console.error("Lỗi khi lưu dữ liệu:", error);
      message.error("Có lỗi xảy ra");
    }
  };

  const handleToggleLock = async (id: string) => {
    try {
      const response = await notificationService.toggleLock(id);
      if (response.status) {
        message.success(response.message);
        handleFetch();
      } else {
        message.error(response.message);
      }
    } catch (error) {
      message.error("Thao tác thất bại");
    }
  };

  const toggleSearch = () => {
    setIsPanelVisible(!isPanelVisible);
  };

  const handleSearch = async (values: NotificationSearch) => {
    try {
      setSearchValues(values);
      await handleFetch(values);
    } catch (error) {
      console.error("Lỗi khi lưu dữ liệu:", error);
    }
  };

  const handleFetch = useCallback(
    async (searchData?: NotificationSearch) => {
      dispatch(setIsLoading(true));
      try {
        const param = searchData || {
          pageIndex,
          pageSize,
          ...searchValues,
        };
        console.log(param);
        const response = await notificationService.getDataDoanhNghiep(param);
        if (response != null && response.data != null) {
          const data = response.data;
          setNotificationList(data.items);
          setDataPage({
            pageIndex: data.pageIndex,
            pageSize: data.pageSize,
            totalCount: data.totalCount,
            totalPage: data.totalPage,
          });
        }
        dispatch(setIsLoading(false));
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
        dispatch(setIsLoading(false));
      }
    },
    [pageIndex, pageSize],
  );

  const handleShowModal = (
    notification: Notification | undefined = undefined,
  ) => {
    setCurrentNotification(notification);
    setIsOpenModal(true);
  };

  const handleClose = () => {
    setIsOpenModal(false);
  };

  const handleCloseDetail = () => {
    setIsOpenDetail(false);
  };

  const handleCloseSendEmail = () => {
    setIsOpenSendEmail(false);
  };

  const handleSendEmail = async (record: Notification) => {
    try {
      if (!record.email) {
        message.error("Không thể gửi email vì không có địa chỉ email.");
        return;
      }
      const content = `
            <div>
                <h2>Thông báo doanh nghiệp</h2>
                <p><strong>Người gửi:</strong> ${record.fromUserName}</p>
                <p><strong>Nội dung:</strong> ${record.message}</p>
            </div>
        `;
      const subject = "Thông báo doanh nghiệp";
      const toAddress = record.email;
      // const response = await notificationService.SendEmail(
      //   subject,
      //   content,
      //   toAddress,
      //   record.id
      // );
      // if (response.status) {
      //   message.success('Gửi email thành công');
      //   handleFetch();
      // } else {
      //   message.error('Gửi email thất bại');
      // }
    } catch (error) {
      message.error("Gửi email thất bại");
    }
  };

  useEffect(() => {
    handleFetch();
    userService
      .getDropdown()
      .then((res: any) => {
        setUserList(res.data);
      })
      .catch((err: any) => {
        console.error(err);
      });
  }, []);

  return (
    <>
      <Flex
        alignItems="center"
        justifyContent="space-between"
        className={classes.mgButton10}
        style={{ flexWrap: "wrap", gap: 8 }}
      >
        <AutoBreadcrumb />
      </Flex>

      {isPanelVisible && (
        <div style={{ marginBottom: 12 }}>
          <Search handleSearch={handleSearch} dropdownUser={userList} />
        </div>
      )}

      <Card bodyStyle={{ padding: 12 }} className={classes.customCardShadow}>
        {/* <Flex justifyContent="flex-end" style={{ marginBottom: 10 }}>
      <Typography.Text strong>{pageSizeInfo}</Typography.Text>
    </Flex> */}

        <div className="table-responsive">
          <Table<Notification>
            columns={tableColumns}
            bordered
            dataSource={notificationList}
            rowKey="id"
            scroll={{ x: 1430 }}
            pagination={false}
            loading={loading}
            tableLayout="fixed"
          />
        </div>

        <Flex justifyContent="flex-end" style={{ marginTop: 16 }}>
          <Pagination
            total={dataPage?.totalCount || 0}
            current={pageIndex}
            pageSize={pageSize}
            showSizeChanger
            showTotal={(total, range) =>
              `${range[0]}-${range[1]} trong ${total} thông báo`
            }
            onChange={(page, size) => {
              setPageIndex(page);
              if (size !== pageSize) setPageSize(size);
            }}
          />
        </Flex>
      </Card>

      <CreateUpdateForm
        isOpen={isOpenModal}
        onSuccess={handleCreateEditSuccess}
        onClose={handleClose}
        dropdownUser={userList}
        data={currentNotification}
      />

      <Detail
        isOpen={isOpenDetail}
        data={currentNotification!}
        dropdownUser={userList}
        onClose={handleCloseDetail}
      />
    </>
  );
};

export default withAuthorization(Page, "");
