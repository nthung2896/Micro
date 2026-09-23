"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Button,
  Card,
  Col,
  Dropdown,
  Form,
  Input,
  MenuProps,
  Pagination,
  Popconfirm,
  Row,
  Space,
  Table,
  TableColumnsType,
  message,
} from "antd";
import {
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  PlusCircleOutlined,
  SearchOutlined,
  SyncOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import Flex from "@/components/shared-components/Flex";
import AutoBreadcrumb from "@/components/util-compenents/Breadcrumb";
import bcSubmissionService from "@/services/bcSubmission/bcSubmission.service";
import dayjs from "dayjs";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { setIsLoading } from "@/store/general/GeneralSlice";
import { useSelector } from "@/store/hooks";
import { useRouter } from "next/navigation";
import { RootState } from "@/store/store";

const DuyetBaoCaoPage: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [dataList, setDataList] = useState<any[]>([]);
  const [dataPage, setDataPage] = useState<any>();
  const [pageSize, setPageSize] = useState<number>(20);
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [isPanelVisible, setIsPanelVisible] = useState<boolean>(true);
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [currentItem, setCurrentItem] = useState<any | undefined>();
  const [openPopconfirmId, setOpenPopconfirmId] = useState<string | null>(null);

  const [searchForm] = Form.useForm();
  const loading = useSelector((state: RootState) => state.general.isLoading);
  const currentUser = useSelector((state: RootState) => state.auth.User);

  const handleFetch = useCallback(
    async (customSearch?: any) => {
      dispatch(setIsLoading(true));
      try {
        const formValues = searchForm.getFieldsValue();
        const searchParams = {
          pageIndex: customSearch?.pageIndex ?? pageIndex,
          pageSize: customSearch?.pageSize ?? pageSize,
          name: formValues.name || undefined,
          ...customSearch,
        };

        const response =
          await bcSubmissionService.getBaoCaoDuocPhepDuyet(searchParams);
        if (response?.data) {
          const {
            items,
            totalCount,
            totalPage,
            pageIndex: respPageIndex,
            pageSize: respPageSize,
          } = response.data;
          setDataList(items || []);
          setDataPage({
            pageIndex: respPageIndex,
            pageSize: respPageSize,
            totalCount,
            totalPage,
          });
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu đợt báo cáo:", error);
        message.error("Lỗi tải danh sách dữ liệu");
      } finally {
        dispatch(setIsLoading(false));
      }
    },
    [pageIndex, pageSize, dispatch, searchForm],
  );

  useEffect(() => {
    handleFetch();
  }, [handleFetch]);

  const handleDelete = async (id: string) => {
    dispatch(setIsLoading(true));
    try {
      const response = await bcSubmissionService.deletePeriod(id);
      if (response.status) {
        message.success("Xóa đợt báo cáo thành công");
        handleFetch();
      } else {
        message.error(response.message || "Xóa dữ liệu thất bại");
      }
    } catch (error) {
      message.error("Có lỗi xảy ra");
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  const handleSearch = () => {
    setPageIndex(1);
    handleFetch({ pageIndex: 1 });
  };

  const handleResetSearch = () => {
    searchForm.resetFields();
    setPageIndex(1);
    handleFetch({ pageIndex: 1 });
  };

  const tableColumns: TableColumnsType<any> = [
    {
      title: "STT",
      width: 70,
      align: "center",
      render: (_: any, __: any, index: number) =>
        pageSize * (pageIndex - 1) + index + 1,
    },
    {
      title: "Tên đợt báo cáo",
      dataIndex: "name",
      width: 250,
      ellipsis: true,
      render: (text: string) => <strong>{text}</strong>,
      onCell: (record) => ({
        onClick: () => {
          router.push(`/duyetBaoCao/${record.id}`);
        },
      }),
    },
    {
      title: "Thời gian bắt đầu",
      dataIndex: "timeStart",
      width: 160,
      align: "center",
      render: (val: string) =>
        val ? dayjs(val).format("DD/MM/YYYY HH:mm") : "-",
    },
    {
      title: "Thời gian kết thúc",
      dataIndex: "timeEnd",
      width: 160,
      align: "center",
      render: (val: string) =>
        val ? dayjs(val).format("DD/MM/YYYY HH:mm") : "-",
    },
    {
      title: "Gửi email thông báo",
      dataIndex: "isGuiMail",
      width: 120,
      align: "center",
      render: (val: boolean) => (val ? "Gửi email" : "Không"),
    },
    {
      title: "Thao tác",
      width: 130,
      align: "center",
      fixed: "right",
      render: (_: any, record: any) => {
        const items: MenuProps["items"] = [
          {
            label: "Chi tiết",
            key: "detail",
            icon: <EyeOutlined />,
            onClick: () => {
              router.push(`/duyetBaoCao/${record.id}`);
            },
          },
        ];

        return (
          <>
            <Dropdown menu={{ items }} trigger={["click"]}>
              <Button type="primary" ghost >
                <Space>
                  Thao tác
                  <DownOutlined />
                </Space>
              </Button>
            </Dropdown>
            <Popconfirm
              title="Xác nhận xóa"
              description="Bạn có chắc chắn muốn xóa đợt báo cáo này?"
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
    <>
      <Flex
        alignItems="center"
        justifyContent="space-between"
        style={{ marginBottom: 12, flexWrap: "wrap", gap: 8 }}
      >
        <AutoBreadcrumb />
      </Flex>

      <Flex justifyContent="flex-end" style={{ marginBottom: 12, gap: 8 }}>
        <Button
          icon={<SearchOutlined />}
          type={isPanelVisible ? "primary" : "default"}
          onClick={() => setIsPanelVisible(!isPanelVisible)}
        >
          {isPanelVisible ? "Ẩn tìm kiếm" : "Tìm kiếm"}
        </Button>
        <Button
          type="primary"
          icon={<PlusCircleOutlined />}
          onClick={() => {
            setCurrentItem(undefined);
            setIsOpenModal(true);
          }}
        >
          Thêm mới
        </Button>
      </Flex>

      {isPanelVisible && (
        <Card size="small" style={{ marginBottom: 12 }}>
          <Form form={searchForm} layout="vertical" onFinish={handleSearch}>
            <Row gutter={16} align="bottom">
              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  label="Tên đợt báo cáo"
                  name="name"
                  style={{ marginBottom: 0 }}
                >
                  <Input placeholder="Nhập tên đợt báo cáo..." allowClear />
                </Form.Item>
              </Col>

              <Col xs={24} sm={24} md={8}>
                <Space>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<SearchOutlined />}
                  >
                    Tìm kiếm
                  </Button>
                  <Button icon={<SyncOutlined />} onClick={handleResetSearch}>
                    Làm mới
                  </Button>
                </Space>
              </Col>
            </Row>
          </Form>
        </Card>
      )}

      <Card size="small">
        <div className="table-responsive">
          <Table
            columns={tableColumns}
            bordered
            dataSource={dataList}
            rowKey="id"
            scroll={{ x: 1000 }}
            pagination={false}
            loading={loading}
          />
        </div>

        <Flex justifyContent="flex-end" style={{ marginTop: 16 }}>
          <Pagination
            total={dataPage?.totalCount || 0}
            current={pageIndex}
            pageSize={pageSize}
            showSizeChanger
            showTotal={(total, range) =>
              `${range[0]}-${range[1]} trong ${total} đợt báo cáo`
            }
            onChange={(page, size) => {
              setPageIndex(page);
              if (size !== pageSize) setPageSize(size);
            }}
          />
        </Flex>
      </Card>
    </>
  );
};

export default DuyetBaoCaoPage;
