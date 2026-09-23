"use client";
import {
  AppstoreOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  NotificationOutlined,
  SearchOutlined,
  ShopOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { apiService } from "@/services";
import tinTucService from "@/services/tinTuc/tinTuc.service";
import vanBanPhapLuatService from "@/services/vanBanPhapLuat/vanBanPhapLuat.service";
import { TinTucDto } from "@/types/tinTuc";
import { VanBanPhapLuatDto } from "@/types/vanBanPhapLuat";
import { Input, Select, Skeleton } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

dayjs.locale("vi");

type PortalPlatform = {
  id: string;
  name?: string;
  domain?: string;
  logo?: string;
  categoryLabel?: string;
  companyName?: string;
  companyTaxCode?: string;
};

const TYPE_OPTIONS = [
  {
    value: "all",
    label: "Tất cả nội dung",
    icon: <AppstoreOutlined />,
    placeholder: "Nhập từ khoá tìm kiếm...",
  },
  {
    value: "platform",
    label: "Nền tảng / Doanh nghiệp / MST",
    icon: <ShopOutlined />,
    placeholder: "Tên nền tảng, domain, MST, tên doanh nghiệp...",
  },
  {
    value: "news",
    label: "Tin tức",
    icon: <FileTextOutlined />,
    placeholder: "Tiêu đề, mô tả tin tức...",
  },
  {
    value: "notification",
    label: "Thông báo",
    icon: <NotificationOutlined />,
    placeholder: "Tiêu đề, nội dung thông báo...",
  },
  {
    value: "warning",
    label: "Cảnh báo",
    icon: <WarningOutlined />,
    placeholder: "Tiêu đề, nội dung cảnh báo...",
  },
  {
    value: "document",
    label: "Văn bản pháp luật",
    icon: <FileTextOutlined />,
    placeholder: "Số hiệu, tên văn bản, trích yếu...",
  },
];

const TIN_TUC_CATEGORY_BY_TYPE: Record<string, string | undefined> = {
  news: "Tin tức",
  notification: "Thông báo",
  warning: "Cảnh báo",
};

function SectionTitle({
  icon,
  title,
  count,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  count: number;
  href?: string;
}) {
  return (
    <div className="flex items-end justify-between mb-3 pb-2 border-b-[3px] border-[#0143DF]">
      <div className="flex items-center gap-2">
        <span className="text-[#0143DF] text-lg">{icon}</span>
        <h2 className="text-base font-bold text-[#0143DF] uppercase">{title}</h2>
        <span className="text-sm text-gray-500">({count})</span>
      </div>
      {href && count > 0 && (
        <Link href={href} className="text-sm text-[#0143DF] hover:underline">
          Xem thêm ›
        </Link>
      )}
    </div>
  );
}

function EmptyHint({ label }: { label: string }) {
  return (
    <div className="border border-gray-200 rounded py-8 text-center text-sm text-gray-500">
      Không có kết quả phù hợp cho mục "{label}"
    </div>
  );
}

function PlatformCard({ p }: { p: PortalPlatform }) {
  return (
    <Link
      href={`/nen-tang/${p.id}`}
      className="border border-gray-200 rounded p-3 bg-white flex items-start gap-3 hover:border-[#0143DF] hover:bg-[#f4f8ff] transition"
    >
      <div
        className="border border-gray-100 rounded bg-white flex items-center justify-center shrink-0"
        style={{ width: 56, height: 56 }}
      >
        {p.logo ? (
          <img
            src={p.logo}
            alt={p.name}
            style={{
              maxHeight: 48,
              maxWidth: 48,
              width: "auto",
              objectFit: "contain",
            }}
          />
        ) : (
          <ShopOutlined className="text-2xl text-gray-300" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm text-gray-800 truncate">
          {p.name}
        </div>
        <div className="text-[11px] text-gray-500 truncate">{p.domain}</div>
        {p.companyName && (
          <div className="text-[11px] text-gray-700 truncate mt-0.5">
            <span className="text-gray-500">DN:</span> {p.companyName}
          </div>
        )}
        {p.companyTaxCode && (
          <div className="text-[11px] text-gray-700 truncate">
            <span className="text-gray-500">MST:</span> {p.companyTaxCode}
          </div>
        )}
      </div>
    </Link>
  );
}

function NewsCard({ item }: { item: TinTucDto }) {
  return (
    <Link
      href={`/tin-tuc/${item.slug || item.id}`}
      className="border border-gray-200 rounded p-3 bg-white hover:border-[#0143DF] hover:bg-[#f4f8ff] transition block"
    >
      <span className="inline-block text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-[#f4f8ff] text-[#0143DF] border border-[#bcdcff] mb-1.5">
        {item.tenDanhMuc}
      </span>
      <div className="font-semibold text-sm text-gray-900 leading-snug line-clamp-2 mb-1">
        {item.tieuDe}
      </div>
      {item.ngayXuatBan && (
        <div className="text-[11px] text-gray-500">
          {dayjs(item.ngayXuatBan).format("DD/MM/YYYY HH:mm")}
        </div>
      )}
    </Link>
  );
}

function DocCard({ d }: { d: VanBanPhapLuatDto }) {
  return (
    <div className="border border-gray-200 rounded p-3 bg-white hover:border-[#0143DF] hover:bg-[#f4f8ff] transition">
      <div className="text-[11px] font-semibold text-[#0143DF] mb-0.5">
        {d.soHieu}
      </div>
      <div className="font-semibold text-sm text-gray-900 leading-snug line-clamp-2 mb-1">
        {d.tenVanBan}
      </div>
      <div className="text-[11px] text-gray-500 flex flex-wrap gap-x-3">
        {d.loaiVanBan && <span>{d.loaiVanBan}</span>}
        {d.ngayBanHanh && (
          <span>BH: {dayjs(d.ngayBanHanh).format("DD/MM/YYYY")}</span>
        )}
      </div>
    </div>
  );
}

function TimKiemContent() {
  const router = useRouter();
  const sp = useSearchParams();
  const type = sp.get("type") || "all";
  const q = sp.get("q") || "";
  const deptCode = sp.get("deptCode") || "";

  const [keyword, setKeyword] = useState(q);
  const [searchType, setSearchType] = useState(type);

  const [platforms, setPlatforms] = useState<PortalPlatform[]>([]);
  const [news, setNews] = useState<TinTucDto[]>([]);
  const [docs, setDocs] = useState<VanBanPhapLuatDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setKeyword(q);
    setSearchType(type);
  }, [q, type]);

  useEffect(() => {
    setLoading(true);
    const wantPlatform = type === "all" || type === "platform";
    const wantNews = type === "all" || ["news", "notification", "warning"].includes(type);
    const wantDoc = type === "all" || type === "document";

    const tasks: Promise<unknown>[] = [];

    if (wantPlatform) {
      const url = deptCode
        ? `/HomeBlock/PlatformsApproved?top=500&deptCode=${deptCode}`
        : "/HomeBlock/PlatformsApproved?top=500";
      tasks.push(
        apiService
          .get<PortalPlatform[]>(url)
          .then((r) => setPlatforms(Array.isArray(r?.data) ? r.data : []))
          .catch(() => setPlatforms([])),
      );
    } else {
      setPlatforms([]);
    }

    if (wantNews) {
      tasks.push(
        tinTucService
          .getPublicData({ trangThai: 1, pageIndex: 1, pageSize: 200 })
          .then((r) => {
            const items: TinTucDto[] = Array.isArray(r?.data?.items)
              ? r.data!.items
              : [];
            setNews(items);
          })
          .catch(() => setNews([])),
      );
    } else {
      setNews([]);
    }

    if (wantDoc) {
      tasks.push(
        vanBanPhapLuatService
          .getPublicData({ trangThai: 1, pageIndex: 1, pageSize: 200 })
          .then((r) => {
            const items: VanBanPhapLuatDto[] = Array.isArray(r?.data?.items)
              ? r.data!.items
              : [];
            setDocs(items);
          })
          .catch(() => setDocs([])),
      );
    } else {
      setDocs([]);
    }

    Promise.allSettled(tasks).finally(() => setLoading(false));
  }, [type]);

  const k = q.trim().toLowerCase();

  const filteredPlatforms = useMemo(() => {
    if (!platforms.length) return [];
    let list = platforms;
    if (k) {
      list = list.filter((x) => {
        return (
          (x.name || "").toLowerCase().includes(k) ||
          (x.domain || "").toLowerCase().includes(k) ||
          (x.companyName || "").toLowerCase().includes(k) ||
          (x.companyTaxCode || "").toLowerCase().includes(k)
        );
      });
    }
    return list;
  }, [platforms, k]);

  const filteredNews = useMemo(() => {
    if (!news.length) return [];
    let list = news;
    const targetCategory = TIN_TUC_CATEGORY_BY_TYPE[type];
    if (targetCategory) {
      list = list.filter((x) => (x.tenDanhMuc || "").trim() === targetCategory);
    }
    if (k) {
      list = list.filter(
        (x) =>
          (x.tieuDe || "").toLowerCase().includes(k) ||
          (x.moTaNgan || "").toLowerCase().includes(k),
      );
    }
    list = [...list].sort((a, b) => {
      const da = a.ngayXuatBan ? new Date(a.ngayXuatBan).getTime() : 0;
      const db = b.ngayXuatBan ? new Date(b.ngayXuatBan).getTime() : 0;
      return db - da;
    });
    return list;
  }, [news, k, type]);

  const filteredDocs = useMemo(() => {
    if (!docs.length) return [];
    let list = docs;
    if (k) {
      list = list.filter(
        (x) =>
          (x.soHieu || "").toLowerCase().includes(k) ||
          (x.tenVanBan || "").toLowerCase().includes(k) ||
          (x.trichYeu || "").toLowerCase().includes(k),
      );
    }
    return list;
  }, [docs, k]);

  const showPlatforms = type === "all" || type === "platform";
  const showNews = type === "all" || type === "news";
  const showNotif = type === "all" || type === "notification";
  const showWarn = type === "all" || type === "warning";
  const showDocs = type === "all" || type === "document";

  const newsOnly = useMemo(
    () => filteredNews.filter((x) => (x.tenDanhMuc || "").trim() === "Tin tức"),
    [filteredNews],
  );
  const notifOnly = useMemo(
    () => filteredNews.filter((x) => (x.tenDanhMuc || "").trim() === "Thông báo"),
    [filteredNews],
  );
  const warnOnly = useMemo(
    () => filteredNews.filter((x) => (x.tenDanhMuc || "").trim() === "Cảnh báo"),
    [filteredNews],
  );

  const totalResults =
    (showPlatforms ? filteredPlatforms.length : 0) +
    (type === "all"
      ? newsOnly.length + notifOnly.length + warnOnly.length
      : filteredNews.length) +
    (showDocs ? filteredDocs.length : 0);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    params.set("type", searchType);
    if (keyword.trim()) params.set("q", keyword.trim());
    if (deptCode) params.set("deptCode", deptCode);
    router.push(`/tim-kiem?${params.toString()}`);
  };

  const previewLimit = type === "all" ? 6 : 30;

  return (
    <div className="bg-white">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-5">
        <div className="text-xs text-gray-600 mb-3 border-b border-gray-200 pb-2">
          <Link href="/" className="hover:text-[#0143DF]">
            Trang chủ
          </Link>
          <span className="mx-1.5 text-gray-400">›</span>
          <span className="text-gray-800 font-medium">Tìm kiếm</span>
        </div>

        <form
          onSubmit={onSubmit}
          className="flex items-stretch mb-5 bg-white rounded-md border border-gray-300 overflow-hidden"
        >
          <div className="flex items-center px-3 border-r border-gray-200 bg-[#f4f8ff]">
            <Select
              value={searchType}
              onChange={setSearchType}
              variant="borderless"
              className="w-[200px]!"
              options={TYPE_OPTIONS.map((o) => ({
                value: o.value,
                label: (
                  <span className="inline-flex items-center gap-2">
                    <span className="text-[#0143DF]">{o.icon}</span>
                    {o.label}
                  </span>
                ),
              }))}
            />
          </div>
          <Input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder={
              TYPE_OPTIONS.find((o) => o.value === searchType)?.placeholder ||
              "Nội dung tìm kiếm..."
            }
            prefix={<SearchOutlined className="text-gray-400" />}
            variant="borderless"
            className="flex-1 h-12!"
            onPressEnter={onSubmit as never}
          />
          <button
            type="submit"
            className="px-6 h-12 bg-[#0143DF] text-white font-semibold text-sm hover:bg-[#0136B5] transition"
          >
            Tìm kiếm
          </button>
        </form>

        <div className="text-sm text-gray-700 mb-4 flex flex-wrap gap-2 items-center">
          <div>
            {q ? (
              <>
                Kết quả tìm kiếm cho{" "}
                <span className="font-semibold text-[#0143DF]">"{q}"</span>:{" "}
                <span className="font-semibold">{totalResults}</span> mục
              </>
            ) : (
              <>
                Hiển thị{" "}
                <span className="font-semibold">{totalResults}</span> mục — nhập
                từ khoá để lọc
              </>
            )}
          </div>
          {deptCode && (
            <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 px-2 py-0.5 rounded text-xs font-medium border border-amber-200">
              Phạm vi tìm kiếm: {
                deptCode === "SCT_HN" ? "Sở Công Thương Hà Nội" :
                  deptCode === "SCT_PT" ? "Sở Công Thương Phú Thọ" :
                    deptCode === "SCT_HCM" ? "Sở Công Thương TP. Hồ Chí Minh" :
                      `Sở Công Thương ${deptCode.replace("SCT_", "")}`
              }
            </span>
          )}
        </div>

        {loading ? (
          <Skeleton active paragraph={{ rows: 8 }} />
        ) : (
          <div className="space-y-6">
            {showPlatforms && (
              <section>
                <SectionTitle
                  icon={<ShopOutlined />}
                  title="Nền tảng TMĐT"
                  count={filteredPlatforms.length}
                  href={`/nen-tang${q ? `?q=${encodeURIComponent(q)}` : ""}`}
                />
                {filteredPlatforms.length === 0 ? (
                  <EmptyHint label="Nền tảng TMĐT" />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {filteredPlatforms.slice(0, previewLimit).map((p) => (
                      <PlatformCard key={p.id} p={p} />
                    ))}
                  </div>
                )}
              </section>
            )}

            {showNews && (
              <section>
                <SectionTitle
                  icon={<FileTextOutlined />}
                  title="Tin tức"
                  count={type === "all" ? newsOnly.length : filteredNews.length}
                  href={`/tin-tuc?danhMuc=${encodeURIComponent("Tin tức")}`}
                />
                {(type === "all" ? newsOnly : filteredNews).length === 0 ? (
                  <EmptyHint label="Tin tức" />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {(type === "all" ? newsOnly : filteredNews)
                      .slice(0, previewLimit)
                      .map((it) => (
                        <NewsCard key={it.id} item={it} />
                      ))}
                  </div>
                )}
              </section>
            )}

            {showNotif && (
              <section>
                <SectionTitle
                  icon={<NotificationOutlined />}
                  title="Thông báo"
                  count={
                    type === "all" ? notifOnly.length : filteredNews.length
                  }
                  href={`/tin-tuc?danhMuc=${encodeURIComponent("Thông báo")}`}
                />
                {(type === "all" ? notifOnly : filteredNews).length === 0 ? (
                  <EmptyHint label="Thông báo" />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {(type === "all" ? notifOnly : filteredNews)
                      .slice(0, previewLimit)
                      .map((it) => (
                        <NewsCard key={it.id} item={it} />
                      ))}
                  </div>
                )}
              </section>
            )}

            {showWarn && (
              <section>
                <SectionTitle
                  icon={<WarningOutlined />}
                  title="Cảnh báo"
                  count={type === "all" ? warnOnly.length : filteredNews.length}
                  href={`/tin-tuc?danhMuc=${encodeURIComponent("Cảnh báo")}`}
                />
                {(type === "all" ? warnOnly : filteredNews).length === 0 ? (
                  <EmptyHint label="Cảnh báo" />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {(type === "all" ? warnOnly : filteredNews)
                      .slice(0, previewLimit)
                      .map((it) => (
                        <NewsCard key={it.id} item={it} />
                      ))}
                  </div>
                )}
              </section>
            )}

            {showDocs && (
              <section>
                <SectionTitle
                  icon={<FileTextOutlined />}
                  title="Văn bản pháp luật"
                  count={filteredDocs.length}
                  href="/van-ban-phap-luat"
                />
                {filteredDocs.length === 0 ? (
                  <EmptyHint label="Văn bản pháp luật" />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {filteredDocs.slice(0, previewLimit).map((d) => (
                      <DocCard key={d.id} d={d} />
                    ))}
                  </div>
                )}
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function TimKiemPage() {
  return (
    <Suspense
      fallback={<div className="py-10 text-center text-gray-500">Đang tải...</div>}
    >
      <TimKiemContent />
    </Suspense>
  );
}
