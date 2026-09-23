import React, { useEffect, useState } from "react";
import { KPI_CauHinhDiemTheoHeSoLanhDaoType } from "@/types/kPI_CauHinhDiemTheoHeSoLanhDao/kPI_CauHinhDiemTheoHeSoLanhDao";
import { Modal, Descriptions, Tag, Spin } from "antd";
import { apiService } from "@/services";
import kPI_BoTieuChiChungService from "@/services/kPI_BoTieuChiChung/kPI_BoTieuChiChungService";
import kPI_BoTieuChiDonViService from "@/services/kPI_BoTieuChiDonVi/kPI_BoTieuChiDonViService";

interface Props {
  item?: KPI_CauHinhDiemTheoHeSoLanhDaoType | null;
  onClose: () => void;
}

const KPI_CauHinhDiemTheoHeSoLanhDaoDetail: React.FC<Props> = ({ item, onClose }) => {
  const [chucVuOptions, setChucVuOptions] = useState<{ value: string; label: string }[]>([]);
  const [boTieuChiOptions, setBoTieuChiOptions] = useState<{ value: string; label: string }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDropdowns = async () => {
      setLoading(true);
      try {
        const [resChucVu, resBoTieuChi, resBoTieuChiDonVi] = await Promise.all([
          apiService.get<any>("/DM_DuLieuDanhMuc/GetDropdownCode/CHUCVUVNU"),
          kPI_BoTieuChiChungService.getDropdown(),
          kPI_BoTieuChiDonViService.getDropdown()
        ]);
        if (resChucVu?.data) {
          setChucVuOptions(resChucVu.data);
        }
        let mergedBoTieuChi: {value: string, label: string}[] = [];
        if (resBoTieuChi?.data) {
          mergedBoTieuChi = [...mergedBoTieuChi, ...resBoTieuChi.data];
        }
        if (resBoTieuChiDonVi?.data) {
          mergedBoTieuChi = [...mergedBoTieuChi, ...resBoTieuChiDonVi.data];
        }
        setBoTieuChiOptions(mergedBoTieuChi);
      } catch (error) {
        console.error("Lỗi lấy danh mục:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDropdowns();
  }, []);

  const chucVuName = chucVuOptions.find(x => x.value === item?.chucVu)?.label || item?.chucVu || "-";
  const boTieuChiName = item?.tenBoTieuChi || boTieuChiOptions.find(x => x.value === item?.idBoTieuChi)?.label || item?.idBoTieuChi || "-";

  return (
    <Modal
      title={
        <div style={{ fontSize: '18px', fontWeight: 600, color: '#0355a2' }}>
          Chi tiết Cấu hình điểm hệ số lãnh đạo
        </div>
      }
      open={true}
      onCancel={onClose}
      footer={null}
      width={700}
      centered
      destroyOnClose
    >
      <Spin spinning={loading}>
        <div style={{ padding: "16px 0" }}>
          <Descriptions bordered column={1} labelStyle={{ width: "30%", fontWeight: 500, backgroundColor: "#f9fafb" }}>
            <Descriptions.Item label="Chức vụ">
              <span style={{ fontWeight: 600 }}>{chucVuName}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Hệ số">
              <Tag color="blue" style={{ fontSize: "14px", padding: "2px 10px" }}>
                {item?.heSo}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Bộ tiêu chí">
              <span style={{ color: "#0355a2", fontWeight: 500 }}>{boTieuChiName}</span>
            </Descriptions.Item>
          </Descriptions>
        </div>
      </Spin>
    </Modal>
  );
};

export default KPI_CauHinhDiemTheoHeSoLanhDaoDetail;
