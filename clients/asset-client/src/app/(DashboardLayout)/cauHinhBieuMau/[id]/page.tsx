"use client";

import Flex from "@/components/shared-components/Flex";
import withAuthorization from "@/libs/authentication";
import { setIsLoading } from "@/store/general/GeneralSlice";
import { useSelector } from "@/store/hooks";
import { AppDispatch } from "@/store/store";
import {
    ArrowLeftOutlined,
    FileOutlined,
    DeleteOutlined,
    DownOutlined,
    EditOutlined,
    PlusCircleOutlined,
    SearchOutlined,
    SyncOutlined,
    SettingOutlined,
} from "@ant-design/icons";
import {
    Button,
    Card,
    Col,
    Dropdown,
    Form,
    Input,
    MenuProps,
    Popconfirm,
    Row,
    Space,
    Table,
    TableColumnsType,
    Tag,
    Typography,
    message,
    Pagination,
} from "antd";
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import AutoBreadcrumb from "@/components/util-compenents/Breadcrumb";
import bcBaoCaoService from "@/services/bcBaoCao/bcBaoCao.service";
import bcFormTemplateService from "@/services/bcFormTemplate/bcFormTemplate.service";
import { BCFormTemplateType } from "@/types/bcFormTemplate/dto";
import { BCBaoCaoType } from "@/types/bCBaoCao/dto";
import { ResponsePageInfo } from "@/types/general";
import { BCFormTemplateSearchType } from "@/types/bcFormTemplate/request";
import { useRouter } from "next/navigation";
import CreateOrUpdate from "./createOrUpdate";

const { Title, Text } = Typography;

interface PageProps {
    params: {
        id: string;
    };
}

