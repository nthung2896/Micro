"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { setIsLoading } from "@/store/general/GeneralSlice";
import { useSelector } from "@/store/hooks";
import withAuthorization from "@/libs/authentication";
import AutoBreadcrumb from "@/components/util-compenents/Breadcrumb";
import Flex from "@/components/shared-components/Flex";
import {
  Button,
  Card,
  Dropdown,
  MenuProps,
  Pagination,
  Popconfirm,
  Space,
  Table,
  TableProps,
  Tag,
  message,
  Modal,
  Select
} from "antd";
import {
  PlusCircleOutlined,
  SearchOutlined,
  DownOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  FilePdfOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  UndoOutlined
} from "@ant-design/icons";
import formatDate from "@/utils/formatDate";
import legalDocumentService from "@/services/legalDocument/legalDocument.service";
import { LegalDocumentDto, LegalDocumentSearch } from "@/types/legalDocument";
import { ResponsePageInfo } from "@/types/general";
import Search from "./search";
import classes from "./page.module.css";

const staticUrl = process.env.NEXT_PUBLIC_STATIC_FILE_BASE_URL || "";

const LegalDocumentPage: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [listData, setListData] = useState<LegalDocumentDto[]>([]);
  const [dataPage, setDataPage] = useState<ResponsePageInfo>();
  const [pageSize, setPageSize] = useState<number>(20);
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [isSearchVisible, setIsSearchVisible] = useState<boolean>(false);
  const [searchValues, setSearchValues] = useState<LegalDocumentSearch | null>(null);
  const [openPopconfirmId, setOpenPopconfirmId] = useState<string | null>(null);
  const loading = useSelector((state: any) => state.general.isLoading);

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<LegalDocumentDto[]>([]);
  const handleDirectUpdateStatus = async (id: string | undefined, status: string, code: string | null | undefined) => {
    if (!id) return;
    dispatch(setIsLoading(true));
    try {
      const res = await legalDocumentService.updateStatus(id, status);
      if (res.status) {
        message.success(`Đã cập nhật trạng thái văn bản [${code || "Không có số hiệu"}] thành công!`);
        handleGetData();
      } else {
        message.error(res.message || "Cập nhật trạng thái thất bại!");
      }
    } catch (err: any) {
      message.error(err?.message || "Lỗi khi cập nhật trạng thái!");
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  const handleBulkUpdateStatusDirect = async (status: string) => {
    if (selectedRows.length === 0) return;

    // Validate transitions: Draft -> Approved -> Removed -> Draft
    const invalidItems = selectedRows.filter(item => {
      const current = item.status || "Draft";
      if (current === "Draft") return status !== "Approved";
      if (current === "Approved") return status !== "Removed";
      if (current === "Removed") return status !== "Draft";
      return true;
    });

    if (invalidItems.length > 0) {
      const codes = invalidItems.map(item => item.code || "Không có số hiệu").join(", ");
      const statusLabel = status === "Approved" ? "Đã duyệt" : status === "Removed" ? "Gỡ bỏ" : "Bản nháp";
      message.error(`Không thể chuyển trạng thái các văn bản [${codes}] sang [${statusLabel}]. Quy trình hợp lệ: Bản nháp -> Đã duyệt -> Gỡ bỏ -> Bản nháp.`);
      return;
    }

    dispatch(setIsLoading(true));
    try {
      const ids = selectedRows.map(item => item.id ?? "");
      const res = await legalDocumentService.updateStatusMultiple(ids, status);
      if (res.status) {
        message.success("Cập nhật trạng thái hàng loạt thành công!");
        setSelectedRowKeys([]);
        setSelectedRows([]);
        handleGetData();
      } else {
        message.error(res.message || "Cập nhật trạng thái thất bại!");
      }
    } catch (err: any) {
      message.error(err?.message || "Lỗi khi cập nhật trạng thái!");
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  const handleGetData = useCallback(async () => {
    dispatch(setIsLoading(true));
    try {
      const searchParams: LegalDocumentSearch = {
        pageIndex,
        pageSize,
        ...searchValues,
      };
      const res = await legalDocumentService.getData(searchParams);
      if (res?.status && res.data) {
        setListData(res.data.items);
        setDataPage({
          pageIndex: res.data.pageIndex,
          pageSize: res.data.pageSize,
          totalCount: res.data.totalCount,
          totalPage: res.data.totalPage,
        });
      }
    } catch (err) {
      console.error("Lỗi khi tải danh sách văn bản pháp lý:", err);
      message.error("Không thể tải danh sách văn bản!");
    } finally {
      dispatch(setIsLoading(false));
    }
  }, [pageIndex, pageSize, searchValues, dispatch]);

  useEffect(() => {
    handleGetData();
  }, [handleGetData]);

  const handleSearch = (values: LegalDocumentSearch) => {
    setPageIndex(1);
    setSearchValues(values);
  };

  const handleDelete = async (id: string) => {
    dispatch(setIsLoading(true));
    try {
      const res = await legalDocumentService.delete(id);
      if (res.status) {
        message.success("Xóa văn bản thành công!");
        handleGetData();
      } else {
        message.error(res.message || "Xóa thất bại!");
      }
    } catch (err) {
      message.error("Lỗi khi xóa văn bản!");
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  const getStatusTag = (status: string | null | undefined) => {
    switch (status) {
      case "Approved":
        return <Tag color="green">Đã duyệt</Tag>;
      case "Removed":
        return <Tag color="red">Gỡ bỏ</Tag>;
      case "Draft":
      default:
        return <Tag color="default">Bản nháp</Tag>;
    }
  };

  const tableColumns: TableProps<LegalDocumentDto>["columns"] = [
    {
      title: "STT",
      width: 60,
      align: "center",
      render: (_: any, __: any, index: number) => index + 1 + (pageIndex - 1) * pageSize,
    },
    {
      title: "Số hiệu văn bản",
      dataIndex: "code",
      key: "code",
      width: 150,
      render: (text: string) => <span className="font-semibold">{text || "-"}</span>,
    },
    {
      title: "Loại văn bản",
      dataIndex: "loaiVanBan",
      key: "loaiVanBan",
      width: 150,
    },
    {
      title: "Mô tả / Trích yếu",
      dataIndex: "description",
      key: "description",
      width: 300,
    },
    {
      title: "Ngày ban hành",
      dataIndex: "publicDate",
      key: "publicDate",
      width: 120,
      align: "center",
      render: (val: string) => val ? formatDate(new Date(val), false) : "-",
    },
    {
      title: "Người ký",
      dataIndex: "signedBy",
      key: "signedBy",
      width: 120,
    },
    {
      title: "Loại hệ thống",
      dataIndex: "loaiHeThongName",
      key: "loaiHeThongName",
      width: 150,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      align: "center",
      render: (status: string) => getStatusTag(status),
    },
    {
      title: "Đính kèm",
      dataIndex: "document",
      key: "document",
      width: 120,
      align: "center",
      render: (document: string) => {
        if (!document) return "-";
        return (
          <a href={`${document}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-1 text-blue-600 hover:text-blue-800">
            <FilePdfOutlined style={{ fontSize: 16 }} />
            Tải về
          </a>
        );
      }
    },
    {
      title: "Thao tác",
      dataIndex: "actions",
      key: "actions",
      fixed: "right",
      align: "center",
      width: 120,
      render: (_: any, record: LegalDocumentDto) => {
        const items: MenuProps["items"] = [
          {
            label: "Chi tiết",
            key: "detail",
            icon: <EyeOutlined />,
            onClick: () => {
              router.push(`/LegalDocument/detail?id=${record.id}`);
            },
          },
          {
            label: "Chỉnh sửa",
            key: "edit",
            icon: <EditOutlined />,
            onClick: () => {
              router.push(`/LegalDocument/createOrUpdate?id=${record.id}`);
            },
          },
          ...((record.status || "Draft") === "Draft" ? [{
            label: "Duyệt văn bản",
            key: "approve",
            icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
            style: { color: "#52c41a" },
            onClick: () => handleDirectUpdateStatus(record.id, "Approved", record.code),
          }] : []),
          ...((record.status || "Draft") === "Approved" ? [{
            label: "Gỡ bỏ văn bản",
            key: "remove",
            icon: <CloseCircleOutlined style={{ color: "#ff4d4f" }} />,
            style: { color: "#ff4d4f" },
            onClick: () => handleDirectUpdateStatus(record.id, "Removed", record.code),
          }] : []),
          ...((record.status || "Draft") === "Removed" ? [{
            label: "Chuyển thành bản nháp",
            key: "draft",
            icon: <UndoOutlined style={{ color: "#1890ff" }} />,
            style: { color: "#1890ff" },
            onClick: () => handleDirectUpdateStatus(record.id, "Draft", record.code),
          }] : []),
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
              <Button>
                <Space>
                  Thao tác
                  <DownOutlined />
                </Space>
              </Button>
            </Dropdown>
            <Popconfirm
              title="Xác nhận xóa"
              description="Bạn có chắc chắn muốn xóa văn bản này?"
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
    <div style={{ padding: "0 8px" }}>
      <Flex
        alignItems="center"
        justifyContent="space-between"
        className="mb-3 flex-wrap justify-end"
      >
        <AutoBreadcrumb />
        <Space size="middle" style={{ marginLeft: "auto" }}>
          {selectedRowKeys.length > 0 && (
            <Dropdown
              menu={{
                items: [
                  {
                    label: "Duyệt hàng loạt",
                    key: "approve_bulk",
                    icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
                    style: { color: "#52c41a" },
                    onClick: () => handleBulkUpdateStatusDirect("Approved"),
                  },
                  {
                    label: "Gỡ bỏ hàng loạt",
                    key: "remove_bulk",
                    icon: <CloseCircleOutlined style={{ color: "#ff4d4f" }} />,
                    style: { color: "#ff4d4f" },
                    onClick: () => handleBulkUpdateStatusDirect("Removed"),
                  },
                  {
                    label: "Chuyển thành bản nháp hàng loạt",
                    key: "draft_bulk",
                    icon: <UndoOutlined style={{ color: "#1890ff" }} />,
                    style: { color: "#1890ff" },
                    onClick: () => handleBulkUpdateStatusDirect("Draft"),
                  },
                ],
              }}
              trigger={["click"]}
            >
              <Button type="default">
                Đổi trạng thái hàng loạt ({selectedRowKeys.length}) <DownOutlined />
              </Button>
            </Dropdown>
          )}
          <Button
            icon={<SearchOutlined />}
            onClick={() => setIsSearchVisible(!isSearchVisible)}
          >
            {isSearchVisible ? "Ẩn tìm kiếm" : "Tìm kiếm"}
          </Button>
          <Button
            color="green" variant="solid"
            icon={<PlusCircleOutlined />}
            onClick={() => router.push("/LegalDocument/createOrUpdate")}
          >
            Thêm mới
          </Button>
        </Space>
      </Flex>

      { isSearchVisible && <Search onFinish={handleSearch} /> }

      <Card className={classes.customCardShadow}>
        <div className="table-responsive">
          <Table<LegalDocumentDto>
            rowSelection={{
              selectedRowKeys,
              onChange: (keys, rows) => {
                setSelectedRowKeys(keys);
                setSelectedRows(rows);
              }
            }}
            columns={tableColumns}
            bordered
            dataSource={listData}
            rowKey="id"
            scroll={{ x: "max-content" }}
            pagination={false}
            loading={loading}
            onRow={(record) => {
              return {
                onClick: (event) => {
                  const target = event.target as HTMLElement;
                  if (
                    target.closest(".ant-table-selection-column") ||
                    target.closest(".ant-dropdown-trigger") ||
                    target.closest(".ant-popconfirm") ||
                    target.closest("button") ||
                    target.closest("a")
                  ) {
                    return;
                  }
                  router.push(`/LegalDocument/detail?id=${record.id}`);
                },
                style: { cursor: "pointer" }
              };
            }}
          />
        </div>
        <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
          <Pagination
            total={dataPage?.totalCount || 0}
            showTotal={(total, range) => `${range[0]}-${range[1]} trong ${total} văn bản`}
            pageSize={pageSize}
            current={pageIndex}
            onChange={(page) => setPageIndex(page)}
            onShowSizeChange={(current, size) => {
              setPageIndex(1);
              setPageSize(size);
            }}
            align="end"
          />
        </div>
      </Card>
    </div >
  );
};

export default withAuthorization(LegalDocumentPage, "");
