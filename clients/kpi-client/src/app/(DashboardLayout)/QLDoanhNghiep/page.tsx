"use client";
import { useCallback, useEffect, useState } from "react";
import {
  Button,
  Card,
  Dropdown,
  FormProps,
  MenuProps,
  Modal,
  Pagination,
  Select,
  Space,
  Table,
  TableProps,
  Tag,
  message,
} from "antd";
import {
  CloseOutlined,
  DeleteOutlined,
  DownOutlined,
  EyeOutlined,
  SearchOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { useDispatch } from "react-redux";
import Flex from "@/components/shared-components/Flex";
import AutoBreadcrumb from "@/components/util-compenents/Breadcrumb";
import withAuthorization from "@/libs/authentication";
import { useSelector } from "@/store/hooks";
import { AppDispatch } from "@/store/store";
import { setIsLoading } from "@/store/general/GeneralSlice";
import { PagedList } from "@/types/general";
import { CompanyInfoType } from "@/types/companyInfo/dto";
import { CompanyInfoSearchType } from "@/types/companyInfo/request";
import companyInfoService from "@/services/companyInfo/companyInfo.service";
import CompanyInfoStatusConstant from "@/constants/CompanyInfoStatusConstant";
import Search from "./search";
import CompanyInfoDetail from "./detail";

const QLDoanhNghiepPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const loading = useSelector((s) => s.general.isLoading);
  const [data, setData] = useState<PagedList<CompanyInfoType>>();
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const [isPanelVisible, setIsPanelVisible] = useState<boolean>(false);
  const [searchValues, setSearchValues] = useState<CompanyInfoSearchType | null>(
    null,
  );
  const [currentItem, setCurrentItem] = useState<CompanyInfoType | null>(null);
  const [isOpenDetail, setIsOpenDetail] = useState<boolean>(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [statusEdit, setStatusEdit] = useState<{
    id: string;
    status: number;
  } | null>(null);

  const handleLoadData = useCallback(
    async (override?: CompanyInfoSearchType) => {
      dispatch(setIsLoading(true));
      const cleaned = Object.fromEntries(
        Object.entries(searchValues || {}).filter(
          ([, v]) => v !== "" && v !== null && v !== undefined,
        ),
      );
      const search = override ?? { pageIndex, pageSize, ...cleaned };
      const response = await companyInfoService.getData(search);
      if (response?.data) setData(response.data);
      dispatch(setIsLoading(false));
    },
    [dispatch, pageIndex, pageSize, searchValues],
  );

  useEffect(() => {
    handleLoadData();
  }, [handleLoadData]);

  const onFinishSearch: FormProps<CompanyInfoSearchType>["onFinish"] = async (
    values,
  ) => {
    setSearchValues(values);
    setPageIndex(1);
    await handleLoadData({ ...values, pageIndex: 1, pageSize });
  };

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    const response = await companyInfoService.delete(confirmDeleteId);
    if (response.status) {
      message.success("Xoá thành công");
      handleLoadData();
    } else {
      message.error(response.message ?? "Xoá thất bại");
    }
    setConfirmDeleteId(null);
  };

  const handleUpdateStatus = async () => {
    if (!statusEdit) return;
    const response = await companyInfoService.updateStatus(statusEdit);
    if (response.status) {
      message.success("Cập nhật trạng thái thành công");
      handleLoadData();
    } else {
      message.error(response.message ?? "Cập nhật thất bại");
    }
    setStatusEdit(null);
  };

  const columns: TableProps<CompanyInfoType>["columns"] = [
    {
      title: "STT",
      width: 60,
      align: "center",
      render: (_: any, __: any, index: number) =>
        (pageIndex - 1) * pageSize + index + 1,
    },
    {
      title: "Tên doanh nghiệp",
      dataIndex: "name",
      ellipsis: true,
    },
    {
      title: "Mã số thuế",
      dataIndex: "taxCode",
      width: 140,
    },
    {
      title: "Loại",
      dataIndex: "typeOrganizationName",
      width: 120,
    },
    {
      title: "Người đại diện",
      dataIndex: "representerName",
      ellipsis: true,
    },
    {
      title: "Email",
      dataIndex: "email",
      ellipsis: true,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      width: 140,
      render: (status: number) => (
        <Tag color={CompanyInfoStatusConstant.getColor(status)}>
          {CompanyInfoStatusConstant.getDisplayName(status)}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      dataIndex: "actions",
      fixed: "right",
      width: 130,
      align: "center",
      render: (_: any, record: CompanyInfoType) => {
        const items: MenuProps["items"] = [
          {
            label: "Chi tiết",
            key: "detail",
            icon: <EyeOutlined />,
            onClick: () => {
              setCurrentItem(record);
              setIsOpenDetail(true);
            },
          },
          {
            label: "Đổi trạng thái",
            key: "status",
            icon: <EditOutlined />,
            onClick: () =>
              setStatusEdit({ id: record.id, status: record.status }),
          },
          { type: "divider" },
          {
            label: "Xoá",
            key: "delete",
            danger: true,
            icon: <DeleteOutlined />,
            onClick: () => setConfirmDeleteId(record.id),
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

  return (
    <>
      <Flex
        alignItems="center"
        justifyContent="space-between"
        className="mb-2 flex-wrap justify-content-end"
      >
        <AutoBreadcrumb />
        <div className="btn-group w-fit flex" style={{ gap: 12 }}>
          <Button
            onClick={() => setIsPanelVisible(!isPanelVisible)}
            type="primary"
            size="middle"
            icon={isPanelVisible ? <CloseOutlined /> : <SearchOutlined />}
          >
            {isPanelVisible ? "Ẩn tìm kiếm" : "Tìm kiếm"}
          </Button>
        </div>
      </Flex>

      {isPanelVisible && <Search onFinish={onFinishSearch} />}
      {isOpenDetail && (
        <CompanyInfoDetail
          item={currentItem}
          onClose={() => {
            setIsOpenDetail(false);
            setCurrentItem(null);
          }}
        />
      )}

      {confirmDeleteId && (
        <Modal
          title="Xác nhận xoá"
          open={true}
          onOk={handleDelete}
          onCancel={() => setConfirmDeleteId(null)}
          okText="Xoá"
          okButtonProps={{ danger: true }}
          cancelText="Huỷ"
        >
          <p>Bạn có chắc chắn muốn xoá doanh nghiệp này?</p>
        </Modal>
      )}

      {statusEdit && (
        <Modal
          title="Cập nhật trạng thái"
          open={true}
          onOk={handleUpdateStatus}
          onCancel={() => setStatusEdit(null)}
          okText="Lưu"
          cancelText="Huỷ"
        >
          <Select
            style={{ width: "100%" }}
            value={statusEdit.status}
            options={CompanyInfoStatusConstant.getDropdownListKey()}
            onChange={(v) => setStatusEdit({ ...statusEdit, status: v })}
          />
        </Modal>
      )}

      <Card className="customCardShadow">
        <div className="table-responsive">
          <Table
            columns={columns}
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
            current={pageIndex}
            pageSize={pageSize}
            showTotal={(total, range) =>
              `${range[0]}-${range[1]} trong ${total} dữ liệu`
            }
            onChange={(p) => setPageIndex(p)}
            onShowSizeChange={(c, s) => {
              setPageIndex(c);
              setPageSize(s);
            }}
            align="end"
          />
        </div>
      </Card>
    </>
  );
};

export default withAuthorization(QLDoanhNghiepPage, "");
