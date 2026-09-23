"use client";
import React, { useCallback, useEffect, useState, useMemo, useRef } from "react";
import Flex from "@/components/shared-components/Flex";
import { DropdownOption, DropdownOptionTree, ResponsePageList } from "@/types/general";
import { setIsLoading } from "@/store/general/GeneralSlice";
import { useSelector } from "@/store/hooks";
import { AppDispatch } from "@/store/store";
import {
  SearchOutlined,
  DownOutlined,
  UpOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Select,
  TreeSelect,
  Affix,
} from "antd";
import { useDispatch } from "react-redux";
import AutoBreadcrumb from "@/components/util-compenents/Breadcrumb";
import { EvaluationColumnDto, KPI_PhieuDanhGiaSearchType } from "@/types/kPI_PhieuDanhGia/kPI_PhieuDanhGia";
import { KPI_DotTheoDoiDanhGiaType } from "@/types/kPI_DotTheoDoiDanhGia/kPI_DotTheoDoiDanhGia";
import kPI_PhieuDanhGiaService from "@/services/kPI_PhieuDanhGia/kPI_PhieuDanhGiaService";
import kPI_DotTheoDoiDanhGiaService from "@/services/kPI_DotTheoDoiDanhGia/kPI_DotTheoDoiDanhGiaService";
import departmentService from "@/services/department/department.service";
import KPI_PhieuDanhGiaDetail from "../detail";
import DashboardView from "./DashboardView";
import DotDetailInfo from "./DotDetailInfo";
import TheoDoiDanhGiaPhongBanTable from "./TheoDoiDanhGiaPhongBanTable";
import KPI_BoTieuChiDonViDetail from "../../kPI_BoTieuChiDonVi/detail";
import kPI_BoTieuChiDonViService from "@/services/kPI_BoTieuChiDonVi/kPI_BoTieuChiDonViService";
import { KPI_BoTieuChiDonViType } from "@/types/kPI_BoTieuChiDonVi/kPI_BoTieuChiDonVi";
import KPI_BoTieuChiChungDetail from "../../kPI_BoTieuChiChung/detail";
import kPI_BoTieuChiChungService from "@/services/kPI_BoTieuChiChung/kPI_BoTieuChiChungService";
import { KPI_BoTieuChiChungType } from "@/types/kPI_BoTieuChiChung/kPI_BoTieuChiChung";
import { TEMPLATE } from "@/constants/ThemeConstant";

const findTreeOptionTitle = (options: DropdownOptionTree[], value?: string): string | undefined => {
  if (!value) return undefined;

  for (const option of options) {
    if (option.value === value) return option.title;
    const nestedTitle: string | undefined = findTreeOptionTitle(option.children || [], value);
    if (nestedTitle) return nestedTitle;
  }

  return undefined;
};

export interface TheoDoiDanhGiaPhongBanComponentProps {
  hideBreadcrumb?: boolean;
  isDashboard?: boolean;
  defaultDotId?: string;
  defaultPhongBanId?: string;
  defaultDashboardMode?: boolean;
  className?: string;
}

