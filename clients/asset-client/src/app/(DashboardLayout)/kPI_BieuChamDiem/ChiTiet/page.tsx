"use client";
import React, { useEffect, useState } from "react";
import { Table, Card, Typography, Button, Alert, Spin } from "antd";
import { ArrowLeftOutlined, EyeOutlined } from "@ant-design/icons";
import { useSearchParams, useRouter } from "next/navigation";
import departmentService from "@/services/department/department.service";
import kPI_DotTheoDoiDanhGiaService from "@/services/kPI_DotTheoDoiDanhGia/kPI_DotTheoDoiDanhGiaService";
import kPI_NhiemVuService from "@/services/kPI_NhiemVu/kPI_NhiemVuService";
import kPI_PhieuDanhGiaService from "@/services/kPI_PhieuDanhGia/kPI_PhieuDanhGiaService";
import TypeNhiemVuConstant from "@/constants/TypeNhiemVuConstant";
import { useSelector } from "react-redux";
import ModalXemBoTieuChi from "../ModalXemBoTieuChi";

const { Title } = Typography;

const TABLE_COMPONENTS = {
  header: {
    cell: (props: any) => (
      <th {...props} style={{ ...props.style, textAlign: 'center', background: '#2256c0', color: '#fff', border: '1px solid #3b82f6', borderBottom: 'none' }}>
        {props.children}
      </th>
    ),
  },
  body: {
    cell: (props: any) => (
      <td {...props} style={{ ...props.style, border: '1px solid #e2e8f0', padding: '16px 12px' }}>
        {props.children}
      </td>
    ),
  },
};

const formatDisplayScore = (value: any) => {
  if (value === null || value === undefined || value === "") return "";
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) return String(value);
  return Number(numberValue.toFixed(2)).toString();
};

