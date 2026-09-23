"use client";
import {
  CaretRightOutlined,
  ClockCircleOutlined,
  EditOutlined,
  EyeOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import tinTucService from "@/services/tinTuc/tinTuc.service";
import { TinTucDto } from "@/types/tinTuc";
import { Skeleton } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import Link from "next/link";
import { useEffect, useState } from "react";

dayjs.locale("vi");

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
            Chưa có bài viết
          </li>
        )}
      </ul>
    </div>
  );
}

export default function GioiThieuPage() {
  const [item, setItem] = useState<TinTucDto | null>(null);
  const [related, setRelated] = useState<TinTucDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const r = await tinTucService.getPublicData({
          trangThai: 1,
          tenDanhMuc: "Giới thiệu",
          pageIndex: 1,
          pageSize: 6,
        });
        const itemsList: TinTucDto[] = Array.isArray(r?.data?.items)
          ? r.data!.items
          : [];
        const firstItem = itemsList[0] || null;
        if (firstItem && firstItem.id) {
          setItem({
            ...firstItem,
            luotXem: (firstItem.luotXem || 0) + 1,
          });
          tinTucService.incrementView(firstItem.id).catch((e) => console.error("Lỗi cộng lượt xem:", e));
        } else {
          setItem(null);
        }
        setRelated(itemsList.slice(1, 6));
      } catch (err) {
        console.error("Lỗi khi tải bài viết giới thiệu:", err);
        setItem(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="bg-white ">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-5">
        {/* Breadcrumb */}
        <div className="text-xs text-gray-600 mb-3 border-b border-gray-200 pb-2">
          <Link href="/" className="hover:text-[#0143DF]">
            Trang chủ
          </Link>
          <span className="mx-1.5 text-gray-400">›</span>
          <span className="text-gray-800 font-medium">Giới thiệu</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Main */}
          <article className="lg:col-span-2 border border-gray-200 rounded">
            <div className="p-6">
              {loading ? (
                <Skeleton active paragraph={{ rows: 10 }} />
              ) : !item ? (
                <div className="py-16 text-center">
                  <FileTextOutlined className="text-5xl text-gray-300 mb-3" />
                  <div className="text-gray-500">
                    Chưa có bài giới thiệu nào được xuất bản
                  </div>
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
                        {dayjs(item.ngayXuatBan).format(
                          "dddd, DD/MM/YYYY HH:mm",
                        )}
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

                  {/* {item.anhDaiDien && (
                    <img
                      src={item.anhDaiDien}
                      alt={item.tieuDe}
                      className="w-full rounded border border-gray-200 mb-5"
                    />
                  )} */}

                  {item.noiDung ? (
                    <div
                      className="
    prose prose-sm max-w-full
    text-gray-800 leading-relaxed
    [&_*]:max-w-full
    [&_img]:max-w-full
    [&_img]:h-auto
    [&_table]:block
    [&_table]:overflow-x-auto
  "
                      style={{
                        wordBreak: "normal",
                        overflowWrap: "normal",
                        whiteSpace: "normal",
                        hyphens: "none",
                      }}
                      dangerouslySetInnerHTML={{ __html: item.noiDung?.replace(/&nbsp;/g, " ").replace(/\u00A0/g, " ") }}
                    />
                  ) : (
                    <div className="text-gray-400 italic">
                      (Bài viết chưa có nội dung chi tiết)
                    </div>
                  )}

                  {item.tags && (
                    <div className="mt-6 pt-4 border-t border-gray-200 flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold text-gray-700 uppercase">
                        Từ khoá:
                      </span>
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
            <SidebarSection title="Bài viết khác" items={related} />
          </aside>
        </div>
      </div>
    </div>
  );
}
