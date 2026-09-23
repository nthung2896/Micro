"use client";
import {
  CaretRightOutlined,
  ClockCircleOutlined,
  EditOutlined,
  EyeOutlined,
  FileTextOutlined,
  LeftOutlined,
} from "@ant-design/icons";
import tinTucService from "@/services/tinTuc/tinTuc.service";
import homeBlockService from "@/services/homeBlock/homeBlock.service";
import { TinTucDto } from "@/types/tinTuc";
import { Skeleton } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

dayjs.locale("vi");

const categoryStyle: Record<string, { bg: string; color: string }> = {
  "Thông báo": { bg: "#fef3c7", color: "#b45309" },
  "Cảnh báo": { bg: "#fee2e2", color: "#b91c1c" },
  "Tin tức": { bg: "#dbeafe", color: "#1d4ed8" },
  "Hỏi đáp": { bg: "#dcfce7", color: "#15803d" },
  "Hướng dẫn": { bg: "#ede9fe", color: "#6d28d9" },
  "Giới thiệu": { bg: "#ede9fe", color: "#6d28d9" },
};

function CategoryBadge({ name }: { name?: string | null }) {
  const c = categoryStyle[name || ""] || { bg: "#f3f4f6", color: "#374151" };
  return (
    <span
      className="inline-block px-2.5 py-1 rounded text-[11px] font-semibold uppercase"
      style={{ background: c.bg, color: c.color }}
    >
      {name}
    </span>
  );
}

function SidebarSection({
  title,
  items,
  deptCode,
}: {
  title: string;
  items: TinTucDto[];
  deptCode: string;
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
          <li className="px-3 py-3 text-xs text-gray-400 italic">
            Chưa có tin
          </li>
        )}
      </ul>
    </div>
  );
}

export default function DeptTinTucDetailPage() {
  const params = useParams<{ deptCode: string; slug: string }>();
  const deptCode = params?.deptCode || "";
  const slug = params?.slug || "";

  const [item, setItem] = useState<TinTucDto | null>(null);
  const [related, setRelated] = useState<TinTucDto[]>([]);
  const [deptName, setDeptName] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    homeBlockService.getSctDepartments().then((res) => {
      const list = Array.isArray(res?.data) ? res.data : [];
      const dept = list.find((d) => d.code === deptCode);
      if (dept) setDeptName(dept.name);
    }).catch(() => {});
  }, [deptCode]);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    tinTucService
      .getBySlug(slug)
      .then((r) => setItem(r?.data || null))
      .catch(() => setItem(null))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!item?.tenDanhMuc) return;
    tinTucService
      .getPublicData({ pageIndex: 1, pageSize: 30 })
      .then((r) => {
        const items: TinTucDto[] = Array.isArray(r?.data?.items) ? r.data!.items : [];
        setRelated(
          items
            .filter((x) => x.tenDanhMuc === item.tenDanhMuc && x.id !== item.id)
            .sort((a, b) => {
              const da = a.ngayXuatBan ? new Date(a.ngayXuatBan).getTime() : 0;
              const db = b.ngayXuatBan ? new Date(b.ngayXuatBan).getTime() : 0;
              return db - da;
            })
            .slice(0, 5),
        );
      })
      .catch(() => {});
  }, [item?.id, item?.tenDanhMuc]);

  return (
    <div className="bg-white">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-5">
        {/* Breadcrumb */}
        <div className="text-xs text-gray-600 mb-3 border-b border-gray-200 pb-2">
          <Link href="/" className="hover:text-[#0143DF]">Trang chủ</Link>
          <span className="mx-1.5 text-gray-400">›</span>
          <Link href={`/${deptCode}`} className="hover:text-[#0143DF]">
            {deptName || deptCode}
          </Link>
          <span className="mx-1.5 text-gray-400">›</span>
          <Link href={`/${deptCode}/tin-tuc`} className="hover:text-[#0143DF]">
            Tin tức
          </Link>
          {item?.tenDanhMuc && (
            <>
              <span className="mx-1.5 text-gray-400">›</span>
              <Link
                href={`/${deptCode}/tin-tuc?danhMuc=${encodeURIComponent(item.tenDanhMuc)}`}
                className="hover:text-[#0143DF]"
              >
                {item.tenDanhMuc}
              </Link>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Main article */}
          <article className="lg:col-span-2 border border-gray-200 rounded">
            <div className="p-6">
              {loading ? (
                <Skeleton active paragraph={{ rows: 10 }} />
              ) : !item ? (
                <div className="py-16 text-center">
                  <FileTextOutlined className="text-5xl text-gray-300 mb-3" />
                  <div className="text-gray-500 mb-4">
                    Không tìm thấy tin tức với đường dẫn này
                  </div>
                  <Link
                    href={`/${deptCode}/tin-tuc`}
                    className="text-[#0143DF] hover:underline inline-flex items-center gap-1"
                  >
                    <LeftOutlined /> Về danh sách tin tức
                  </Link>
                </div>
              ) : (
                <>
                  <h1 className="text-2xl md:text-[26px] font-bold text-gray-900 leading-tight mb-3 pb-3 border-b-[3px] border-[#0143DF] inline-block w-full">
                    {item.tieuDe}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 pb-4 mb-5 border-b border-gray-200">
                    {item.ngayXuatBan && (
                      <span className="inline-flex items-center gap-1.5">
                        <ClockCircleOutlined />
                        {dayjs(item.ngayXuatBan).format("dddd, DD/MM/YYYY HH:mm")}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5">
                      <EyeOutlined />
                      {item.luotXem || 0} lượt xem
                    </span>
                    {item.createdBy && (
                      <span className="inline-flex items-center gap-1.5">
                        <EditOutlined />
                        {item.createdBy}
                      </span>
                    )}
                  </div>

                  {item.moTaNgan && (
                    <div className="bg-[#f0f7ff] border-l-4 border-[#0143DF] px-4 py-3 mb-5 text-gray-800 font-medium leading-relaxed">
                      {item.moTaNgan}
                    </div>
                  )}

                  {item.noiDung ? (
                    <div
                      className="prose prose-sm max-w-full text-gray-800 leading-relaxed [&_*]:max-w-full [&_img]:max-w-full [&_img]:h-auto [&_table]:block [&_table]:overflow-x-auto"
                      style={{ wordBreak: "normal", overflowWrap: "normal", whiteSpace: "normal", hyphens: "none" }}
                      dangerouslySetInnerHTML={{ __html: item.noiDung.replace(/&nbsp;/g, " ").replace(/ /g, " ") }}
                    />
                  ) : (
                    <div className="text-gray-400 italic">(Bài viết chưa có nội dung chi tiết)</div>
                  )}

                  {item.tags && (
                    <div className="mt-6 pt-4 border-t border-gray-200 flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold text-gray-700 uppercase">Từ khoá:</span>
                      {item.tags.split(",").map((t) => (
                        <span
                          key={t.trim()}
                          className="inline-block px-2 py-0.5 rounded text-[11px] bg-gray-100 text-gray-700 border border-gray-200"
                        >
                          {t.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-4">
            <SidebarSection title="Tin liên quan" deptCode={deptCode} items={related} />
          </aside>
        </div>
      </div>
    </div>
  );
}
