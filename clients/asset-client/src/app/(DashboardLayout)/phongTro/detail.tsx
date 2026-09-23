import React, { useEffect, useState } from "react";
import { Modal, Descriptions, Tag, Divider, Spin, Button, Image, Row, Col } from "antd";
import { PhongTroType } from "@/types/phongTro/phongTro";
import * as extensions from "@/utils/extensions";
import { buildFileUrl } from "@/utils/file";
import phongTroService from "@/services/phongTro/phongTroService";

interface Props {
  item?: PhongTroType | null;
  onClose: () => void;
}

const PhongTroDetail: React.FC<Props> = ({ item, onClose }) => {
  const [detail, setDetail] = useState<PhongTroType | null>(item || null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (item?.id) {
      setLoading(true);
      phongTroService
        .getById(item.id)
        .then((res) => {
          if (res?.data) {
            setDetail(res.data);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setDetail(item || null);
    }
  }, [item]);

  const renderTrangThai = (val?: number) => {
    if (val === 0) return <Tag color="green">Còn trống</Tag>;
    if (val === 1) return <Tag color="red">Đã thuê</Tag>;
    return <Tag color="default">Tạm ngưng</Tag>;
  };

  const renderDuyet = (val?: number) => {
    if (val === 1) return <Tag color="success">Đã duyệt</Tag>;
    if (val === 0) return <Tag color="warning">Chờ duyệt</Tag>;
    if (val === 2) return <Tag color="error">Từ chối</Tag>;
    return <Tag color="default">Hết hạn</Tag>;
  };

  const renderGoiTin = (val?: number) => {
    if (val === 3) return <Tag color="magenta">VIP Nổi bật</Tag>;
    if (val === 2) return <Tag color="purple">VIP 2</Tag>;
    if (val === 1) return <Tag color="blue">VIP 1</Tag>;
    return <Tag>Thường</Tag>;
  };

  const rawTaiLieu = (detail as any)?.danhSachTaiLieu;
  const imagesList = rawTaiLieu && Array.isArray(rawTaiLieu) && rawTaiLieu.length > 0
    ? rawTaiLieu.map((tl: any) => buildFileUrl(tl.duongDanFile)).filter(Boolean)
    : detail?.danhSachHinhAnh
    ? detail.danhSachHinhAnh
        .split(/[;,]/)
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => buildFileUrl(s))
    : detail?.hinhAnhDaiDien
    ? [buildFileUrl(detail.hinhAnhDaiDien)]
    : [];

  return (
    <Modal
      title={<span style={{ fontSize: 16, fontWeight: 600 }}>Chi tiết thông tin phòng trọ</span>}
      open={true}
      onCancel={onClose}
      centered
      width={920}
      destroyOnClose
      footer={[
        <Button key="close" type="primary" onClick={onClose}>
          Đóng
        </Button>,
      ]}
      styles={{
        body: {
          maxHeight: "75vh",
          overflowY: "auto",
          paddingRight: 8,
        },
      }}
    >
      <Spin spinning={loading}>
        {detail ? (
          <div>
            <div style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: "#1f2937" }}>
                {detail.tieuDe}
              </h3>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                {renderTrangThai(detail.trangThai)}
                {renderDuyet(detail.trangThaiDuyet)}
                {renderGoiTin(detail.goiTin)}
                {detail.isNoiBat && <Tag color="gold">Nổi bật</Tag>}
              </div>
            </div>

            {imagesList.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <Image.PreviewGroup>
                  <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
                    {imagesList.map((img, idx) => (
                      <Image
                        key={idx}
                        src={img}
                        alt="Hình ảnh phòng"
                        width={120}
                        height={90}
                        style={{ objectFit: "cover", borderRadius: 6 }}
                        fallback="https://via.placeholder.com/120x90?text=No+Image"
                      />
                    ))}
                  </div>
                </Image.PreviewGroup>
              </div>
            )}

            <Divider titlePlacement="left" plain style={{ margin: "14px 0 10px", fontWeight: 600 }}>
              Thông tin cơ bản & Vị trí
            </Divider>
            <Descriptions column={{ xs: 1, sm: 2, md: 3 }} size="small" bordered>
              <Descriptions.Item label="Mã phòng">{detail.maPhong || "-"}</Descriptions.Item>
              <Descriptions.Item label="Tên phòng">{detail.tenPhong || "-"}</Descriptions.Item>
              <Descriptions.Item label="Loại phòng">{detail.loaiPhong || "-"}</Descriptions.Item>
              <Descriptions.Item label="Địa chỉ chi tiết" span={3}>
                {detail.diaChi || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Phường/Xã">{detail.tenXa || "-"}</Descriptions.Item>
              <Descriptions.Item label="Quận/Huyện">{detail.tenHuyen || "-"}</Descriptions.Item>
              <Descriptions.Item label="Tỉnh/Thành phố">{detail.tenTinh || "-"}</Descriptions.Item>
              <Descriptions.Item label="Tọa độ" span={3}>
                {detail.toaDo || "-"}
              </Descriptions.Item>
            </Descriptions>

            <Divider titlePlacement="left" plain style={{ margin: "16px 0 10px", fontWeight: 600 }}>
              Diện tích & Chi phí
            </Divider>
            <Descriptions column={{ xs: 1, sm: 2, md: 3 }} size="small" bordered>
              <Descriptions.Item label="Diện tích">
                {detail.dienTich ? `${detail.dienTich} m²` : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Tầng số">{detail.tang ?? "-"}</Descriptions.Item>
              <Descriptions.Item label="Số người ở">{detail.soNguoiOToiDa ?? "-"}</Descriptions.Item>
              <Descriptions.Item label="Phòng ngủ / WC">
                {detail.soPhongNgu ?? 0} PN / {detail.soPhongTam ?? 0} WC
              </Descriptions.Item>
              <Descriptions.Item label="Giá cho thuê" span={2}>
                {detail.giaChoThue ? (
                  <span style={{ color: "#f5222d", fontWeight: "bold", fontSize: 16 }}>
                    {detail.giaChoThue.toLocaleString()} VNĐ/tháng
                  </span>
                ) : (
                  "Thỏa thuận"
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Tiền đặt cọc" span={3}>
                {detail.tienCoc ? `${detail.tienCoc.toLocaleString()} VNĐ` : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Giá điện">
                {detail.giaDien ? `${detail.giaDien.toLocaleString()} đ/${detail.donViDien || "Số"}` : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Giá nước">
                {detail.giaNuoc ? `${detail.giaNuoc.toLocaleString()} đ/${detail.donViNuoc || "Khối"}` : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Internet">
                {detail.giaInternet ? `${detail.giaInternet.toLocaleString()} đ/${detail.donViInternet || "Phòng"}` : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Dịch vụ chung">
                {detail.giaDichVuChung ? `${detail.giaDichVuChung.toLocaleString()} đ/${detail.donViDichVuChung || "Người"}` : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Phí gửi xe">
                {detail.giaGuiXe ? `${detail.giaGuiXe.toLocaleString()} đ/xe` : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Phí vệ sinh">
                {detail.giaVeSinh ? `${detail.giaVeSinh.toLocaleString()} đ` : "-"}
              </Descriptions.Item>
            </Descriptions>

            <Divider titlePlacement="left" plain style={{ margin: "16px 0 10px", fontWeight: 600 }}>
              Tiện nghi phòng
            </Divider>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
              {detail.gioGiacTuDo && <Tag color="blue">Giờ giấc tự do</Tag>}
              {detail.khongChungChu && <Tag color="blue">Không chung chủ</Tag>}
              {detail.coDieuHoa && <Tag color="cyan">Điều hòa</Tag>}
              {detail.coNongLanh && <Tag color="cyan">Nóng lạnh</Tag>}
              {detail.coMayGiat && <Tag color="cyan">Máy giặt</Tag>}
              {detail.coTuLanh && <Tag color="cyan">Tủ lạnh</Tag>}
              {detail.coGiuongTu && <Tag color="cyan">Giường tủ</Tag>}
              {detail.coKeBep && <Tag color="cyan">Kệ bếp riêng</Tag>}
              {detail.coBanCong && <Tag color="green">Ban công / Cửa sổ</Tag>}
              {detail.coThangMay && <Tag color="green">Thang máy</Tag>}
              {detail.coChoDeXe && <Tag color="green">Chỗ để xe</Tag>}
              {detail.coKhoaVanTay && <Tag color="green">Khóa vân tay/Camera</Tag>}
              {detail.choNuoiThuCung && <Tag color="purple">Cho nuôi thú cưng</Tag>}
            </div>
            {detail.quyDinhGioGiac && (
              <p style={{ fontSize: 13, marginBottom: 6 }}>
                <strong>Quy định giờ giấc:</strong> {detail.quyDinhGioGiac}
              </p>
            )}
            {detail.tienNghiKhac && (
              <p style={{ fontSize: 13, marginBottom: 6 }}>
                <strong>Tiện nghi khác:</strong> {detail.tienNghiKhac}
              </p>
            )}

            <Divider titlePlacement="left" plain style={{ margin: "16px 0 10px", fontWeight: 600 }}>
              Liên hệ & Quản lý
            </Divider>
            <Descriptions column={{ xs: 1, sm: 2, md: 3 }} size="small" bordered>
              <Descriptions.Item label="Người liên hệ">{detail.tenLienHe || "-"}</Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">{detail.soDienThoaiLienHe || "-"}</Descriptions.Item>
              <Descriptions.Item label="Zalo">{detail.zaloLienHe || "-"}</Descriptions.Item>
              <Descriptions.Item label="Ngày bắt đầu trống">
                {extensions.toDateString(detail.ngayTrong) || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Lượt xem">{detail.luotXem ?? 0}</Descriptions.Item>
              <Descriptions.Item label="Số lượt đẩy tin">{detail.soLuotDayTin ?? 0}</Descriptions.Item>
              {detail.lyDoTuChoi && (
                <Descriptions.Item label="Lý do từ chối" span={3}>
                  <span style={{ color: "#f5222d" }}>{detail.lyDoTuChoi}</span>
                </Descriptions.Item>
              )}
            </Descriptions>

            {detail.moTa && (
              <>
                <Divider titlePlacement="left" plain style={{ margin: "16px 0 10px", fontWeight: 600 }}>
                  Mô tả chi tiết
                </Divider>
                <div
                  style={{
                    fontSize: 13,
                    color: "#374151",
                    background: "#f9fafb",
                    padding: 14,
                    borderRadius: 6,
                    border: "1px solid #f0f0f0",
                    lineHeight: 1.6,
                  }}
                  dangerouslySetInnerHTML={{ __html: detail.moTa }}
                />
              </>
            )}

            {detail.quyDinh && (
              <>
                <Divider titlePlacement="left" plain style={{ margin: "16px 0 10px", fontWeight: 600 }}>
                  Nội quy phòng trọ
                </Divider>
                <div
                  style={{
                    fontSize: 13,
                    color: "#374151",
                    background: "#f9fafb",
                    padding: 14,
                    borderRadius: 6,
                    border: "1px solid #f0f0f0",
                    lineHeight: 1.6,
                    whiteSpace: detail.quyDinh.includes("<") ? "normal" : "pre-line",
                  }}
                  dangerouslySetInnerHTML={{ __html: detail.quyDinh }}
                />
              </>
            )}
          </div>
        ) : (
          <div>Không có dữ liệu</div>
        )}
      </Spin>
    </Modal>
  );
};

export default PhongTroDetail;
