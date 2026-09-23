"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Spin, Empty, Button, Pagination } from "antd";
import phongTroService from "@/services/phongTro/phongTroService";
import tinhService from "@/services/tinh/tinh.service";
import { useSelector } from "@/store/hooks";

import {
  RoomListing,
  FilterAmenities,
  SortTabType,
  DEFAULT_TINH,
  SAMPLE_ROOMS,
  PRICE_RANGES,
  AREA_RANGES,
  mapPhongTroToRoom,
  getProvincePriority,
  HeroSearchSection,
  LocationFilterHeader,
  RoomTabs,
  RoomCard,
  RoomSidebar,
  RoomDetailModal,
  RoomContactModal,
  RoomCtaBanner,
  RoomPagination,
  KeywordSuggestions,
} from "./_components";

export default function PortalHomePage() {
  const appConfig = useSelector((state: any) => state.general.appConfig);
  const appName = appConfig?.tenApp || "Hệ thống quản lý phòng trọ";

  // Dữ liệu danh sách phòng từ database
  const [rooms, setRooms] = useState<RoomListing[]>([]);
  const [loadingRooms, setLoadingRooms] = useState<boolean>(true);

  // Danh mục tỉnh thành từ API
  const [tinhOptions, setTinhOptions] = useState<{ label: string; value: string }[]>([]);

  // Bộ lọc tìm kiếm
  const [selectedTinh, setSelectedTinh] = useState<string | undefined>(undefined);
  const [selectedPrice, setSelectedPrice] = useState<string>("ALL");
  const [selectedArea, setSelectedArea] = useState<string>("ALL");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [keyword, setKeyword] = useState<string>("");

  // Tab sắp xếp danh sách phòng
  const [activeTab, setActiveTab] = useState<SortTabType>("dexuat");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 6; // 6 phòng/trang gọn gàng giúp cuộn vừa vặn và có nhiều trang

  // Tiện nghi lọc nhanh
  const [filterAmenities, setFilterAmenities] = useState<FilterAmenities>({
    dieuHoa: false,
    mayGiat: false,
    nongLanh: false,
    gioTuDo: false,
    tuLanh: false,
    banCong: false,
  });

  // Modals
  const [contactModalRoom, setContactModalRoom] = useState<RoomListing | null>(null);
  const [detailModalRoom, setDetailModalRoom] = useState<RoomListing | null>(null);

  // 1. Tải danh sách phòng trọ từ API (kết hợp với dữ liệu mẫu để luôn có nhiều tin)
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoadingRooms(true);
        const res = await phongTroService.getData({ pageIndex: 1, pageSize: 100 });
        if (res?.data?.items && res.data.items.length > 0) {
          const apiRooms = res.data.items.map(mapPhongTroToRoom);
          // Kết hợp các tin từ API và danh sách tin mẫu để người dùng luôn có nhiều trang trải nghiệm
          const combined = [
            ...apiRooms,
            ...SAMPLE_ROOMS.filter((s) => !apiRooms.some((a: any) => a.id === s.id)),
          ];
          setRooms(combined);
        } else {
          setRooms(SAMPLE_ROOMS);
        }
      } catch (err) {
        console.warn("Chưa tải được dữ liệu phòng từ API, dùng danh sách mẫu:", err);
        setRooms(SAMPLE_ROOMS);
      } finally {
        setLoadingRooms(false);
      }
    };
    fetchRooms();
  }, []);

  // 2. Tải danh sách Tỉnh (Ưu tiên Hà Nội, TP.HCM, Hải Phòng, Đà Nẵng)
  useEffect(() => {
    const fetchTinh = async () => {
      try {
        const res = await tinhService.getData({ page: 1, pageSize: 100 } as any);
        if (res?.status && res?.data?.items && res.data.items.length > 0) {
          const sorted = [...res.data.items]
            .map((t: any) => ({
              label: t.tenTinh,
              value: t.maTinh,
            }))
            .sort((a, b) => {
              const pA = getProvincePriority(a.label, a.value);
              const pB = getProvincePriority(b.label, b.value);
              if (pA !== pB) return pA - pB;
              return a.label.localeCompare(b.label, "vi");
            });
          setTinhOptions(sorted);
        } else {
          setTinhOptions(DEFAULT_TINH);
        }
      } catch (err) {
        setTinhOptions(DEFAULT_TINH);
      }
    };
    fetchTinh();
  }, []);

  // Lọc dữ liệu phòng theo các tiêu chí
  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      if (keyword.trim()) {
        const kw = keyword.toLowerCase();
        const match =
          room.tieuDe.toLowerCase().includes(kw) ||
          room.diaChi.toLowerCase().includes(kw) ||
          (room.maPhong && room.maPhong.toLowerCase().includes(kw)) ||
          room.loaiPhong.toLowerCase().includes(kw);
        if (!match) return false;
      }

      if (selectedTinh && room.maTinh && room.maTinh !== selectedTinh) return false;
      if (selectedType !== "ALL" && room.loaiPhong !== selectedType) return false;

      if (selectedPrice !== "ALL") {
        const priceRule = PRICE_RANGES.find((p) => p.value === selectedPrice);
        if (priceRule && (room.giaChoThue < priceRule.min! || room.giaChoThue > priceRule.max!)) {
          return false;
        }
      }

      if (selectedArea !== "ALL") {
        const areaRule = AREA_RANGES.find((a) => a.value === selectedArea);
        if (areaRule && (room.dienTich < areaRule.min || room.dienTich > areaRule.max)) {
          return false;
        }
      }

      if (filterAmenities.dieuHoa && !room.coDieuHoa) return false;
      if (filterAmenities.mayGiat && !room.coMayGiat) return false;
      if (filterAmenities.nongLanh && !room.coNongLanh) return false;
      if (filterAmenities.gioTuDo && !room.gioGiacTuDo) return false;
      if (filterAmenities.tuLanh && !room.coTuLanh) return false;
      if (filterAmenities.banCong && !room.coBanCong) return false;

      return true;
    });
  }, [rooms, keyword, selectedTinh, selectedPrice, selectedArea, selectedType, filterAmenities]);

  // Sắp xếp dữ liệu theo Tab
  const sortedRooms = useMemo(() => {
    const list = [...filteredRooms];
    if (activeTab === "moidang") {
      return list.reverse();
    }
    if (activeTab === "giare") {
      return list.sort((a, b) => a.giaChoThue - b.giaChoThue);
    }
    if (activeTab === "video") {
      return list.filter((r) => r.danhSachHinhAnh?.length > 1 || r.isNoiBat);
    }
    // Tab "dexuat": VIP lên trước
    return list.sort((a, b) => {
      const getScore = (r: RoomListing) => {
        if (r.goiTin === "VIP_KIMCUONG") return 4;
        if (r.goiTin === "VIP_1") return 3;
        if (r.goiTin === "VIP_2") return 2;
        if (r.isNoiBat) return 1;
        return 0;
      };
      return getScore(b) - getScore(a);
    });
  }, [filteredRooms, activeTab]);

  // Phân trang
  const paginatedRooms = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedRooms.slice(start, start + pageSize);
  }, [sortedRooms, currentPage, pageSize]);

  // Xóa toàn bộ bộ lọc
  const handleResetFilter = () => {
    setSelectedTinh(undefined);
    setSelectedPrice("ALL");
    setSelectedArea("ALL");
    setSelectedType("ALL");
    setKeyword("");
    setFilterAmenities({
      dieuHoa: false,
      mayGiat: false,
      nongLanh: false,
      gioTuDo: false,
      tuLanh: false,
      banCong: false,
    });
    setCurrentPage(1);
  };

  const handleToggleAmenity = (key: keyof FilterAmenities) => {
    setFilterAmenities((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="w-full bg-[#f8fafc] min-h-screen text-gray-800">
      {/* 1. HERO SEARCH BANNER */}
      <HeroSearchSection
        appName={appName}
        keyword={keyword}
        onKeywordChange={(kw) => {
          setKeyword(kw);
          setCurrentPage(1);
        }}
        selectedTinh={selectedTinh}
        onTinhChange={(val) => {
          setSelectedTinh(val);
          setCurrentPage(1);
        }}
        tinhOptions={tinhOptions}
        selectedPrice={selectedPrice}
        onPriceChange={(val) => {
          setSelectedPrice(val);
          setCurrentPage(1);
        }}
        selectedType={selectedType}
        onTypeChange={(val) => {
          setSelectedType(val);
          setCurrentPage(1);
        }}
        filterAmenities={filterAmenities}
        onToggleAmenity={handleToggleAmenity}
        onResetFilter={handleResetFilter}
        foundCount={filteredRooms.length}
      />

      {/* 2. MAIN CONTENT */}
      <div className="max-w-[1240px] mx-auto px-4 py-6 sm:py-8">
        {/* Breadcrumb & Bộ chọn Tỉnh/Thành */}
        <LocationFilterHeader
          selectedTinh={selectedTinh}
          tinhOptions={tinhOptions}
          totalRooms={sortedRooms.length}
          onSelectTinh={(code) => {
            setSelectedTinh(code);
            setCurrentPage(1);
          }}
        />

        {/* Lưới nội dung chính: 2 cột (Cột trái: Danh sách phòng, Cột phải: Sidebar) */}
        <div
          id="room-listings-section"
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
        >
          {/* Cột trái: Tab & Khối phòng nằm ngang */}
          <div className="lg:col-span-8">
            <Spin spinning={loadingRooms}>
              <RoomTabs
                activeTab={activeTab}
                onTabChange={(tab) => {
                  setActiveTab(tab);
                  setCurrentPage(1);
                }}
              />

              {paginatedRooms.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-200">
                  <Empty
                    description={
                      <span className="text-gray-500 font-medium">
                        Không tìm thấy phòng trọ nào phù hợp với bộ lọc hoặc tab hiện tại.
                      </span>
                    }
                  >
                    <Button type="primary" onClick={handleResetFilter}>
                      Xóa bộ lọc để xem tất cả
                    </Button>
                  </Empty>
                </div>
              ) : (
                <div className="space-y-3">
                  {paginatedRooms.map((room) => {
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

              {/* Phân trang dạng chuẩn Phongtro123 */}
              <RoomPagination
                currentPage={currentPage}
                totalPages={Math.ceil(sortedRooms.length / pageSize)}
                onPageChange={(page) => {
                  setCurrentPage(page);
                  const el = document.getElementById("room-listings-section");
                  if (el) {
                    el.scrollIntoView({ behavior: "smooth", block: "start" });
                  }
                }}
              />

              {/* Tìm kiếm theo từ khóa & Khối SEO */}
              <KeywordSuggestions
                onKeywordClick={(kw) => {
                  setKeyword(kw);
                  setCurrentPage(1);
                  const el = document.getElementById("room-listings-section");
                  if (el) {
                    el.scrollIntoView({ behavior: "smooth", block: "start" });
                  }
                }}
              />
            </Spin>
          </div>

          {/* Cột phải: Sidebar Widgets */}
          <div className="lg:col-span-4">
            <RoomSidebar
              rooms={rooms}
              selectedPrice={selectedPrice}
              onSelectPrice={(val) => {
                setSelectedPrice(val);
                setCurrentPage(1);
              }}
              selectedArea={selectedArea}
              onSelectArea={(val) => {
                setSelectedArea(val);
                setCurrentPage(1);
              }}
              selectedType={selectedType}
              onSelectType={(val) => {
                setSelectedType(val);
                setCurrentPage(1);
              }}
              onDetailClick={(room) => setDetailModalRoom(room)}
            />
          </div>
        </div>

        {/* 3. BANNER KÊU GỌI ĐĂNG TIN */}
        <RoomCtaBanner appName={appName} />
      </div>

      {/* 4. MODALS */}
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