export const TheoDoiDanhGiaPhongBanComponent: React.FC<TheoDoiDanhGiaPhongBanComponentProps> = ({
  hideBreadcrumb = false,
  isDashboard = false,
  defaultDotId,
  defaultPhongBanId,
  defaultDashboardMode = false,
  className,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: any) => state.auth.User);

  const [data, setData] = useState<ResponsePageList<any>>();
  const [pageSize, setPageSize] = useState<number>(20);
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [dotOptions, setDotOptions] = useState<DropdownOption[]>([]);
  const [detailedDots, setDetailedDots] = useState<KPI_DotTheoDoiDanhGiaType[]>([]);
  const [phongBanTree, setPhongBanTree] = useState<DropdownOptionTree[]>([]);
  const [accessInfo, setAccessInfo] = useState<{
    isCT_PCT: boolean;
    isTP_PTP: boolean;
    evaluationWorkflowType?: string | null;
    visibleEvaluationColumns: EvaluationColumnDto[];
    idPhongBan?: string;
  } | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const hasLoadedInitialData = useRef<boolean>(false);
  const [isLoadedDots, setIsLoadedDots] = useState<boolean>(false);
  const [isDashboardMode, setIsDashboardMode] = useState<boolean>(
    isDashboard ? false : (defaultDotId ? false : defaultDashboardMode)
  );
  const [searchValues, setSearchValues] = useState<KPI_PhieuDanhGiaSearchType | null>(
    defaultDotId ? { idDotDanhGia: defaultDotId, phongBan: defaultPhongBanId } : null
  );
  const [pendingDotIds, setPendingDotIds] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const loading = useSelector((state) => state.general.isLoading);

  const [isOpenDetail, setIsOpenDetail] = useState<boolean>(false);
  const [currentItem, setCurentItem] = useState<any | null>(null);
  const [viewingTieuChiDonVi, setViewingTieuChiDonVi] = useState<KPI_BoTieuChiDonViType | null>(null);
  const [viewingTieuChiChung, setViewingTieuChiChung] = useState<KPI_BoTieuChiChungType | null>(null);

  useEffect(() => {
    const fetchDots = async () => {
      try {
        const dots = await kPI_DotTheoDoiDanhGiaService.getListDotDanhGiaDropdown(false, "CaNhan");
        const filteredDots = (dots || []).filter((d: any) => {
          const label = String(d.label || "").toLowerCase();
          return !label.includes("tập thể");
        });
        setDotOptions(filteredDots);

        let sortedItems: KPI_DotTheoDoiDanhGiaType[] = [];
        try {
          const resDetails = await kPI_DotTheoDoiDanhGiaService.getData({
            pageIndex: 1,
            pageSize: 50,
            type: "CaNhan",
            sortExpression: "CreatedDate DESC"
          } as any);
          if (resDetails?.data?.items) {
            sortedItems = [...resDetails.data.items]
              .filter((d: any) => d.type !== "TapThe" && !String(d.tenDotTheoDoiDanhGia || "").toLowerCase().includes("tập thể"))
              .sort((a, b) => {
                const timeA = a.thoiGianBatDau ? new Date(a.thoiGianBatDau).getTime() : 0;
                const timeB = b.thoiGianBatDau ? new Date(b.thoiGianBatDau).getTime() : 0;
                return timeB - timeA;
              });
            setDetailedDots(sortedItems);
          }
        } catch (e) {
          console.error("Lỗi lấy chi tiết đợt", e);
        }

        let targetDotId = defaultDotId;
        if (!targetDotId && sortedItems.length > 0) {
          const now = new Date().getTime();
          // Ưu tiên đợt đang diễn ra hoặc đợt mới nhất
          const currentActiveDot = sortedItems.find((d: any) => {
            const start = d.thoiGianBatDau ? new Date(d.thoiGianBatDau).getTime() : 0;
            const end = d.thoiGianKetThuc ? new Date(d.thoiGianKetThuc).getTime() : Infinity;
            return (start <= now && end >= now) || d.trangThai === "DangDanhGia";
          });
          targetDotId = currentActiveDot ? currentActiveDot.id : sortedItems[0].id;
        } else if (!targetDotId && filteredDots.length > 0) {
          targetDotId = filteredDots[0].value;
        }

        if (targetDotId) {
          setSearchValues(prev => ({ ...(prev || {}), idDotDanhGia: targetDotId }));
        }
        setIsLoadedDots(true);
      } catch (err) {
        console.error(err);
        setIsLoadedDots(true);
      }
    };

    const fetchPhongBanTree = async () => {
      try {
        const userDonViId = user?.donViSuDungId || user?.donViId || user?.idDonVi;
        const response = userDonViId
          ? await departmentService.getCurrentAndChildDropdown(userDonViId, false)
          : await departmentService.getHierarchicalDropdownList(false);
        if (response?.data) {
          setPhongBanTree(response.data);
        }
      } catch (err) {
        console.error("Không thể tải cây phòng ban:", err);
      }
    };

    const fetchPendingDots = async () => {
      if (!user?.id) return;
      try {
        const searchData = {
          pageIndex: 1,
          pageSize: 10000,
          idNguoiXuLy: user.id,
          isXuLy: false,
          isKhacHoanThanh: true,
        };
        const response = await kPI_PhieuDanhGiaService.getDotDanhGiaWithPhieu(user.id, searchData);
        if (response?.data?.items) {
          const ids = Array.from(new Set(response.data.items.map((item: any) => item.idDotDanhGia).filter(Boolean))) as string[];
          setPendingDotIds(ids);
        }
      } catch (e) {
        console.error(e);
      }
    };

    fetchDots();
    fetchPhongBanTree();
    fetchPendingDots();
  }, [user?.donViSuDungId, user?.donViId, user?.idDonVi, defaultDotId]);

  const handleViewTieuChiDonVi = async (id?: string) => {
    if (!id) return;
    dispatch(setIsLoading(true));
    try {
      const res = await kPI_BoTieuChiDonViService.getById(id);
      if (res && res.data) {
        setViewingTieuChiDonVi(res.data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  const handleViewTieuChiChung = async (id?: string) => {
    if (!id) return;
    dispatch(setIsLoading(true));
    try {
      const res = await kPI_BoTieuChiChungService.getById(id);
      if (res && res.data) {
        setViewingTieuChiChung(res.data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  const handleLoadData = useCallback(
    async (
      searchDataOverride?: KPI_PhieuDanhGiaSearchType,
      pageIndexOverride: number = pageIndex,
      pageSizeOverride: number = pageSize
    ) => {
      dispatch(setIsLoading(true));

      const activeSearch = {
        ...(searchValues || {}),
        ...(searchDataOverride || {}),
      };

      const searchData = {
        pageIndex: pageIndexOverride,
        pageSize: pageSizeOverride,
        ...activeSearch,
      };

      if (user?.id) {
        // GỌI API LẤY DANH SÁCH NHÂN SỰ VÀ THÔNG TIN PHIẾU
        const response = await kPI_PhieuDanhGiaService.getDanhSachNhanSuDanhGia(user.id, searchData);
        if (response != null && response.data != null) {
          setData(response.data);
          const firstItem = response.data.items?.[0];
          if (firstItem) {
            setAccessInfo({
              isCT_PCT: firstItem.isCT_PCT === true,
              isTP_PTP: firstItem.isTP_PTP === true,
              evaluationWorkflowType: firstItem.evaluationWorkflowType,
              visibleEvaluationColumns: firstItem.visibleEvaluationColumns || [],
              idPhongBan: firstItem.idPhongBan ?? undefined,
            });
          }
        }
      }
      dispatch(setIsLoading(false));
    },
    [dispatch, pageIndex, pageSize, searchValues, user?.id]
  );

  useEffect(() => {
    if (!isLoadedDots || !user?.id || hasLoadedInitialData.current) {
      return;
    }

    hasLoadedInitialData.current = true;
    handleLoadData();
  }, [handleLoadData, isLoadedDots, user?.id]);

  useEffect(() => {
    if (accessInfo?.isTP_PTP && accessInfo.idPhongBan && !searchValues?.phongBan) {
      setSearchValues((current) => ({
        ...(current || {}),
        phongBan: accessInfo.idPhongBan,
      }));
      setPageIndex(1);
    }
  }, [accessInfo, searchValues?.phongBan]);

  const onSelectDot = (idDot: string) => {
    setPageIndex(1);
    if (!idDot) {
      const values = { ...(searchValues || {}), idDotDanhGia: undefined };
      setSearchValues(values);
      return;
    }
    const values = { ...(searchValues || {}), idDotDanhGia: idDot };
    setSearchValues(values);
    setIsDashboardMode(false);
    handleLoadData(values, 1);
  };

  const onSelectPhongBan = (phongBanValue: string) => {
    const values = { ...(searchValues || {}), phongBan: phongBanValue || undefined };
    setSearchValues(values);
    setPageIndex(1);
  };

  const onSearch = async () => {
    setPageIndex(1);
    setHasSearched(true);
    await handleLoadData(undefined, 1);
  };

  const onChangePage = async (nextPage: number, nextPageSize: number) => {
    setPageIndex(nextPage);
    setPageSize(nextPageSize);
    if (hasSearched) {
      await handleLoadData(undefined, nextPage, nextPageSize);
    }
  };

  const organizationInfo = useMemo(() => {
    const items = data?.items || [];
    const uniqueValues = (field: "donViChuPhieu" | "phongBanChuPhieu") =>
      Array.from(
        new Set(
          items
            .map((item: any) => item[field])
            .filter((value: unknown): value is string => Boolean(value && String(value).trim()))
            .map((value: string) => value.trim())
        )
      );

    const donViNames = uniqueValues("donViChuPhieu");
    const phongBanNames = uniqueValues("phongBanChuPhieu");
    const selectedPhongBanName = findTreeOptionTitle(phongBanTree, searchValues?.phongBan);

    return {
      donVi: donViNames.join(", ") || user?.tenDonVi_txt || "-",
      phongBan: phongBanNames.join(", ") || selectedPhongBanName || "-",
    };
  }, [data?.items, phongBanTree, searchValues?.phongBan, user?.tenDonVi_txt]);

  if (isDashboardMode) {
    return <DashboardView detailedDots={detailedDots} pendingDotIds={pendingDotIds} onSelectDot={onSelectDot} />;
  }

  const selectedDot = detailedDots.find(d => d.id === searchValues?.idDotDanhGia);

  return (
    <div className={className}>
      {!hideBreadcrumb && (
        <Flex alignItems="center" justifyContent="space-between" className="mb-2">
          <AutoBreadcrumb />
        </Flex>
      )}

      <Affix offsetTop={TEMPLATE.HEADER_HEIGHT}>
        <Card
          className="customCardShadow mb-3"
          style={{ backgroundColor: '#e6f4ff', border: '1px solid #91caff' }}
          styles={{
            header: { padding: '8px 16px', minHeight: 'auto' },
            body: { padding: isExpanded ? '12px 16px' : '0px', display: isExpanded ? 'block' : 'none' }
          }}
          title={
            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
              <span style={{ color: "#0355a2", fontSize: "15px", fontWeight: "bold", textTransform: "uppercase" }}>
                Đợt đánh giá:
              </span>
              <Select
                style={{ minWidth: 260, maxWidth: 380 }}
                placeholder="Chọn đợt đánh giá"
                value={searchValues?.idDotDanhGia}
                onChange={onSelectDot}
                options={dotOptions}
                showSearch
                filterOption={(input: string, option?: any) =>
                  String(option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                }
              />
            </div>
          }
          extra={
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {(accessInfo?.isCT_PCT || accessInfo?.isTP_PTP) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 'normal', fontSize: "14px", color: "#555" }}>Phòng ban:</span>
                  <TreeSelect
                    showSearch
                    style={{ width: 250 }}
                    placeholder="Chọn phòng ban"
                    allowClear={accessInfo?.isCT_PCT}
                    disabled={accessInfo?.isTP_PTP}
                    onChange={onSelectPhongBan}
                    value={searchValues?.phongBan}
                    treeData={phongBanTree}
                    treeNodeFilterProp="title"
                    treeDefaultExpandAll={false}
                  />
                </div>
              )}
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={onSearch}
                loading={loading}
              >
                Tìm kiếm
              </Button>
              <Button
                type="text"
                icon={isExpanded ? <UpOutlined /> : <DownOutlined />}
                onClick={() => setIsExpanded(!isExpanded)}
                style={{ color: '#0355a2', fontWeight: 'bold' }}
              >
                {isExpanded ? 'Thu gọn' : 'Mở rộng'}
              </Button>
            </div>
          }
        >
          {isExpanded && (
            <DotDetailInfo
              dot={selectedDot}
              donVi={organizationInfo.donVi}
              phongBan={organizationInfo.phongBan}
              onViewTieuChiDonVi={handleViewTieuChiDonVi}
              onViewTieuChiChung={handleViewTieuChiChung}
            />
          )}
        </Card>
      </Affix>

      <TheoDoiDanhGiaPhongBanTable
        data={data}
        pageIndex={pageIndex}
        pageSize={pageSize}
        loading={loading}
        accessInfo={accessInfo}
        searchDotId={searchValues?.idDotDanhGia}
        userId={user?.id}
        onViewDetail={(item) => {
          setCurentItem(item);
          setIsOpenDetail(true);
        }}
        onPageChange={onChangePage}
      />

      {isOpenDetail && currentItem && currentItem.idPhieuDanhGia && (
        <KPI_PhieuDanhGiaDetail
          item={currentItem}
          onClose={() => setIsOpenDetail(false)}
        />
      )}

      {viewingTieuChiDonVi && (
        <KPI_BoTieuChiDonViDetail
          item={viewingTieuChiDonVi}
          onClose={() => setViewingTieuChiDonVi(null)}
        />
      )}
      {viewingTieuChiChung && (
        <KPI_BoTieuChiChungDetail
          item={viewingTieuChiChung}
          onClose={() => setViewingTieuChiChung(null)}
        />
      )}
    </div>
  );
};

export default TheoDoiDanhGiaPhongBanComponent;
