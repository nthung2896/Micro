import React, { useMemo, useState } from "react";
import { Card, Col, Row, Tag, Tabs, Collapse, Input, Select, Tooltip } from "antd";
import Flex from "@/components/shared-components/Flex";
import { KPI_DotTheoDoiDanhGiaType } from "@/types/kPI_DotTheoDoiDanhGia/kPI_DotTheoDoiDanhGia";
import KPI_BoTieuChiChungDetail from "../../kPI_BoTieuChiChung/detail";
import KPI_BoTieuChiDonViDetail from "../../kPI_BoTieuChiDonVi/detail";
import kPI_BoTieuChiChungService from "@/services/kPI_BoTieuChiChung/kPI_BoTieuChiChungService";
import kPI_BoTieuChiDonViService from "@/services/kPI_BoTieuChiDonVi/kPI_BoTieuChiDonViService";
import { KPI_BoTieuChiChungType } from "@/types/kPI_BoTieuChiChung/kPI_BoTieuChiChung";
import { KPI_BoTieuChiDonViType } from "@/types/kPI_BoTieuChiDonVi/kPI_BoTieuChiDonVi";

interface Props {
  detailedDots: KPI_DotTheoDoiDanhGiaType[];
  pendingDotIds?: string[];
  onSelectDot: (id: string) => void;
}

