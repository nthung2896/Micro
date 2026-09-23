"use client";
import {
  AppstoreOutlined,
  CheckCircleOutlined,
  LeftOutlined,
  RightOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { apiService } from "@/services";
import { Button, Input, Select, Skeleton } from "antd";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

/** Các mã category hợp lệ */
const VALID_CATEGORIES = new Set([
  "NenTangTrucTuyen",
  "DatHangNuocNgoai",
  "TrungGianTrongNuoc",
  "TrungGianNuocNgoai",
]);

/** Đọc mảng categories từ URL param ?categories=A,B,C */
function parseCatsFromUrl(param: string | null): string[] {
  if (!param) return [];
  return param
    .split(",")
    .map((v) => v.trim())
    .filter((v) => VALID_CATEGORIES.has(v));
}

/** Xây dựng URL mới không thay đổi các params khác */
function buildUrl(
  current: URLSearchParams,
  cats: string[],
  kw: string,
  page: number,
): string {
  const p = new URLSearchParams(current.toString());
  if (cats.length > 0) p.set("categories", cats.join(","));
  else p.delete("categories");
  if (kw) p.set("keyword", kw);
  else p.delete("keyword");
  if (page > 1) p.set("page", String(page));
  else p.delete("page");
  return `?${p.toString()}`;
}

type PortalPlatform = {
  id: string;
  name?: string;
  domain?: string;
  logo?: string;
  mauSo?: string;
  categoryCode?: string;
  categoryLabel?: string;
  reviewDate?: string;
  companyName?: string;
  companyTaxCode?: string;
  status?: number;
  statusName?: string;
};

type PagedResult = {
  items: PortalPlatform[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;
  totalPage: number;
};

const CATEGORY_OPTIONS = [
  { label: "Nền tảng trực tuyến", value: "NenTangTrucTuyen" },
  { label: "Đặt hàng nước ngoài", value: "DatHangNuocNgoai" },
  { label: "Trung gian trong nước", value: "TrungGianTrongNuoc" },
  { label: "Trung gian nước ngoài", value: "TrungGianNuocNgoai" },
];

const PAGE_SIZE = 24;

function statusColor(status?: number): { bg: string; color: string; border: string } {
  switch (status) {
    case 5:
      return { bg: "#dcfce7", color: "#15803d", border: "#bbf7d0" };
    case 4:
      return { bg: "#dbeafe", color: "#1d4ed8", border: "#bfdbfe" };
    case 1:
    case 6:
      return { bg: "#fef3c7", color: "#b45309", border: "#fde68a" };
    case 2:
      return { bg: "#fef3c7", color: "#92400e", border: "#fde68a" };
    case 3:
    case 7:
      return { bg: "#fee2e2", color: "#b91c1c", border: "#fecaca" };
    default:
      return { bg: "#f3f4f6", color: "#374151", border: "#e5e7eb" };
  }
}

export default function NenTangPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Khởi tạo state từ URL (chạy 1 lần)
  const [result, setResult] = useState<PagedResult>({
    items: [], totalCount: 0, pageIndex: 1, pageSize: PAGE_SIZE, totalPage: 0,
  });
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState(() => searchParams.get("keyword") ?? "");
  const [categories, setCategories] = useState<string[]>(
    () => parseCatsFromUrl(searchParams.get("categories")),
  );
  const [pageIndex, setPageIndex] = useState(
    () => Math.max(1, Number(searchParams.get("page") ?? 1)),
  );

  const fetchData = useCallback(
    async (kw: string, cats: string[], page: number) => {
      setLoading(true);
      try {
        const res = await apiService.post<PagedResult>("/HomeBlock/SearchPlatforms", {
          keyword: kw || undefined,
          categoryCodes: cats.length > 0 ? cats : undefined,
          pageIndex: page,
          pageSize: PAGE_SIZE,
        });
        setResult(res?.data ?? { items: [], totalCount: 0, pageIndex: page, pageSize: PAGE_SIZE, totalPage: 0 });
      } catch {
        setResult({ items: [], totalCount: 0, pageIndex: page, pageSize: PAGE_SIZE, totalPage: 0 });
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Lần đầu + khi categories hoặc page thay đổi — cũng cập nhật URL
  useEffect(() => {
    fetchData(keyword, categories, pageIndex);
    router.replace(buildUrl(searchParams, categories, keyword, pageIndex), { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories, pageIndex]);

  // Debounce keyword bằng native setTimeout – không cần thư viện ngoài
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debouncedSearch = useCallback(
    (kw: string, cats: string[]) => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        setPageIndex(1);
        fetchData(kw, cats, 1);
        router.replace(buildUrl(searchParams, cats, kw, 1), { scroll: false });
      }, 400);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fetchData],
  );

  const handleKeywordChange = (val: string) => {
    setKeyword(val);
    debouncedSearch(val, categories);
  };

  const handleCategoryChange = (val: string[]) => {
    setCategories(val);
    setPageIndex(1);
  };

  const { items, totalCount, totalPage } = result;

  return (
    <div className="bg-white">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-5">
        <div className="text-xs text-gray-600 mb-3 border-b border-gray-200 pb-2">
          <Link href="/" className="hover:text-[#0143DF]">
            Trang chủ
          </Link>
          <span className="mx-1.5 text-gray-400">›</span>
          <span className="text-gray-800 font-medium">Nền tảng TMĐT</span>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-3 mb-4 pb-2 border-b-[3px] border-[#0143DF]">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-[#0143DF] uppercase">
              Nền tảng TMĐT
            </h1>
            <span className="text-sm text-gray-500">
              ({totalCount} nền tảng)
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Input
              placeholder="Tên, domain, DN, MST..."
              prefix={<SearchOutlined className="text-gray-400" />}
              value={keyword}
              onChange={(e) => handleKeywordChange(e.target.value)}
              allowClear
              onClear={() => handleKeywordChange("")}
              className="w-[260px]!"
            />
            <Select
              mode="multiple"
              value={categories}
              onChange={handleCategoryChange}
              options={CATEGORY_OPTIONS}
              placeholder="Tất cả nhóm"
              allowClear
              maxTagCount="responsive"
              className="w-[260px]!"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="border border-gray-200 rounded p-3">
                <Skeleton.Image active style={{ width: "100%", height: 56 }} />
                <Skeleton active paragraph={{ rows: 1 }} title={false} />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center border border-gray-200 rounded">
            <AppstoreOutlined className="text-5xl text-gray-300 mb-3" />
            <div className="text-gray-500">Không tìm thấy nền tảng nào</div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {items.map((p) => (
                <Link
                  key={p.id}
                  href={`/nen-tang/${p.id}`}
                  className="border border-gray-200 rounded p-3 bg-white flex flex-col items-center text-center hover:border-[#0143DF] hover:bg-[#f4f8ff] transition"
                >
                  <div
                    className="w-full flex items-center justify-center mb-2 px-2 relative"
                    style={{ height: 56 }}
                  >
                    {p.logo && (
                      <img
                        src={p.logo}
                        alt={p.name}
                        style={{
                          maxHeight: 56,
                          maxWidth: "100%",
                          width: "auto",
                          objectFit: "contain",
                        }}
                      />
                    )}
                    {p.status === 5 && (
                      <img
                        src="/icon-chungnhanCCDV.png"
                        alt="Đã chứng nhận"
                        title="Đã đăng ký với Bộ Công Thương"
                        style={{
                          position: "absolute",
                          top: -6,
                          right: 4,
                          width: 22,
                          height: 22,
                          objectFit: "contain",
                          pointerEvents: "none",
                        }}
                      />
                    )}
                  </div>
                  <div className="font-semibold text-sm text-gray-800 truncate w-full">
                    {p.name}
                  </div>
                  <div className="text-[11px] text-gray-500 truncate w-full mb-2">
                    {p.domain}
                  </div>
                  {(() => {
                    const c = statusColor(p.status);
                    return (
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase border"
                        style={{ background: c.bg, color: c.color, borderColor: c.border }}
                      >
                        {p.status === 5 && <CheckCircleOutlined />}
                        {p.statusName || "—"}
                      </span>
                    );
                  })()}
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPage > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <Button
                  icon={<LeftOutlined />}
                  disabled={pageIndex <= 1}
                  onClick={() => setPageIndex((p) => p - 1)}
                  size="small"
                />
                {Array.from({ length: totalPage }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPage || Math.abs(p - pageIndex) <= 2)
                  .reduce<(number | "...")[]>((acc, p, i, arr) => {
                    if (i > 0 && typeof arr[i - 1] === "number" && p - (arr[i - 1] as number) > 1) {
                      acc.push("...");
                    }
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    p === "..." ? (
                      <span key={`ellipsis-${i}`} className="px-1 text-gray-400">…</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPageIndex(p as number)}
                        className={`w-8 h-8 rounded text-sm font-medium transition ${pageIndex === p
                            ? "bg-[#0143DF] text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                      >
                        {p}
                      </button>
                    ),
                  )}
                <Button
                  icon={<RightOutlined />}
                  disabled={pageIndex >= totalPage}
                  onClick={() => setPageIndex((p) => p + 1)}
                  size="small"
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