export default function ChiTietBieuChamDiemPage(props: any) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentUser = useSelector((state: any) => state.auth.User);

  const [loading, setLoading] = useState<boolean>(true);
  const [tenDonVi, setTenDonVi] = useState<string>("");
  const [tenDotDanhGia, setTenDotDanhGia] = useState<string>("");
  const [selectedDot, setSelectedDot] = useState<string | null>(null);
  const [viewBoTieuChiModalVisible, setViewBoTieuChiModalVisible] = useState(false);
  const [nhiemVuHeThong, setNhiemVuHeThong] = useState<any[]>([]);
  const [nhiemVuPhatSinh, setNhiemVuPhatSinh] = useState<any[]>([]);
  const [chucVuHeSo, setChucVuHeSo] = useState<number | null>(null);
  const [tenChucVuLanhDao, setTenChucVuLanhDao] = useState<string>("");

  const [kqLinhVucPercent, setKqLinhVucPercent] = useState<number>(100);
  const [knToChucPercent, setKnToChucPercent] = useState<number>(100);
  const [nlTapHopPercent, setNlTapHopPercent] = useState<number>(100);

  const queryIdPhieu = props.idPhieuDanhGia || searchParams.get("idPhieuDanhGia") || searchParams.get("idPhieu");
  const queryIdDot = props.idDotDanhGia || searchParams.get("idDotDanhGia");
  const propIdLyLich = props.idLyLich;

  useEffect(() => {
    const loadData = async () => {
      if (!queryIdPhieu && !(propIdLyLich && queryIdDot)) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        let idLyLich = propIdLyLich;
        let idDot = queryIdDot;
        let donViId = currentUser?.donViId || currentUser?.departmentId;

        if (queryIdPhieu) {
          const resPhieu = await kPI_PhieuDanhGiaService.getById(queryIdPhieu);
          const phieuData = resPhieu?.data;
          if (phieuData?.idLyLich) idLyLich = phieuData.idLyLich;
          if (phieuData?.idDotDanhGia) idDot = phieuData.idDotDanhGia;
          if (phieuData?.donVi) donViId = phieuData.donVi;
        }

        if (idDot) {
          setSelectedDot(idDot);
          try {
            const options = await kPI_DotTheoDoiDanhGiaService.getListDotDanhGiaDropdown();
            const matchDot = options.find((x: any) => x.value === idDot);
            if (matchDot) setTenDotDanhGia(matchDot.label);
          } catch (err) {
            console.error(err);
          }
        }

        if (donViId) {
          try {
            const resDonVi = await departmentService.get(donViId);
            if (resDonVi?.data) setTenDonVi(resDonVi.data.name || "");
          } catch (err) {
            console.error(err);
          }
        }

        // 2. Lấy danh sách nhiệm vụ từ idLyLich và idDot của phiếu đánh giá
        if (idLyLich && idDot) {
          const [resHeThong, resPhatSinh] = await Promise.all([
            kPI_NhiemVuService.getNhiemVuByTypeAndLyLich(idLyLich, TypeNhiemVuConstant.HETHONG, idDot),
            kPI_NhiemVuService.getNhiemVuByTypeAndLyLich(idLyLich, TypeNhiemVuConstant.PHATSINH, idDot)
          ]);
          if (resHeThong?.data) setNhiemVuHeThong(resHeThong.data);
          if (resPhatSinh?.data) setNhiemVuPhatSinh(resPhatSinh.data);
        }

        // 3. Lấy kết quả thực hiện đã lưu
        if (idLyLich && idDot) {
          const resKetQua = await kPI_NhiemVuService.getKetQuaThucHien(queryIdPhieu, idDot, idLyLich);
          if (resKetQua?.status && resKetQua?.data) {
            if (resKetQua.data.ketQuaLinhVucPhanTram !== null && resKetQua.data.ketQuaLinhVucPhanTram !== undefined) {
              setKqLinhVucPercent(resKetQua.data.ketQuaLinhVucPhanTram);
            }
            if (resKetQua.data.khaNangToChucPhanTram !== null && resKetQua.data.khaNangToChucPhanTram !== undefined) {
              setKnToChucPercent(resKetQua.data.khaNangToChucPhanTram);
            }
            if (resKetQua.data.nangLucTapHopPhanTram !== null && resKetQua.data.nangLucTapHopPhanTram !== undefined) {
              setNlTapHopPercent(resKetQua.data.nangLucTapHopPhanTram);
            }
          }
        }

        // 4. Lấy snapshot/cấu hình hệ số theo nhân sự của phiếu đánh giá
        if (queryIdPhieu && idDot) {
          try {
            const resHeSo = await kPI_NhiemVuService.getHeSoLanhDaoApDung(queryIdPhieu, idDot);
            const heSoData = resHeSo?.status ? resHeSo.data : null;
            setTenChucVuLanhDao(heSoData?.tenChucVu || heSoData?.chucVuCode || "");
            setChucVuHeSo(heSoData?.coApDungHeSo && heSoData?.heSo !== null && heSoData?.heSo !== undefined
              ? Number(heSoData.heSo)
              : null);
          } catch (err) {
            console.error("Lỗi lấy cấu hình hệ số:", err);
          }
        } else {
          setChucVuHeSo(null);
          setTenChucVuLanhDao("");
        }
      } catch (error) {
        console.error("Lỗi khi tải chi tiết biểu chấm điểm:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [queryIdPhieu, queryIdDot, currentUser, propIdLyLich]);

  const formatPercent = (val: any) => {
    if (val === null || val === undefined || val === "") return "";
    let num = Number(val);
    if (isNaN(num)) return val;
    if (num < 0) num = 0;
    return `${formatDisplayScore(num)}%`;
  };

  const getProductScoreValues = (product: any, fallbackBaseScore?: number) => {
    const diemBoTieuChi = Number(product?.diemTheoBoTieuChi ?? fallbackBaseScore ?? 0);
    const diemCoSo = chucVuHeSo !== null ? diemBoTieuChi * chucVuHeSo : diemBoTieuChi;
    const soLuongHoanThanh = Number(product?.chamDiemSoLuong_HoanThanh ?? 0);
    const soLuongKhongHoanThanh = Math.max(0, diemCoSo - soLuongHoanThanh);
    const soLanKhongDat = Number(product?.chamDiemChatLuong_KhongDat ?? 0);
    const chatLuongConLai = Math.max(0, diemCoSo - soLanKhongDat * 0.25 * diemCoSo);
    const soLanCham = Number(product?.chamDiemTienDo_KhongDat ?? 0);
    const tienDoConLai = Math.max(0, diemCoSo - soLanCham * 0.25 * diemCoSo);

    return {
      diemBoTieuChi,
      diemCoSo,
      diemHeSo: chucVuHeSo !== null ? diemCoSo : null,
      soLuongHoanThanh,
      soLuongKhongHoanThanh,
      soLuongPhanTram: diemCoSo ? (soLuongHoanThanh / diemCoSo) * 100 : 0,
      soLanKhongDat,
      chatLuongConLai,
      chatLuongPhanTram: diemCoSo ? (chatLuongConLai / diemCoSo) * 100 : 0,
      soLanCham,
      tienDoConLai,
      tienDoPhanTram: diemCoSo ? (tienDoConLai / diemCoSo) * 100 : 0,
    };
  };

  const mapNhiemVuToTableItems = (nv: any, index: number, sttPrefix: string) => {
    const products = nv.danhSachDauRa && nv.danhSachDauRa.length > 0 ? nv.danhSachDauRa : [{}];
    return products.map((sp: any, i: number) => {
      const scores = getProductScoreValues(sp, i === 0 ? nv.diemBoTieuChi : undefined);
      return ({
        key: `item-${nv.id || 'view'}-${index}-${i}`,
        stt: `${sttPrefix}${index + 1}`,
        mieuTa: nv.tenNhiemVuDayDu || nv.tenNhiemVuRutGon || "",
        sanPham: sp.tenSanPhamDauRa || (i === 0 ? nv.ketQuaXuLyMoiNhat || "" : ""),
        canCu: sp.tenTieuChi || (nv.boTieuChiList?.[i] || (i === 0 ? nv.boTieuChiList?.join(', ') : "")) || sp.tieuChiId || "",
        diemBoTieuChi: formatDisplayScore(sp.diemTheoBoTieuChi ?? (i === 0 ? nv.diemBoTieuChi : "") ?? ""),
        diemHeSo: formatDisplayScore(scores.diemHeSo),
        slHoanThanh: formatDisplayScore(sp.chamDiemSoLuong_HoanThanh ?? ""),
        slKhongHoanThanh: formatDisplayScore(scores.soLuongKhongHoanThanh),
        slDiemPhanTram: formatPercent(scores.soLuongPhanTram),
        clSoLanKhongDat: formatDisplayScore(sp.chamDiemChatLuong_KhongDat ?? ""),
        clDiemConLai: formatDisplayScore(scores.chatLuongConLai),
        clDiemPhanTram: formatPercent(scores.chatLuongPhanTram),
        tdSoLanCham: formatDisplayScore(sp.chamDiemTienDo_KhongDat ?? ""),
        tdDiemConLai: formatDisplayScore(scores.tienDoConLai),
        tdDiemPhanTram: formatPercent(scores.tienDoPhanTram),
        ghiChu: sp.ghiChuGiaTrinh || (i === 0 ? nv.ghiChuGiaTrinh : ""),
        rowSpan: i === 0 ? products.length : 0,
      });
    });
  };

  const renderTotalRow = (key: string, title: React.ReactNode, items: any[]) => {
    const allProducts = items.flatMap(item => (item.danhSachDauRa && item.danhSachDauRa.length > 0)
      ? item.danhSachDauRa
      : [{ diemTheoBoTieuChi: item.diemBoTieuChi }]);
    const productScores = allProducts.map((product) => getProductScoreValues(product, product.diemTheoBoTieuChi));
    const sumCanCu = productScores.reduce((sum, score) => sum + score.diemBoTieuChi, 0);
    const sumBoTieuChi = sumCanCu;
    const sumHeSo = chucVuHeSo !== null ? productScores.reduce((sum, score) => sum + score.diemCoSo, 0) : 0;

    const sumSlHoanThanh = productScores.reduce((sum, score) => sum + score.soLuongHoanThanh, 0);
    const sumSlKhongHoanThanh = productScores.reduce((sum, score) => sum + score.soLuongKhongHoanThanh, 0);

    const sumClKhongDat = productScores.reduce((sum, score) => sum + score.soLanKhongDat, 0);
    const sumClConLai = productScores.reduce((sum, score) => sum + score.chatLuongConLai, 0);

    const sumTdCham = productScores.reduce((sum, score) => sum + score.soLanCham, 0);
    const sumTdConLai = productScores.reduce((sum, score) => sum + score.tienDoConLai, 0);

    const baseDiem = chucVuHeSo !== null ? sumHeSo : sumBoTieuChi;

    const slDiemPhanTram = baseDiem ? Math.max(0, (sumSlHoanThanh / baseDiem) * 100) : 0;
    const clDiemPhanTram = baseDiem ? Math.max(0, (sumClConLai / baseDiem) * 100) : 0;
    const tdDiemPhanTram = baseDiem ? Math.max(0, (sumTdConLai / baseDiem) * 100) : 0;

    return {
      key,
      stt: <strong style={{ textAlign: "center", display: "block" }}>{title}</strong>,
      mieuTa: "",
      sanPham: "",
      canCu: <strong>{formatDisplayScore(sumCanCu)}</strong>,
      diemBoTieuChi: <strong>{formatDisplayScore(sumBoTieuChi)}</strong>,
      ...(chucVuHeSo !== null ? { diemHeSo: <strong>{formatDisplayScore(sumHeSo)}</strong> } : {}),
      slHoanThanh: <strong>{formatDisplayScore(sumSlHoanThanh)}</strong>,
      slKhongHoanThanh: <strong>{formatDisplayScore(sumSlKhongHoanThanh)}</strong>,
      slDiemPhanTram: <strong>{baseDiem ? formatPercent(slDiemPhanTram) : ""}</strong>,
      clSoLanKhongDat: <strong>{formatDisplayScore(sumClKhongDat)}</strong>,
      clDiemConLai: <strong>{formatDisplayScore(sumClConLai)}</strong>,
      clDiemPhanTram: <strong>{baseDiem ? formatPercent(clDiemPhanTram) : ""}</strong>,
      tdSoLanCham: <strong>{formatDisplayScore(sumTdCham)}</strong>,
      tdDiemConLai: <strong>{formatDisplayScore(sumTdConLai)}</strong>,
      tdDiemPhanTram: <strong>{baseDiem ? formatPercent(tdDiemPhanTram) : ""}</strong>,
    };
  };

  const columns = React.useMemo<any[]>(() => [
    {
      title: "STT",
      dataIndex: "stt",
      key: "stt",
      width: 80,
      align: "center",
      render: (text: any, record: any) => {
        if (record.key?.startsWith('group-total')) {
          return { children: text, props: { colSpan: 3 } };
        }
        return { children: <strong style={{ whiteSpace: "nowrap" }}>{text}</strong>, props: { colSpan: 1, rowSpan: record.rowSpan ?? 1 } };
      },
    },
    {
      title: "Miêu tả công việc",
      dataIndex: "mieuTa",
      key: "mieuTa",
      width: 200,
      render: (text: any, record: any) => {
        if (record.key?.startsWith('group-total')) {
          return { props: { colSpan: 0 } };
        }
        return { children: text, props: { rowSpan: record.rowSpan ?? 1 } };
      },
    },
    {
      title: "Sản phẩm đầu ra",
      dataIndex: "sanPham",
      key: "sanPham",
      width: 200,
      render: (text: any, record: any) => {
        if (record.key?.startsWith('group-total')) {
          return { props: { colSpan: 0 } };
        }
        return text;
      },
    },
    {
      title: "Căn cứ chấm theo Bộ tiêu chí",
      dataIndex: "canCu",
      key: "canCu",
      width: 150,
      align: "center",
    },
    {
      title: "Điểm theo Bộ tiêu chí",
      dataIndex: "diemBoTieuChi",
      key: "diemBoTieuChi",
      width: 100,
      align: "center",
    },
    ...(chucVuHeSo !== null ? [{
      title: `Điểm theo hệ số lãnh đạo (${tenChucVuLanhDao || 'Lãnh đạo'} = ${formatDisplayScore(chucVuHeSo)} x Điểm Bộ tiêu chí)`,
      dataIndex: "diemHeSo",
      key: "diemHeSo",
      width: 120,
      align: "center",
    }] : []),
    {
      title: "Chấm điểm số lượng",
      children: [
        { title: "Hoàn thành", dataIndex: "slHoanThanh", key: "slHoanThanh", align: "center", width: 80 },
        { title: "Không hoàn thành", dataIndex: "slKhongHoanThanh", key: "slKhongHoanThanh", align: "center", width: 80 },
        { title: "Điểm (%)", dataIndex: "slDiemPhanTram", key: "slDiemPhanTram", align: "center", width: 80 },
      ],
    },
    {
      title: () => (
        <div style={{ textAlign: "center" }}>
          Chấm điểm chất lượng<br />
          <span style={{ color: "#ffd666", fontWeight: "normal" }}>(Trừ 25%/lần không đạt)</span>
        </div>
      ),
      children: [
        { title: "Số lần không đạt", dataIndex: "clSoLanKhongDat", key: "clSoLanKhongDat", align: "center", width: 80 },
        { title: "Số điểm còn lại sau khi trừ", dataIndex: "clDiemConLai", key: "clDiemConLai", align: "center", width: 100 },
        { title: "Điểm (%)", dataIndex: "clDiemPhanTram", key: "clDiemPhanTram", align: "center", width: 80 },
      ],
    },
    {
      title: () => (
        <div style={{ textAlign: "center" }}>
          Chấm điểm tiến độ<br />
          <span style={{ color: "#ffd666", fontWeight: "normal" }}>(Trừ 25%/lần chậm muộn)</span>
        </div>
      ),
      children: [
        { title: "Số lần chậm muộn", dataIndex: "tdSoLanCham", key: "tdSoLanCham", align: "center", width: 80 },
        { title: "Số điểm còn lại sau khi trừ", dataIndex: "tdDiemConLai", key: "tdDiemConLai", align: "center", width: 100 },
        { title: "Điểm (%)", dataIndex: "tdDiemPhanTram", key: "tdDiemPhanTram", align: "center", width: 80 },
      ],
    },
    {
      title: "Ghi chú/Giải trình",
      dataIndex: "ghiChu",
      key: "ghiChu",
      width: 180,
    }
  ], [chucVuHeSo, tenChucVuLanhDao]);

  const data = [
    {
      key: "header-num",
      stt: "(1)",
      mieuTa: <div style={{ textAlign: "center", fontWeight: "bold" }}>(2)</div>,
      sanPham: <div style={{ textAlign: "center", fontWeight: "bold" }}>(3)</div>,
      canCu: <div style={{ textAlign: "center", fontWeight: "bold" }}>(4)</div>,
      ...(chucVuHeSo !== null
        ? {
          diemBoTieuChi: <div style={{ textAlign: "center", fontWeight: "bold" }}>(5)</div>,
          diemHeSo: <div style={{ textAlign: "center", fontWeight: "bold" }}>(6)</div>,
          slHoanThanh: <div style={{ textAlign: "center", fontWeight: "bold" }}>(7)</div>,
          slKhongHoanThanh: <div style={{ textAlign: "center", fontWeight: "bold" }}>(8)</div>,
          slDiemPhanTram: <div style={{ textAlign: "center", fontWeight: "bold" }}>(9)=(7)/(6)</div>,
          clSoLanKhongDat: <div style={{ textAlign: "center", fontWeight: "bold" }}>(10)</div>,
          clDiemConLai: <div style={{ textAlign: "center", fontWeight: "bold" }}>(11)</div>,
          clDiemPhanTram: <div style={{ textAlign: "center", fontWeight: "bold" }}>(12)=(11)/(6)</div>,
          tdSoLanCham: <div style={{ textAlign: "center", fontWeight: "bold" }}>(13)</div>,
          tdDiemConLai: <div style={{ textAlign: "center", fontWeight: "bold" }}>(14)</div>,
          tdDiemPhanTram: <div style={{ textAlign: "center", fontWeight: "bold" }}>(15)=(14)/(6)</div>,
          ghiChu: <div style={{ textAlign: "center", fontWeight: "bold" }}>(16)</div>,
        }
        : {
          diemBoTieuChi: <div style={{ textAlign: "center", fontWeight: "bold" }}>(5)</div>,
          slHoanThanh: <div style={{ textAlign: "center", fontWeight: "bold" }}>(6)</div>,
          slKhongHoanThanh: <div style={{ textAlign: "center", fontWeight: "bold" }}>(7)</div>,
          slDiemPhanTram: <div style={{ textAlign: "center", fontWeight: "bold" }}>(8)=(6)/(5)</div>,
          clSoLanKhongDat: <div style={{ textAlign: "center", fontWeight: "bold" }}>(9)</div>,
          clDiemConLai: <div style={{ textAlign: "center", fontWeight: "bold" }}>(10)</div>,
          clDiemPhanTram: <div style={{ textAlign: "center", fontWeight: "bold" }}>(11)=(10)/(5)</div>,
          tdSoLanCham: <div style={{ textAlign: "center", fontWeight: "bold" }}>(12)</div>,
          tdDiemConLai: <div style={{ textAlign: "center", fontWeight: "bold" }}>(13)</div>,
          tdDiemPhanTram: <div style={{ textAlign: "center", fontWeight: "bold" }}>(14)=(13)/(5)</div>,
          ghiChu: <div style={{ textAlign: "center", fontWeight: "bold" }}>(15)</div>,
        }),
    },
    {
      key: "group-1",
      stt: "I",
      mieuTa: <strong>Nhiệm vụ đã có trong kế hoạch/ phân công</strong>,
    },
    ...nhiemVuHeThong.flatMap((nv, index) => mapNhiemVuToTableItems(nv, index, "HT")),
    renderTotalRow("group-total-1", "Tổng (1)", nhiemVuHeThong),
    {
      key: "group-2",
      stt: "II",
      mieuTa: <strong>Nhiệm vụ đảm nhận thêm hoặc đột xuất, phát sinh (*)</strong>,
    },
    ...nhiemVuPhatSinh.flatMap((nv, index) => mapNhiemVuToTableItems(nv, index, "PS")),
    renderTotalRow("group-total-2", "Tổng (2)", nhiemVuPhatSinh),
    renderTotalRow("group-total-3", "Tổng điểm (3) = Tổng (1) + Tổng (2)", [...nhiemVuHeThong, ...nhiemVuPhatSinh]),
  ];

  const allNhiemVu = [...nhiemVuHeThong, ...nhiemVuPhatSinh];
  const allProductsB = allNhiemVu.flatMap(item => (item.danhSachDauRa && item.danhSachDauRa.length > 0)
    ? item.danhSachDauRa
    : [{ diemTheoBoTieuChi: item.diemBoTieuChi }]);
  const productScoresB = allProductsB.map((product) => getProductScoreValues(product, product.diemTheoBoTieuChi));

  const sumBoTieuChiB = productScoresB.reduce((sum, score) => sum + score.diemBoTieuChi, 0);
  const sumHeSoB = chucVuHeSo !== null ? productScoresB.reduce((sum, score) => sum + score.diemCoSo, 0) : 0;

  const sumSlHoanThanhB = productScoresB.reduce((sum, score) => sum + score.soLuongHoanThanh, 0);
  const sumClConLaiB = productScoresB.reduce((sum, score) => sum + score.chatLuongConLai, 0);
  const sumTdConLaiB = productScoresB.reduce((sum, score) => sum + score.tienDoConLai, 0);

  const baseDiemB = chucVuHeSo !== null ? sumHeSoB : sumBoTieuChiB;
  const percentSlB = baseDiemB ? Math.max(0, (sumSlHoanThanhB / baseDiemB) * 100) : 0;
  const percentClB = baseDiemB ? Math.max(0, (sumClConLaiB / baseDiemB) * 100) : 0;
  const percentTdB = baseDiemB ? Math.max(0, (sumTdConLaiB / baseDiemB) * 100) : 0;
  const hasScoringData = productScoresB.some((score) => score.diemBoTieuChi > 0);

  const finalScoreNum = hasScoringData
    ? Math.max(0, chucVuHeSo !== null
      ? (percentSlB + percentClB + percentTdB + kqLinhVucPercent + knToChucPercent + nlTapHopPercent) / 6
      : (percentSlB + percentClB + percentTdB) / 3)
    : 0;
  const finalScoreStr = formatPercent(finalScoreNum);

  const columnsB = React.useMemo<any[]>(() => [
    {
      title: "STT",
      dataIndex: "stt",
      key: "stt",
      width: 80,
      align: "center",
      render: (text: any, record: any) => {
        if (record.key === 'row-iv') {
          return { children: text, props: { colSpan: 1 } };
        }
        return <span style={{ whiteSpace: "nowrap" }}>{text}</span>;
      }
    },
    {
      title: chucVuHeSo !== null ? "Đối với công chức giữ chức vụ lãnh đạo" : "Đối với công chức không giữ chức vụ lãnh đạo",
      dataIndex: "mieuTa",
      key: "mieuTa",
      width: 250,
      render: (text: any, record: any) => {
        return { children: text, props: { colSpan: 1 } };
      }
    },
    {
      title: "Điểm theo Bộ tiêu chí",
      dataIndex: "diemBoTieuChi",
      key: "diemBoTieuChi",
      align: "center",
      width: 100,
      render: (text: any, record: any) => {
        if (record.key === 'row-iv') {
          return {
            children: <strong style={{ fontSize: '1.2em' }}>{record.finalScore}</strong>,
            props: { colSpan: chucVuHeSo !== null ? 12 : 7, style: { background: '#92d050', textAlign: 'center' } },
          };
        }
        return text;
      }
    },
    ...(chucVuHeSo !== null ? [{
      title: `Điểm theo hệ số lãnh đạo (${tenChucVuLanhDao || 'Lãnh đạo'} = ${formatDisplayScore(chucVuHeSo)} x Điểm Bộ tiêu chí)`,
      dataIndex: "diemHeSo",
      key: "diemHeSo",
      align: "center",
      width: 120,
      render: (text: any, record: any) => (record.key === 'row-iv' ? { props: { colSpan: 0 } } : text)
    }] : []),
    {
      title: chucVuHeSo !== null ? "Khối lượng" : "Chấm điểm số lượng",
      children: [
        { title: "Điểm cuối cùng", dataIndex: "klDiem", key: "klDiem", align: "center", width: 80, render: (text: any, record: any) => (record.key === 'row-iv' ? { props: { colSpan: 0 } } : text) },
        { title: "Điểm tiêu chí (%)", dataIndex: "klPhanTram", key: "klPhanTram", align: "center", width: 80, render: (text: any, record: any) => (record.key === 'row-iv' ? { props: { colSpan: 0 } } : text) },
      ]
    },
    {
      title: chucVuHeSo !== null ? "Chất lượng" : (
        <div style={{ textAlign: "center" }}>
          Chấm điểm chất lượng<br />
          <span style={{ color: "#ffd666", fontWeight: "normal" }}>(Trừ 25%/lần không đạt)</span>
        </div>
      ),
      children: [
        { title: "Điểm cuối cùng", dataIndex: "clDiem", key: "clDiem", align: "center", width: 80, render: (text: any, record: any) => (record.key === 'row-iv' ? { props: { colSpan: 0 } } : text) },
        { title: "Điểm tiêu chí (%)", dataIndex: "clPhanTram", key: "clPhanTram", align: "center", width: 80, render: (text: any, record: any) => (record.key === 'row-iv' ? { props: { colSpan: 0 } } : text) },
      ]
    },
    {
      title: chucVuHeSo !== null ? "Tiến độ" : (
        <div style={{ textAlign: "center" }}>
          Chấm điểm tiến độ<br />
          <span style={{ color: "#ffd666", fontWeight: "normal" }}>(Trừ 25%/lần chậm muộn)</span>
        </div>
      ),
      children: [
        { title: "Điểm cuối cùng", dataIndex: "tdDiem", key: "tdDiem", align: "center", width: 80, render: (text: any, record: any) => (record.key === 'row-iv' ? { props: { colSpan: 0 } } : text) },
        { title: "Điểm tiêu chí (%)", dataIndex: "tdPhanTram", key: "tdPhanTram", align: "center", width: 80, render: (text: any, record: any) => (record.key === 'row-iv' ? { props: { colSpan: 0 } } : text) },
      ]
    },
    ...(chucVuHeSo !== null ? [
      {
        title: "Kết quả hoạt động của lĩnh vực được giao (**)",
        dataIndex: "kqLinhVuc",
        key: "kqLinhVuc",
        align: "center",
        width: 120,
        render: (text: any, record: any) => (record.key === 'row-iv' ? { props: { colSpan: 0 } } : text)
      },
      {
        title: "Khả năng tổ chức triển khai thực hiện nhiệm vụ",
        dataIndex: "knToChuc",
        key: "knToChuc",
        align: "center",
        width: 120,
        render: (text: any, record: any) => (record.key === 'row-iv' ? { props: { colSpan: 0 } } : text)
      },
      {
        title: "Năng lực tập hợp, đoàn kết công chức",
        dataIndex: "nlTapHop",
        key: "nlTapHop",
        align: "center",
        width: 120,
        render: (text: any, record: any) => (record.key === 'row-iv' ? { props: { colSpan: 0 } } : text)
      }
    ] : []),
    {
      title: "Ghi chú/Giải trình",
      dataIndex: "ghiChu",
      key: "ghiChu",
      width: 150,
      render: (text: any, record: any) => (record.key === 'row-iv' && chucVuHeSo !== null ? { props: { colSpan: 0 } } : text)
    }
  ], [chucVuHeSo, tenChucVuLanhDao]);

  const dataB = [
    {
      key: "header-num-b",
      stt: chucVuHeSo !== null ? <div style={{ textAlign: "center", fontWeight: "bold" }}>(1)</div> : "",
      mieuTa: chucVuHeSo !== null ? <div style={{ textAlign: "center", fontWeight: "bold" }}>(2)</div> : "",
      diemBoTieuChi: chucVuHeSo !== null ? <div style={{ textAlign: "center", fontWeight: "bold" }}>(3)</div> : <div style={{ textAlign: "center", fontWeight: "bold", fontStyle: "italic" }}>(1)</div>,
      ...(chucVuHeSo !== null
        ? {
          diemHeSo: <div style={{ textAlign: "center", fontWeight: "bold" }}>(4)</div>,
          klDiem: <div style={{ textAlign: "center", fontWeight: "bold" }}>(5)</div>,
          klPhanTram: <div style={{ textAlign: "center", fontWeight: "bold" }}>(6)=(5)/(4)</div>,
          clDiem: <div style={{ textAlign: "center", fontWeight: "bold" }}>(7)</div>,
          clPhanTram: <div style={{ textAlign: "center", fontWeight: "bold" }}>(8)=(7)/(4)</div>,
          tdDiem: <div style={{ textAlign: "center", fontWeight: "bold" }}>(9)</div>,
          tdPhanTram: <div style={{ textAlign: "center", fontWeight: "bold" }}>(10)=(9)/(4)</div>,
          kqLinhVuc: <div style={{ textAlign: "center", fontWeight: "bold" }}>(11)</div>,
          knToChuc: <div style={{ textAlign: "center", fontWeight: "bold" }}>(12)</div>,
          nlTapHop: <div style={{ textAlign: "center", fontWeight: "bold" }}>(13)</div>,
          ghiChu: <div style={{ textAlign: "center", fontWeight: "bold" }}>(14)</div>,
        }
        : {
          klDiem: <div style={{ textAlign: "center", fontWeight: "bold", fontStyle: "italic" }}>(2)</div>,
          klPhanTram: <div style={{ textAlign: "center", fontWeight: "bold", fontStyle: "italic" }}>(3)=(2)/(1)</div>,
          clDiem: <div style={{ textAlign: "center", fontWeight: "bold", fontStyle: "italic" }}>(4)</div>,
          clPhanTram: <div style={{ textAlign: "center", fontWeight: "bold", fontStyle: "italic" }}>(5)=(4)/(1)</div>,
          tdDiem: <div style={{ textAlign: "center", fontWeight: "bold", fontStyle: "italic" }}>(6)</div>,
          tdPhanTram: <div style={{ textAlign: "center", fontWeight: "bold", fontStyle: "italic" }}>(7)=(6)/(1)</div>,
          ghiChu: <div style={{ textAlign: "center", fontWeight: "bold", fontStyle: "italic" }}>(8)</div>,
        })
    },
    {
      key: "row-iii",
      stt: <strong style={{ textAlign: "center", display: "block" }}>III</strong>,
      mieuTa: <strong style={{ textAlign: "center", display: "block" }}>Chấm điểm theo từng tiêu chí</strong>,
      diemBoTieuChi: formatDisplayScore(sumBoTieuChiB),
      ...(chucVuHeSo !== null ? { diemHeSo: formatDisplayScore(sumHeSoB) } : {}),
      klDiem: formatDisplayScore(sumSlHoanThanhB),
      klPhanTram: formatPercent(percentSlB),
      clDiem: formatDisplayScore(sumClConLaiB),
      clPhanTram: formatPercent(percentClB),
      tdDiem: formatDisplayScore(sumTdConLaiB),
      tdPhanTram: formatPercent(percentTdB),
      ...(chucVuHeSo !== null ? {
        kqLinhVuc: formatPercent(kqLinhVucPercent),
        knToChuc: formatPercent(knToChucPercent),
        nlTapHop: formatPercent(nlTapHopPercent),
      } : {}),
      ghiChu: "",
    },
    {
      key: "row-iv",
      stt: <strong style={{ textAlign: "center", display: "block" }}>IV</strong>,
      mieuTa: <strong>Điểm tiêu chí kết quả thực hiện nhiệm vụ = {chucVuHeSo !== null ? "[(6)+(8)+(10)+(11)+(12)+(13)]/6" : "(điểm số lượng + điểm chất lượng + điểm tiến độ)/3"}</strong>,
      finalScore: finalScoreStr
    }
  ];

  if (loading) {
    return (
      <Card className="customCardShadow" bordered={false} style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" tip="Đang tải dữ liệu biểu chấm điểm..." />
      </Card>
    );
  }

  return (
    <Card className="customCardShadow" bordered={false}>
      {!props.hideBackBtn && (
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => router.back()}
          style={{ marginBottom: "20px" }}
        >
          Quay lại
        </Button>
      )}

      <Alert
        type="info"
        showIcon
        style={{ marginBottom: "20px" }}
        message={
          <div style={{ fontSize: "13.5px", lineHeight: "1.6" }}>
            <div>
              <strong>(*)</strong> Công chức được giao đảm nhận thêm nhiệm vụ từ công chức khác hoặc công việc đột xuất, phát sinh thì nhiệm vụ này được tính ngoài tổng số nhiệm vụ được giao ban đầu và được tính thêm điểm tiêu chí kết quả thực hiện nhiệm vụ.
            </div>
            <div style={{ marginTop: "6px" }}>
              <strong>(**)</strong> Chỉ chấm 100% hoặc 50% đối với các tiêu chí: Kết quả hoạt động của lĩnh vực được giao, khả năng tổ chức triển khai thực hiện nhiệm vụ, năng lực tập hợp đoàn kết (quy định tại điểm a, khoản 3, Điều 15 Nghị định số 335/2025/NĐ-CP)
            </div>
          </div>
        }
      />

      <div style={{ textAlign: "center", marginBottom: "0px" }}>
        <Title level={4} style={{ marginTop: "10px", textTransform: "uppercase", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
          Biểu chấm điểm tiêu chí kết quả thực hiện nhiệm vụ {tenDotDanhGia ? `- ${tenDotDanhGia}` : ""}
        </Title>
      </div>

      <div style={{ position: "relative", marginBottom: 0 }}>
        <div style={{
          position: "sticky",
          top: "56px",
          zIndex: 99,
          background: "linear-gradient(135deg, #0f766e 0%, #06b6d4 100%)",
          color: "#fff",
          padding: "14px 24px",
          fontSize: "16px",
          fontWeight: "700",
          borderRadius: "12px 12px 0 0",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.12)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "3px solid #67e8f9",
          textTransform: "uppercase",
          letterSpacing: "0.5px"
        }}>
          <span>A. CHẤM ĐIỂM KẾT QUẢ TỪNG NHIỆM VỤ TRONG THÁNG</span>
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => setViewBoTieuChiModalVisible(true)}
            style={{
              backgroundColor: "#ffffff",
              color: "#0f766e",
              fontWeight: 600,
              borderColor: "#ffffff",
              borderRadius: "4px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            Xem bộ tiêu chí đang dùng
          </Button>
        </div>

        <Table
          className="table_component"
          columns={columns}
          dataSource={data}
          bordered
          pagination={false}
          scroll={{ x: 'max-content' }}
          rowClassName={(record) => {
            if (record.key.startsWith('group-total')) return 'bg-gray-100 font-bold';
            if (record.key.startsWith('group-')) return 'bg-blue-50';
            return '';
          }}

          components={TABLE_COMPONENTS}
        />
      </div>

      <div style={{ position: "relative", marginTop: "40px", marginBottom: "0px" }}>
        <div style={{
          position: "sticky",
          top: "56px",
          zIndex: 99,
          background: "linear-gradient(135deg, #0f766e 0%, #06b6d4 100%)",
          color: "#fff",
          padding: "14px 24px",
          fontSize: "16px",
          fontWeight: "700",
          borderRadius: "12px 12px 0 0",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.12)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "3px solid #67e8f9",
          textTransform: "uppercase",
          letterSpacing: "0.5px"
        }}>
          <span>B. KẾT QUẢ THỰC HIỆN NHIỆM VỤ</span>
        </div>

        <Table
          className="table_component"
          columns={columnsB}
          dataSource={dataB}
          bordered
          pagination={false}
          scroll={{ x: 'max-content' }}
          components={TABLE_COMPONENTS}
        />

        <div style={{ marginTop: "20px", fontSize: "16px", paddingLeft: "10px" }}>
          <span>Sau khi hoàn thành việc chấm điểm theo Bộ tiêu chí, điểm tiêu chí kết quả thực hiện nhiệm vụ tháng {tenDotDanhGia || "...."} là: <strong style={{ marginLeft: "20px" }}>{finalScoreStr}</strong></span>
        </div>
      </div>

      <ModalXemBoTieuChi
        visible={viewBoTieuChiModalVisible}
        onClose={() => setViewBoTieuChiModalVisible(false)}
        idDotDanhGia={selectedDot}
        donViId={currentUser?.departmentId}
      />
    </Card>
  );
}