const DashboardView: React.FC<Props> = ({ detailedDots, pendingDotIds, onSelectDot }) => {
  const [dashboardSearchText, setDashboardSearchText] = useState<string>('');
  const [selectedYearFilter, setSelectedYearFilter] = useState<number | null>(null);

  const [viewingTieuChiChung, setViewingTieuChiChung] = useState<KPI_BoTieuChiChungType | null>(null);
  const [viewingTieuChiDonVi, setViewingTieuChiDonVi] = useState<KPI_BoTieuChiDonViType | null>(null);

  const handleViewTieuChiChung = async (e: React.MouseEvent, id?: string) => {
    e.stopPropagation();
    if (!id) return;
    try {
      const res = await kPI_BoTieuChiChungService.getById(id);
      if (res.status && res.data) {
        setViewingTieuChiChung(res.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleViewTieuChiDonVi = async (e: React.MouseEvent, id?: string) => {
    e.stopPropagation();
    if (!id) return;
    try {
      const res = await kPI_BoTieuChiDonViService.getById(id);
      if (res.status && res.data) {
        setViewingTieuChiDonVi(res.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // --- BỘ LỌC TÌM KIẾM ---
  // Lọc danh sách đợt đánh giá dựa trên từ khoá tìm kiếm ở ô Input
  // Từ khoá sẽ được tìm trong: Tên đợt, Tên bộ tiêu chí chung, Tên bộ tiêu chí đơn vị/nhiệm vụ
  const filteredDots = useMemo(() => {
    if (!dashboardSearchText) return detailedDots;
    const lower = dashboardSearchText.toLowerCase();
    return detailedDots.filter(d =>
      d.tenDotTheoDoiDanhGia?.toLowerCase().includes(lower) ||
      (d.defaultTieuChiChungName && d.defaultTieuChiChungName.toLowerCase().includes(lower)) ||
      (d.defaultTieuChiDonViName && d.defaultTieuChiDonViName.toLowerCase().includes(lower))
    );
  }, [detailedDots, dashboardSearchText]);

  // --- LOGIC NHÓM DỮ LIỆU (GROUPING) ---
  // Nhóm các đợt đánh giá đã lọc theo cấu trúc: Năm -> Quý -> Tháng -> Danh sách đợt
  const groupedDots = useMemo(() => {
    const groups: Record<number, Record<number, Record<number, KPI_DotTheoDoiDanhGiaType[]>>> = {};

    filteredDots.forEach(dot => {
      // 1. Xác định Năm: Ưu tiên thuộc tính 'nam', nếu không có thì lấy năm từ 'thoiGianBatDau'
      const year = dot.nam || (dot.thoiGianBatDau ? new Date(dot.thoiGianBatDau).getFullYear() : 0);

      let quarter = dot.quy || 0;
      let month = dot.thang || 0;

      // 2. Xác định Quý (nếu thiếu):
      // - Nếu có tháng mà không có quý, tự động tính Quý = Tháng / 3 (làm tròn lên)
      // - Nếu không có cả tháng, tính Quý dựa vào tháng của 'thoiGianBatDau'
      if (!quarter && month) {
        quarter = Math.ceil(month / 3);
      } else if (!quarter && dot.thoiGianBatDau) {
        quarter = Math.ceil((new Date(dot.thoiGianBatDau).getMonth() + 1) / 3);
      }

      // 3. Xác định Tháng (nếu thiếu): Lấy tháng từ 'thoiGianBatDau'
      if (!month && dot.thoiGianBatDau) {
        month = new Date(dot.thoiGianBatDau).getMonth() + 1;
      }

      // 4. Khởi tạo cấu trúc object lồng nhau nếu chưa tồn tại
      if (!groups[year]) groups[year] = {};
      if (!groups[year][quarter]) groups[year][quarter] = {};
      if (!groups[year][quarter][month]) groups[year][quarter][month] = [];

      // 5. Đẩy đợt đánh giá vào đúng nhóm (Năm -> Quý -> Tháng)
      groups[year][quarter][month].push(dot);
    });
    return groups;
  }, [filteredDots]);

  const years = Object.keys(groupedDots).map(Number).sort((a, b) => b - a);
  const displayYears = selectedYearFilter ? years.filter(y => y === selectedYearFilter) : years;

  return (
    <div style={{ padding: '8px 0 24px 0' }}>
      <h2 style={{ margin: 0, color: "#0355a2", textTransform: 'uppercase', fontSize: 18, fontWeight: 700, marginBottom: 16 }}>CHỌN ĐỢT ĐÁNH GIÁ ĐỂ THEO DÕI</h2>

      {/* KHỐI TÌM KIẾM */}
      <Card
        size="small"
        style={{ marginBottom: 24, borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 8px', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 600, color: '#475569', fontSize: 15 }}>🔍 Lọc và Tìm kiếm:</span>
          <Select
            allowClear
            placeholder="Lọc theo năm"
            style={{ width: 180 }}
            value={selectedYearFilter}
            onChange={setSelectedYearFilter}
            options={years.map(y => ({ label: y > 0 ? `Năm ${y}` : 'Năm Khác', value: y }))}
          />
          <Input.Search
            placeholder="Tìm kiếm đợt đánh giá (tên, bộ tiêu chí)..."
            allowClear
            onChange={e => setDashboardSearchText(e.target.value)}
            style={{ maxWidth: 500, flex: 1 }}
          />
        </div>
      </Card>

      {displayYears.length === 0 ? (
        <div style={{ textAlign: "center", color: "#888", padding: 40 }}>Chưa có dữ liệu đợt đánh giá</div>
      ) : (
        <Tabs
          defaultActiveKey={displayYears[0]?.toString()}
          items={displayYears.map(year => {
            const quarters = Object.keys(groupedDots[year]).map(Number).sort((a, b) => b - a);
            const pendingYearDots = quarters.reduce((accQuarter, quarter) => {
              return accQuarter + Object.keys(groupedDots[year][quarter]).reduce((accMonth, month) => {
                return accMonth + groupedDots[year][quarter][Number(month)].filter(dot => pendingDotIds?.includes(dot.id as string)).length;
              }, 0);
            }, 0);
            return {
              key: year.toString(),
              label: (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontWeight: 600, fontSize: 15 }}>{year > 0 ? `Năm ${year}` : 'Năm Khác'}</span>
                  {pendingYearDots > 0 && (
                    <span style={{ background: '#ef4444', color: '#fff', fontSize: '12px', fontWeight: 'bold', padding: '0 6px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '20px', height: '20px', animation: 'blink-animation 1.5s infinite', boxShadow: '0 0 5px rgba(239, 68, 68, 0.5)' }}>
                      {pendingYearDots}
                    </span>
                  )}
                </div>
              ),
              children: (
                <div style={{ padding: '12px 0' }}>
                  <Collapse
                    defaultActiveKey={quarters.length > 0 ? [quarters[0].toString()] : []}
                    accordion
                    size="large"
                    bordered={false}
                    expandIconPosition="end"
                    style={{ backgroundColor: 'transparent' }}
                    items={quarters.map(quarter => {
                      const months = Object.keys(groupedDots[year][quarter]).map(Number).sort((a, b) => b - a);
                      const totalQuarterDots = months.reduce((acc, m) => acc + groupedDots[year][quarter][m].length, 0);
                      const pendingQuarterDots = months.reduce((acc, m) => {
                        return acc + groupedDots[year][quarter][m].filter(dot => pendingDotIds?.includes(dot.id as string)).length;
                      }, 0);
                      return {
                        key: quarter.toString(),
                        label: (
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingRight: 16 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <span style={{ fontSize: 18, color: '#0355a2', fontWeight: 700, textTransform: 'uppercase' }}>
                                {quarter > 0 ? `🎯 QUÝ ${quarter}` : '📋 CÁC ĐỢT KHÁC'}
                              </span>
                              {pendingQuarterDots > 0 && (
                                <span style={{ fontSize: 14, color: '#ef4444', fontWeight: 600, background: '#fef2f2', padding: '2px 12px', borderRadius: 16, border: '1px solid #fca5a5' }}>
                                  {pendingQuarterDots} cần xử lý
                                </span>
                              )}
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <span style={{ fontSize: 14, color: '#0355a2', fontWeight: 600, background: '#dbeafe', padding: '2px 12px', borderRadius: 16 }}>
                                {totalQuarterDots} đợt
                              </span>
                            </div>
                          </div>
                        ),
                        style: {
                          marginBottom: 20,
                          background: '#f0f7ff',
                          borderRadius: 12,
                          border: '1px solid #bae0ff',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                          overflow: 'hidden'
                        },
                        children: (
                          <div style={{ padding: '16px', background: '#fff', margin: '-16px -16px -16px -16px', borderTop: '1px solid #bae0ff' }}>
                            {months.map(month => {
                              const pendingMonthDots = groupedDots[year][quarter][month].filter(dot => pendingDotIds?.includes(dot.id as string)).length;
                              return (
                                <div key={month} style={{ marginBottom: 24 }}>
                                  {month > 0 ? (
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                                      <div style={{ background: '#e0e7ff', color: '#4338ca', padding: '4px 12px', borderRadius: 16, fontWeight: 600, fontSize: 13 }}>
                                        Tháng {month}
                                      </div>
                                      <div style={{ flex: 1, height: 1, background: '#e2e8f0', marginLeft: 12 }}></div>
                                      <div style={{ display: 'flex', gap: '8px', marginLeft: 12, alignItems: 'center' }}>
                                        {pendingMonthDots > 0 && (
                                          <div style={{ color: '#ef4444', fontSize: 13, fontWeight: 600 }}>{pendingMonthDots} cần xử lý</div>
                                        )}
                                        <div style={{ color: '#64748b', fontSize: 13, fontWeight: 500 }}>{groupedDots[year][quarter][month].length} đợt</div>
                                      </div>
                                    </div>
                                  ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                                      <div style={{ flex: 1, height: 1, background: '#e2e8f0' }}></div>
                                      <div style={{ display: 'flex', gap: '8px', marginLeft: 12, alignItems: 'center' }}>
                                        {pendingMonthDots > 0 && (
                                          <div style={{ color: '#ef4444', fontSize: 13, fontWeight: 600 }}>{pendingMonthDots} cần xử lý</div>
                                        )}
                                        <div style={{ color: '#64748b', fontSize: 13, fontWeight: 500 }}>{groupedDots[year][quarter][month].length} đợt</div>
                                      </div>
                                    </div>
                                  )}
                                  <Row gutter={[24, 24]}>
                                    {groupedDots[year][quarter][month].map(dot => {
                                      const isActive = dot.trangThai === "ACTIVE" || dot.trangThai === "Đang hoạt động";
                                      const isPending = pendingDotIds?.includes(dot.id as string);

                                      return (
                                        <Col span={12} lg={8} xl={8} key={dot.id}>
                                          <Card
                                            hoverable
                                            onClick={() => onSelectDot(dot.id as string)}
                                            style={{
                                              borderRadius: 12,
                                              borderTop: isPending ? "4px solid #ef4444" : (isActive ? "4px solid #52c41a" : "4px solid #d9d9d9"),
                                              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                                              height: "100%",
                                              display: "flex",
                                              flexDirection: "column",
                                              backgroundColor: isPending ? "#fef2f2" : "#ffffff",
                                            }}
                                            bodyStyle={{ flex: 1, display: "flex", flexDirection: "column" }}
                                          >
                                            <div style={{ fontSize: 16, fontWeight: 'bold', color: '#1e293b', marginBottom: 12 }}>
                                              {dot.tenDotTheoDoiDanhGia}
                                            </div>
                                            <div style={{ fontSize: 13, color: '#555', marginBottom: 12 }}>
                                              <b>Thời gian:</b> {dot.thoiGianBatDau ? new Date(dot.thoiGianBatDau).toLocaleDateString("vi-VN") : "---"} - {dot.thoiGianKetThuc ? new Date(dot.thoiGianKetThuc).toLocaleDateString("vi-VN") : "---"}
                                            </div>

                                            {dot.defaultTieuChiChungName && (
                                              <div style={{ fontSize: 12, color: '#888', marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={dot.defaultTieuChiChungName}>
                                                • Tiêu chí chung: <span
                                                  style={{ color: '#0891b2', cursor: 'pointer', textDecoration: 'underline' }}
                                                  onClick={(e) => handleViewTieuChiChung(e, dot.defaultTieuChiChung)}
                                                >
                                                  {dot.defaultTieuChiChungName}
                                                </span>
                                              </div>
                                            )}
                                            {dot.defaultTieuChiDonViName && (
                                              <div style={{ fontSize: 12, color: '#888', marginBottom: 12, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={dot.defaultTieuChiDonViName}>
                                                • Nhiệm vụ: <span
                                                  style={{ color: '#0355a2', cursor: 'pointer', textDecoration: 'underline' }}
                                                  onClick={(e) => handleViewTieuChiDonVi(e, dot.defaultTieuChiDonVi)}
                                                >
                                                  {dot.defaultTieuChiDonViName}
                                                </span>
                                              </div>
                                            )}

                                            <div style={{ marginTop: 'auto', paddingTop: 16 }}>
                                              {isActive ? <Tag color="success">Đang hoạt động</Tag> : <Tag color="default">Đã đóng</Tag>}
                                              {isPending && <Tag color="error" style={{ fontWeight: 600, animation: 'blink-animation 1.5s infinite' }}>Cần xử lý</Tag>}
                                              {dot.thang ? <Tag color="processing">Tháng {dot.thang}</Tag> : null}
                                              {dot.quy ? <Tag color="warning">Quý {dot.quy}</Tag> : null}
                                              {dot.nam ? <Tag color="purple">Năm {dot.nam}</Tag> : null}
                                            </div>
                                          </Card>
                                        </Col>
                                      );
                                    })}
                                  </Row>
                                </div>
                              );
                            })}
                          </div>
                        )
                      }
                    })}
                  />
                </div>
              )
            }
          })}
        />
      )}

      {viewingTieuChiChung && (
        <KPI_BoTieuChiChungDetail item={viewingTieuChiChung} onClose={() => setViewingTieuChiChung(null)} />
      )}
      {viewingTieuChiDonVi && (
        <KPI_BoTieuChiDonViDetail item={viewingTieuChiDonVi} onClose={() => setViewingTieuChiDonVi(null)} />
      )}
      <style>{`
        @keyframes blink-animation {
          0% { opacity: 1; }
          50% { opacity: 0.3; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default DashboardView;
