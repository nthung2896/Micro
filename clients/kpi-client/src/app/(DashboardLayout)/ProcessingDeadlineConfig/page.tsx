"use client";

import React, { useState, useEffect, useCallback } from "react";
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
} from "antd";
import {
  PlusCircleOutlined,
  SearchOutlined,
  DownOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import processingDeadlineConfigService from "@/services/processingDeadlineConfig/processingDeadlineConfig.service";
import PlatformManageTypeConstant from "@/constants/PlatformManageTypeConstant";
import PlatformStatusConstant from "@/constants/PlatformStatusConstant";
import {
  ProcessingDeadlineConfigDto,
  ProcessingDeadlineConfigSearch,
} from "@/types/processingDeadlineConfig";
import { ResponsePageInfo } from "@/types/general";
import Search from "./search";
import CreateOrUpdateModal from "./createOrUpdate";
import DetailModal from "./detail";

const ProcessingDeadlineConfigPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [listData, setListData] = useState<ProcessingDeadlineConfigDto[]>([]);
  const [dataPage, setDataPage] = useState<ResponsePageInfo>();
  const [pageSize, setPageSize] = useState<number>(20);
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [isSearchVisible, setIsSearchVisible] = useState<boolean>(false);
  const [searchValues, setSearchValues] = useState<ProcessingDeadlineConfigSearch | null>(null);
  const [openPopconfirmId, setOpenPopconfirmId] = useState<string | null>(null);

  // Modals state
  const [isCreateOrUpdateOpen, setIsCreateOrUpdateOpen] = useState<boolean>(false);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const loading = useSelector((state: any) => state.general.isLoading);

  const handleGetData = useCallback(async () => {
    dispatch(setIsLoading(true));
    try {
      const searchParams: ProcessingDeadlineConfigSearch = {
        pageIndex,
        pageSize,
        ...searchValues,
      };
      const res = await processingDeadlineConfigService.getData(searchParams);
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
      console.error("Lỗi khi tải danh sách cấu hình hạn xử lý:", err);
      message.error("Không thể tải danh sách cấu hình!");
    } finally {
      dispatch(setIsLoading(false));
    }
  }, [pageIndex, pageSize, searchValues, dispatch]);

  useEffect(() => {
    handleGetData();
  }, [handleGetData]);

  const handleSearch = (values: ProcessingDeadlineConfigSearch) => {
    setPageIndex(1);
    setSearchValues(values);
  };

  const handleDelete = async (id: string) => {
    dispatch(setIsLoading(true));
    try {
      const res = await processingDeadlineConfigService.delete(id);
      if (res.status) {
        message.success("Xóa cấu hình thành công!");
        handleGetData();
      } else {
        message.error(res.message || "Xóa thất bại!");
      }
    } catch (err) {
      message.error("Lỗi khi xóa cấu hình!");
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  const tableColumns: TableProps<ProcessingDeadlineConfigDto>["columns"] = [
    {
      title: "STT",
      dataIndex: "stt",
      key: "stt",
      width: 60,
      align: "center",
      render: (stt: number | null | undefined, _, index: number) => {
        return stt !== null && stt !== undefined ? (
          <span className="font-semibold">{stt}</span>
        ) : (
          index + 1 + (pageIndex - 1) * pageSize
        );
      },
    },
    {
      title: "Tên cấu hình",
      dataIndex: "name",
      key: "name",
      width: 200,
      render: (text: string) => <span className="font-semibold">{text || "-"}</span>,
    },
    {
      title: "Mã module",
      dataIndex: "code",
      key: "code",
      width: 120,
      render: (text: string) => <code>{text || "-"}</code>,
    },
    {
      title: "Loại hình",
      dataIndex: "type",
      key: "type",
      width: 150,
      render: (text: string, record: ProcessingDeadlineConfigDto) => {
        if (!text) return "-";
        if (record.isNenTang) {
          return (
            <Tag color={PlatformManageTypeConstant.getColor(text)}>
              {PlatformManageTypeConstant.getDisplayName(text)}
            </Tag>
          );
        }
        return text;
      },
    },
    {
      title: "Hạn xử lý",
      dataIndex: "limitDays",
      key: "limitDays",
      width: 110,
      align: "center",
      render: (days: number) => <span style={{ fontWeight: 600, color: "#1e3b8b" }}>{days} ngày</span>,
    },
    {
      title: "Bước chuyển đổi (Trước ➔ Sau)",
      key: "transition",
      width: 220,
      align: "center",
      render: (_, record: ProcessingDeadlineConfigDto) => {
        const getStatusText = (val: number | null | undefined) => {
          if (val === null || val === undefined) return "?";
          if (record.isNenTang) {
            return PlatformStatusConstant.getDisplayName(val) || val;
          }
          return val;
        };
        const before = getStatusText(record.statusBefore);
        const after = getStatusText(record.statusAfter);
        return before === "?" && after === "?" ? "-" : `${before} ➔ ${after}`;
      },
    },
    {
      title: "Bỏ qua ngày lễ",
      dataIndex: "isCheckHoliday",
      key: "isCheckHoliday",
      width: 120,
      align: "center",
      render: (val: boolean) =>
        val ? (
          <Tag color="success" icon={<CheckOutlined />}>
            Có
          </Tag>
        ) : (
          <Tag color="default" icon={<CloseOutlined />}>
            Không
          </Tag>
        ),
    },
    {
      title: "Cấu hình nền tảng",
      dataIndex: "isNenTang",
      key: "isNenTang",
      width: 140,
      align: "center",
      render: (val: boolean) =>
        val ? (
          <Tag color="processing" icon={<CheckOutlined />}>
            Có
          </Tag>
        ) : (
          <Tag color="default" icon={<CloseOutlined />}>
            Không
          </Tag>
        ),
    },
    {
      title: "Thao tác",
      dataIndex: "actions",
      key: "actions",
      fixed: "right",
      align: "center",
      width: 110,
      render: (_: any, record: ProcessingDeadlineConfigDto) => {
        const items: MenuProps["items"] = [
          {
            label: "Chi tiết",
            key: "detail",
            icon: <EyeOutlined />,
            onClick: ({ domEvent }) => {
              domEvent.stopPropagation();
              setSelectedId(record.id);
              setIsDetailOpen(true);
            },
          },
          {
            label: "Chỉnh sửa",
            key: "edit",
            icon: <EditOutlined />,
            onClick: ({ domEvent }) => {
              domEvent.stopPropagation();
              setSelectedId(record.id);
              setIsCreateOrUpdateOpen(true);
            },
          },
          {
            type: "divider",
          },
          {
            label: "Xóa",
            key: "delete",
            danger: true,
            icon: <DeleteOutlined />,
            onClick: ({ domEvent }) => {
              domEvent.stopPropagation();
              setOpenPopconfirmId(record.id ?? "");
            },
          },
        ];

        return (
          <>
            <Dropdown menu={{ items }} trigger={["click"]}>
              <Button onClick={(e) => e.stopPropagation()}>
                <Space>
                  Thao tác
                  <DownOutlined />
                </Space>
              </Button>
            </Dropdown>
            <Popconfirm
              title="Xác nhận xóa"
              description="Bạn có chắc chắn muốn xóa cấu hình này?"
              okText="Xóa"
              cancelText="Hủy"
              open={openPopconfirmId === record.id}
              onConfirm={(e) => {
                e?.stopPropagation();
                handleDelete(record.id || "");
                setOpenPopconfirmId(null);
              }}
              onCancel={(e) => {
                e?.stopPropagation();
                setOpenPopconfirmId(null);
              }}
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
        <AutoBreadcrumb items={[{ title: "Cấu hình số ngày hạn xử lý" }]} />
        <Space size="middle" style={{ marginLeft: "auto" }}>
          <Button
            icon={<SearchOutlined />}
            onClick={() => setIsSearchVisible(!isSearchVisible)}
          >
            {isSearchVisible ? "Ẩn tìm kiếm" : "Tìm kiếm"}
          </Button>
          <Button
            color="green" variant="solid"
            icon={<PlusCircleOutlined />}
            onClick={() => {
              setSelectedId(null);
              setIsCreateOrUpdateOpen(true);
            }}
          >
            Thêm mới
          </Button>
        </Space>
      </Flex>

      {isSearchVisible && <Search onFinish={handleSearch} />}

      <Card style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)", borderRadius: "8px" }}>
        <div className="table-responsive">
          <Table<ProcessingDeadlineConfigDto>
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
                  setSelectedId(record.id);
                  setIsDetailOpen(true);
                },
                style: { cursor: "pointer" },
              };
            }}
          />
        </div>
        <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
          <Pagination
            total={dataPage?.totalCount || 0}
            showTotal={(total, range) => `${range[0]}-${range[1]} trong ${total} cấu hình`}
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

      {/* Modals */}
      <CreateOrUpdateModal
        isOpen={isCreateOrUpdateOpen}
        id={selectedId}
        onClose={() => {
          setIsCreateOrUpdateOpen(false);
          setSelectedId(null);
        }}
        onSuccess={handleGetData}
      />

      <DetailModal
        isOpen={isDetailOpen}
        id={selectedId}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedId(null);
        }}
      />
    </div>
  );
};

export default withAuthorization(ProcessingDeadlineConfigPage, "");
