"use client";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, useMemo } from "react";
import Flex from "@/components/shared-components/Flex";
import { ResponsePageList } from "@/types/general";
import withAuthorization from "@/libs/authentication";
import { setIsLoading } from "@/store/general/GeneralSlice";
import { useSelector } from "@/store/hooks";
import { AppDispatch } from "@/store/store";
import * as extensions from "@/utils/extensions";
import { isRomanNumeral } from "@/utils/string";
import {
  CloseOutlined,
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  EyeOutlined,
  PlusCircleOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Dropdown,
  FormProps,
  MenuProps,
  Modal,
  Pagination,
  Space,
  Table,
  TableProps,
  ConfigProvider,
} from "antd";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import KPI_TieuChiChungDetail from "./detail";
import Search from "./search";
import AutoBreadcrumb from "@/components/util-compenents/Breadcrumb";
import {
  KPI_TieuChiChungSearchType,
  KPI_TieuChiChungType,
} from "@/types/kPI_TieuChiChung/kPI_TieuChiChung";
import kPI_TieuChiChungService from "@/services/kPI_TieuChiChung/kPI_TieuChiChungService";
import KPI_TieuChiChungCreateOrUpdate from "./createOrUpdate";


const KPI_TieuChiChungPage: React.FC = () => {
  const searchParams = useSearchParams();
  const idBoTieuChiChung = searchParams.get("IdBoTieuChiChung");
  const dispatch = useDispatch<AppDispatch>();
  const [data, setData] = useState<ResponsePageList<KPI_TieuChiChungType[]>>();
  const [pageSize, setPageSize] = useState<number>(20);
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [isPanelVisible, setIsPanelVisible] = useState<boolean>(false);
  const [searchValues, setSearchValues] = useState<KPI_TieuChiChungSearchType | null>(null);
  const loading = useSelector((state) => state.general.isLoading);
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [currentItem, setCurentItem] = useState<KPI_TieuChiChungType | null>(null);
  const [isOpenDetail, setIsOpenDetail] = useState<boolean>(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [defaultParentId, setDefaultParentId] = useState<string | null>(null);
  const [defaultParentName, setDefaultParentName] = useState<string | null>(null);
  const [expandedRowKeys, setExpandedRowKeys] = useState<readonly React.Key[]>([]);

  const [fullTreeData, setFullTreeData] = useState<any[]>([]);

  const fetchFullTreeData = useCallback(async () => {
    try {
      const searchParam: any = { pageIndex: 1, pageSize: 1000 };
      if (idBoTieuChiChung) {
        searchParam.idBoTieuChiChung = idBoTieuChiChung;
      }
      const response = await kPI_TieuChiChungService.getData(searchParam);
      if (response?.data?.items) {
        const itemMap: Record<string, any> = {};
        response.data.items.forEach((item) => {
          itemMap[item.id] = { ...item, children: [] };
        });
        const tree: any[] = [];
        response.data.items.forEach((item) => {
          if (item.parentId && itemMap[item.parentId]) {
            itemMap[item.parentId].children.push(itemMap[item.id]);
          } else {
            tree.push(itemMap[item.id]);
          }
        });
        const cleanEmptyChildren = (nodes: any[]) => {
          nodes.forEach((node) => {
            if (node.children.length === 0) {
              delete node.children;
            } else {
              cleanEmptyChildren(node.children);
            }
          });
        };
        cleanEmptyChildren(tree);
        setFullTreeData(tree);
      }
    } catch (err) {
      console.error("Lỗi khi tải danh sách tiêu chí:", err);
    }
  }, [idBoTieuChiChung]);

  useEffect(() => {
    fetchFullTreeData();
  }, [fetchFullTreeData]);

  useEffect(() => {
    if (data?.items) {
      setExpandedRowKeys(data.items.map(x => x.id as string));
    }
  }, [data?.items]);

  const treeData = useMemo(() => {
    if (!data?.items) return [];
    const itemMap: Record<string, any> = {};
    data.items.forEach((item) => {
      itemMap[item.id] = { ...item, children: [] };
    });

    const tree: any[] = [];
    data.items.forEach((item) => {
      if (item.parentId && itemMap[item.parentId]) {
        itemMap[item.parentId].children.push(itemMap[item.id]);
      } else {
        tree.push(itemMap[item.id]);
      }
    });

    const toRoman = (num: number): string => {
      const romanMap: [number, string][] = [
        [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"],
        [100, "C"], [90, "XC"], [50, "L"], [40, "XL"],
        [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]
      ];
      let res = "";
      for (const [val, char] of romanMap) {
        while (num >= val) {
          res += char;
          num -= val;
        }
      }
      return res || "I";
    };

    const assignStt = (nodes: any[], parentStt = "", level = 0) => {
      nodes.forEach((node, index) => {
        if (level === 0) {
          node.stt = toRoman(index + 1);
        } else if (level === 1) {
          node.stt = `${index + 1}`;
        } else {
          node.stt = parentStt ? `${parentStt}.${index + 1}` : `${index + 1}`;
        }
        if (node.children && node.children.length > 0) {
          assignStt(node.children, node.stt, level + 1);
        }
      });
    };

    assignStt(tree);

    const cleanEmptyChildren = (nodes: any[]) => {
      nodes.forEach((node) => {
        if (node.children.length === 0) {
          delete node.children;
        } else {
          cleanEmptyChildren(node.children);
        }
      });
    };

    cleanEmptyChildren(tree);
    return tree;
  }, [data?.items]);

  const tableColumns: TableProps<KPI_TieuChiChungType>["columns"] = [
    {
      title: "STT",
      dataIndex: "stt",
      key: "stt",
      align: "center",
      width: 80,
      render: (stt: any, record: any) => {
        const val = record.stt || stt;
        const isRoman = isRomanNumeral(val);
        return (
          <span
            style={{
              fontWeight: isRoman ? "bold" : "normal",
              whiteSpace: "nowrap",
              display: "inline-block",
            }}
          >
            {val}
          </span>
        );
      },
    },
    {
      title: "Tên tiêu chí chung",
      dataIndex: "ten",
      width: 350,
      render: (_: any, record: KPI_TieuChiChungType) => {
        const isRoot = !record.parentId;
        const hasChildren = (record as any).children && (record as any).children.length > 0;
        return (
          <span style={{ fontWeight: isRoot || hasChildren ? "bold" : "normal" }}>
            {record.ten}
          </span>
        );
      },
    },
    {
      title: "Tên bộ tiêu chí",
      dataIndex: "tenBoTieuChiChung",
      width: 320,
      onCell: () => ({
        style: {
          whiteSpace: "normal",
          overflowWrap: "anywhere",
          wordBreak: "break-word",
        },
      }),
      render: (_: any, record: KPI_TieuChiChungType) => (
        <span style={{ whiteSpace: "normal", overflowWrap: "anywhere" }}>
          {record.tenBoTieuChiChung || "-"}
        </span>
      ),
    },
    {
      title: "Tiêu chí cha",
      dataIndex: "tenParent",
      width: 350,
      render: (_: any, record: KPI_TieuChiChungType) => {
        if (!record.parentId) return "-";
        const parent = data?.items?.find((x) => x.id === record.parentId);
        return <span>{record.tenParent || parent?.ten || "-"}</span>;
      },
    },
    {
      title: "Điểm / Trọng số",
      dataIndex: "myProperty",
      render: (_: any, record: KPI_TieuChiChungType) => (
        <span>{record.myProperty}</span>
      ),
    },
    {
      title: "Sắp xếp",
      dataIndex: "priority",
      render: (_: any, record: KPI_TieuChiChungType) => (
        <span>{record.priority}</span>
      ),
    },
    {
      title: "Thao tác",
      dataIndex: "actions",
      fixed: "right",
      align: "center",
      render: (_: any, record: KPI_TieuChiChungType) => {
        const items: MenuProps["items"] = [
          {
            label: "Chi tiết",
            key: "2",
            icon: <EyeOutlined />,
            onClick: () => {
              setCurentItem(record);
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
            label: "Thêm tiêu chí con",
            key: "4",
            icon: <PlusCircleOutlined />,
            onClick: () => {
              handleShowModal(false, undefined, record.id, record.ten);
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
            onClick: () => setConfirmDeleteId(record.id ?? ""),
          },
        ];
        return (
          <>
            <Dropdown menu={{ items }} trigger={["click"]}>
              <Button
                onClick={(e) => e.preventDefault()}
                color="primary"

              >
                <Space>
                  Thao tác
                  <DownOutlined />
                </Space>
              </Button>
            </Dropdown>
          </>
        );
      },
    },
  ];

  const hanleCreateEditSuccess = () => {
    handleLoadData();
    fetchFullTreeData();
    setCurentItem(null);
  };

  const handleDelete = async () => {
    const response = await kPI_TieuChiChungService.delete(confirmDeleteId ?? "");
    if (response.status) {
      toast.success("Xóa thành công");
      handleLoadData();
      fetchFullTreeData();
    }
    setConfirmDeleteId(null);
  };

  const toggleSearch = () => {
    setIsPanelVisible(!isPanelVisible);
  };

  const onFinishSearch: FormProps<KPI_TieuChiChungSearchType>["onFinish"] = async (
    values
  ) => {
    try {
      setSearchValues(values);
      setPageIndex(1);
      await handleLoadData(values);
    } catch (error) {
      console.error("Lỗi khi lưu dữ liệu:", error);
    }
  };

  const handleLoadData = useCallback(
    async (searchDataOverride?: KPI_TieuChiChungSearchType) => {
      dispatch(setIsLoading(true));

      const searchData: any = {
        pageIndex: searchDataOverride ? 1 : pageIndex,
        pageSize,
        ...(searchValues || {}),
        ...(searchDataOverride || {}),
      };
      if (idBoTieuChiChung) {
        searchData.idBoTieuChiChung = idBoTieuChiChung;
      }
      const response = await kPI_TieuChiChungService.getData(searchData);
      if (response != null && response.data != null) {
        const data = response.data;
        setData(data);
      }
      dispatch(setIsLoading(false));
    },
    [dispatch, pageIndex, pageSize, searchValues, idBoTieuChiChung]
  );

  const handleShowModal = (isEdit?: boolean, item?: KPI_TieuChiChungType, defaultParentId?: string, defaultParentName?: string) => {
    setIsOpenModal(true);
    if (isEdit) {
      setCurentItem(item ?? null);
    } else {
      setCurentItem(null);
    }
    setDefaultParentId(defaultParentId ?? null);
    setDefaultParentName(defaultParentName ?? null);
  };

  const handleClose = () => {
    setIsOpenModal(false);
    setCurentItem(null);
  };

  const handleCloseDetail = () => {
    setIsOpenDetail(false);
  };

  useEffect(() => {
    handleLoadData();
  }, [handleLoadData]);

  return (
    <>
      <Flex
        alignItems="center"
        justifyContent="space-between"
        className="mb-2 "
      >
        <AutoBreadcrumb />
        <div className="btn-group">
          <Button
            onClick={() => toggleSearch()}
            type="primary"

            icon={isPanelVisible ? <CloseOutlined /> : <SearchOutlined />}
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
          {isOpenModal && (
            <KPI_TieuChiChungCreateOrUpdate
              onSuccess={hanleCreateEditSuccess}
              onClose={handleClose}
              item={currentItem}
              defaultParentId={defaultParentId}
              defaultParentName={defaultParentName}
              treeData={fullTreeData}
              idBoTieuChiChung={idBoTieuChiChung}
            />
          )}
        </div>
      </Flex>
      {isPanelVisible && (
        <Search
          onFinish={onFinishSearch}
          pageIndex={pageIndex}
          pageSize={pageSize}
          columns={tableColumns}
          treeData={fullTreeData}
        />
      )}
      {isOpenDetail && (
        <KPI_TieuChiChungDetail item={currentItem} onClose={handleCloseDetail} />
      )}

      {confirmDeleteId && (
        <Modal
          title="Xác nhận xóa"
          open={true}
          onOk={handleDelete}
          onCancel={() => setConfirmDeleteId(null)}
          okText="Xóa"
          cancelText="Hủy"
        >
          <p>Bạn có chắc chắn muốn xóa mục này?</p>
        </Modal>
      )}
      <Card className={"customCardShadow"}>
        <div className="table-responsive">
          <ConfigProvider
            theme={{
              components: {
                Table: {
                  headerBg: "#0355a2",
                  headerColor: "#ffffff",
                },
              },
            }}
          >
            <Table
              columns={tableColumns?.map((col) => ({
                ...col,
                onHeaderCell: () => ({
                  style: { textAlign: "center" },
                }),
              }))}
              bordered
              dataSource={treeData}
              rowKey="id"
              scroll={{ x: "max-content" }}
              tableLayout="fixed"
              pagination={false}
              loading={loading}
              expandable={{
                expandedRowKeys,
                onExpandedRowsChange: (keys) => setExpandedRowKeys(keys),
                expandIconColumnIndex: 1,
              }}
            />
          </ConfigProvider>
        </div>
        <Pagination
          className="mt-2"
          total={data?.totalCount}
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
      </Card>
    </>
  );
};

export default withAuthorization(KPI_TieuChiChungPage, "");
