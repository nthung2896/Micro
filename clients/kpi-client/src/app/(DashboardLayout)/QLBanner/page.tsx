"use client";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { DeleteOutlined, DownOutlined, EditOutlined, PlusCircleOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Card, Dropdown, MenuProps, Pagination, Popconfirm, Space, Switch, Table, TableColumnsType, Tag, message } from "antd";
import Flex from "@/components/shared-components/Flex";
import AutoBreadcrumb from "@/components/util-compenents/Breadcrumb";
import withAuthorization from "@/libs/authentication";
import { setIsLoading } from "@/store/general/GeneralSlice";
import { useSelector } from "@/store/hooks";
import { AppDispatch } from "@/store/store";
import { ResponsePageInfo } from "@/types/general";
import { BannerDto, BannerSearch } from "@/types/banner";
import bannerService from "@/services/banner/banner.service";
import Search from "./search";
import CreateOrUpdate from "./createOrUpdate";
import classes from "./page.module.css";

const staticUrl = process.env.NEXT_PUBLIC_STATIC_FILE_BASE_URL || "";

const BannerPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [dataList, setDataList] = useState<BannerDto[]>([]);
  const [dataPage, setDataPage] = useState<ResponsePageInfo>();
  const [pageSize, setPageSize] = useState<number>(20);
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [searchValues, setSearchValues] = useState<BannerSearch | null>(null);
  const loading = useSelector((state) => state.general.isLoading);
  const [currentItem, setCurrentItem] = useState<BannerDto | null>(null);
  const [openPopconfirmId, setOpenPopconfirmId] = useState<string | null>(null);
  const [isPanelVisible, setIsPanelVisible] = useState<boolean>(false);

  const handleFetch = useCallback(
    async (s?: BannerSearch) => {
      dispatch(setIsLoading(true));
      try {
        const param = s || { pageIndex, pageSize, ...searchValues };
        const response = await bannerService.getData(param as BannerSearch);
        if (response?.status && response.data) {
          setDataList(response.data.items || []);
          setDataPage({
            pageIndex: response.data.pageIndex,
            pageSize: response.data.pageSize,
            totalCount: response.data.totalCount,
            totalPage: response.data.totalPage,
          });
        }
      } catch (error) {
        console.error("Lỗi khi load danh sách banner:", error);
      } finally {
        dispatch(setIsLoading(false));
      }
    },
    [pageIndex, pageSize, searchValues, dispatch],
  );

  const handleDelete = async (id: string) => {
    try {
      const response = await bannerService.delete(id);
      if (response.status) {
        message.success("Xóa banner thành công");
        handleFetch();
      } else {
        message.error(response.message || "Xóa banner thất bại");
      }
    } catch (error: any) {
      message.error("Có lỗi xảy ra: " + (error.message || error));
    }
  };

  const handleToggleStatus = async (record: BannerDto) => {
    try {
      const newStatus = !record.isActive;
      const response = await bannerService.updateTrangThai(record.id, newStatus);
      if (response.status) {
        message.success("Cập nhật trạng thái thành công");
        // Update local state directly to be fast and responsive
        setDataList((prevList) =>
          prevList.map((item) =>
            item.id === record.id ? { ...item, isActive: newStatus } : item
          )
        );
      } else {
        message.error(response.message || "Cập nhật trạng thái thất bại");
      }
    } catch (error: any) {
      message.error("Có lỗi xảy ra: " + (error.message || error));
    }
  };

  const getPositionTag = (position?: string | null) => {
    switch (position) {
      case "SLIDE":
        return <Tag color="blue">Slide chính</Tag>;
      case "SIDEBAR":
        return <Tag color="orange">Cột bên (Sidebar)</Tag>;
      case "FOOTER":
        return <Tag color="cyan">Chân trang (Footer)</Tag>;
      case "SLIDE_DEPT":
        return <Tag color="green">Slide chính cho sở</Tag>;
      default:
        return <Tag>{position || "Không xác định"}</Tag>;
    }
  };

  const tableColumns: TableColumnsType<BannerDto> = [
    {
      title: "STT",
      width: 60,
      align: "center",
      render: (_: any, __: any, i: number) => pageSize * (pageIndex - 1) + i + 1,
    },
    {
      title: "Ảnh",
      width: 110,
      align: "center",
      render: (_: any, record: BannerDto) => {
        if (!record.image) {
          return <div className="text-gray-300">-</div>;
        }
        const isAbsolute = record.image.startsWith("http");
        const baseUrl = staticUrl.endsWith("/") ? staticUrl.slice(0, -1) : staticUrl;
        const path = record.image.startsWith("/") ? record.image : `/${record.image}`;
        const src = isAbsolute ? record.image : `${baseUrl}${path}`;
        return (
          <img src={src} alt={record.name} className={classes.bannerThumbnail} />
        );
      },
    },
    {
      title: "Tên banner",
      dataIndex: "name",
      width: 250,
    },
    {
      title: "Vị trí",
      dataIndex: "position",
      width: 160,
      align: "center",
      render: (v: string) => getPositionTag(v),
    },
    {
      title: "Đường dẫn liên kết",
      dataIndex: "link",
      width: 200,
      render: (v: string) => v ? <a href={v} target="_blank" rel="noreferrer" className="text-blue-500 underline truncate max-w-[180px] inline-block">{v}</a> : "-",
    },
    {
      title: "Thứ tự",
      dataIndex: "sortOrder",
      width: 90,
      align: "center",
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      width: 120,
      align: "center",
      render: (isActive: boolean, record: BannerDto) => (
        <Switch
          checked={isActive}
          onChange={() => handleToggleStatus(record)}
          checkedChildren="Bật"
          unCheckedChildren="Tắt"
        />
      ),
    },
    {
      title: "Thao tác",
      width: 120,
      align: "center",
      fixed: "right",
      render: (_: any, record: BannerDto) => {
        const items: MenuProps["items"] = [
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
            onClick: () => setOpenPopconfirmId(record.id),
          },
        ];

        return (
          <>
            <Dropdown menu={{ items }} trigger={["click"]}>
              <Button onClick={(e) => e.preventDefault()} type="text">
                <Space>
                  Thao tác
                  <DownOutlined />
                </Space>
              </Button>
            </Dropdown>
            <Popconfirm
              title="Bạn chắc chắn muốn xóa banner này?"
              okText="Xóa"
              cancelText="Hủy"
              open={openPopconfirmId === record.id}
              onConfirm={() => {
                handleDelete(record.id);
                setOpenPopconfirmId(null);
              }}
              onCancel={() => setOpenPopconfirmId(null)}
            />
          </>
        );
      },
    },
  ];

  const handleSearch = (values: BannerSearch) => {
    const sValues = {
      keyword: values.keyword,
      position: values.position,
      isActive: values.isActive,
      pageIndex: 1,
      pageSize,
    };
    setSearchValues(sValues);
    setPageIndex(1);
  };

  const handleResetSearch = () => {
    setSearchValues(null);
    setPageIndex(1);
  };

  useEffect(() => {
    handleFetch();
  }, [handleFetch]);

  return (
    <>
      <Flex alignItems="center" justifyContent="space-between" style={{ marginBottom: 10 }}>
        <AutoBreadcrumb />
      </Flex>

      <Flex justifyContent="flex-end" style={{ marginBottom: 10, gap: 8 }}>
        <Button
          icon={<SearchOutlined />}
          onClick={() => setIsPanelVisible(!isPanelVisible)}
        >
          Tìm kiếm
        </Button>
        <Button
          color="green" variant="solid"
          icon={<PlusCircleOutlined />}
          onClick={() => {
            setCurrentItem(null);
            setIsOpenModal(true);
          }}
        >
          Thêm mới
        </Button>
      </Flex>

      {isPanelVisible && (
        <Search
          onFinish={handleSearch}
          onReset={handleResetSearch}
        />
      )}

      <Card bodyStyle={{ padding: 12 }}>
        <Table<BannerDto>
          columns={tableColumns}
          bordered
          dataSource={dataList}
          rowKey="id"
          scroll={{ x: 1000 }}
          pagination={false}
          loading={loading}
        />
        <Flex justifyContent="flex-end" style={{ marginTop: 16 }}>
          <Pagination
            total={dataPage?.totalCount || 0}
            current={pageIndex}
            pageSize={pageSize}
            showSizeChanger
            showTotal={(t, r) => `${r[0]}-${r[1]} trong ${t} banner`}
            onChange={(p, s) => {
              setPageIndex(p);
              if (s !== pageSize) {
                setPageSize(s);
              }
            }}
          />
        </Flex>
      </Card>

      <CreateOrUpdate
        isOpen={isOpenModal}
        bannerItem={currentItem}
        onClose={() => {
          setIsOpenModal(false);
          setCurrentItem(null);
        }}
        onSuccess={() => {
          handleFetch();
        }}
      />
    </>
  );
};

export default withAuthorization(BannerPage, "");
