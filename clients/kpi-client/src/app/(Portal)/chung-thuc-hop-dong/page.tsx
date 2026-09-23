"use client";
import {
  AppstoreOutlined,
  CheckCircleOutlined,
  LeftOutlined,
  RightOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { apiService } from "@/services";
import { Button, Input, Skeleton } from "antd";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

/** Xây dựng URL mới không làm mất các params khác */
function buildUrl(current: URLSearchParams, kw: string, page: number): string {
  const p = new URLSearchParams(current.toString());
  if (kw) p.set("keyword", kw);
  else p.delete("keyword");
  if (page > 1) p.set("page", String(page));
  else p.delete("page");
  return `?${p.toString()}`;
}

type PortalContract = {
  id: string;
  name?: string;
  domain?: string;
  logo?: string;
  chuSoHuu?: string;
  companyTaxCode?: string;
  status?: number;
  statusName?: string;
  updatedDate?: string;
};

type PagedResult = {
  items: PortalContract[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;
  totalPage: number;
};

const PAGE_SIZE = 24;

export default function ChungThucHopDongPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [result, setResult] = useState<PagedResult>({
    items: [], totalCount: 0, pageIndex: 1, pageSize: PAGE_SIZE, totalPage: 0,
  });
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState(() => searchParams.get("keyword") ?? "");
  const [pageIndex, setPageIndex] = useState(
    () => Math.max(1, Number(searchParams.get("page") ?? 1)),
  );

  const fetchData = useCallback(
    async (kw: string, page: number) => {
      setLoading(true);
      try {
        const res = await apiService.post<PagedResult>("/HomeBlock/SearchContracts", {
          keyword: kw || undefined,
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

  // Load khi page thay đổi
  useEffect(() => {
    fetchData(keyword, pageIndex);
    router.replace(buildUrl(searchParams, keyword, pageIndex), { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIndex]);

  // Debounce keyword
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleKeywordChange = useCallback(
    (val: string) => {
      setKeyword(val);
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        setPageIndex(1);
        fetchData(val, 1);
        router.replace(buildUrl(searchParams, val, 1), { scroll: false });
      }, 400);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fetchData],
  );

  const { items, totalCount, totalPage } = result;

  return (
    <div className="bg-white">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-5">
        {/* Breadcrumb */}
        <div className="text-xs text-gray-600 mb-3 border-b border-gray-200 pb-2">
          <Link href="/" className="hover:text-[#0143DF]">
            Trang chủ
          </Link>
          <span className="mx-1.5 text-gray-400">›</span>
          <span className="text-gray-800 font-medium">Chứng thực hợp đồng điện tử</span>
        </div>

        {/* Header + Search */}
        <div className="flex flex-wrap items-end justify-between gap-3 mb-4 pb-2 border-b-[3px] border-[#0143DF]">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-[#0143DF] uppercase">
              Chứng thực hợp đồng điện tử
            </h1>
            <span className="text-sm text-gray-500">
              ({totalCount} dịch vụ)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Tên, domain, chủ sở hữu, MST..."
              prefix={<SearchOutlined className="text-gray-400" />}
              value={keyword}
              onChange={(e) => handleKeywordChange(e.target.value)}
              allowClear
              onClear={() => handleKeywordChange("")}
              className="w-[300px]!"
            />
          </div>
        </div>

        {/* Grid */}
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
            <div className="text-gray-500">Không tìm thấy dịch vụ nào</div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {items.map((c) => (
                <div
                  key={c.id}
                  className="border border-gray-200 rounded p-3 bg-white flex flex-col items-center text-center hover:border-[#0143DF] hover:bg-[#f4f8ff] transition cursor-default"
                >
                  {/* Logo */}
                  <div
                    className="w-full flex items-center justify-center mb-2 px-2 relative"
                    style={{ height: 56 }}
                  >
                    {c.logo ? (
                      <img
                        src={c.logo}
                        alt={c.name}
                        style={{ maxHeight: 56, maxWidth: "100%", width: "auto", objectFit: "contain" }}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-[#e8f0fe] flex items-center justify-center text-[#0143DF] text-xl font-bold">
                        {(c.name || "?")[0].toUpperCase()}
                      </div>
                    )}
                    {/* Badge đã xác nhận */}
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
                  </div>

                  {/* Tên */}
                  <div className="font-semibold text-sm text-gray-800 truncate w-full">
                    {c.name}
                  </div>

                  {/* Domain */}
                  {c.domain && (
                    <a
                      href={c.domain.startsWith("http") ? c.domain : `https://${c.domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-[#0143DF] truncate w-full mb-1 hover:underline"
                    >
                      {c.domain}
                    </a>
                  )}

                  {/* Chủ sở hữu */}
                  {c.chuSoHuu && (
                    <div className="text-[11px] text-gray-500 truncate w-full mb-2">
                      {c.chuSoHuu}
                    </div>
                  )}

                  {/* Badge */}
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase border bg-[#dcfce7] text-[#15803d] border-[#bbf7d0]">
                    <CheckCircleOutlined />
                    Đã xác nhận
                  </span>
                </div>
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
                      <span key={`el-${i}`} className="px-1 text-gray-400">…</span>
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
