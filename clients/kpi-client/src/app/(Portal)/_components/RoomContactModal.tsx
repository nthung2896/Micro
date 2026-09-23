"use client";
import React from "react";
import { Modal } from "antd";
import {
  SafetyCertificateOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import { RoomListing } from "./types";
import { formatVnd } from "./utils";

interface RoomContactModalProps {
  room: RoomListing | null;
  onClose: () => void;
}

export default function RoomContactModal({ room, onClose }: RoomContactModalProps) {
  if (!room) return null;

  return (
    <Modal
      open={Boolean(room)}
      onCancel={onClose}
      footer={null}
      centered
      width={480}
      title={
        <div className="flex items-center gap-2 text-[#0355a2] font-bold text-base">
          <SafetyCertificateOutlined className="text-lg text-emerald-500" />
          <span>Thông tin liên hệ chính chủ</span>
        </div>
      }
    >
      <div className="pt-2">
        <div className="p-3 bg-blue-50 rounded-xl mb-4 border border-blue-100">
          <div className="text-xs font-bold text-blue-800 uppercase tracking-wide">
            {room.loaiPhong} {room.maPhong && `• ${room.maPhong}`}
          </div>
          <div className="font-bold text-gray-900 text-sm mt-0.5 line-clamp-2">
            {room.tieuDe}
          </div>
          <div className="text-xs text-gray-600 mt-1 flex items-center gap-1">
            <EnvironmentOutlined className="text-red-500 shrink-0" />
            <span className="truncate">{room.diaChi}</span>
          </div>
          <div className="mt-2 text-base font-extrabold text-red-600">
            {formatVnd(room.giaChoThue)}
            <span className="text-xs font-medium text-gray-500"> / tháng</span>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200">
            <span className="text-xs font-semibold text-gray-500">Chủ nhà / Người liên hệ:</span>
            <span className="text-sm font-extrabold text-gray-900">{room.tenLienHe}</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200">
            <span className="text-xs font-semibold text-gray-500">Số điện thoại liên hệ:</span>
            <span className="text-base font-black text-blue-700 tracking-wide">
              {room.soDienThoaiLienHe}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <a
            href={`tel:${room.soDienThoaiLienHe}`}
            className="flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 shadow-md transition-all active:scale-95 text-center"
          >
            <PhoneOutlined />
            <span>Gọi điện thoại</span>
          </a>

          <a
            href={`https://zalo.me/${room.zaloLienHe || room.soDienThoaiLienHe}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white bg-[#0068ff] hover:bg-[#0052cc] shadow-md transition-all active:scale-95 text-center"
          >
            <MessageOutlined />
            <span>Nhắn Zalo</span>
          </a>
        </div>

        <p className="text-[11px] text-center text-gray-400 mt-4">
          Lưu ý an toàn: Không chuyển tiền đặt cọc khi chưa xem phòng thực tế và ký kết hợp đồng rõ ràng.
        </p>
      </div>
    </Modal>
  );
}