const DetailPage: React.FC<PageProps> = ({ params }) => {
    const { id } = params;
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const staticUrl = process.env.NEXT_PUBLIC_STATIC_FILE_BASE_URL || "";

    const [dataList, setDataList] = useState<BCFormTemplateType[]>([]);
    const [dataPage, setDataPage] = useState<ResponsePageInfo>();
    const [pageSize, setPageSize] = useState<number>(20);
    const [pageIndex, setPageIndex] = useState<number>(1);
    const [reportInfo, setReportInfo] = useState<BCBaoCaoType | null>(null);
    const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
    const [currentItem, setCurrentItem] = useState<BCFormTemplateType | undefined>();
    const [openPopconfirmId, setOpenPopconfirmId] = useState<string | null>(null);
    const [isPanelVisible, setIsPanelVisible] = useState<boolean>(true);

    const [searchForm] = Form.useForm();
    const loading = useSelector((state) => state.general.isLoading);

    const fetchDetails = useCallback(async (customSearch?: BCFormTemplateSearchType) => {
        if (!id) return;
        dispatch(setIsLoading(true));
        try {
            // 1. Fetch Report Metadata
            if (!reportInfo) {
                const reportRes = await bcBaoCaoService.get(id);
                if (reportRes?.data) {
                    setReportInfo(reportRes.data);
                }
            }

            // 2. Fetch Form Templates using getData
            const formValues = searchForm.getFieldsValue();
            const searchParams: BCFormTemplateSearchType = {
                pageIndex: customSearch?.pageIndex ?? pageIndex,
                pageSize: customSearch?.pageSize ?? pageSize,
                idBaoCao: id,
                name: formValues.name || undefined,
                ...customSearch,
            };

            const templateRes = await bcFormTemplateService.getData(searchParams);
            if (templateRes?.data) {
                const {
                    items,
                    totalCount,
                    totalPage,
                    pageIndex: respPageIndex,
                    pageSize: respPageSize,
                } = templateRes.data;
                setDataList(items || []);
                setDataPage({
                    pageIndex: respPageIndex,
                    pageSize: respPageSize,
                    totalCount,
                    totalPage,
                });
            }
        } catch (error) {
            console.error("Lỗi khi tải danh sách template form:", error);
            message.error("Lỗi tải thông tin chi tiết");
        } finally {
            dispatch(setIsLoading(false));
        }
    }, [id, dispatch, pageIndex, pageSize, searchForm, reportInfo]);

    useEffect(() => {
        fetchDetails();
    }, [fetchDetails]);

    const handleDelete = async (templateId: string) => {
        dispatch(setIsLoading(true));
        try {
            const response = await bcFormTemplateService.delete(templateId);
            if (response.status) {
                message.success("Xóa form template thành công");
                fetchDetails();
            } else {
                message.error(response.message || "Xóa form template thất bại");
            }
        } catch (error) {
            message.error("Có lỗi xảy ra");
        } finally {
            dispatch(setIsLoading(false));
        }
    };

    const handleSearch = () => {
        setPageIndex(1);
        fetchDetails({ pageIndex: 1 });
    };

    const handleResetSearch = () => {
        searchForm.resetFields();
        setPageIndex(1);
        fetchDetails({ pageIndex: 1 });
    };

    const tableColumns: TableColumnsType<BCFormTemplateType> = [
        {
            title: "STT",
            width: 70,
            align: "center",
            render: (_: any, __: BCFormTemplateType, index: number) =>
                pageSize * (pageIndex - 1) + index + 1,
        },
        {
            title: "Tên template form",
            dataIndex: "name",
            width: 280,
            ellipsis: true,
            onCell: (record: any) => ({ onClick: () => {
                            router.push(`/cauHinhBieuMau/${id}/template/${record.id}`);
                        }}),
            render: (text: string) => <strong>{text}</strong>,
        },
        // {
        //     title: "Đối tượng áp dụng",
        //     dataIndex: "doiTuongTypes",
        //     width: 250,
        //     render: (types: string[]) => {
        //         if (!types || types.length === 0) return "-";
        //         return (
        //             <Space wrap size={[4, 4]}>
        //                 {types.map((type) => {
        //                     let color = "blue";
        //                     let label = type;
        //                     if (type === "DOANH_NGHIEP") {
        //                         color = "geekblue";
        //                         label = "Doanh nghiệp";
        //                     } else if (type === "HTX") {
        //                         color = "purple";
        //                         label = "Hợp tác xã";
        //                     } else if (type === "HO_KINH_DOANH") {
        //                         color = "cyan";
        //                         label = "Hộ kinh doanh";
        //                     }
        //                     return (
        //                         <Tag color={color} key={type}>
        //                             {label}
        //                         </Tag>
        //                     );
        //                 })}
        //             </Space>
        //         );
        //     },
        // },
        // {
        //     title: "Hướng trang",
        //     dataIndex: "huongTrang",
        //     width: 130,
        //     align: "center",
        //     render: (val: string) => {
        //         if (!val) return "-";
        //         return val === "PORTRAIT" || val === "doc" ? "Trang dọc" : "Trang ngang";
        //     },
        // },
        {
            title: "Thao tác",
            width: 140,
            align: "center",
            fixed: "right",
            render: (_: any, record: BCFormTemplateType) => {
                const items: MenuProps["items"] = [
                    {
                        label: "Cấu hình",
                        key: "configure",
                        icon: <SettingOutlined />,
                        onClick: () => {
                            router.push(`/cauHinhBieuMau/${id}/template/${record.id}`);
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
                            description="Bạn có chắc chắn muốn xóa form template này?"
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
                style={{ marginBottom: 16, flexWrap: "wrap", gap: 8 }}
            >
                <AutoBreadcrumb />
                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => router.push("/cauHinhBieuMau")}
                >
                    Quay lại
                </Button>
            </Flex>
{/* 
            <Card size="small" style={{ marginBottom: 16 }}>
                <Title level={4} style={{ margin: 0 }}>
                    Cấu hình Form Báo Cáo
                </Title>
                {reportInfo && (
                    <Text type="secondary" style={{ marginTop: 8, display: "block" }}>
                        Đang cấu hình các biểu mẫu cho báo cáo: <strong>{reportInfo.name}</strong>
                        {reportInfo.description && ` (${reportInfo.description})`}
                    </Text>
                )}
            </Card> */}

            <Flex justifyContent="flex-end" style={{ marginBottom: 12, gap: 8 }}>
                {/* <Button
                    icon={<SearchOutlined />}
                    type={isPanelVisible ? "primary" : "default"}
                    onClick={() => setIsPanelVisible(!isPanelVisible)}
                >
                    {isPanelVisible ? "Ẩn tìm kiếm" : "Tìm kiếm"}
                </Button> */}
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
{/* 
            {isPanelVisible && (
                <Card size="small" style={{ marginBottom: 12 }}>
                    <Form form={searchForm} layout="vertical" onFinish={handleSearch}>
                        <Row gutter={16} align="bottom">
                            <Col xs={24} sm={16} md={18}>
                                <Form.Item label="Từ khóa" name="name" style={{ marginBottom: 0 }}>
                                    <Input placeholder="Nhập tên template form để tìm kiếm..." allowClear />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={8} md={6}>
                                <Space>
                                    <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
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
            )} */}

            <Card size="small">
                <div className="table-responsive">
                    <Table<BCFormTemplateType>
                        columns={tableColumns}
                        bordered
                        dataSource={dataList}
                        rowKey="id"
                        scroll={{ x: 900 }}
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
                            `${range[0]}-${range[1]} trong ${total} template form`
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
                idBaoCao={id}
                onSuccess={() => {
                    setIsOpenModal(false);
                    fetchDetails();
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

export default withAuthorization(DetailPage, "");
