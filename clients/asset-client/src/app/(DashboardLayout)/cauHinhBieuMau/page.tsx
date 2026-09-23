"use client";

import Flex from "@/components/shared-components/Flex";
import { ResponsePageInfo } from "@/types/general";
import withAuthorization from "@/libs/authentication";
import { setIsLoading } from "@/store/general/GeneralSlice";
import { useSelector } from "@/store/hooks";
import { AppDispatch } from "@/store/store";
import {
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  FormOutlined,
  PlusCircleOutlined,
  SearchOutlined,
  SyncOutlined,
} from "@ant-design/icons";
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
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import AutoBreadcrumb from "@/components/util-compenents/Breadcrumb";
import bcBaoCaoService from "@/services/bcBaoCao/bcBaoCao.service";
import bcFormTemplateService from "@/services/bcFormTemplate/bcFormTemplate.service";
import { BCBaoCaoType } from "@/types/bCBaoCao/dto";
import { BCBaoCaoSearchType } from "@/types/bCBaoCao/request";
import CreateOrUpdate from "./createOrUpdate";
import { useRouter } from "next/navigation";
const Page: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const [dataList, setDataList] = useState<BCBaoCaoType[]>([]);
  const [dataPage, setDataPage] = useState<ResponsePageInfo>();
  const [pageSize, setPageSize] = useState<number>(20);
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [isPanelVisible, setIsPanelVisible] = useState<boolean>(true);
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [currentItem, setCurrentItem] = useState<BCBaoCaoType | undefined>();
  const [openPopconfirmId, setOpenPopconfirmId] = useState<string | null>(null);
  const router = useRouter();
  const [searchForm] = Form.useForm();
  const loading = useSelector((state) => state.general.isLoading);

  const handleFetch = useCallback(
    async (customSearch?: BCBaoCaoSearchType) => {
      dispatch(setIsLoading(true));
      try {
        const formValues = searchForm.getFieldsValue();
        const searchParams: BCBaoCaoSearchType = {
          pageIndex: customSearch?.pageIndex ?? pageIndex,
          pageSize: customSearch?.pageSize ?? pageSize,
          name: formValues.name || undefined,
          description: formValues.description || undefined,
          ...customSearch,
        };

        const response = await bcBaoCaoService.getData(searchParams);
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
        console.error("Lỗi khi tải dữ liệu cấu hình báo cáo:", error);
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
      const response = await bcBaoCaoService.delete(id);
      if (response.status) {
        message.success("Xóa cấu hình báo cáo thành công");
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

  const tableColumns: TableColumnsType<BCBaoCaoType> = [
    {
      title: "STT",
      width: 70,
      align: "center",
      render: (_: any, __: BCBaoCaoType, index: number) =>
        pageSize * (pageIndex - 1) + index + 1,
    },
    {
      title: "Tên biểu mẫu báo cáo",
      dataIndex: "name",
      width: 350,
      ellipsis: true,
      onCell: (record: any) => ({
        onClick: async () => {
          dispatch(setIsLoading(true));
          try {
            const res = await bcFormTemplateService.getData({ idBaoCao: record.id, pageIndex: 1, pageSize: 1 });
            const template = res.data?.items?.[0];
            if (template) {
              router.push(`/cauHinhBieuMau/${record.id}/template/${template.id}`);
            } else {
              message.warning("Chưa có template nào được cấu hình cho báo cáo này");
              router.push(`/cauHinhBieuMau/${record.id}`);
            }
          } catch (error) {
            message.error("Lỗi khi lấy thông tin template");
          } finally {
            dispatch(setIsLoading(false));
          }
        }
      }),
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      width: 450,
      ellipsis: true,
      render: (text: string) => text || "-",
    },
    {
      title: "Thao tác",
      width: 130,
      align: "center",
      fixed: "right",
      render: (_: any, record: BCBaoCaoType) => {
        const items: MenuProps["items"] = [
          {
            label: "Cấu hình form",
            key: "configForm",
            icon: <FormOutlined />,
            onClick: async () => {
              dispatch(setIsLoading(true));
              try {
                const res = await bcFormTemplateService.getData({ idBaoCao: record.id, pageIndex: 1, pageSize: 1 });
                const template = res.data?.items?.[0];
                if (template) {
                  router.push(`/cauHinhBieuMau/${record.id}/template/${template.id}`);
                } else {
                  message.warning("Chưa có template nào được cấu hình cho báo cáo này");
                }
              } catch (error) {
                message.error("Lỗi khi lấy thông tin template");
              } finally {
                dispatch(setIsLoading(false));
              }
            },
          },
          { type: "divider" },
          {
            label: "Chỉnh sửa",
            key: "edit",
            icon: <EditOutlined />,
            onClick: () => {
              setCurrentItem(record);
              setIsOpenModal(true);
            },
          },
          {
            label: "Xóa",
            key: "delete",
            icon: <DeleteOutlined />,
            danger: true,
            onClick: () => setOpenPopconfirmId(record.id ?? null),
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
              description="Bạn có chắc chắn muốn xóa cấu hình báo cáo này?"
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
                  label="Tên biểu mẫu"
                  name="name"
                  style={{ marginBottom: 0 }}
                >
                  <Input
                    placeholder="Nhập tên biểu mẫu báo cáo..."
                    allowClear
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  label="Mô tả"
                  name="description"
                  style={{ marginBottom: 0 }}
                >
                  <Input placeholder="Nhập mô tả..." allowClear />
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
          <Table<BCBaoCaoType>
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
              `${range[0]}-${range[1]} trong ${total} cấu hình biểu mẫu`
            }
            onChange={(page, size) => {
              setPageIndex(page);
              if (size !== pageSize) setPageSize(size);
            }}
          />
        </Flex>
      </Card>

      <CreateOrUpdate
        isOpen={isOpenModal}
        onSuccess={() => {
          setIsOpenModal(false);
          handleFetch();
        }}
        onClose={() => {
          setIsOpenModal(false);
          setCurrentItem(undefined);
        }}
        data={currentItem}
      />
    </>
  );
};

export default withAuthorization(Page, "");
