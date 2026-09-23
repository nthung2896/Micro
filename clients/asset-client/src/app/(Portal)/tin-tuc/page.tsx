"use client";
import {
  BookOutlined,
  CaretRightOutlined,
  FileTextOutlined,
  NotificationOutlined,
  QuestionCircleOutlined,
  SearchOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import tinTucService from "@/services/tinTuc/tinTuc.service";
import { TinTucDto } from "@/types/tinTuc";
import { Input, Skeleton } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
const staticUrl = process.env.NEXT_PUBLIC_STATIC_FILE_BASE_URL || "";

dayjs.locale("vi");

const PAGE_SIZE = 8;

const categoryMap: Record<
  string,
  { bg: string; color: string; icon: ReactNode; label: string }
> = {
  "Thông báo": {
    bg: "#fef3c7",
    color: "#b45309",
    icon: <NotificationOutlined />,
    label: "THÔNG BÁO",
  },
  "Cảnh báo": {
    bg: "#fee2e2",
    color: "#b91c1c",
    icon: <WarningOutlined />,
    label: "CẢNH BÁO",
  },
  "Tin tức": {
    bg: "#dbeafe",
    color: "#1d4ed8",
    icon: <FileTextOutlined />,
    label: "TIN TỨC",
  },
  "Hỏi đáp": {
    bg: "#dcfce7",
    color: "#15803d",
    icon: <QuestionCircleOutlined />,
    label: "HỎI ĐÁP",
  },
  "Hướng dẫn": {
    bg: "#ede9fe",
    color: "#6d28d9",
    icon: <BookOutlined />,
    label: "HƯỚNG DẪN",
  },
  "Giới thiệu": {
    bg: "#ede9fe",
    color: "#6d28d9",
    icon: <FileTextOutlined />,
    label: "GIỚI THIỆU",
  },
};

function CategoryBadge({ name }: { name?: string | null }) {
  const c = categoryMap[name || ""] || {
    bg: "#f3f4f6",
    color: "#374151",
    icon: null,
    label: name,
  };
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold uppercase"
      style={{ background: c.bg, color: c.color }}
    >
      {c.icon}
      {c.label}
    </span>
  );
}

function ThumbPlaceholder({ category }: { category?: string | null }) {
  const map: Record<string, { bg: string; icon: ReactNode; label: string }> = {
    "Cảnh báo": { bg: "#7f1d1d", icon: <WarningOutlined />, label: "CẢNH BÁO" },
    "Thông báo": {
      bg: "#b45309",
      icon: <NotificationOutlined />,
      label: "THÔNG BÁO",
    },
    "Tin tức": {
      bg: "#1d4ed8",
      icon: <FileTextOutlined />,
      label: "TIN TỨC",
    },
    "Hỏi đáp": {
      bg: "#15803d",
      icon: <QuestionCircleOutlined />,
      label: "HỎI ĐÁP",
    },
    "Hướng dẫn": {
      bg: "#6d28d9",
      icon: <BookOutlined />,
      label: "HƯỚNG DẪN",
    },
    "Giới thiệu": {
      bg: "#6d28d9",
      icon: <FileTextOutlined />,
      label: "GIỚI THIỆU",
    },
  };
  const c = map[category || ""] || {
    bg: "#374151",
    icon: <FileTextOutlined />,
    label: "TIN",
  };
  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center text-white"
      style={{ background: c.bg }}
    >
      <div className="text-3xl mb-1">{c.icon}</div>
      <div className="text-[10px] font-bold tracking-wider">{c.label}</div>
    </div>
  );
}

