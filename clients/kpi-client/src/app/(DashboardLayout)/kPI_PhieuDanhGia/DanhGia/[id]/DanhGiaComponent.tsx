"use client";
import "./DanhGia.css";
import React, { useEffect, useState, useMemo } from "react";
import { Card, Table, Typography, Button, Space, InputNumber, Row, Col, Input, Alert } from "antd";
import { ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons";
import { useRouter, useSearchParams } from "next/navigation";
import AutoBreadcrumb from "@/components/util-compenents/Breadcrumb";
import kPI_TieuChiChungService from "@/services/kPI_TieuChiChung/kPI_TieuChiChungService";
import kPI_LyLich2CService from "@/services/kPI_LyLich2C/kPI_LyLich2CService";
import kPI_DotTheoDoiDanhGiaService from "@/services/kPI_DotTheoDoiDanhGia/kPI_DotTheoDoiDanhGiaService";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import kPI_TieuChiChung_DiemSoService from "@/services/kPI_TieuChiChung_DiemSo/kPI_TieuChiChung_DiemSoService";
import kPI_PhieuDanhGiaService from "@/services/kPI_PhieuDanhGia/kPI_PhieuDanhGiaService";

const { Title, Text } = Typography;

export type DanhGiaPageProps = {
  params?: { id: string };
  searchParams?: any;
  extraSectionIContent?: React.ReactNode;
  hideSaveButton?: boolean;
  saveRef?: React.MutableRefObject<any>;
  hideHeader?: boolean;
  idPhieu?: string;
  idDot?: string;
  idLyLich?: string;
  isModal?: boolean;
  viewOnly?: boolean;
  silentSave?: boolean;
  vaiTroDanhGia?: string;
};

export default function DanhGiaComponent({
  params,
  searchParams: sp,
  extraSectionIContent,
  hideSaveButton,
  saveRef,
  hideHeader,
  idPhieu: idPhieuProp,
  idDot: idDotProp,
  idLyLich: idLyLichProp,
  isModal,
  viewOnly = false,
  silentSave = false,
}: DanhGiaPageProps) {
  const router = useRouter();
  const user = useSelector((state: any) => state.auth.User);
  const [treeData, setTreeData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [lyLichInfo, setLyLichInfo] = useState<any>(null);
  const [hasLoadedLyLich, setHasLoadedLyLich] = useState(false);
  const [dotDanhGiaInfo, setDotDanhGiaInfo] = useState<any>(null);
  const [phieuDanhGiaInfo, setPhieuDanhGiaInfo] = useState<any>(null);
  const [expandedKeys, setExpandedKeys] = useState<readonly React.Key[]>([]);
  const searchParams = useSearchParams();
  const effectiveIdPhieu = idPhieuProp || searchParams?.get("idPhieu") || searchParams?.get("idPhieuDanhGia");
  const effectiveIdDot = idDotProp || params?.id || searchParams?.get("idDotDanhGia");

  const isReadOnly = viewOnly || Boolean(phieuDanhGiaInfo?.trangThai && phieuDanhGiaInfo.trangThai !== "KhoiTao" && phieuDanhGiaInfo.trangThai !== "TraVe");

  const [uuDiem, setUuDiem] = useState("");
  const [hanChe, setHanChe] = useState("");
  const [yKienNhanXet, setYKienNhanXet] = useState("");
  const [diemThucHienNhiemVu, setDiemThucHienNhiemVu] = useState<number>(0);

  const totalTieuChiChung = useMemo(() => {
    return Object.values(scores).reduce((sum, score) => sum + (Number(score) || 0), 0);
  }, [scores]);

  const formatDisplayScore = (value: any) => {
    if (value === null || value === undefined || value === "") return "";
    const numberValue = Number(value);
    if (!Number.isFinite(numberValue)) return String(value);
    return Number(numberValue.toFixed(2)).toString();
  };

  useEffect(() => {
    const targetIdLyLich = idLyLichProp || user?.idLyLich || user?.lyLichId || user?.id;
    if ((targetIdLyLich && effectiveIdDot) || effectiveIdPhieu) {
      fetchData();
    }
  }, [user, effectiveIdDot, effectiveIdPhieu, idLyLichProp]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let targetIdLyLich = idLyLichProp || user?.idLyLich || user?.lyLichId || user?.id;

      if (effectiveIdPhieu) {
        const resPhieu = await kPI_PhieuDanhGiaService.getById(effectiveIdPhieu);
        if (resPhieu?.data) {
          const phieu = resPhieu.data;
          setPhieuDanhGiaInfo(phieu);
          setUuDiem(phieu.uuDiem || "");
          setHanChe(phieu.hanChe || "");
          setYKienNhanXet(phieu.yKienNhanXet || "");
          setDiemThucHienNhiemVu(phieu.diemThucHienNhiemVu || 0);
          if (phieu.idLyLich) {
            targetIdLyLich = phieu.idLyLich;
          }
        }
      } else if (effectiveIdDot) {
        const res = await kPI_PhieuDanhGiaService.getData({
          pageIndex: 1,
          pageSize: 1,
          idLyLich: targetIdLyLich,
          idDotDanhGia: effectiveIdDot
        });
        if (res?.data?.items?.length > 0) {
          const phieu = res.data.items[0];
          setPhieuDanhGiaInfo(phieu);
          setUuDiem(phieu.uuDiem || "");
          setHanChe(phieu.hanChe || "");
          setYKienNhanXet(phieu.yKienNhanXet || "");
          setDiemThucHienNhiemVu(phieu.diemThucHienNhiemVu || 0);
        }
      }

      await Promise.all([
        fetchCriteria(targetIdLyLich, effectiveIdDot || undefined, effectiveIdPhieu || undefined),
        fetchLyLich(targetIdLyLich),
        fetchDotDanhGia(effectiveIdDot || undefined)
      ]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLyLich = async (targetId: string) => {
    if (targetId) {
      setHasLoadedLyLich(false);
      setLyLichInfo(null);
      try {
        // targetId là Id của bản ghi lý lịch (KPI_LyLich2C.Id), không phải UserId.
        // Khi xem phiếu của người khác, gọi GetByUserId khiến không tìm thấy lý lịch
        // và phần header rơi vào fallback thông tin của người đang đăng nhập.
        const res = await kPI_LyLich2CService.getById(targetId);
        if (res && res.data) {
          setLyLichInfo(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setHasLoadedLyLich(true);
      }
    }
  };

  const fetchDotDanhGia = async (targetDotId?: string | null) => {
    const dotId = targetDotId || effectiveIdDot;
    if (dotId) {
      try {
        const res = await kPI_DotTheoDoiDanhGiaService.getById(dotId);
        if (res && res.data) {
          setDotDanhGiaInfo(res.data);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const fetchCriteria = async (targetIdLyLich: string, targetDotId?: string | null, targetPhieuId?: string | null) => {
    setLoading(true);
    try {
      const dotId = targetDotId || effectiveIdDot || "";
      const phieuId = targetPhieuId || effectiveIdPhieu || undefined;
      const res = await kPI_TieuChiChungService.getTreeDataForDot(
        dotId,
        targetIdLyLich,
        phieuId
      );
      if (res && res.data) {
        const tree = res.data;

        const allIds: string[] = [];
        const loadedScores: Record<string, number> = {};

        const extractData = (nodes: any[]) => {
          nodes.forEach((node) => {
            allIds.push(node.id);
            if (node.diemTuCham !== undefined && node.diemTuCham !== null) {
              loadedScores[node.id] = node.diemTuCham;
            }
            if (node.children && node.children.length > 0) {
              extractData(node.children);
            }
          });
        };
        extractData(tree);

        setExpandedKeys(allIds);
        setTreeData(tree);
        setScores(loadedScores);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleScoreChange = (id: string, value: number | null) => {
    setScores((prev) => ({ ...prev, [id]: value || 0 }));
  };

  const handleSave = async () => {
    const idLyLich = idLyLichProp || phieuDanhGiaInfo?.idLyLich || user?.idLyLich || user?.lyLichId || user?.id;
    const targetDotId = idDotProp || params?.id;
    if (!idLyLich || !targetDotId) {
      toast.error("Không đủ thông tin để lưu!");
      return { error: true, message: "Không đủ thông tin để lưu phiếu đánh giá!", section: "section1" };
    }

    const scoresToSave = Object.keys(scores)
      .filter(key => scores[key] !== undefined && scores[key] !== null)
      .map(key => ({
        idTieuChiChung: key,
        diemTuCham: scores[key]
      }));

    try {
      setLoading(true);
      const response = await kPI_TieuChiChung_DiemSoService.saveScores({
        idLyLich: idLyLich,
        idDotDanhGia: targetDotId,
        uuDiem: uuDiem,
        hanChe: hanChe,
        yKienNhanXet: yKienNhanXet,
        diemTieuChiChung: totalTieuChiChung,
        tongDiem: totalTieuChiChung + diemThucHienNhiemVu,
        scores: scoresToSave
      });

      if (response.status) {
        if (!silentSave) {
          toast.success("Lưu đánh giá thành công!");
        }
        // SaveScores tạo/lấy phiếu trước nên trả về ID để luồng lưu nhiệm vụ
        // phía sau dùng đúng phiếu ngay từ lần lưu đầu tiên.
        return response.data || true;
      } else {
        if (!silentSave) {
          toast.error(response.message || "Lưu đánh giá thất bại!");
        }
        return { error: true, message: response.message || "Lưu tiêu chí chung thất bại!", section: "section1" };
      }
    } catch (error) {
      console.error(error);
      if (!silentSave) {
        toast.error("Đã xảy ra lỗi khi lưu đánh giá.");
      }
      return { error: true, message: "Đã xảy ra lỗi khi lưu tiêu chí chung.", section: "section1" };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (saveRef) {
      saveRef.current = handleSave;
    }
  }, [saveRef, handleSave]);

  const attachTaskScoreChange = (element: React.ReactElement<any>): React.ReactElement<any> => {
    const children = element.props?.children;

    if (React.Children.count(children) === 0) {
      return React.cloneElement(element, {
        onTaskScoreChange: setDiemThucHienNhiemVu,
      });
    }

    const renderedChildren = React.Children.map(children, (child) =>
      React.isValidElement(child)
        ? attachTaskScoreChange(child as React.ReactElement<any>)
        : child,
    );

    return React.cloneElement(element, undefined, renderedChildren);
  };

  const renderedExtraSectionIContent = React.isValidElement(extraSectionIContent)
    ? attachTaskScoreChange(extraSectionIContent as React.ReactElement<any>)
    : extraSectionIContent;

  const columns = [
    {
      title: "TT",
      dataIndex: "stt",
      key: "stt",
      align: "center" as const,
      width: 80,
      render: (text: string, record: any) => {
        const hasChildren = record.children && record.children.length > 0;
        return <span style={{ fontWeight: hasChildren ? "bold" : "normal", whiteSpace: "nowrap" }}>{text}</span>;
      }
    },
    {
      title: "Tiêu chí chấm điểm",
      dataIndex: "ten",
      key: "ten",
      render: (text: string, record: any) => {
        const hasChildren = record.children && record.children.length > 0;
        return <span style={{ fontWeight: hasChildren ? "bold" : "normal" }}>{text}</span>;
      }
    },
    {
      title: "Điểm tối đa",
      dataIndex: "myProperty",
      key: "maxScore",
      align: "center" as const,
      width: 100,
      render: (text: any, record: any) => {
        const hasChildren = record.children && record.children.length > 0;
        return <span style={{ fontWeight: hasChildren ? "bold" : "normal" }}>{text}</span>;
      }
    },
    {
      title: "Điểm do cá nhân tự chấm",
      key: "selfScore",
      align: "center" as const,
      width: 140,
      render: (_: any, record: any) => {
        const hasChildren = record.children && record.children.length > 0;
        if (hasChildren) {
          return null;
        }
        return (
          <InputNumber
            min={0}
            max={record.myProperty ? parseFloat(record.myProperty) : 100}
            value={scores[record.id] || 0}
            disabled={isReadOnly}
            onChange={(val) => handleScoreChange(record.id, val)}
            style={{ width: "100%" }}
            className="[&_input]:!text-center"
          />
        );
      },
    },
  ];
  const headerStickyTop = isModal ? "0px" : "56px";
  const tableHeaderTop = isModal ? "44px" : "100px";
  const isViewingSpecificPhieu = Boolean(idLyLichProp || effectiveIdPhieu || phieuDanhGiaInfo?.idLyLich);
  const profileFallback = isViewingSpecificPhieu
    ? (hasLoadedLyLich ? "Chưa cập nhật" : "Đang tải dữ liệu...")
    : undefined;
  const phieuDonVi = phieuDanhGiaInfo?.tenPhongBan
    ? [phieuDanhGiaInfo.tenPhongBan, phieuDanhGiaInfo.tenDonVi].filter(Boolean).join(" - ")
    : phieuDanhGiaInfo?.tenDonVi;
  const lyLichDonVi = lyLichInfo?.phongBanName
    ? [lyLichInfo.phongBanName, lyLichInfo.donViSuDungName].filter(Boolean).join(" - ")
    : lyLichInfo?.donViSuDungName;

  return (
    <div className={isModal ? "bg-gray-50" : ""} style={{ padding: 0 }}>


      {!hideHeader && (
        <div className="mb-2">
          <AutoBreadcrumb />
        </div>
      )}
      <Card className="customCardShadow" style={{ marginBottom: 20 }}>
        {!hideHeader && (
          <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
            <Col>
              <Button icon={<ArrowLeftOutlined />} onClick={() => router.back()}>
                Quay lại
              </Button>
            </Col>
          </Row>
        )}
        {isReadOnly && !viewOnly && (
          <Alert
            type="warning"
            showIcon
            message="Phiếu đánh giá đã bắt đầu luồng luân chuyển, bạn chỉ có thể xem chi tiết mà không thể chỉnh sửa."
            style={{ marginBottom: 20 }}
          />
        )}
        <div style={{ textAlign: "center", marginBottom: 0 }}>
          <Title level={3} style={{ color: "#0355a2", textTransform: "uppercase", marginBottom: 10 }}>PHIẾU THEO DÕI, ĐÁNH GIÁ CÔNG CHỨC</Title>
          <Text italic>(Kỳ theo dõi, đánh giá: <strong>{dotDanhGiaInfo?.tenDotTheoDoiDanhGia || "..........."}</strong>)</Text>
        </div>
        <div style={{ fontSize: 16 }}>
          <p style={{ marginBottom: 8 }}><strong>Họ và tên:</strong> {lyLichInfo?.hoTen || phieuDanhGiaInfo?.hoTen || profileFallback || user?.name || "Chưa cập nhật"}</p>
          <p style={{ marginBottom: 8 }}><strong>Chức vụ, chức danh:</strong> {lyLichInfo?.chucVuHienTaiName || lyLichInfo?.chucDanh || lyLichInfo?.chucVuHienTai || profileFallback || user?.tenChucVu || "Chưa cập nhật"}</p>
          <p style={{ marginBottom: 0 }}><strong>Đơn vị công tác:</strong> {lyLichDonVi || phieuDonVi || profileFallback || user?.tenDonVi_txt || "Chưa cập nhật"}</p>
        </div>
      </Card>

      <div style={{ position: "relative", marginBottom: 0, "--table-header-top-section1": tableHeaderTop } as React.CSSProperties}>
        <div style={{
          position: "sticky",
          top: headerStickyTop,
          zIndex: 99,
          height: "44px",
          boxSizing: "border-box",
          background: "linear-gradient(135deg, #0355a2 0%, #0077cc 100%)",
          color: "#fff",
          padding: "0 8px",
          fontSize: "15px",
          fontWeight: "700",
          borderRadius: "0",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.12)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "2px solid #4096ff",
          textTransform: "uppercase",
          letterSpacing: "0.5px"
        }}>
          <span>I. KẾT QUẢ THEO DÕI, ĐÁNH GIÁ THEO TIÊU CHÍ CHUNG</span>
        </div>

        {treeData.length > 0 ? (
          <Table
            className="table_component expand-table-body-section1"
            columns={columns}
            dataSource={treeData}
            rowKey="id"
            pagination={false}
            bordered
            size="small"
            loading={loading}
            scroll={{ y: 1 }}
            expandable={{
              expandedRowKeys: expandedKeys,
              onExpandedRowsChange: (keys) => setExpandedKeys(keys),
              expandIconColumnIndex: 1,
            }}
            components={{
              header: {
                cell: (props: any) => (
                  <th {...props} style={{ ...props.style, textAlign: 'center', background: '#0355a2', color: '#fff', border: '1px solid #3b82f6', padding: '8px 4px', fontSize: '13px', fontWeight: 600 }}>
                    {props.children}
                  </th>
                ),
              },
            }}
            summary={(pageData) => {
              let totalMaxScore = 0;
              pageData.forEach((record: any) => {
                totalMaxScore += parseFloat(record.myProperty || "0");
              });
              let totalSelfScore = 0;
              Object.values(scores).forEach((val) => {
                totalSelfScore += (val || 0);
              });
              return (
                <Table.Summary.Row style={{ backgroundColor: "#fafafa", fontWeight: "bold" }}>
                  <Table.Summary.Cell index={0} colSpan={2} align="center">
                    Tổng cộng
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1} align="center">
                    {formatDisplayScore(totalMaxScore)}
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2} align="center">
                    {formatDisplayScore(totalSelfScore)}
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              );
            }}
          />
        ) : (
          <Table
            className="table_component expand-table-body-section1"
            columns={columns}
            dataSource={[]}
            rowKey="id"
            pagination={false}
            bordered
            size="small"
            loading={loading}
            scroll={{ y: 1 }}
            components={{
              header: {
                cell: (props: any) => (
                  <th {...props} style={{ ...props.style, textAlign: 'center', background: '#0355a2', color: '#fff', border: '1px solid #3b82f6', padding: '8px 4px', fontSize: '13px', fontWeight: 600 }}>
                    {props.children}
                  </th>
                ),
              },
            }}
          />
        )}
        {extraSectionIContent && (
          <div style={{ marginTop: "20px" }}>
            {renderedExtraSectionIContent}
          </div>
        )}
      </div>

      <div style={{ position: "relative", marginBottom: 0 }}>
        <div style={{
          position: "sticky",
          top: headerStickyTop,
          zIndex: 99,
          height: "44px",
          boxSizing: "border-box",
          background: "linear-gradient(135deg, #0355a2 0%, #0077cc 100%)",
          color: "#fff",
          padding: "0 8px",
          fontSize: "15px",
          fontWeight: "700",
          borderRadius: "0",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.12)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "2px solid #4096ff",
          textTransform: "uppercase",
          letterSpacing: "0.5px"
        }}>
          <span>II. TỔNG HỢP KẾT QUẢ THEO DÕI, ĐÁNH GIÁ CÔNG CHỨC</span>
        </div>

        <Card className="shadow-sm border-slate-200" style={{ borderRadius: "0 0 8px 8px", borderTop: "none" }}>
          <div style={{ marginTop: 15 }}>
            <p><strong>1. Điểm tiêu chí chung:</strong> {formatDisplayScore(totalTieuChiChung)}/30</p>
            <p><strong>2. Điểm tiêu chí kết quả thực hiện nhiệm vụ:</strong> {formatDisplayScore(diemThucHienNhiemVu)}/70</p>
            <p><strong>3. Tổng điểm theo dõi, đánh giá công chức:</strong> {formatDisplayScore(totalTieuChiChung + diemThucHienNhiemVu)}/100</p>
          </div>
          <div style={{ marginTop: 15 }}>
            <p><strong>4. Ưu điểm, kết quả đạt được:</strong></p>
            <Input.TextArea
              rows={4}
              value={uuDiem}
              disabled={isReadOnly}
              onChange={(e) => setUuDiem(e.target.value)}
              placeholder="Nhập ưu điểm, kết quả đạt được..."
            />
          </div>
          <div style={{ marginTop: 15 }}>
            <p><strong>5. Tồn tại, hạn chế và nguyên nhân:</strong></p>
            <Input.TextArea
              rows={4}
              value={hanChe}
              disabled={isReadOnly}
              onChange={(e) => setHanChe(e.target.value)}
              placeholder="Nhập tồn tại, hạn chế và nguyên nhân..."
            />
          </div>
          <div style={{ marginTop: 15 }}>
            <p><strong>6. Đề xuất, kiến nghị (nếu có):</strong></p>
            <Input.TextArea
              rows={4}
              value={yKienNhanXet}
              disabled={isReadOnly}
              onChange={(e) => setYKienNhanXet(e.target.value)}
              placeholder="Nhập đề xuất, kiến nghị..."
            />
          </div>
          {!isReadOnly && !hideSaveButton && (
            <div style={{ textAlign: "right", marginTop: 20 }}>
              <Button type="primary" icon={<SaveOutlined />} onClick={handleSave} size="large" style={{ fontWeight: 600, padding: "0 30px" }}>
                Lưu phiếu đánh giá
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
