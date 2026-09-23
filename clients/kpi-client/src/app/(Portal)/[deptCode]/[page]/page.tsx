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
import homeBlockService from "@/services/homeBlock/homeBlock.service";
import { TinTucDto } from "@/types/tinTuc";
import { Input, Skeleton } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState, type ReactNode } from "react";

const staticUrl = process.env.NEXT_PUBLIC_STATIC_FILE_BASE_URL || "";

dayjs.locale("vi");

const PAGE_SIZE = 8;

const PAGE_MAP: Record<string, { title: string; category: string | null }> = {
  "tin-tuc": { title: "Tin tức", category: null },
  "thong-bao": { title: "Thông báo", category: "Thông báo" },
  "canh-bao": { title: "Cảnh báo", category: "Cảnh báo" },
  "hoi-dap": { title: "Hỏi đáp", category: "Hỏi đáp" },
  "huong-dan": { title: "Hướng dẫn", category: "Hướng dẫn" },
  "gioi-thieu": { title: "Giới thiệu", category: "Giới thiệu" },
};

const categoryMeta: Record<string, { bg: string; color: string; icon: ReactNode; label: string }> = {
  "Thông báo": { bg: "#fef3c7", color: "#b45309", icon: <NotificationOutlined />, label: "THÔNG BÁO" },
  "Cảnh báo": { bg: "#fee2e2", color: "#b91c1c", icon: <WarningOutlined />, label: "CẢNH BÁO" },
  "Tin tức": { bg: "#dbeafe", color: "#1d4ed8", icon: <FileTextOutlined />, label: "TIN TỨC" },
  "Hỏi đáp": { bg: "#dcfce7", color: "#15803d", icon: <QuestionCircleOutlined />, label: "HỎI ĐÁP" },
  "Hướng dẫn": { bg: "#ede9fe", color: "#6d28d9", icon: <BookOutlined />, label: "HƯỚNG DẪN" },
  "Giới thiệu": { bg: "#ede9fe", color: "#6d28d9", icon: <FileTextOutlined />, label: "GIỚI THIỆU" },
};

function CategoryBadge({ name }: { name?: string | null }) {
  const c = categoryMeta[name || ""] || { bg: "#f3f4f6", color: "#374151", icon: null, label: name };
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
  const map: Record<string, { bg: string; icon: ReactNode }> = {
    "Cảnh báo": { bg: "#7f1d1d", icon: <WarningOutlined /> },
    "Thông báo": { bg: "#b45309", icon: <NotificationOutlined /> },
    "Tin tức": { bg: "#1d4ed8", icon: <FileTextOutlined /> },
    "Hỏi đáp": { bg: "#15803d", icon: <QuestionCircleOutlined /> },
    "Hướng dẫn": { bg: "#6d28d9", icon: <BookOutlined /> },
    "Giới thiệu": { bg: "#6d28d9", icon: <FileTextOutlined /> },
  };
  const c = map[category || ""] || { bg: "#374151", icon: <FileTextOutlined /> };
  return (
    <div className="w-full h-full flex items-center justify-center text-white text-3xl" style={{ background: c.bg }}>
      {c.icon}
    </div>
  );
}

function NewsListItem({ item, deptCode }: { item: TinTucDto; deptCode: string }) {
  const date = item.ngayXuatBan ? dayjs(item.ngayXuatBan).format("DD/MM/YYYY HH:mm") : "";
  return (
    <Link
      href={`/${deptCode}/tin-tuc/${item.slug || item.id}`}
      className="flex gap-4 py-4 border-b border-gray-200 last:border-b-0 hover:bg-[#eff6ff] transition px-3 -mx-3"
    >
      <div className="w-[170px] h-[110px] shrink-0 rounded overflow-hidden bg-gray-100 border border-gray-200">
        {item.anhDaiDien ? (
          <img src={`${staticUrl}/${item.anhDaiDien}`} alt={item.tieuDe} className="w-full h-full object-cover" />
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
        <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{item.moTaNgan || ""}</p>
      </div>
    </Link>
  );
}

function SidebarSection({ title, items, deptCode }: { title: string; items: TinTucDto[]; deptCode: string }) {
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
              href={`/${deptCode}/tin-tuc/${it.slug || it.id}`}
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
          <li className="px-3 py-3 text-xs text-gray-400 italic">Chưa có tin</li>
        )}
      </ul>
    </div>
  );
}

function DeptPageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const deptCode = params.deptCode as string;
  const pageSlug = params.page as string;

  // Category from query param (e.g. ?danhMuc=Thông+báo) takes priority,
  // then fall back to the page-slug map.
  const danhMucParam = searchParams.get("danhMuc") || "";
  const pageMeta = PAGE_MAP[pageSlug] ?? { title: pageSlug, category: null };
  const activeCategory = danhMucParam || pageMeta.category || undefined;

  const pageTitle = danhMucParam || pageMeta.title;

  const [allItems, setAllItems] = useState<TinTucDto[]>([]);
  const [deptName, setDeptName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState(searchParams.get("q") || "");
  const [page, setPage] = useState(1);
  const [sidebarThongBao, setSidebarThongBao] = useState<TinTucDto[]>([]);
  const [sidebarCanhBao, setSidebarCanhBao] = useState<TinTucDto[]>([]);

  useEffect(() => {
    let cancelled = false;

    homeBlockService.getSctDepartments().then((res) => {
      if (cancelled) return;
      const list = Array.isArray(res?.data) ? res.data : [];
      const dept = list.find((d) => d.code === deptCode);
      if (!dept) {
        setLoading(false);
        return;
      }

      setDeptName(dept.name);

      setLoading(true);
      Promise.all([
        tinTucService.getPublicData({
          departmentId: dept.id,
          tenDanhMuc: activeCategory,
          pageIndex: 1,
          pageSize: 200,
        }),
        tinTucService.getPublicData({
          departmentId: dept.id,
          tenDanhMuc: "Thông báo",
          pageIndex: 1,
          pageSize: 5,
        }),
        tinTucService.getPublicData({
          departmentId: dept.id,
          tenDanhMuc: "Cảnh báo",
          pageIndex: 1,
          pageSize: 5,
        }),
      ])
        .then(([mainRes, tbRes, cbRes]) => {
          if (cancelled) return;
          const items: TinTucDto[] = Array.isArray(mainRes?.data?.items) ? mainRes.data!.items : [];
          items.sort((a, b) => {
            const da = a.ngayXuatBan ? new Date(a.ngayXuatBan).getTime() : 0;
            const db = b.ngayXuatBan ? new Date(b.ngayXuatBan).getTime() : 0;
            return db - da;
          });
          setAllItems(items);
          setSidebarThongBao(Array.isArray(tbRes?.data?.items) ? tbRes.data!.items : []);
          setSidebarCanhBao(Array.isArray(cbRes?.data?.items) ? cbRes.data!.items : []);
        })
        .catch(() => {
          if (cancelled) return;
          setAllItems([]);
          setSidebarThongBao([]);
          setSidebarCanhBao([]);
        })
        .finally(() => { if (!cancelled) setLoading(false); });
    }).catch(() => {
      if (!cancelled) setLoading(false);
    });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deptCode, pageSlug, danhMucParam]);

  const filtered = useMemo(() => {
    if (!keyword.trim()) return allItems;
    const k = keyword.trim().toLowerCase();
    return allItems.filter(
      (x) =>
        (x.tieuDe || "").toLowerCase().includes(k) ||
        (x.moTaNgan || "").toLowerCase().includes(k),
    );
  }, [allItems, keyword]);

  const total = filtered.length;
  const visible = filtered.slice(0, page * PAGE_SIZE);

  const thongBaoLatest = sidebarThongBao;
  const canhBaoLatest = sidebarCanhBao;

  return (
    <div className="bg-white">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-5">
        {/* Breadcrumb */}
        <div className="text-xs text-gray-600 mb-3 border-b border-gray-200 pb-2">
          <Link href="/" className="hover:text-[#0143DF]">Trang chủ</Link>
          <span className="mx-1.5 text-gray-400">›</span>
          <Link href={`/${deptCode}`} className="hover:text-[#0143DF]">{deptName || deptCode}</Link>
          <span className="mx-1.5 text-gray-400">›</span>
          <span className="text-gray-800 font-medium">{pageTitle}</span>
        </div>

        {/* Title + Search */}
        <div className="flex flex-wrap items-end justify-between gap-3 mb-4 pb-2 border-b-[3px] border-[#0143DF]">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-[#0143DF] uppercase">{pageTitle}</h1>
            <span className="text-sm text-gray-500">({total} tin)</span>
          </div>
          <Input
            placeholder="Tìm kiếm..."
            prefix={<SearchOutlined className="text-gray-400" />}
            value={keyword}
            onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
            allowClear
            className="w-[320px]!"
          />
        </div>

        {/* Layout 2 cột */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 border border-gray-200 rounded">
            {loading ? (
              <div className="p-4 space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex gap-4">
                    <Skeleton.Image active style={{ width: 170, height: 110 }} />
                    <div className="flex-1"><Skeleton active paragraph={{ rows: 2 }} /></div>
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
                  {visible.map((it) => <NewsListItem key={it.id} item={it} deptCode={deptCode} />)}
                </div>
                {visible.length < total && (
                  <div className="py-4 text-center border-t border-gray-200">
                    <button
                      onClick={() => setPage((p) => p + 1)}
                      className="px-5 py-2 rounded border border-gray-300 hover:border-[#0143DF] hover:text-[#0143DF] text-sm font-medium transition"
                    >
                      Xem thêm tin
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          <aside className="lg:col-span-1 space-y-4">
            <SidebarSection title="Thông báo mới" items={thongBaoLatest} deptCode={deptCode} />
            <SidebarSection title="Cảnh báo mới" items={canhBaoLatest} deptCode={deptCode} />
          </aside>
        </div>
      </div>
    </div>
  );
}

export default function DeptPageRoute() {
  return (
    <Suspense fallback={<div className="py-10 text-center">Đang tải...</div>}>
      <DeptPageContent />
    </Suspense>
  );
}
