"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Empty, Button, Spin } from "antd";
import { HeartFilled, ArrowLeftOutlined, DeleteOutlined } from "@ant-design/icons";
import phongTroService from "@/services/phongTro/phongTroService";
import {
  RoomListing,
  SAMPLE_ROOMS,
  mapPhongTroToRoom,
  RoomCard,
  RoomDetailModal,
  RoomContactModal,
} from "../_components";

export default function TinDaLuuPage() {
  const [savedRooms, setSavedRooms] = useState<RoomListing[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [detailModalRoom, setDetailModalRoom] = useState<RoomListing | null>(null);
  const [contactModalRoom, setContactModalRoom] = useState<RoomListing | null>(null);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        let allRooms: RoomListing[] = [];
        try {
          const res = await phongTroService.getData({ pageIndex: 1, pageSize: 100 });
          if (res?.data?.items && res.data.items.length > 0) {
            allRooms = res.data.items.map(mapPhongTroToRoom);
          } else {
            allRooms = SAMPLE_ROOMS;
          }
        } catch (e) {
          allRooms = SAMPLE_ROOMS;
        }

        // Đọc danh sách ID đã lưu từ localStorage
        const savedIdsJson = localStorage.getItem("saved_room_ids");
        let savedIds: string[] = [];
        if (savedIdsJson) {
          try {
            savedIds = JSON.parse(savedIdsJson);
          } catch (err) {
            savedIds = [];
          }
        }

        // Nếu chưa lưu tin nào, hiển thị mặc định 2 phòng mẫu để người dùng dễ hình dung
        if (savedIds.length === 0) {
          setSavedRooms(allRooms.slice(0, 2));
        } else {
          const matched = allRooms.filter((r) => savedIds.includes(r.id));
          setSavedRooms(matched.length > 0 ? matched : allRooms.slice(0, 2));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  const handleClearAll = () => {
    localStorage.removeItem("saved_room_ids");
    setSavedRooms([]);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] py-6 sm:py-8 text-gray-800">
      <div className="max-w-[1100px] mx-auto px-4">
        {/* Breadcrumb */}
        <div className="text-xs text-gray-500 mb-4 flex items-center gap-1.5 font-medium">
          <Link href="/" className="hover:text-blue-600">
            Trang chủ
          </Link>
          <span>/</span>
          <span className="text-gray-800 font-bold">Tin đã lưu</span>
        </div>

        {/* Tiêu đề & Nút xóa tất cả */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 flex items-center gap-2.5">
              <HeartFilled className="text-red-500" />
              <span>Danh Sách Phòng Trọ Đã Lưu</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Bạn đang lưu <b className="text-red-600 font-bold">{savedRooms.length}</b> tin phòng trọ yêu thích.
            </p>
          </div>

          {savedRooms.length > 0 && (
            <Button
              onClick={handleClearAll}
              icon={<DeleteOutlined />}
              danger
              className="rounded-xl text-xs font-semibold"
            >
              Xóa tất cả tin đã lưu
            </Button>
          )}
        </div>

        {/* Danh sách phòng đã lưu */}
        <Spin spinning={loading}>
          {savedRooms.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-200">
              <Empty
                description={
                  <div className="space-y-1">
                    <p className="text-gray-700 font-bold text-base">
                      Bạn chưa lưu tin phòng trọ nào
                    </p>
                    <p className="text-gray-400 text-xs">
                      Hãy bấm vào biểu tượng trái tim ở các phòng trọ để lưu lại và tiện liên hệ chủ nhà sau!
                    </p>
                  </div>
                }
              >
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 mt-3 px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 shadow-md transition-all active:scale-95"
                >
                  <ArrowLeftOutlined />
                  <span>Khám phá danh sách phòng ngay</span>
                </Link>
              </Empty>
            </div>
          ) : (
            <div className="space-y-4">
              {savedRooms.map((room) => {
                const isVip =
                  room.isNoiBat ||
                  room.goiTin === "VIP_KIMCUONG" ||
                  room.goiTin === "VIP_1" ||
                  room.goiTin === "VIP_2";
                return (
                  <RoomCard
                    key={room.id}
                    room={room}
                    isVip={isVip}
                    onDetailClick={() => setDetailModalRoom(room)}
                    onContactClick={() => setContactModalRoom(room)}
                  />
                );
              })}
            </div>
          )}
        </Spin>

        {/* Back to home link */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800"
          >
            <ArrowLeftOutlined />
            <span>Quay lại trang chủ tìm phòng</span>
          </Link>
        </div>
      </div>

      {/* Modals */}
      <RoomDetailModal
        room={detailModalRoom}
        onClose={() => setDetailModalRoom(null)}
        onContactClick={(room) => setContactModalRoom(room)}
      />

      <RoomContactModal
        room={contactModalRoom}
        onClose={() => setContactModalRoom(null)}
      />
    </div>
  );
}
