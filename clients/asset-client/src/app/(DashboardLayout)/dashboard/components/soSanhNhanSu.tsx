"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  Card,
  Empty,
  Select,
  Space,
  Spin,
  Typography,
  message,
} from "antd";
import {
  ArrowRightOutlined,
  FileTextOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import { useSelector } from "@/store/hooks";
import kPI_DashboardService from "@/services/kPI_Dashboard/kPI_DashboardService";
import kPI_DotTheoDoiDanhGiaService from "@/services/kPI_DotTheoDoiDanhGia/kPI_DotTheoDoiDanhGiaService";
import { DropdownOption } from "@/types/general";
import {
  NhanSuSoSanhType,
  PhamViSoSanhNhanSuType,
  PhongBanSoSanhType,
  SoSanhDiemNhanSuRequestType,
  SoSanhDiemNhanSuType,
} from "@/types/kPI_Dashboard/dto";

const { Text, Title } = Typography;

const normalizeText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const formatScore = (value: number | null | undefined) => {
  const score = Number(value ?? 0);
  return score.toFixed(2).replace(/\.?0+$/, "");
};

const getCriterionProgressWidths = (
  leftScore: number | null | undefined,
  rightScore: number | null | undefined,
  leftMaximumScore: number | null | undefined,
  rightMaximumScore: number | null | undefined = leftMaximumScore,
) => {
  const leftMaximum = Math.max(0, Number(leftMaximumScore ?? 0));
  const rightMaximum = Math.max(0, Number(rightMaximumScore ?? 0));
  const left = Math.max(0, Number(leftScore ?? 0));
  const right = Math.max(0, Number(rightScore ?? 0));

  return {
    left: leftMaximum ? `${(Math.min(left, leftMaximum) / leftMaximum) * 100}%` : "0%",
    right: rightMaximum ? `${(Math.min(right, rightMaximum) / rightMaximum) * 100}%` : "0%",
  };
};

const getDetailCriterionMaximum = (person: SoSanhDiemNhanSuType["nhanSu1"]) =>
  person?.diemHeSoLanhDao ?? person?.diemBoTieuChi;

const getInitial = (name: string | undefined) => {
  const value = name?.trim() || "?";
  return value.charAt(0).toUpperCase();
};

const toDropdownOptions = (items: PhongBanSoSanhType[]): DropdownOption[] =>
  items.map((item) => ({ label: item.name, value: item.id }));

const renderPersonnelLabel = (item: NhanSuSoSanhType) =>
  `${item.hoTen}${item.phongBanName ? ` — ${item.phongBanName}` : ""}`;

const filterOption = (input: string, option?: { label?: React.ReactNode }) =>
  normalizeText(String(option?.label ?? "")).includes(normalizeText(input));

export default function SoSanhNhanSu() {
  const currentUser = useSelector((state: any) => state.auth.User);
  const roles: string[] = currentUser?.listRole || [];
  const isCapCuc = Boolean(currentUser?.isCT || currentUser?.isPCT);
  const isCapPhong = !isCapCuc && roles.some((role) => role === "TruongPhong" || role === "PhoTruongPhong");
  const isAllowed = isCapCuc || isCapPhong;

  const [phongBanOptions, setPhongBanOptions] = useState<PhongBanSoSanhType[]>([]);
  const [dotOptions, setDotOptions] = useState<DropdownOption[]>([]);
  const [nhanSu1Options, setNhanSu1Options] = useState<NhanSuSoSanhType[]>([]);
  const [nhanSu2Options, setNhanSu2Options] = useState<NhanSuSoSanhType[]>([]);
  const [phongBan1Id, setPhongBan1Id] = useState<string>();
  const [phongBan2Id, setPhongBan2Id] = useState<string>();
  const [nhanSu1Id, setNhanSu1Id] = useState<string>();
  const [nhanSu2Id, setNhanSu2Id] = useState<string>();
  const [idDotDanhGia, setIdDotDanhGia] = useState<string>();
  const [isTheoDonViSuDung, setIsTheoDonViSuDung] = useState(false);
  const [scopeReady, setScopeReady] = useState(false);
  const [filtersLoading, setFiltersLoading] = useState(false);
  const [nhanSu1Loading, setNhanSu1Loading] = useState(false);
  const [nhanSu2Loading, setNhanSu2Loading] = useState(false);
  const [comparisonLoading, setComparisonLoading] = useState(false);
  const [comparison, setComparison] = useState<SoSanhDiemNhanSuType | null>(null);
  const comparisonRequestId = useRef(0);

  useEffect(() => {
    if (!isAllowed) return;

    let cancelled = false;
    const loadFilters = async () => {
      setFiltersLoading(true);
      try {
        const [scopeResponse, phongBanResponse, activeDots] = await Promise.all([
          isCapCuc
            ? kPI_DashboardService.getPhamViSoSanhNhanSu()
            : Promise.resolve(null),
          isCapCuc ? kPI_DashboardService.getPhongBanSoSanh() : Promise.resolve(null),
          kPI_DotTheoDoiDanhGiaService.getListDotDanhGiaDropdown(true),
        ]);

        if (cancelled) return;

        const isOrganizationScope = Boolean(
          (scopeResponse?.data as PhamViSoSanhNhanSuType | undefined)?.theoDonViSuDung,
        );
        setIsTheoDonViSuDung(isOrganizationScope);
        setScopeReady(true);
        setPhongBanOptions(
          isOrganizationScope
            ? []
            : (Array.isArray(phongBanResponse?.data) ? phongBanResponse.data : []),
        );
        setDotOptions(Array.isArray(activeDots) ? activeDots : []);
        setIdDotDanhGia((current) => current || (activeDots?.[0]?.value as string | undefined));
      } catch (error: any) {
        if (!cancelled) {
          setScopeReady(false);
          message.error(error?.message || "Không thể tải dữ liệu bộ lọc so sánh.");
        }
      } finally {
        if (!cancelled) setFiltersLoading(false);
      }
    };

    loadFilters();
    return () => {
      cancelled = true;
    };
  }, [isAllowed, isCapCuc]);

  useEffect(() => {
    if (!isCapCuc || !isTheoDonViSuDung) return;

    let cancelled = false;
    const loadOrganizationPersonnel = async () => {
      setNhanSu1Loading(true);
      setNhanSu2Loading(true);
      setPhongBan1Id(undefined);
      setPhongBan2Id(undefined);
      try {
        const response = await kPI_DashboardService.getNhanSuSoSanh();
        if (cancelled) return;

        const options = Array.isArray(response?.data) ? response.data : [];
        setNhanSu1Options(options);
        setNhanSu2Options(options);
      } catch (error: any) {
        if (!cancelled) {
          setNhanSu1Options([]);
          setNhanSu2Options([]);
          message.error(error?.message || "Không thể tải danh sách nhân sự cùng đơn vị.");
        }
      } finally {
        if (!cancelled) {
          setNhanSu1Loading(false);
          setNhanSu2Loading(false);
        }
      }
    };

    loadOrganizationPersonnel();
    return () => {
      cancelled = true;
    };
  }, [isCapCuc, isTheoDonViSuDung]);

  useEffect(() => {
    if (!isCapPhong) return;

    let cancelled = false;
    const loadCurrentDepartmentPersonnel = async () => {
      setNhanSu1Loading(true);
      setNhanSu2Loading(true);
      try {
        const response = await kPI_DashboardService.getNhanSuSoSanh();
        if (cancelled) return;

        const options = Array.isArray(response?.data) ? response.data : [];
        setNhanSu1Options(options);
        setNhanSu2Options(options);
        const currentPhongBanId = options[0]?.phongBanId;
        setPhongBan1Id(currentPhongBanId);
        setPhongBan2Id(currentPhongBanId);
      } catch (error: any) {
        if (!cancelled) {
          setNhanSu1Options([]);
          setNhanSu2Options([]);
          message.error(error?.message || "Không thể tải danh sách nhân sự.");
        }
      } finally {
        if (!cancelled) {
          setNhanSu1Loading(false);
          setNhanSu2Loading(false);
        }
      }
    };

    loadCurrentDepartmentPersonnel();
    return () => {
      cancelled = true;
    };
  }, [isCapPhong]);

  useEffect(() => {
    if (isCapPhong || isTheoDonViSuDung) return;
    if (!phongBan1Id) {
      setNhanSu1Options([]);
      setNhanSu1Id(undefined);
      return;
    }

    let cancelled = false;
    const loadPersonnel = async () => {
      setNhanSu1Loading(true);
      setNhanSu1Options([]);
      try {
        const response = await kPI_DashboardService.getNhanSuSoSanh(phongBan1Id);
        if (!cancelled) {
          setNhanSu1Options(Array.isArray(response?.data) ? response.data : []);
        }
      } catch (error: any) {
        if (!cancelled) {
          setNhanSu1Options([]);
          message.error(error?.message || "Không thể tải danh sách nhân sự.");
        }
      } finally {
        if (!cancelled) setNhanSu1Loading(false);
      }
    };

    loadPersonnel();
    return () => {
      cancelled = true;
    };
  }, [isCapPhong, isTheoDonViSuDung, phongBan1Id]);

  useEffect(() => {
    if (isCapPhong || isTheoDonViSuDung) return;
    if (!phongBan2Id) {
      setNhanSu2Options([]);
      setNhanSu2Id(undefined);
      return;
    }

    let cancelled = false;
    const loadPersonnel = async () => {
      setNhanSu2Loading(true);
      setNhanSu2Options([]);
      try {
        const response = await kPI_DashboardService.getNhanSuSoSanh(phongBan2Id);
        if (!cancelled) {
          setNhanSu2Options(Array.isArray(response?.data) ? response.data : []);
        }
      } catch (error: any) {
        if (!cancelled) {
          setNhanSu2Options([]);
          message.error(error?.message || "Không thể tải danh sách nhân sự.");
        }
      } finally {
        if (!cancelled) setNhanSu2Loading(false);
      }
    };

    loadPersonnel();
    return () => {
      cancelled = true;
    };
  }, [isCapPhong, isTheoDonViSuDung, phongBan2Id]);

  useEffect(() => {
    if (!isAllowed || !scopeReady || !idDotDanhGia) {
      if (!idDotDanhGia) setComparison(null);
      return;
    }

    let cancelled = false;
    const loadTopComparison = async () => {
      const requestId = ++comparisonRequestId.current;
      setComparisonLoading(true);
      try {
        const response = await kPI_DashboardService.getTopSoSanhDiemNhanSu(idDotDanhGia);
        if (cancelled || requestId !== comparisonRequestId.current) return;
        if (response?.status === false || !response?.data) {
          setComparison(null);
          return;
        }

        const topComparison = response.data;
        const topNhanSu1 = topComparison.nhanSu1;
        const topNhanSu2 = topComparison.nhanSu2;
        if (topNhanSu1 && topNhanSu2) {
          if (!isTheoDonViSuDung) {
            setPhongBan1Id(topNhanSu1.phongBanId);
            setPhongBan2Id(topNhanSu2.phongBanId);
          }
          setNhanSu1Id(topNhanSu1.idLyLich);
          setNhanSu2Id(topNhanSu2.idLyLich);
        }
        setComparison(topComparison);
      } catch (error: any) {
        if (!cancelled && requestId === comparisonRequestId.current) {
          setComparison(null);
          message.error(error?.message || "Không thể tự động chọn nhân sự có điểm cao nhất.");
        }
      } finally {
        if (!cancelled && requestId === comparisonRequestId.current) setComparisonLoading(false);
      }
    };

    loadTopComparison();
    return () => {
      cancelled = true;
    };
  }, [isAllowed, scopeReady, isTheoDonViSuDung, idDotDanhGia]);

  const visibleNhanSu1Options = useMemo(
    () => nhanSu1Options.filter((item) => item.idLyLich !== nhanSu2Id),
    [nhanSu1Options, nhanSu2Id],
  );
  const visibleNhanSu2Options = useMemo(
    () => nhanSu2Options.filter((item) => item.idLyLich !== nhanSu1Id),
    [nhanSu2Options, nhanSu1Id],
  );

  const canCompare = Boolean(
    (isTheoDonViSuDung || (phongBan1Id && phongBan2Id)) &&
      nhanSu1Id &&
      nhanSu2Id &&
      idDotDanhGia &&
      nhanSu1Id !== nhanSu2Id,
  );

  const handleCompare = async () => {
    if (!canCompare || !nhanSu1Id || !nhanSu2Id || !idDotDanhGia) {
      return;
    }

    const request: SoSanhDiemNhanSuRequestType = {
      phongBanNhanSu1Id: isTheoDonViSuDung ? undefined : phongBan1Id,
      phongBanNhanSu2Id: isTheoDonViSuDung ? undefined : phongBan2Id,
      idLyLichNhanSu1: nhanSu1Id,
      idLyLichNhanSu2: nhanSu2Id,
      idDotDanhGia,
    };

    const requestId = ++comparisonRequestId.current;
    setComparisonLoading(true);
    try {
      const response = await kPI_DashboardService.getSoSanhDiemNhanSu(request);
      if (requestId !== comparisonRequestId.current) return;
      if (response?.status === false || !response?.data) {
        message.error(response?.message || "Không thể tải dữ liệu so sánh.");
        return;
      }

      setComparison(response.data);
    } catch (error: any) {
      if (requestId !== comparisonRequestId.current) return;
      message.error(error?.message || "Không thể tải dữ liệu so sánh.");
    } finally {
      if (requestId === comparisonRequestId.current) setComparisonLoading(false);
    }
  };

  if (!isAllowed) return null;

  const left = comparison?.nhanSu1;
  const right = comparison?.nhanSu2;
  const criteria = comparison?.tieuChi;
  const missingIds = comparison?.thieuDuLieuNhanSuIds || [];
  const leftIsMissing = Boolean(left && missingIds.includes(left.idLyLich));
  const rightIsMissing = Boolean(right && missingIds.includes(right.idLyLich));
  const leftHigher = Number(left?.tongDiem ?? 0) > Number(right?.tongDiem ?? 0);
  const rightHigher = Number(right?.tongDiem ?? 0) > Number(left?.tongDiem ?? 0);
  const scoreDifference = Math.abs(Number(left?.tongDiem ?? 0) - Number(right?.tongDiem ?? 0));
  const resultPillClass = leftHigher
    ? "comparison-result-pill-left"
    : rightHigher
      ? "comparison-result-pill-right"
      : "comparison-result-pill-equal";
  const commonCriteriaProgress = getCriterionProgressWidths(
    left?.diemTieuChiChung,
    right?.diemTieuChiChung,
    criteria?.diemToiDaTieuChiChung,
  );
  const resultCriteriaProgress = getCriterionProgressWidths(
    left?.diemTieuChiKetQua,
    right?.diemTieuChiKetQua,
    criteria?.diemToiDaTieuChiKetQua,
  );
  const detailCriteria = [
    { key: "diemSoLuong", label: "Điểm số lượng cuối cùng" },
    { key: "diemChatLuong", label: "Điểm chất lượng cuối cùng" },
    { key: "diemTienDo", label: "Điểm tiến độ cuối cùng" },
  ] as const;
  const leftDetailCriteriaMaximum = getDetailCriterionMaximum(left);
  const rightDetailCriteriaMaximum = getDetailCriterionMaximum(right);

  const selectCommonProps = {
    showSearch: true,
    allowClear: true,
    optionFilterProp: "label",
    filterOption,
    loading: filtersLoading,
  };

  return (
    <Card
      title={
        <Space>
          <span className="text-white font-bold text-base uppercase">SO SÁNH ĐIỂM ĐÁNH GIÁ GIỮA HAI NHÂN SỰ</span>
        </Space>
      }
      headStyle={{ backgroundColor: "#0355a2", borderBottom: "none", borderRadius: "8px 8px 0 0" }}
      style={{
        marginTop: 24,
        borderRadius: 16,
        border: "none",
        boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
      }}
    >
      <div className="comparison-evaluation-field">
        <Text strong>Đợt đánh giá:</Text>
        <Select
          {...selectCommonProps}
          placeholder="Chọn đợt đánh giá"
          value={idDotDanhGia}
          options={dotOptions}
          onChange={(value) => {
            setIdDotDanhGia(value || undefined);
            if (!value) {
              setNhanSu1Id(undefined);
              setNhanSu2Id(undefined);
              setComparison(null);
            }
          }}
        />
      </div>

      <div className="comparison-groups-row">
        {isCapCuc && !isTheoDonViSuDung ? (
          <>
            <div className="comparison-personnel-group comparison-personnel-group-left">
              <div className="comparison-personnel-group-title">
                <span className="comparison-group-dot" />
                Nhân sự 1
              </div>
              <div className="comparison-group-fields">
                <div className="comparison-filter">
                  <Text strong>Phòng ban:</Text>
                  <Select
                    {...selectCommonProps}
                    placeholder="Chọn phòng ban"
                    value={phongBan1Id}
                    options={toDropdownOptions(phongBanOptions)}
                    onChange={(value) => {
                      setPhongBan1Id(value || undefined);
                      setNhanSu1Id(undefined);
                      setComparison(null);
                    }}
                  />
                </div>
                <div className="comparison-filter">
                  <Text strong>Nhân sự:</Text>
                  <Select
                    {...selectCommonProps}
                    loading={nhanSu1Loading}
                    placeholder="Chọn nhân sự"
                    value={nhanSu1Id}
                    options={visibleNhanSu1Options.map((item) => ({
                      label: renderPersonnelLabel(item),
                      value: item.idLyLich,
                    }))}
                    onChange={(value) => {
                      setNhanSu1Id(value || undefined);
                      setComparison(null);
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="comparison-versus-filter">VS</div>

            <div className="comparison-personnel-group comparison-personnel-group-right">
              <div className="comparison-personnel-group-title">
                <span className="comparison-group-dot" />
                Nhân sự 2
              </div>
              <div className="comparison-group-fields">
                <div className="comparison-filter">
                  <Text strong>Phòng ban:</Text>
                  <Select
                    {...selectCommonProps}
                    placeholder="Chọn phòng ban"
                    value={phongBan2Id}
                    options={toDropdownOptions(phongBanOptions)}
                    onChange={(value) => {
                      setPhongBan2Id(value || undefined);
                      setNhanSu2Id(undefined);
                      setComparison(null);
                    }}
                  />
                </div>
                <div className="comparison-filter">
                  <Text strong>Nhân sự:</Text>
                  <Select
                    {...selectCommonProps}
                    loading={nhanSu2Loading}
                    placeholder="Chọn nhân sự"
                    value={nhanSu2Id}
                    options={visibleNhanSu2Options.map((item) => ({
                      label: renderPersonnelLabel(item),
                      value: item.idLyLich,
                    }))}
                    onChange={(value) => {
                      setNhanSu2Id(value || undefined);
                      setComparison(null);
                    }}
                  />
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="comparison-personnel-group comparison-personnel-group-left">
              <div className="comparison-personnel-group-title">
                <span className="comparison-group-dot" />
                Nhân sự 1
              </div>
              <div className="comparison-group-fields comparison-group-fields-single">
                <div className="comparison-filter">
                  <Text strong>Nhân sự:</Text>
                  <Select
                    {...selectCommonProps}
                    loading={filtersLoading || nhanSu1Loading}
                    placeholder="Chọn nhân sự"
                    value={nhanSu1Id}
                    options={visibleNhanSu1Options.map((item) => ({
                      label: renderPersonnelLabel(item),
                      value: item.idLyLich,
                    }))}
                    onChange={(value) => {
                      setNhanSu1Id(value || undefined);
                      setComparison(null);
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="comparison-versus-filter">VS</div>

            <div className="comparison-personnel-group comparison-personnel-group-right">
              <div className="comparison-personnel-group-title">
                <span className="comparison-group-dot" />
                Nhân sự 2
              </div>
              <div className="comparison-group-fields comparison-group-fields-single">
                <div className="comparison-filter">
                  <Text strong>Nhân sự:</Text>
                  <Select
                    {...selectCommonProps}
                    loading={filtersLoading || nhanSu2Loading}
                    placeholder="Chọn nhân sự"
                    value={nhanSu2Id}
                    options={visibleNhanSu2Options.map((item) => ({
                      label: renderPersonnelLabel(item),
                      value: item.idLyLich,
                    }))}
                    onChange={(value) => {
                      setNhanSu2Id(value || undefined);
                      setComparison(null);
                    }}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="comparison-actions">
        <Button
          type="primary"
          icon={<ArrowRightOutlined />}
          disabled={!canCompare}
          loading={comparisonLoading}
          onClick={handleCompare}
          className="comparison-submit"
        >
          So sánh
        </Button>
      </div>

      {!comparison ? (
        <Empty description="Chọn đủ điều kiện và bấm So sánh để xem kết quả." />
      ) : (
        <Spin spinning={comparisonLoading}>
          <div className="comparison-result">
            <div className="comparison-people-header">
              <div className="comparison-person comparison-person-left">
                <div className="comparison-avatar comparison-avatar-left">{getInitial(left?.hoTen)}</div>
                <div>
                  <Title level={4}>{left?.hoTen || "Nhân sự 1"}</Title>
                  <Text type="secondary">{left?.phongBanName || ""}</Text>
                  {leftIsMissing && (
                    <div className="comparison-missing-warning">Chưa có phiếu đánh giá thuộc đợt đã chọn</div>
                  )}
                </div>
              </div>
              <div className="comparison-versus"><Text>So với</Text></div>
              <div className="comparison-person comparison-person-right">
                <div>
                  <Title level={4}>{right?.hoTen || "Nhân sự 2"}</Title>
                  <Text type="secondary">{right?.phongBanName || ""}</Text>
                  {rightIsMissing && (
                    <div className="comparison-missing-warning">Chưa có phiếu đánh giá thuộc đợt đã chọn</div>
                  )}
                </div>
                <div className="comparison-avatar comparison-avatar-right">{getInitial(right?.hoTen)}</div>
              </div>
            </div>

            <div className="comparison-criteria">
              <div className="comparison-criterion">
                <div className="comparison-criterion-name">
                  {criteria?.tenTieuChiChung} <span>(tối đa {formatScore(criteria?.diemToiDaTieuChiChung)})</span>
                </div>
                <div className="comparison-progress-row">
                  <span className="comparison-score comparison-score-left">
                    {formatScore(left?.diemTieuChiChung)}/{formatScore(criteria?.diemToiDaTieuChiChung)}
                  </span>
                  <div className="comparison-progress-track" aria-hidden="true">
                    <div className="comparison-progress-half comparison-progress-half-left">
                      <div
                        className="comparison-progress-segment comparison-progress-segment-left"
                        style={{ width: commonCriteriaProgress.left }}
                      />
                    </div>
                    <div className="comparison-progress-half comparison-progress-half-right">
                      <div
                        className="comparison-progress-segment comparison-progress-segment-right"
                        style={{ width: commonCriteriaProgress.right }}
                      />
                    </div>
                    <span className="comparison-progress-divider" />
                  </div>
                  <span className="comparison-score comparison-score-right">
                    {formatScore(right?.diemTieuChiChung)}/{formatScore(criteria?.diemToiDaTieuChiChung)}
                  </span>
                </div>
              </div>

              <div className="comparison-criterion">
                <div className="comparison-criterion-name">
                  {criteria?.tenTieuChiKetQua} <span>(tối đa {formatScore(criteria?.diemToiDaTieuChiKetQua)})</span>
                </div>
                <div className="comparison-progress-row">
                  <span className="comparison-score comparison-score-left">
                    {formatScore(left?.diemTieuChiKetQua)}/{formatScore(criteria?.diemToiDaTieuChiKetQua)}
                  </span>
                  <div className="comparison-progress-track" aria-hidden="true">
                    <div className="comparison-progress-half comparison-progress-half-left">
                      <div
                        className="comparison-progress-segment comparison-progress-segment-left"
                        style={{ width: resultCriteriaProgress.left }}
                      />
                    </div>
                    <div className="comparison-progress-half comparison-progress-half-right">
                      <div
                        className="comparison-progress-segment comparison-progress-segment-right"
                        style={{ width: resultCriteriaProgress.right }}
                      />
                    </div>
                    <span className="comparison-progress-divider" />
                  </div>
                  <span className="comparison-score comparison-score-right">
                    {formatScore(right?.diemTieuChiKetQua)}/{formatScore(criteria?.diemToiDaTieuChiKetQua)}
                  </span>
                </div>
              </div>

              {detailCriteria.map(({ key, label }) => {
                const detailProgress = getCriterionProgressWidths(
                  left?.[key],
                  right?.[key],
                  leftDetailCriteriaMaximum,
                  rightDetailCriteriaMaximum,
                );

                return (
                  <div className="comparison-criterion" key={key}>
                    <div className="comparison-criterion-name">
                      {label}
                    </div>
                    <div className="comparison-progress-row">
                      <span className="comparison-score comparison-score-left">
                        {formatScore(left?.[key])}/{formatScore(leftDetailCriteriaMaximum)}
                      </span>
                      <div className="comparison-progress-track" aria-hidden="true">
                        <div className="comparison-progress-half comparison-progress-half-left">
                          <div
                            className="comparison-progress-segment comparison-progress-segment-left"
                            style={{ width: detailProgress.left }}
                          />
                        </div>
                        <div className="comparison-progress-half comparison-progress-half-right">
                          <div
                            className="comparison-progress-segment comparison-progress-segment-right"
                            style={{ width: detailProgress.right }}
                          />
                        </div>
                        <span className="comparison-progress-divider" />
                      </div>
                      <span className="comparison-score comparison-score-right">
                        {formatScore(right?.[key])}/{formatScore(rightDetailCriteriaMaximum)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="comparison-total-row">
              <div>
                <Text type="secondary">Tổng điểm</Text>
                <div className="comparison-total comparison-total-left">
                  {formatScore(left?.tongDiem)}<small>/100</small>
                </div>
              </div>
              <div className="comparison-total-divider" />
              <div>
                <Text type="secondary">Tổng điểm</Text>
                <div className="comparison-total comparison-total-right">
                  {formatScore(right?.tongDiem)}<small>/100</small>
                </div>
              </div>
            </div>

            <div className={`comparison-result-pill ${resultPillClass}`}>
              <TrophyOutlined />
              {leftHigher
                ? `${left?.hoTen || "Nhân sự 1"} cao hơn ${formatScore(scoreDifference)} điểm`
                : rightHigher
                  ? `${right?.hoTen || "Nhân sự 2"} cao hơn ${formatScore(scoreDifference)} điểm`
                  : "Hai nhân sự có tổng điểm bằng nhau"}
            </div>
          </div>
        </Spin>
      )}

      <style jsx>{`
        .comparison-evaluation-field,
        .comparison-filter {
          display: flex;
          flex-direction: column;
          gap: 7px;
          min-width: 0;
        }
        .comparison-evaluation-field {
          width: min(100%, 440px);
          margin-bottom: 16px;
        }
        .comparison-filter :global(.ant-select) {
          width: 100%;
          max-width: 100%;
          min-width: 0;
        }
        .comparison-filter :global(.ant-select-selector) {
          max-width: 100%;
          min-width: 0 !important;
        }
        .comparison-filter :global(.ant-select-selection-item),
        .comparison-filter :global(.ant-select-selection-placeholder) {
          display: block;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .comparison-evaluation-field :global(.ant-select) {
          width: 100%;
        }
        .comparison-groups-row {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
          gap: 24px;
          align-items: center;
          margin-bottom: 24px;
        }
        .comparison-personnel-group {
          min-width: 0;
          padding: 18px 20px 20px;
          border: 1px solid;
          border-radius: 16px;
        }
        .comparison-personnel-group-left {
          border-color: #91caff;
          background: #f5faff;
        }
        .comparison-personnel-group-right {
          border-color: #ffccc7;
          background: #fff7f6;
        }
        .comparison-personnel-group-title {
          display: flex;
          align-items: center;
          gap: 9px;
          margin-bottom: 16px;
          font-size: 18px;
          font-weight: 700;
        }
        .comparison-personnel-group-left .comparison-personnel-group-title {
          color: #1677ff;
        }
        .comparison-personnel-group-right .comparison-personnel-group-title {
          color: #d4380d;
        }
        .comparison-group-dot {
          width: 12px;
          height: 12px;
          flex: 0 0 12px;
          border-radius: 50%;
          background: currentColor;
        }
        .comparison-group-fields {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
          min-width: 0;
        }
        .comparison-group-fields-single {
          grid-template-columns: 1fr;
        }
        .comparison-versus-filter {
          align-self: center;
          color: #8c8c8c;
          font-size: 18px;
          font-weight: 700;
          white-space: nowrap;
        }
        .comparison-actions {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-bottom: 28px;
          width: 100%;
        }
        .comparison-submit {
          height: 40px;
          padding-inline: 28px;
          white-space: nowrap;
        }
        .comparison-submit:disabled,
        .comparison-submit:global(.ant-btn-disabled) {
          color: #ffffff !important;
          background-color: #75a9d8 !important;
          border-color: #75a9d8 !important;
          opacity: 1;
        }
        .comparison-submit:disabled :global(.anticon),
        .comparison-submit:global(.ant-btn-disabled) :global(.anticon) {
          color: #ffffff !important;
        }
        .comparison-result {
          border: 1px solid #d9e2ec;
          border-radius: 16px;
          padding: 28px 32px;
          background: var(--ant-color-bg-container, #fff);
        }
        .comparison-people-header {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          gap: 28px;
          align-items: center;
          padding-bottom: 28px;
          border-bottom: 1px solid #d9d9d9;
        }
        .comparison-person {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          min-width: 0;
          text-align: center;
        }
        .comparison-person-left {
          justify-content: flex-start;
          text-align: left;
        }
        .comparison-person-right {
          justify-content: flex-end;
          text-align: right;
        }
        .comparison-person :global(.ant-typography) {
          margin: 0;
        }
        .comparison-person :global(.ant-typography-secondary) {
          display: block;
        }
        .comparison-missing-warning {
          color: #d46b08;
          font-size: 13px;
          font-weight: 600;
          line-height: 1.35;
        }
        .comparison-avatar {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 25px;
          font-weight: 700;
        }
        .comparison-avatar-left {
          color: #1677ff;
          background: #e6f4ff;
        }
        .comparison-avatar-right {
          color: #d4380d;
          background: #fff1f0;
        }
        .comparison-versus {
          font-size: 20px;
          font-weight: 600;
          color: #8c8c8c;
        }
        .comparison-criteria {
          display: flex;
          flex-direction: column;
          gap: 30px;
          padding: 28px 0 30px;
          width: 100%;
        }
        .comparison-criterion {
          display: flex;
          flex-direction: column;
          gap: 13px;
          width: 100%;
        }

        /* Biểu đồ so sánh: Cố định điểm 2 bên bám sát viền và thanh giữa giữ tâm 50% */
        .comparison-progress-row {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          min-height: 24px;
        }

        .comparison-score {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          font-size: 16px;
          font-weight: 700;
          white-space: nowrap;
          line-height: 1;
        }
        .comparison-score-left {
          left: 0;
          color: #1677ff;
          text-align: left;
        }
        .comparison-score-right {
          right: 0;
          color: #d4380d;
          text-align: right;
        }
        .comparison-criterion-name {
          text-align: center;
          font-size: 15px;
          font-weight: 700;
          color: #595959;
        }
        .comparison-criterion-name span {
          color: #8c8c8c;
          font-weight: 500;
        }

        .comparison-progress-track {
          position: relative;
          display: grid;
          grid-template-columns: 1fr 1fr;
          width: calc(100% - 200px);
          max-width: 100%;
          height: 24px;
          margin: 0 auto;
        }
        .comparison-progress-half {
          display: flex;
          min-width: 0;
          height: 100%;
        }
        .comparison-progress-half-left {
          justify-content: flex-end;
        }
        .comparison-progress-half-right {
          justify-content: flex-start;
        }
        .comparison-progress-segment {
          height: 100%;
          transition: width 180ms ease;
        }
        .comparison-progress-segment-left {
          background: #3f8edb;
          border-radius: 7px 0 0 7px;
        }
        .comparison-progress-segment-right {
          background: #dd5b34;
          border-radius: 0 7px 7px 0;
        }
        .comparison-progress-divider {
          position: absolute;
          top: -7px;
          bottom: -7px;
          left: 50%;
          width: 1px;
          transform: translateX(-50%);
          background: #8c8c8c;
        }

        .comparison-total-row {
          display: grid;
          grid-template-columns: 1fr 1px 1fr;
          gap: 32px;
          justify-items: center;
          align-items: center;
          margin-top: 14px;
          padding-top: 24px;
          border-top: 1px solid #d9d9d9;
        }
        .comparison-total {
          font-size: 42px;
          font-weight: 700;
          line-height: 1.15;
        }
        .comparison-total small {
          font-size: 22px;
          font-weight: 500;
          color: #8c8c8c;
        }
        .comparison-total-left {
          color: #1677ff;
        }
        .comparison-total-right {
          color: #d4380d;
        }
        .comparison-total-divider {
          height: 60px;
          background: #bfbfbf;
        }
        .comparison-result-pill {
          width: fit-content;
          max-width: 100%;
          margin: 26px auto 0;
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 9px 20px;
          border-radius: 999px;
          color: #0958d9;
          background: #e6f4ff;
          font-size: 16px;
          font-weight: 600;
          text-align: center;
        }
        .comparison-result-pill-left {
          color: #0958d9;
          background: #e6f4ff;
        }
        .comparison-result-pill-right {
          color: #d4380d;
          background: #fff1f0;
        }
        .comparison-result-pill-equal {
          color: #595959;
          background: #f5f5f5;
        }
        @media (max-width: 991px) {
          .comparison-evaluation-field {
            width: 100%;
          }
          .comparison-groups-row {
            grid-template-columns: minmax(0, 1fr);
            gap: 16px;
          }
          .comparison-versus-filter {
            justify-self: center;
            text-align: center;
          }
          .comparison-result {
            padding: 20px 16px;
          }
          .comparison-people-header {
            grid-template-columns: 1fr;
            gap: 16px;
          }
          .comparison-person-right,
          .comparison-person-left {
            justify-content: center;
            text-align: center;
          }
          .comparison-versus {
            text-align: center;
          }
          .comparison-progress-row {
            display: flex;
            flex-direction: column;
            gap: 8px;
            min-height: 0;
          }
          .comparison-progress-track {
            width: 100%;
            margin: 0;
          }
          .comparison-score {
            position: static;
            transform: none;
          }
          .comparison-score-left,
          .comparison-score-right,
          .comparison-criterion-name {
            text-align: center;
          }
          .comparison-total-row {
            gap: 12px;
          }
          .comparison-total {
            font-size: 32px;
          }
        }
        @media (max-width: 575px) {
          .comparison-group-fields {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </Card>
  );
}
