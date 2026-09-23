"use client";
import Flex from "@/components/shared-components/Flex";

import AutoBreadcrumb from "@/components/util-compenents/Breadcrumb";
import withAuthorization from "@/libs/authentication";
import nhomDanhMucService from "@/services/nhomDanhMuc/nhomDanhMuc.service";
import { setIsLoading } from "@/store/general/GeneralSlice";
import { useSelector } from "@/store/hooks";
import { AppDispatch } from "@/store/store";
import { DM_NhomDanhMucType } from "@/types/dM_NhomDanhMuc/dto";
import { DM_NhomDanhMucSearchType } from "@/types/dM_NhomDanhMuc/request";
import { ResponsePageInfo } from "@/types/general";
import {
  CloseOutlined,
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  EyeOutlined,
  PlusCircleOutlined,
  SearchOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Dropdown,
  FormProps,
  MenuProps,
  Pagination,
  Popconfirm,
  Space,
  Table,
  TableProps,
  message,
} from "antd";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import CreateOrUpdate from "./createOrUpdate";
import NhomDanhMucDetail from "./detail";
import classes from "./page.module.css";
import Search from "./search";

const NhomDanhMuc: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [listNhomDanhMucs, setListNhomDanhMucs] = useState<
    DM_NhomDanhMucType[]
  >([]);
  const [dataPage, setDataPage] = useState<ResponsePageInfo>();
  const [pageSize, setPageSize] = useState<number>(20);
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [isPanelVisible, setIsPanelVisible] = useState<boolean>(false);
  const [searchValues, setSearchValues] =
    useState<DM_NhomDanhMucSearchType | null>(null);
  const loading = useSelector((state) => state.general.isLoading);
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [currentNhomDanhMuc, setCurrentNhomDanhMuc] =
    useState<DM_NhomDanhMucType | null>(null);
  const [currentDetailNhomDanhMuc, setCurrentDetailNhomDanhMuc] =
    useState<DM_NhomDanhMucType>();
  const [isOpenDetail, setIsOpenDetail] = useState<boolean>(false);
  const router = useRouter();
  const [openPopconfirmId, setOpenPopconfirmId] = useState<string | null>(null);

  const tableColumns: TableProps<DM_NhomDanhMucType>["columns"] = [
    {
      title: "STT",
      width: 70,
      align: "center",
      dataIndex: "index",
      key: "index",
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: "Mã nhóm",
      dataIndex: "groupCode",
      render: (_: any, record: DM_NhomDanhMucType) => (
        <span>{record.groupCode}</span>
      ),
    },
    {
      title: "Tên nhóm",
      dataIndex: "groupName",
      render: (_: any, record: DM_NhomDanhMucType) => (
        <span>{record.groupName}</span>
      ),
    },
    {
      title: "Thao tác",
      dataIndex: "actions",
      fixed: "right",
      width: 150,
      render: (_: any, record: DM_NhomDanhMucType) => {
        const items: MenuProps["items"] = [
          {
            label: "Cấu hình",
            key: "1",
            icon: <SettingOutlined />,
            onClick: () => {
              handleSetting(record);
            },
          },
          {
            label: "Chi tiết",
            key: "2",
            icon: <EyeOutlined />,
            onClick: () => {
              setCurrentDetailNhomDanhMuc(record);
              setIsOpenDetail(true);
            },
          },
          {
            label: "Chỉnh sửa",
            key: "3",
            icon: <EditOutlined />,
            onClick: () => {
              handleShowModal(true, record);
            },
          },
          {
            type: "divider",
          },
          {
            label: "Xóa",
            key: "4",
            danger: true,
            icon: <DeleteOutlined />,
            onClick: () => setOpenPopconfirmId(record.id ?? ""),
          },
        ];
        return (
          <>
            <Dropdown menu={{ items }} trigger={["click"]}>
              <Button
                onClick={(e) => e.preventDefault()}
                color="primary"
                icon={<DownOutlined />}
              >
                <Space>Thao tác</Space>
              </Button>
            </Dropdown>
            <Popconfirm
              title="Xác nhận xóa"
              description="Bạn có chắc chắn muốn xóa?"
              okText="Xóa"
              cancelText="Hủy"
              open={openPopconfirmId === record.id}
              onConfirm={() => {
                handleDeleteNhomDanhMuc(record.id || "");
                setOpenPopconfirmId(null);
              }}
              onCancel={() => setOpenPopconfirmId(null)}
            ></Popconfirm>
          </>
        );
      },
    },
  ];

  const handleSetting = (record: DM_NhomDanhMucType) => {
    router.push(`/DuLieuDanhMuc/${record.id}`);
  };

  const hanleCreateEditSuccess = () => {
    handleGetListNhomDanhMuc();
    setCurrentNhomDanhMuc(null);
  };

  const handleDeleteNhomDanhMuc = async (id: string) => {
    try {
      const response = await nhomDanhMucService.delete(id);
      if (response.status) {
        message.success("Xóa thành công");
        handleGetListNhomDanhMuc();
      } else {
        message.error("Xóa thất bại");
      }
    } catch (error) {
      message.error("Xóa thất bại");
    }
  };

  const toggleSearch = () => {
    setIsPanelVisible(!isPanelVisible);
  };

  const onFinishSearch: FormProps<DM_NhomDanhMucSearchType>["onFinish"] =
    async (values) => {
      try {
        setSearchValues(values);
        await handleGetListNhomDanhMuc(values);
      } catch (error) {
        console.error("Lỗi khi lưu dữ liệu:", error);
      }
    };

  const handleGetListNhomDanhMuc = useCallback(
    async (searchDataOverride?: DM_NhomDanhMucSearchType) => {
      dispatch(setIsLoading(true));
      try {
        const searchData = searchDataOverride || {
          pageIndex,
          pageSize,
          ...(searchValues || {}),
        };
        const response = await nhomDanhMucService.getData(searchData);
        if (response != null && response.data != null) {
          const data = response.data;
          const items: DM_NhomDanhMucType[] = data.items;
          setListNhomDanhMucs(items);
          setDataPage({
            pageIndex: data.pageIndex,
            pageSize: data.pageSize,
            totalCount: data.totalCount,
            totalPage: data.totalPage,
          });
        }
        dispatch(setIsLoading(false));
      } catch (error) {
        dispatch(setIsLoading(false));
      }
    },
    [pageIndex, pageSize],
  );

  const handleShowModal = (
    isEdit?: boolean,
    NhomDanhMuc?: DM_NhomDanhMucType,
  ) => {
    setIsOpenModal(true);
    if (isEdit) {
      setCurrentNhomDanhMuc(NhomDanhMuc ?? null);
    }
  };

  const handleClose = () => {
    setIsOpenModal(false);
    setCurrentNhomDanhMuc(null);
  };

  const handleCloseDetail = () => {
    setIsOpenDetail(false);
  };

  useEffect(() => {
    handleGetListNhomDanhMuc();
  }, [handleGetListNhomDanhMuc]);

  return (
    <>
      <Flex
        alignItems="center"
        justifyContent="space-between"
        className="mb-2 flex-wrap justify-content-end"
      >
        <AutoBreadcrumb />
        <div>
          <Button
            onClick={() => toggleSearch()}
            type="primary"
            icon={isPanelVisible ? <CloseOutlined /> : <SearchOutlined />}
            className={classes.mgright5}
          >
            {isPanelVisible ? "Ẩn tìm kiếm" : "Tìm kiếm"}
          </Button>
          <Button
            onClick={() => {
              handleShowModal();
            }}
            type="primary"
            icon={<PlusCircleOutlined />}
          >
            Thêm mới
          </Button>
          <CreateOrUpdate
            isOpen={isOpenModal}
            onSuccess={hanleCreateEditSuccess}
            onClose={handleClose}
            NhomDanhMuc={currentNhomDanhMuc}
          />
        </div>
      </Flex>
      {isPanelVisible && (
        <Search
          onFinish={onFinishSearch}
          pageIndex={pageIndex}
          pageSize={pageSize}
        />
      )}
      <NhomDanhMucDetail
        NhomDanhMuc={currentDetailNhomDanhMuc}
        isOpen={isOpenDetail}
        onClose={handleCloseDetail}
      />
      <Card style={{ padding: "0px" }} className={classes.customCardShadow}>
        <div className="table-responsive">
          <Table
            columns={tableColumns}
            bordered
            dataSource={listNhomDanhMucs}
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
            total={dataPage?.totalCount}
            showTotal={(total, range) =>
              `${range[0]}-${range[1]} trong ${total} dữ liệu`
            }
            pageSize={pageSize}
            defaultCurrent={1}
            onChange={(e) => {
              setPageIndex(e);
            }}
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

export default withAuthorization(NhomDanhMuc, "CATEGORY_MANAGEMENT");
