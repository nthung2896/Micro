"use client";
import React, { useCallback, useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Flex from "@/components/shared-components/Flex";
import { ResponsePageList } from "@/types/general";
import { setIsLoading } from "@/store/general/GeneralSlice";
import { useSelector } from "@/store/hooks";
import { AppDispatch } from "@/store/store";
import {
  ArrowLeftOutlined,
  CloseOutlined,
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  EyeOutlined,
  PlusCircleOutlined,
  SearchOutlined,
  SyncOutlined,
  RightOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Dropdown,
  FormProps,
  MenuProps,
  Modal,
  Space,
  Table,
  TableProps,
  Input,
  ConfigProvider,
  Switch,
} from "antd";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import KPI_NhomTieuChiDetail from "./detail";
import Search from "./search";
import AutoBreadcrumb from "@/components/util-compenents/Breadcrumb";
import {
  KPI_NhomTieuChiSearchType,
  KPI_NhomTieuChiType,
} from "@/types/kPI_NhomTieuChi/kPI_NhomTieuChi";
import kPI_NhomTieuChiService from "@/services/kPI_NhomTieuChi/kPI_NhomTieuChiService";
import KPI_NhomTieuChiCreateOrUpdate from "./createOrUpdate";
import kPI_BoTieuChiDonViService from "@/services/kPI_BoTieuChiDonVi/kPI_BoTieuChiDonViService";

const removeAccents = (str: string) => {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
};

const HighlightText = ({ text, highlight }: { text?: string; highlight?: string }) => {
  if (!text) return null;
  if (!highlight) return <>{text}</>;

  const textStr = text.toString();
  const unaccentedText = removeAccents(textStr).toLowerCase();
  const unaccentedHighlight = removeAccents(highlight).toLowerCase();

  if (!unaccentedHighlight || unaccentedHighlight.trim() === '') return <>{textStr}</>;

  const parts = [];
  let currentIndex = 0;
  let matchIndex = unaccentedText.indexOf(unaccentedHighlight, currentIndex);

  if (matchIndex === -1) return <>{textStr}</>;

  while (matchIndex !== -1) {
    parts.push(textStr.substring(currentIndex, matchIndex));
    parts.push(
      <span key={matchIndex} style={{ backgroundColor: '#ffc069' }}>
        {textStr.substring(matchIndex, matchIndex + highlight.length)}
      </span>
    );
    currentIndex = matchIndex + highlight.length;
    matchIndex = unaccentedText.indexOf(unaccentedHighlight, currentIndex);
  }

  parts.push(textStr.substring(currentIndex));

  return <>{parts.map((part, i) => React.isValidElement(part) ? part : <React.Fragment key={i}>{part}</React.Fragment>)}</>;
};

export const KPI_NhomTieuChiTreeView = (props: any) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isModal = props?.isModal ?? false;
  const idBoTieuChiDonViParam = props?.idBoTieuChiDonVi || searchParams?.get("idBoTieuChiDonVi") || undefined;
  const dispatch = useDispatch<AppDispatch>();
  const [boTieuChiName, setBoTieuChiName] = useState<string>('');
  const [data, setData] = useState<ResponsePageList<KPI_NhomTieuChiType[]>>();
  const [pageSize, setPageSize] = useState<number>(10000); // Hinet: Fetch all for Excel view
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [isPanelVisible, setIsPanelVisible] = useState<boolean>(false);
  const [searchValues, setSearchValues] = useState<KPI_NhomTieuChiSearchType | null>(null);
  const loading = useSelector((state: any) => state.general.isLoading);
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [currentItem, setCurentItem] = useState<KPI_NhomTieuChiType | null>(null);
  const [isOpenDetail, setIsOpenDetail] = useState<boolean>(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [localSearchText, setLocalSearchText] = useState<string>("");
  const [appliedSearchText, setAppliedSearchText] = useState<string>("");
  const [elasticMatchedIds, setElasticMatchedIds] = useState<string[] | null>(null);
  const [collapsedKeys, setCollapsedKeys] = useState<Set<string>>(new Set());

  const toggleCollapse = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedKeys((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const toggleAllCollapse = (checked: boolean) => {
    if (!checked) {
      setCollapsedKeys(new Set());
    } else {
      if (data?.items) {
        const allHeaderIds = (data.items as any[])
          .filter(item => item.level === 0 || item.level === 1 || !item.parentID)
          .map(item => item.id)
          .filter(Boolean);
        setCollapsedKeys(new Set(allHeaderIds));
      }
    }
  };

  const handleLocalSearch = async (value: string) => {
    if (!value) {
      setElasticMatchedIds(null);
      setAppliedSearchText("");
      return;
    }

    dispatch(setIsLoading(true));
    try {
      const response = await kPI_NhomTieuChiService.getData({
        pageIndex: 1,
        pageSize: 10000,
        isElastic: true,
        keyword: value,
        idBoTieuChiDonVi: idBoTieuChiDonViParam,
      });
      if (response?.data?.items) {
        setElasticMatchedIds(response.data.items.map(x => x.id ?? ""));
      } else {
        setElasticMatchedIds([]);
      }
      setAppliedSearchText(value);
    } catch (err) {
      console.error(err);
      setElasticMatchedIds([]);
      setAppliedSearchText(value);
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  const flattenForExcel = (items: KPI_NhomTieuChiType[]) => {
    if (!items || !Array.isArray(items) || items.length === 0) return [];

    let clonedItems = JSON.parse(JSON.stringify(items)).filter(Boolean);

    const map: any = {};
    const roots: any[] = [];

    clonedItems.forEach((item: any) => {
      if (item && item.id != null) {
        map[item.id] = item;
        item.children = [];
      }
    });

    clonedItems.forEach((item: any) => {
      if (item && item.id != null) {
        if (item.parentID && map[item.parentID]) {
          map[item.parentID].children.push(item);
        } else {
          roots.push(item);
        }
      }
    });

    const matchNode = (node: any) => {
      if (!appliedSearchText) return true;

      const lowerSearch = removeAccents(appliedSearchText).toLowerCase();
      const matchField = (field: string) => {
        if (!field) return false;
        return removeAccents(field).toLowerCase().includes(lowerSearch);
      };

      return matchField(node.tenNhomTieuChi) ||
        matchField(node.congViecChiTiet) ||
        matchField(node.sanPhamDauRa);
    };

    const filterTree = (nodes: any[]): any[] => {
      if (!appliedSearchText) return nodes;

      const processNode = (node: any): any | null => {
        let isMatch = matchNode(node);

        let filteredChildren = [];
        if (node.children && node.children.length > 0) {
          filteredChildren = filterTree(node.children);
        }

        if (isMatch || filteredChildren.length > 0) {
          return { ...node, flatChildren: filteredChildren };
        }
        return null;
      };

      return nodes.map(processNode).filter(n => n !== null);
    };

    const filteredRoots = filterTree(roots);

    const getChildren = (node: any) => appliedSearchText ? (node.flatChildren || []) : (node.children || []);

    const getLeafCount = (node: any): number => {
      const children = getChildren(node);
      if (!children || children.length === 0) return 1;
      return children.reduce((acc: number, child: any) => acc + getLeafCount(child), 0);
    };

    let flattenedRows: any[] = [];
    let sttCounter = 1;

    const processL2List = (l2List: any[]) => {
      for (let l2 of l2List) {
        let l2Leaves = getLeafCount(l2);
        let l2FirstRow = true;

        const l2Children = getChildren(l2);
        if (!l2Children || l2Children.length === 0) {
          flattenedRows.push({
            ...l2,
            stt: sttCounter++,
            nhiemVuRowSpan: 1,
            congViecRowSpan: 1,
          });
          continue;
        }

        for (let l3 of l2Children) {
          let l3Leaves = getLeafCount(l3);
          let l3FirstRow = true;

          const l3Children = getChildren(l3);
          if (!l3Children || l3Children.length === 0) {
            flattenedRows.push({
              ...l3,
              stt: sttCounter++,
              nhiemVuRowSpan: l2FirstRow ? l2Leaves : 0,
              congViecRowSpan: 1,
              parentL2Name: l2.tenNhomTieuChi,
            });
            l2FirstRow = false;
            continue;
          }

          for (let l4 of l3Children) {
            flattenedRows.push({
              ...l4,
              stt: sttCounter++,
              nhiemVuRowSpan: l2FirstRow ? l2Leaves : 0,
              congViecRowSpan: l3FirstRow ? l3Leaves : 0,
              parentL2Name: l2.tenNhomTieuChi,
              parentL3Name: l3.congViecChiTiet || l3.tenNhomTieuChi,
            });
            l2FirstRow = false;
            l3FirstRow = false;
          }
        }
      }
    };

    for (let root of filteredRoots) {
      if (root.level === 0 || root.isHeader || (root.children && root.children.length > 0 && root.level !== 2 && root.level !== 3 && root.level !== 4 && !root.congViecChiTiet && !root.sanPhamDauRa && !root.parentID)) {
        flattenedRows.push({
          ...root,
          isHeader: true,
          isLevel0: root.level === 0 || !root.parentID,
          isLevel1: root.level === 1,
          stt: "",
          headerSuffix: `(Tổng: ${getLeafCount(root)} sản phẩm)`,
        });
        if (!collapsedKeys.has(root.id)) {
          const rootChildren = getChildren(root);
          for (let child of rootChildren) {
            if (child.level === 1 || child.isHeader || (child.children && child.children.length > 0 && child.level !== 2 && child.level !== 3 && child.level !== 4 && !child.congViecChiTiet && !child.sanPhamDauRa)) {
              flattenedRows.push({
                ...child,
                isHeader: true,
                isLevel1: true,
                stt: "",
                headerSuffix: `(Tổng: ${getLeafCount(child)} sản phẩm)`,
              });
              if (!collapsedKeys.has(child.id)) {
                processL2List(getChildren(child));
              }
            } else {
              processL2List([child]);
            }
          }
        }
      } else if (root.level === 1) {
        flattenedRows.push({
          ...root,
          isHeader: true,
          isLevel1: true,
          stt: "",
          headerSuffix: `(Tổng: ${getLeafCount(root)} sản phẩm)`,
        });
        if (!collapsedKeys.has(root.id)) {
          processL2List(getChildren(root));
        }
      } else {
        processL2List([root]);
      }
    }
    return flattenedRows.map(({ children, flatChildren, ...cleanRow }) => cleanRow);
  };

  const excelData = useMemo(() => {
    const rawItems = Array.isArray((data as any)?.items)
      ? (data as any).items
      : (Array.isArray(data) ? data : []);
    return flattenForExcel(rawItems);
  }, [data, appliedSearchText, elasticMatchedIds, collapsedKeys]);

  const totalColumns = isModal ? 8 : 9;

  const tableColumns: TableProps<any>["columns"] = [
    {
      title: "STT", width: 60,
      dataIndex: "stt",
      key: "stt",
      align: "center",
      render: (value: any, record: any) => {
        const isHeaderRow = record.isHeader || record.isLevel0 || record.isLevel1 || record.level === 0 || record.level === 1;
        if (isHeaderRow) {
          const isL0 = record.isLevel0 || record.level === 0;
          const isCollapsed = collapsedKeys.has(record.id);
          return {
            children: (
              <div
                style={{ textAlign: "left", display: "flex", width: "100%", alignItems: "center", cursor: "pointer" }}
                onClick={(e) => toggleCollapse(record.id, e)}
              >
                {isCollapsed ? <RightOutlined style={{ marginRight: 8, color: isL0 ? "#0355a2" : "#333", fontSize: "12px" }} /> : <DownOutlined style={{ marginRight: 8, color: isL0 ? "#0355a2" : "#333", fontSize: "12px" }} />}
                <b style={isL0 ? { fontSize: "16px", color: "#0355a2" } : { fontSize: "14px", color: "#333" }}>
                  <HighlightText text={record.tenNhomTieuChi} highlight={appliedSearchText} />
                  {record.headerSuffix && <span style={{ color: '#d9363e', marginLeft: 8, fontWeight: 'normal', fontStyle: 'italic' }}>{record.headerSuffix}</span>}
                </b>
              </div>
            ),
            props: { colSpan: totalColumns },
          };
        }
        return value;
      },
    },
    {
      title: "Nhiệm vụ", width: 250,
      dataIndex: "tenNhomTieuChi",
      key: "nhiemVu",
      render: (value: any, record: any) => {
        const isHeaderRow = record.isHeader || record.isLevel0 || record.isLevel1 || record.level === 0 || record.level === 1;
        if (isHeaderRow) return { props: { colSpan: 0 } };
        return {
          children: <HighlightText text={record.parentL2Name || record.tenNhomTieuChi} highlight={appliedSearchText} />,
          props: { rowSpan: record.nhiemVuRowSpan }
        };
      },
    },
    {
      title: "Công việc chi tiết", width: 250,
      dataIndex: "congViecChiTiet",
      key: "congViecChiTiet",
      render: (value: any, record: any) => {
        const isHeaderRow = record.isHeader || record.isLevel0 || record.isLevel1 || record.level === 0 || record.level === 1;
        if (isHeaderRow) return { props: { colSpan: 0 } };
        return {
          children: <HighlightText text={record.parentL3Name || record.congViecChiTiet} highlight={appliedSearchText} />,
          props: { rowSpan: record.congViecRowSpan }
        };
      },
    },
    {
      title: "Sản phẩm đầu ra", width: 300,
      dataIndex: "sanPhamDauRa",
      key: "sanPhamDauRa",
      render: (value: any, record: any) => {
        const isHeaderRow = record.isHeader || record.isLevel0 || record.isLevel1 || record.level === 0 || record.level === 1;
        if (isHeaderRow) return { props: { colSpan: 0 } };
        return <HighlightText text={value} highlight={appliedSearchText} />;
      },
    },
    {
      title: "Phân nhóm", width: 100,
      dataIndex: "phanNhom",
      key: "phanNhom",
      render: (value: any, record: any) => {
        const isHeaderRow = record.isHeader || record.isLevel0 || record.isLevel1 || record.level === 0 || record.level === 1;
        if (isHeaderRow) return { props: { colSpan: 0 } };
        return value;
      },
    },
    {
      title: "Điểm", width: 100,
      dataIndex: "diem",
      key: "diem",
      render: (value: any, record: any) => {
        const isHeaderRow = record.isHeader || record.isLevel0 || record.isLevel1 || record.level === 0 || record.level === 1;
        if (isHeaderRow) return { props: { colSpan: 0 } };
        return value;
      },
    },
    {
      title: "Hệ số", width: 100,
      dataIndex: "heSoQuyDoi",
      key: "heSoQuyDoi",
      render: (value: any, record: any) => {
        const isHeaderRow = record.isHeader || record.isLevel0 || record.isLevel1 || record.level === 0 || record.level === 1;
        if (isHeaderRow) return { props: { colSpan: 0 } };
        return value;
      },
    },

    {
      title: "Khung điểm", width: 100,
      dataIndex: "khungDiemToiDa",
      key: "khungDiemToiDa",
      render: (value: any, record: any) => {
        const isHeaderRow = record.isHeader || record.isLevel0 || record.isLevel1 || record.level === 0 || record.level === 1;
        if (isHeaderRow) return { props: { colSpan: 0 } };
        return value;
      },
    },
    {
      title: "Ghi chú", width: 200,
      dataIndex: "ghiChu",
      key: "ghiChu",
      render: (value: any, record: any) => {
        const isHeaderRow = record.isHeader || record.isLevel0 || record.isLevel1 || record.level === 0 || record.level === 1;
        if (isHeaderRow) return { props: { colSpan: 0 } };
        return value;
      },
    },
    {
      title: "Thao tác", width: 110,
      dataIndex: "actions",
      fixed: "right",
      align: "center",
      render: (_: any, record: any) => {
        const isHeaderRow = record.isHeader || record.isLevel0 || record.isLevel1 || record.level === 0 || record.level === 1;
        if (isHeaderRow) return { props: { colSpan: 0 } };
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
              <Button onClick={(e) => e.preventDefault()} type="default" >
                <Space>Thao tác<DownOutlined /></Space>
              </Button>
            </Dropdown>
          </>
        );
      },
    },
  ];

  const columnsToRender = useMemo(() => {
    if (isModal) {
      return tableColumns?.filter((col: any) => col.key !== "actions" && col.dataIndex !== "actions");
    }
    return tableColumns;
  }, [tableColumns, isModal]);

  const hanleCreateEditSuccess = () => {
    handleLoadData();
    setCurentItem(null);
  };

  const handleDelete = async () => {
    const response = await kPI_NhomTieuChiService.delete(confirmDeleteId ?? "");
    if (response.status) {
      toast.success("Xóa thành công");
      handleLoadData();
    }
    setConfirmDeleteId(null);
  };

  const toggleSearch = () => setIsPanelVisible(!isPanelVisible);

  const onFinishSearch: FormProps<KPI_NhomTieuChiSearchType>["onFinish"] = async (values) => {
    try {
      setSearchValues(values);
      await handleLoadData(values);
    } catch (error) {
      console.error("Lỗi khi lưu dữ liệu:", error);
    }
  };

  const handleLoadData = useCallback(
    async (searchDataOverride?: KPI_NhomTieuChiSearchType) => {
      dispatch(setIsLoading(true));

      const searchData = searchDataOverride || {
        pageIndex,
        pageSize,
        idBoTieuChiDonVi: idBoTieuChiDonViParam,
        ...(searchValues || {}),
      };
      const response = await kPI_NhomTieuChiService.getData(searchData);
      const resboTieuChi = idBoTieuChiDonViParam ? await kPI_BoTieuChiDonViService.getById(idBoTieuChiDonViParam) : null;
      if (resboTieuChi?.status && resboTieuChi?.data) {
        setBoTieuChiName(resboTieuChi.data.tenBoTieuChiDonVi || "");
      }
      if (response != null && response.data != null) {
        setData(response.data);
      }
      dispatch(setIsLoading(false));
    },
    [dispatch, pageIndex, pageSize, searchValues, idBoTieuChiDonViParam]
  );

  const handleShowModal = (isEdit?: boolean, item?: KPI_NhomTieuChiType) => {
    setIsOpenModal(true);
    if (isEdit) setCurentItem(item ?? null);
  };

  const handleClose = () => {
    setIsOpenModal(false);
    setCurentItem(null);
  };

  const handleSyncElastic = async () => {
    dispatch(setIsLoading(true));
    try {
      const searchData = {
        idBoTieuChiDonVi: idBoTieuChiDonViParam,
      };
      const response = await kPI_NhomTieuChiService.syncToElastic(searchData);
      if (response.status) {
        toast.success(response.message || "Đồng bộ lên Elastic thành công");
      } else {
        toast.error(response.message || "Đồng bộ lên Elastic thất bại");
      }
    } catch (error: any) {
      toast.error("Lỗi khi đồng bộ Elastic");
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  const handleCloseDetail = () => setIsOpenDetail(false);

  useEffect(() => {
    handleLoadData();
  }, [handleLoadData, idBoTieuChiDonViParam]);

  return (
    <>
      <style>{`
        .level1-row {
          background-color: #f0f2f5 !important;
        }
      `}</style>
      <Flex alignItems="center" justifyContent="space-between" className="mb-2 flex-wrap" gap={16}>
        {!isModal && <AutoBreadcrumb />}
        <Space size={4} className="btn-group flex-wrap" style={{ marginLeft: "auto" }}>
          <Input.Search
            placeholder="Tìm kiếm nhanh Elastic..."
            value={localSearchText}
            onChange={(e) => setLocalSearchText(e.target.value)}
            onSearch={handleLocalSearch}
            style={{ width: 280 }}
            allowClear
            enterButton
          />
          <Button onClick={() => toggleSearch()} type="primary" style={{ backgroundColor: "#13c2c2", borderColor: "#13c2c2" }} icon={isPanelVisible ? <CloseOutlined /> : <SearchOutlined />}>
            {isPanelVisible ? "Ẩn tìm kiếm" : "Tìm kiếm"}
          </Button>

          {!isModal && (
            <>
              <Button onClick={() => handleShowModal()} type="primary" icon={<PlusCircleOutlined />}>
                Thêm mới
              </Button>
              <Button
                type="primary" style={{ backgroundColor: "#fa8c16", borderColor: "#fa8c16" }}
                icon={<SyncOutlined />}
                onClick={handleSyncElastic}
              >
                Update to Elastic
              </Button>
            </>
          )}
          {!isModal && (
            <Link href={`/kPI_NhomTieuChi${idBoTieuChiDonViParam ? `?idBoTieuChiDonVi=${idBoTieuChiDonViParam}` : ""}`}>
              <Button>
                Về trang danh sách
              </Button>
            </Link>
          )}
          {isOpenModal && (
            <KPI_NhomTieuChiCreateOrUpdate onSuccess={hanleCreateEditSuccess} onClose={handleClose} item={currentItem} />
          )}
        </Space>
      </Flex>
      {!isModal && idBoTieuChiDonViParam && (
        <Card
          className="mb-3 customCardShadow"
          styles={{ body: { padding: "12px 16px" } }}
          style={{ borderLeft: "4px solid #722ed1", backgroundColor: "#f9f0ff" }}
        >
          <Flex justifyContent="space-between" alignItems="center" className="flex-wrap gap-2">
            <div>
              <span className="font-semibold text-base text-purple-800">
                {boTieuChiName ? (`Tree View Nhóm Tiêu Chí thuộc Bộ Tiêu Chí Đơn Vị - ${boTieuChiName}`) : "Chi tiết Bộ Tiêu Chí Đơn Vị"}
              </span>
            </div>
            <Button
              type="default"
              icon={<ArrowLeftOutlined />}
              onClick={() => router.push("/kPI_BoTieuChiDonVi")}
              style={{ fontWeight: 500 }}
            >
              Quay lại danh sách Bộ Tiêu Chí
            </Button>
          </Flex>
        </Card>
      )}
      {isPanelVisible && (
        <Search onFinish={onFinishSearch} pageIndex={pageIndex} pageSize={pageSize} />
      )}
      {isOpenDetail && (
        <KPI_NhomTieuChiDetail item={currentItem} onClose={handleCloseDetail} />
      )}

      {confirmDeleteId && (
        <Modal title="Xác nhận xóa" open={true} onOk={handleDelete} onCancel={() => setConfirmDeleteId(null)} okText="Xóa" cancelText="Hủy">
          <p>Bạn có chắc chắn muốn xóa mục này?</p>
        </Modal>
      )}
      <Card className={isModal ? "" : "customCardShadow"} styles={{ body: { padding: isModal ? "12px 0 0 0" : "24px" } }}>
        <Flex justifyContent="flex-end" className={isModal ? "mb-2 mr-4 mt-2" : "mb-2"}>
          <Space>
            <span style={{ fontWeight: 500, color: "#333" }}>Thu gọn tất cả</span>
            <Switch
              checked={collapsedKeys.size > 0}
              onChange={toggleAllCollapse}
              checkedChildren="Bật"
              unCheckedChildren="Tắt"
            />
          </Space>
        </Flex>
        <div className="table-responsive">
          <ConfigProvider
            theme={{
              components: {
                Table: {
                  headerBg: "#0355a2",
                  headerColor: "white",
                  headerBorderRadius: 0,
                },
              },
            }}
          >
            <Table
              rowClassName={(record) => (record.isLevel1 ? "level1-row" : "")}
              columns={columnsToRender}
              bordered
              dataSource={excelData}
              rowKey="id"
              scroll={{ x: "max-content", y: isModal ? "calc(75vh - 200px)" : "calc(100vh - 260px)" }}
              pagination={false}
              loading={loading}
            />
          </ConfigProvider>
        </div>
      </Card>
    </>
  );
};
