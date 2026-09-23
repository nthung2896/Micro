"use client";

import Flex from "@/components/shared-components/Flex";
import AutoBreadcrumb from "@/components/util-compenents/Breadcrumb";
import withAuthorization from "@/libs/authentication";
import notificationService from "@/services/notification/notification.service";
import { setIsLoading } from "@/store/general/GeneralSlice";
import { useSelector } from "@/store/hooks";
import { AppDispatch } from "@/store/store";
import { ResponsePageList } from "@/types/general";
import formatDate from "@/utils/formatDate";

import {
  CheckOutlined,
  CloseOutlined,
  DownOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  Badge,
  Button,
  Card,
  Dropdown,
  FormProps,
  MenuProps,
  Pagination,
  Space,
  Table,
  TableProps,
} from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import Search from "../Search";
import { NotificationSearchType } from "@/types/notification/request";
import { NotificationType } from "@/types/notification/dto";

const NotificationUserPage: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const [data, setData] = useState<ResponsePageList<NotificationType[]>>();
  const [pageSize, setPageSize] = useState<number>(20);
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [isPanelVisible, setIsPanelVisible] = useState<boolean>(false);
  const [searchValues, setSearchValues] =
    useState<NotificationSearchType | null>(null);

  const loading = useSelector((state) => state.general.isLoading);

  /* ================= MARK AS READ ================= */

  const markAsRead = async (id: string) => {
    try {
      const response = await notificationService.maskAsRead(id);
      if (response && response.status) {
        handleLoadData();
      }
    } catch (error) {}
  };

  const handleOpenNotificationLink = async (id: string, link: string) => {
    try {
      await markAsRead(id);
    } finally {
      router.push(link);
    }
  };

  /* ================= TABLE ================= */

  const tableColumns: TableProps<NotificationType>["columns"] = [
    {
      title: "STT",
      width: 70,
      align: "center",
      dataIndex: "index",
      key: "index",
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: "Tin nhắn",
      dataIndex: "message",
      key: "message",
      render: (_: any, record: NotificationType) => (
        <>
          {record.isRead ? (
            <Badge key={record.id} color="green" />
          ) : (
            <Badge key={record.id} color="red" />
          )}{" "}
          <Link
            href={record?.link ?? "#"}
            onClick={(e) => {
              e.preventDefault();
              handleOpenNotificationLink(record.id, record.link ?? "");
            }}
          >
            {record.message}
          </Link>
        </>
      ),
    },
    {
      title: "Thời gian gửi",
      dataIndex: "createdDate",
      key: "createdDate",
      width: 180,
      render: (value: any) => formatDate(value),
    },
    {
      title: "Thao tác",
      dataIndex: "actions",
      fixed: "right",
      align: "center",
      width: 50,
      render: (_: any, record: NotificationType) => {
        const items: MenuProps["items"] = [
          {
            label: "Đánh dấu là đã đọc",
            key: "1",
            icon: <CheckOutlined />,
            onClick: () => markAsRead(record.id),
          },
        ];
        return (
          <Dropdown menu={{ items }} trigger={["click"]}>
            <Button onClick={(e) => e.preventDefault()} color="primary">
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

  /* ================= SEARCH ================= */

  const toggleSearch = () => {
    setIsPanelVisible(!isPanelVisible);
  };

  const onFinishSearch: FormProps<NotificationSearchType>["onFinish"] = async (
    values,
  ) => {
    setSearchValues(values);
    await handleLoadData(values);
  };

  /* ================= LOAD DATA ================= */

  const handleLoadData = useCallback(
    async (searchDataOverride?: NotificationSearchType) => {
      dispatch(setIsLoading(true));

      const searchData = searchDataOverride || {
        pageIndex,
        pageSize,
        ...(searchValues || {}),
      };

      const response = await notificationService.getNotification(searchData);

      if (response?.data) {
        setData(response.data);
      }

      dispatch(setIsLoading(false));
    },
    [dispatch, pageIndex, pageSize, searchValues],
  );

  useEffect(() => {
    handleLoadData();
  }, [pageIndex, pageSize, searchValues]);

  /* ================= RENDER ================= */

  return (
    <>
      <Flex
        alignItems="center"
        justifyContent="space-between"
        className="mb-2 flex-wrap justify-content-end"
      >
        <AutoBreadcrumb />
        <div className="btn-group">
          <Button
            onClick={toggleSearch}
            color="cyan" variant="solid"
            icon={isPanelVisible ? <CloseOutlined /> : <SearchOutlined />}
          >
            {isPanelVisible ? "Ẩn tìm kiếm" : "Tìm kiếm"}
          </Button>
        </div>
      </Flex>

      {isPanelVisible && <Search handleSearch={onFinishSearch} />}

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
            onChange={(e) => setPageIndex(e)}
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

export default withAuthorization(NotificationUserPage, "");