function NewsListItem({ item }: { item: TinTucDto }) {
  const date = item.ngayXuatBan
    ? dayjs(item.ngayXuatBan).format("DD/MM/YYYY HH:mm")
    : "";
  return (
    <Link
      href={`/tin-tuc/${item.slug || item.id}`}
      className="flex gap-4 py-4 border-b border-gray-200 last:border-b-0 hover:bg-[#eff6ff] transition px-3 -mx-3"
    >
      <div className="w-[170px] h-[110px] shrink-0 rounded overflow-hidden bg-gray-100 border border-gray-200">
        {item.anhDaiDien ? (
          <img
            src={item.anhDaiDien ? `${staticUrl}/${item.anhDaiDien}` : ""}
            alt={item.tieuDe}
            className="w-full h-full object-cover"
          />
        ) : (
          <ThumbPlaceholder category={item.tenDanhMuc} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <CategoryBadge name={item.tenDanhMuc} />
          {date && <span className="text-[11px] text-gray-500">{date}</span>}
        </div>
        <h3 className="text-[15px] font-bold text-gray-900 leading-snug mb-1.5 line-clamp-2 hover:text-[#0143DF]">
          {item.tieuDe}
        </h3>
        <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
          {item.moTaNgan || ""}
        </p>
      </div>
    </Link>
  );
}

function SidebarSection({
  title,
  items,
}: {
  title: string;
  items: TinTucDto[];
}) {
  return (
    <div className="border border-gray-200 rounded overflow-hidden">
      <div className="bg-[#0143DF] text-white text-sm font-bold uppercase px-3 py-2 flex items-center gap-2">
        <CaretRightOutlined className="text-yellow-300" />
        {title}
      </div>
      <ul className="divide-y divide-gray-100">
        {items.map((it) => (
          <li key={it.id} className="px-3 py-2.5 hover:bg-gray-50">
            <Link
              href={`/tin-tuc/${it.slug || it.id}`}
              className="text-sm text-gray-800 hover:text-[#0143DF] line-clamp-2 leading-snug block font-medium"
            >
              {it.tieuDe}
            </Link>
            {it.ngayXuatBan && (
              <div className="text-[11px] text-gray-500 mt-1">
                {dayjs(it.ngayXuatBan).format("DD/MM/YYYY HH:mm")}
              </div>
            )}
          </li>
        ))}
        {items.length === 0 && (
          <li className="px-3 py-3 text-xs text-gray-400 italic">
            Chưa có tin
          </li>
        )}
      </ul>
    </div>
  );
}

function TinTucContent() {
  const search = useSearchParams();
  const danhMuc = search.get("danhMuc") || "";
  const [allItems, setAllItems] = useState<TinTucDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sidebarThongBao, setSidebarThongBao] = useState<TinTucDto[]>([]);
  const [sidebarCanhBao, setSidebarCanhBao] = useState<TinTucDto[]>([]);

  // Fetch initial data
  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    setAllItems([]);
    setPage(1);
    setHasMore(true);

    try {
      const response = await tinTucService.getPublicData({
        trangThai: 1,
        pageIndex: 1,
        pageSize: PAGE_SIZE,
        tenDanhMuc: danhMuc || undefined,
      });

      const items: TinTucDto[] = Array.isArray(response?.data?.items)
        ? response.data!.items
        : [];

      // Sort by ngayXuatBan descending
      items.sort((a, b) => {
        const da = a.ngayXuatBan ? new Date(a.ngayXuatBan).getTime() : 0;
        const db = b.ngayXuatBan ? new Date(b.ngayXuatBan).getTime() : 0;
        return db - da;
      });

      setAllItems(items);

      // Check if there are more items
      const totalCount = response?.data?.totalCount || 0;
      setHasMore(items.length < totalCount);
    } catch (error) {
      setAllItems([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load more data
  const loadMore = async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    const nextPage = page + 1;

    try {
      const response = await tinTucService.getPublicData({
        trangThai: 1,
        pageIndex: nextPage,
        pageSize: PAGE_SIZE,
        tenDanhMuc: danhMuc || undefined,
      });

      const newItems: TinTucDto[] = Array.isArray(response?.data?.items)
        ? response.data!.items
        : [];

      if (newItems.length === 0) {
        setHasMore(false);
      } else {
        setAllItems((prev) => [...prev, ...newItems]);
        setPage(nextPage);

        // Check if there are more items
        const totalCount = response?.data?.totalCount || 0;
        const currentTotal = allItems.length + newItems.length;
        setHasMore(currentTotal < totalCount);
      }
    } catch (error) {
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  };

  // Debounce ref for keyword search
  const keywordTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initial load and reset when danhMuc changes
  useEffect(() => {
    fetchInitialData();
  }, [danhMuc, fetchInitialData]);

  // Sidebar sections fetch independently — not derived from paginated main list
  useEffect(() => {
    let cancelled = false;
    Promise.all([
      tinTucService.getPublicData({ trangThai: 1, tenDanhMuc: "Thông báo", pageIndex: 1, pageSize: 5 }),
      tinTucService.getPublicData({ trangThai: 1, tenDanhMuc: "Cảnh báo", pageIndex: 1, pageSize: 5 }),
    ]).then(([tbRes, cbRes]) => {
      if (cancelled) return;
      setSidebarThongBao(Array.isArray(tbRes?.data?.items) ? tbRes.data!.items : []);
      setSidebarCanhBao(Array.isArray(cbRes?.data?.items) ? cbRes.data!.items : []);
    }).catch(() => {
      if (!cancelled) {
        setSidebarThongBao([]);
        setSidebarCanhBao([]);
      }
    });
    return () => { cancelled = true; };
  }, []);

  // Refetch when keyword changes (with debounce)
  useEffect(() => {
    // Clear previous timeout
    if (keywordTimeoutRef.current) {
      clearTimeout(keywordTimeoutRef.current);
    }

    // Set new timeout for debounced search
    keywordTimeoutRef.current = setTimeout(() => {
      if (keyword.trim()) {
        // When keyword is active, fetch from server with keyword filter
        const fetchWithKeyword = async () => {
          setLoading(true);
          setAllItems([]);
          setPage(1);
          setHasMore(true);

          try {
            const response = await tinTucService.getPublicData({
              trangThai: 1,
              pageIndex: 1,
              pageSize: PAGE_SIZE,
              keyword: keyword.trim(),
              tenDanhMuc: danhMuc || undefined,
            });

            const items: TinTucDto[] = Array.isArray(response?.data?.items)
              ? response.data!.items
              : [];

            items.sort((a, b) => {
              const da = a.ngayXuatBan ? new Date(a.ngayXuatBan).getTime() : 0;
              const db = b.ngayXuatBan ? new Date(b.ngayXuatBan).getTime() : 0;
              return db - da;
            });

            setAllItems(items);

            const totalCount = response?.data?.totalCount || 0;
            setHasMore(items.length < totalCount);
          } catch (error) {
            setAllItems([]);
            setHasMore(false);
          } finally {
            setLoading(false);
          }
        };

        fetchWithKeyword();
      } else if (allItems.length === 0 || keyword === "") {
        // If keyword cleared, refetch initial data
        fetchInitialData();
      }
    }, 500); // 500ms debounce

    return () => {
      if (keywordTimeoutRef.current) {
        clearTimeout(keywordTimeoutRef.current);
      }
    };
  }, [keyword, fetchInitialData]);

  const filtered = useMemo(() => {
    let list = allItems;
    // Backend already filters by tenDanhMuc, only apply keyword filter client-side
    if (keyword.trim()) {
      const k = keyword.trim().toLowerCase();
      list = list.filter(
        (x) =>
          (x.tieuDe || "").toLowerCase().includes(k) ||
          (x.moTaNgan || "").toLowerCase().includes(k),
      );
    }
    return list;
  }, [allItems, keyword]);

  const total = filtered.length;
  // Show all filtered items (they're already paginated server-side)
  const visible = filtered;

  const thongBaoLatest = sidebarThongBao;
  const canhBaoLatest = sidebarCanhBao;

  const pageTitle = danhMuc || "Tin tức";

  return (
    <div className="bg-white">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-5">
        {/* Breadcrumb */}
        <div className="text-xs text-gray-600 mb-3 border-b border-gray-200 pb-2">
          <Link href="/" className="hover:text-[#0143DF]">
            Trang chủ
          </Link>
          <span className="mx-1.5 text-gray-400">›</span>
          <Link href="/tin-tuc" className="hover:text-[#0143DF]">
            Tin tức
          </Link>
          {danhMuc && (
            <>
              <span className="mx-1.5 text-gray-400">›</span>
              <span className="text-gray-800 font-medium">{danhMuc}</span>
            </>
          )}
        </div>

        {/* Title + Filter cùng hàng */}
        <div className="flex flex-wrap items-end justify-between gap-3 mb-4 pb-2 border-b-[3px] border-[#0143DF]">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-[#0143DF] uppercase">
              {pageTitle}
            </h1>
          </div>
          <Input
            placeholder="Tìm kiếm tin tức..."
            prefix={<SearchOutlined className="text-gray-400" />}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            allowClear
            className="w-[320px]!"
          />
        </div>

        {/* Layout 2 cột */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Main list */}
          <div className="lg:col-span-2 border border-gray-200 rounded">
            {loading ? (
              <div className="p-4 space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex gap-4">
                    <Skeleton.Image
                      active
                      style={{ width: 170, height: 110 }}
                    />
                    <div className="flex-1">
                      <Skeleton active paragraph={{ rows: 2 }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : visible.length === 0 ? (
              <div className="py-16 text-center">
                <FileTextOutlined className="text-5xl text-gray-300 mb-3" />
                <div className="text-gray-500">Không tìm thấy tin nào</div>
              </div>
            ) : (
              <>
                <div className="px-4">
                  {visible.map((it) => (
                    <NewsListItem key={it.id} item={it} />
                  ))}
                </div>
                {hasMore && (
                  <div className="py-4 text-center border-t border-gray-200">
                    <button
                      onClick={loadMore}
                      disabled={loadingMore}
                      className="px-5 py-2 rounded border border-gray-300 hover:border-[#0143DF] hover:text-[#0143DF] text-sm font-medium transition disabled:opacity-50"
                    >
                      {loadingMore ? "Đang tải..." : "Xem thêm tin"}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-4">
            <SidebarSection title="Thông báo mới" items={thongBaoLatest} />
            <SidebarSection title="Cảnh báo mới" items={canhBaoLatest} />
          </aside>
        </div>
      </div>
    </div>
  );
}

export default function TinTucPage() {
  return (
    <Suspense fallback={<div className="py-10 text-center">Đang tải...</div>}>
      <TinTucContent />
    </Suspense>
  );
}
