"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Pagination,
  Row,
  Space,
  Table,
  TableColumnsType,
  message,
  Tag,
} from "antd";
import {
  SearchOutlined,
  SyncOutlined,
  EyeOutlined,
  SendOutlined,
  EditOutlined,
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

const DoanhNghiepBaoCaoPage: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [dataList, setDataList] = useState<any[]>([]);
  const [dataPage, setDataPage] = useState<any>();
  const [pageSize, setPageSize] = useState<number>(20);
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [isPanelVisible, setIsPanelVisible] = useState<boolean>(true);
  const userInfo = useSelector((state: any) => state.auth.User);

  const [searchForm] = Form.useForm();

  const handleFetch = useCallback(
    async (customSearch?: any) => {
      dispatch(setIsLoading(true));
      try {
        const formValues = searchForm.getFieldsValue();
        const searchParams = {
          pageIndex: customSearch?.pageIndex ?? pageIndex,
          pageSize: customSearch?.pageSize ?? pageSize,
          name: formValues.name || undefined,
          nameNenTang: formValues.nameNenTang || undefined,
          loaiKyBaoCao: "NAM",
          IdDoiTuong: userInfo?.id, // Filter by the current business
          ...customSearch,
        };

        const response =
          await bcSubmissionService.getDotBaoCaoData(searchParams);
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
            totalCount: totalCount,
            totalPage: totalPage,
          });
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu báo cáo:", error);
        message.error("Lỗi tải danh sách đợt báo cáo");
      } finally {
        dispatch(setIsLoading(false));
      }
    },
    [pageIndex, pageSize, dispatch, searchForm, userInfo],
  );

  useEffect(() => {
    handleFetch();
  }, [handleFetch]);

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
      render: (text: string, record: any) => (
        <strong>{text || record.dotBaoCaoName || "-"}</strong>
      ),
    },
    {
      title: "Tên nền tảng",
      dataIndex: "nameNenTang",
      width: 200,
      align: "center",
    },
    {
      title: "Hạn nộp",
      dataIndex: "timeEnd",
      width: 160,
      align: "center",
      render: (val: string) =>
        val ? dayjs(val).format("DD/MM/YYYY HH:mm") : "-",
    },
    {
      title: "Trạng thái nộp",
      dataIndex: "status",
      width: 150,
      align: "center",
      render: (val: string) => {
        if (val === "SUBMITTED") return <Tag color="green">Đã nộp</Tag>;
        if (val === "APPROVED") return <Tag color="blue">Đã duyệt</Tag>;
        if (val === "TAM_LUU") return <Tag color="error">Tạm lưu</Tag>;
        return <Tag color="default">Chưa nộp</Tag>;
      },
    },
    {
      title: "Thao tác",
      width: 130,
      align: "center",
      fixed: "right",
      render: (_: any, record: any) => {
        const isApproved = record.status === "APPROVED";
        return (
          <Button
            type="primary"
            
            icon={<EditOutlined />}
            disabled={isApproved}
            onClick={() => {
              if(record.status === "APPROVED") {
                message.warning("Đã duyệt không thể sửa")
                return;
              }
              const assignment = record.baoCaoDoiTuongId;
              const url = `/doanhNghiepBaoCao/${record.id}/${record.bcFormTemplates[0].id}?assignmentId=${assignment}`;
              router.push(url);
            }}
          >
         {record.status === "SUBMITTED" || record.status === "TAM_LUU"? "Sửa báo cáo" : "Làm báo cáo"}
          </Button>
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
              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  label="Tên nền tảng"
                  name="nameNenTang"
                  style={{ marginBottom: 0 }}
                >
                  <Input placeholder="Nhập tên nền tảng..." allowClear />
                </Form.Item>
              </Col>

              <Col xs={24} sm={24} md={8}>
                <Space>
                  <Button
                    color="cyan" variant="solid"
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
              handleFetch({ pageIndex: page, pageSize: size });
            }}
          />
        </Flex>
      </Card>
    </>
  );
};

export default DoanhNghiepBaoCaoPage;
