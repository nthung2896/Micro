"use client";
import React from "react";
import { Modal, Button, Tag, Image, Divider } from "antd";
import { HomeOutlined, EnvironmentOutlined } from "@ant-design/icons";
import { RoomListing } from "./types";
import { formatVnd } from "./utils";

interface RoomDetailModalProps {
  room: RoomListing | null;
  onClose: () => void;
  onContactClick: (room: RoomListing) => void;
}

export default function RoomDetailModal({
  room,
  onClose,
  onContactClick,
}: RoomDetailModalProps) {
  if (!room) return null;

  return (
    <Modal
      open={Boolean(room)}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Đóng
        </Button>,
        <Button
          key="contact"
          type="primary"
          style={{ backgroundColor: "#d81b60", borderColor: "#d81b60" }}
          onClick={() => {
            const currentRoom = room;
            onClose();
            onContactClick(currentRoom);
          }}
        >
          Liên hệ chủ nhà ngay
        </Button>,
      ]}
      centered
      width={850}
      styles={{ body: { maxHeight: "75vh", overflowY: "auto", paddingRight: 8 } }}
      title={
        <div className="flex items-center gap-2 text-[#0355a2] font-bold text-base">
          <HomeOutlined />
          <span>Chi tiết phòng trọ: {room.tieuDe}</span>
        </div>
      }
    >
      <div>
        {/* Ảnh phòng */}
        {room.danhSachHinhAnh.length > 0 && (
          <div className="mb-4">
            <Image.PreviewGroup>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {room.danhSachHinhAnh.map((img, idx) => (
                  <Image
                    key={idx}
                    src={img}
                    alt="Ảnh phòng trọ"
                    width={130}
                    height={95}
                    style={{ objectFit: "cover", borderRadius: 8, border: "1px solid #e5e7eb" }}
                    fallback="https://via.placeholder.com/130x95?text=No+Image"
                  />
                ))}
              </div>
            </Image.PreviewGroup>
          </div>
        )}

        {/* Thông tin cơ bản */}
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 mb-4">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {room.maPhong && <Tag color="blue">Mã: {room.maPhong}</Tag>}
            <Tag color="cyan">{room.loaiPhong}</Tag>
            {room.isNoiBat && <Tag color="gold">VIP Nổi bật</Tag>}
            <Tag color="green">Còn trống</Tag>
          </div>

          <div className="text-xs text-gray-600 mb-2 flex items-start gap-1">
            <EnvironmentOutlined className="text-red-500 shrink-0 mt-0.5" />
            <span>{room.diaChi}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-gray-200 text-xs">
            <div>
              <span className="text-gray-400 block font-medium">Giá cho thuê:</span>
              <span className="text-base font-black text-red-600">
                {formatVnd(room.giaChoThue)}/tháng
              </span>
            </div>
            <div>
              <span className="text-gray-400 block font-medium">Tiền đặt cọc:</span>
              <span className="font-bold text-gray-800">{formatVnd(room.tienCoc)}</span>
            </div>
            <div>
              <span className="text-gray-400 block font-medium">Diện tích:</span>
              <span className="font-bold text-gray-800">{room.dienTich} m²</span>
            </div>
            <div>
              <span className="text-gray-400 block font-medium">Lượt xem:</span>
              <span className="font-bold text-gray-800">{room.luotXem} lượt</span>
            </div>
          </div>
        </div>

        {/* Bảng chi phí dịch vụ */}
        <Divider titlePlacement="left" plain style={{ margin: "14px 0 10px", fontWeight: 700 }}>
          Chi phí dịch vụ hàng tháng
        </Divider>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs mb-4">
          <div className="p-2.5 bg-blue-50/50 rounded-lg border border-blue-100 flex justify-between">
            <span className="text-gray-600">⚡ Điện:</span>
            <b className="text-gray-900">{formatVnd(room.giaDien)}/{room.donViDien || "Số"}</b>
          </div>
          <div className="p-2.5 bg-blue-50/50 rounded-lg border border-blue-100 flex justify-between">
            <span className="text-gray-600">💧 Nước:</span>
            <b className="text-gray-900">{formatVnd(room.giaNuoc)}/{room.donViNuoc || "Khối"}</b>
          </div>
          <div className="p-2.5 bg-blue-50/50 rounded-lg border border-blue-100 flex justify-between">
            <span className="text-gray-600">🌐 Internet:</span>
            <b className="text-gray-900">{formatVnd(room.giaInternet)}/{room.donViInternet || "Phòng"}</b>
          </div>
          <div className="p-2.5 bg-blue-50/50 rounded-lg border border-blue-100 flex justify-between">
            <span className="text-gray-600">🧹 Dịch vụ chung:</span>
            <b className="text-gray-900">{formatVnd(room.giaDichVuChung)}/{room.donViDichVuChung || "Người"}</b>
          </div>
          <div className="p-2.5 bg-blue-50/50 rounded-lg border border-blue-100 flex justify-between">
            <span className="text-gray-600">🛵 Gửi xe:</span>
            <b className="text-gray-900">{formatVnd(room.giaGuiXe)}/xe</b>
          </div>
          <div className="p-2.5 bg-blue-50/50 rounded-lg border border-blue-100 flex justify-between">
            <span className="text-gray-600">🗑️ Vệ sinh:</span>
            <b className="text-gray-900">{formatVnd(room.giaVeSinh)}</b>
          </div>
        </div>

        {/* Tiện nghi phòng */}
        <Divider titlePlacement="left" plain style={{ margin: "14px 0 10px", fontWeight: 700 }}>
          Tiện nghi &amp; Nội thất phòng
        </Divider>
        <div className="flex flex-wrap gap-2 mb-4 text-xs">
          {room.gioGiacTuDo && <Tag color="blue">✓ Giờ giấc tự do</Tag>}
          {room.khongChungChu && <Tag color="blue">✓ Không chung chủ</Tag>}
          {room.coDieuHoa && <Tag color="cyan">✓ Có điều hòa</Tag>}
          {room.coNongLanh && <Tag color="cyan">✓ Có nóng lạnh</Tag>}
          {room.coMayGiat && <Tag color="cyan">✓ Có máy giặt</Tag>}
          {room.coTuLanh && <Tag color="cyan">✓ Có tủ lạnh</Tag>}
          {room.coGiuongTu && <Tag color="cyan">✓ Có giường tủ</Tag>}
          {room.coKeBep && <Tag color="cyan">✓ Có kệ bếp riêng</Tag>}
          {room.coBanCong && <Tag color="green">✓ Ban công thoáng</Tag>}
          {room.coThangMay && <Tag color="green">✓ Có thang máy</Tag>}
          {room.coChoDeXe && <Tag color="green">✓ Có chỗ để xe</Tag>}
          {room.coKhoaVanTay && <Tag color="green">✓ Khóa vân tay an ninh</Tag>}
        </div>

        {/* Mô tả chi tiết */}
        {room.moTa && (
          <>
            <Divider titlePlacement="left" plain style={{ margin: "14px 0 10px", fontWeight: 700 }}>
              Mô tả chi tiết phòng trọ
            </Divider>
            <div
              className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: room.moTa }}
            />
          </>
        )}

        {/* Quy định */}
        {room.quyDinh && (
          <>
            <Divider titlePlacement="left" plain style={{ margin: "14px 0 10px", fontWeight: 700 }}>
              Nội quy phòng trọ
            </Divider>
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-700 whitespace-pre-line leading-relaxed">
              {room.quyDinh}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
