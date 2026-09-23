"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button, Card, Dropdown, MenuProps, Pagination, Popconfirm, Space, Table, TableProps, message } from "antd";
import {
  CloseOutlined,
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  PlusCircleOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import Flex from "@/components/shared-components/Flex";
import AutoBreadcrumb from "@/components/util-compenents/Breadcrumb";
import { setIsLoading } from "@/store/general/GeneralSlice";
import { AppDispatch } from "@/store/store";
import { MauTraLoiType } from "@/types/mauTraLoi/dto";
import { MauTraLoiSearchType } from "@/types/mauTraLoi/request";
import mauTraLoiService from "@/services/mauTraLoi/mauTraLoi.service";
import formatDate from "@/utils/formatDate";
import CreateOrUpdate from "./createOrUpdate";
import Search from "./search";
import withAuthorization from "@/libs/authentication";

const MauTraLoiList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [listData, setListData] = useState<MauTraLoiType[]>([]);
  const [openPopconfirmId, setOpenPopconfirmId] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(20);
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [isSearchVisible, setIsSearchVisible] = useState<boolean>(false);
  const [searchValues, setSearchValues] = useState<MauTraLoiSearchType | null>(null);

  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [currentData, setCurrentData] = useState<MauTraLoiType | null>(null);

  const handleGetData = useCallback(async () => {
    dispatch(setIsLoading(true));
    try {
      const searchData: MauTraLoiSearchType = {
        pageIndex,
        pageSize,
        ...(searchValues || {}),
      };
      const response = await mauTraLoiService.getData(searchData);
      if (response?.status && response.data) {
        setListData(response.data.items || []);
        setTotalCount(response.data.totalCount || 0);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách mẫu trả lời:", error);
    } finally {
      dispatch(setIsLoading(false));
    }
  }, [pageIndex, pageSize, searchValues, dispatch]);

  const handleDelete = async (id: string) => {
    try {
      const response = await mauTraLoiService.delete(id);
      if (response.status) {
        message.success("Xóa mẫu trả lời sẵn thành công!");
        handleGetData();
      } else {
        message.error("Xóa thất bại: " + response.message);
      }
    } catch (error) {
      message.error("Lỗi khi xóa mẫu trả lời sẵn");
    }
  };

  const handleShowModal = (record?: MauTraLoiType) => {
    setCurrentData(record || null);
    setIsOpenModal(true);
  };

  const handleCloseModal = () => {
    setIsOpenModal(false);
    setCurrentData(null);
  };

  const handleSearchFinish = (values: MauTraLoiSearchType) => {
    setSearchValues(values);
    setPageIndex(1);
  };

  useEffect(() => {
    handleGetData();
  }, [handleGetData]);

  const columns: TableProps<MauTraLoiType>["columns"] = [
    {
      title: "STT",
      width: 65,
      align: "center",
      dataIndex: "index",
      key: "index",
      render: (_: any, __: any, index: number) => index + 1 + (pageIndex - 1) * pageSize,
    },
    {
      title: "Mẫu trả lời sẵn (Tiêu đề)",
      dataIndex: "name",
      key: "name",
      render: (text: string) => <span style={{ fontWeight: 600, color: "#1e3a8a" }}>{text}</span>,
    },
    {
      title: "Loại hồ sơ",
      dataIndex: "typeName",
      key: "typeName",
      width: 250,
      render: (text: string, record: MauTraLoiType) => (
        <span style={{ fontWeight: 500 }}>{text || record.type}</span>
      ),
    },
    {
      title: "Nhóm tài liệu",
      dataIndex: "nhomTaiLieuName",
      key: "nhomTaiLieuName",
      width: 250,
      render: (text: string, record: MauTraLoiType) => (
        <span style={{ fontWeight: 500, color: "#475569" }}>{text || record.nhomTaiLieu}</span>
      ),
    },
    {
      title: "Thông tin tạo",
      key: "creatorInfo",
      width: 200,
      render: (_: any, record: MauTraLoiType) => (
        <div style={{ fontSize: 13, color: "#64748b" }}>
          <div>👤 {record.createdBy || "Hệ thống"}</div>
          <div>📅 {record.createdDate ? formatDate(new Date(record.createdDate), false) : ""}</div>
        </div>
      ),
    },
    {
      title: "Thao tác",
      dataIndex: "actions",
      key: "actions",
      fixed: "right",
      align: "center",
      width: 140,
      render: (_: any, record: MauTraLoiType) => {
        const items: MenuProps["items"] = [
          {
            label: "Chỉnh sửa",
            key: "edit",
            icon: <EditOutlined />,
            onClick: () => handleShowModal(record),
          },
          {
            type: "divider",
          },
          {
            label: "Xóa",
            key: "delete",
            danger: true,
            icon: <DeleteOutlined />,
            onClick: () => setOpenPopconfirmId(record.id ?? ""),
          },
        ];

        return (
          <>
            <Dropdown menu={{ items }} trigger={["click"]}>
              <Button type="default"  style={{ borderRadius: 6 }}>
                <Space>
                  Thao tác
                  <DownOutlined style={{ fontSize: 10 }} />
                </Space>
              </Button>
            </Dropdown>
            <Popconfirm
              title="Xác nhận xóa"
              description="Bạn có chắc muốn xóa mẫu trả lời sẵn này?"
              okText="Xóa"
              cancelText="Hủy"
              open={openPopconfirmId === record.id}
              onConfirm={() => {
                handleDelete(record.id || "");
                setOpenPopconfirmId(null);
              }}
              onCancel={() => setOpenPopconfirmId(null)}
            />
          </>
        );
      },
    },
  ];

  return (
    <div style={{ padding: "8px" }}>
      <Flex alignItems="center" justifyContent="space-between" className="mb-4 flex-wrap justify-end">
        <AutoBreadcrumb />
        <Space size="middle" style={{ marginLeft: "auto" }}>
          <Button
            onClick={() => setIsSearchVisible(!isSearchVisible)}
            type="default"
            icon={isSearchVisible ? <CloseOutlined /> : <SearchOutlined />}
            style={{ borderRadius: 6 }}
          >
            {isSearchVisible ? "Ẩn tìm kiếm" : "Tìm kiếm"}
          </Button>

          <Button
            onClick={() => handleShowModal()}
            type="primary"
            icon={<PlusCircleOutlined />}
            style={{ borderRadius: 6, fontWeight: 500 }}
          >
            Thêm mới mẫu
          </Button>
        </Space>
      </Flex>

      {isSearchVisible && <Search onFinish={handleSearchFinish} />}

      <Card style={{ borderRadius: 12, boxShadow: "0 4px 20px -2px rgba(0, 0, 0, 0.05)" }} bodyStyle={{ padding: "0px" }}>
        <div className="table-responsive">
          <Table
            columns={columns}
            dataSource={listData}
            rowKey="id"
            pagination={false}
            bordered
            className="custom-table"
            style={{ borderRadius: 12, overflow: "hidden" }}
          />
        </div>
        <div style={{ padding: "16px", display: "flex", justifyContent: "end" }}>
          <Pagination
            current={pageIndex}
            pageSize={pageSize}
            total={totalCount}
            showSizeChanger
            pageSizeOptions={["10", "20", "50", "100"]}
            onChange={(page, size) => {
              setPageIndex(page);
              setPageSize(size);
            }}
            showTotal={(total, range) => `Hiển thị ${range[0]}-${range[1]} trong tổng số ${total} bản ghi`}
          />
        </div>
      </Card>

      <CreateOrUpdate
        isOpen={isOpenModal}
        data={currentData}
        onClose={handleCloseModal}
        onSuccess={handleGetData}
      />
    </div>
  );
};

// Phân quyền cho chuyên viên/cán bộ hệ thống (Staff)
export default withAuthorization(MauTraLoiList, "QLMAUTRALOI");
