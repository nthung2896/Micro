"use client";
import {
  CaretRightOutlined,
  GlobalOutlined,
  LeftOutlined,
  ShopOutlined,
} from "@ant-design/icons";
import { apiService } from "@/services";
import tinTucService from "@/services/tinTuc/tinTuc.service";
import { TinTucDto } from "@/types/tinTuc";
import { buildFileServerUrl } from "@/utils/file";
import { Skeleton } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

dayjs.locale("vi");

type PortalAppInfo = {
  appName?: string;
  osCode?: string;
  appLink?: string;
};

type PortalPlatformDetail = {
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
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
  chuSoHuu?: string;
  representerName?: string;
  representerJob?: string;
  representerMobile?: string;
  representerEmail?: string;
  chucNangNenTang?: string;
  ngonNgu?: string;
  urlApp?: string;
  status?: number;
  statusName?: string;
  isApproved?: boolean;
  apps?: PortalAppInfo[];
};

function matchOs(osCode: string | undefined, target: "android" | "ios") {
  const c = (osCode || "").toLowerCase();
  if (target === "android") return c.includes("android");
  return c.includes("ios") || c.includes("iphone") || c.includes("apple");
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
      <div
        className="text-sm font-bold uppercase px-3 py-2 flex items-center gap-2"
        style={{ background: "#0143DF", color: "#ffffff" }}
      >
        <CaretRightOutlined style={{ color: "#ffffff" }} />
        {title}
      </div>
      <ul className="divide-y divide-gray-100">
        {items.map((it) => (
          <li key={it.id} className="px-3 py-2.5 hover:bg-gray-50">
            <Link
              href={`/tin-tuc/${it.slug || it.id}`}
              className="text-sm hover:text-[#0143DF] line-clamp-2 leading-snug block font-medium"
              style={{ color: "#1f2937" }}
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

function Row({
  label,
  value,
}: {
  label: string;
  value?: ReactNode;
}) {
  if (!value) return null;
  return (
    <div className="grid grid-cols-3 gap-3 py-2 border-b border-gray-100 last:border-b-0">
      <div className="text-sm text-gray-500 col-span-1">{label}</div>
      <div className="text-sm text-gray-800 col-span-2 font-medium break-words">
        {value}
      </div>
    </div>
  );
}

export default function NenTangDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id || "";
  const [item, setItem] = useState<PortalPlatformDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [thongBaoLatest, setThongBaoLatest] = useState<TinTucDto[]>([]);
  const [canhBaoLatest, setCanhBaoLatest] = useState<TinTucDto[]>([]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    apiService
      .get<PortalPlatformDetail>(`/HomeBlock/PlatformPublic/${id}`)
      .then((r) => setItem(r?.data || null))
      .catch(() => setItem(null))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    tinTucService
      .getPublicData({ trangThai: 1, pageIndex: 1, pageSize: 30 })
      .then((r) => {
        const items: TinTucDto[] = Array.isArray(r?.data?.items)
          ? r.data!.items
          : [];
        const sorted = [...items].sort((a, b) => {
          const da = a.ngayXuatBan ? new Date(a.ngayXuatBan).getTime() : 0;
          const db = b.ngayXuatBan ? new Date(b.ngayXuatBan).getTime() : 0;
          return db - da;
        });
        setThongBaoLatest(
          sorted.filter((x) => (x.tenDanhMuc || "").trim() === "Thông báo").slice(0, 5),
        );
        setCanhBaoLatest(
          sorted.filter((x) => (x.tenDanhMuc || "").trim() === "Cảnh báo").slice(0, 5),
        );
      })
      .catch(() => {
        setThongBaoLatest([]);
        setCanhBaoLatest([]);
      });
  }, []);

  return (
    <div className="bg-white">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-5">
        <div className="text-xs text-gray-600 mb-3 border-b border-gray-200 pb-2">
          <Link href="/" className="hover:text-[#0143DF]">
            Trang chủ
          </Link>
          <span className="mx-1.5 text-gray-400">›</span>
          <Link href="/nen-tang" className="hover:text-[#0143DF]">
            Nền tảng TMĐT
          </Link>
          {item?.name && (
            <>
              <span className="mx-1.5 text-gray-400">›</span>
              <span className="text-gray-800 font-medium">{item.name}</span>
            </>
          )}
        </div>

        {loading ? (
          <div className="border border-gray-200 rounded p-6">
            <Skeleton active paragraph={{ rows: 10 }} />
          </div>
        ) : !item ? (
          <div className="border border-gray-200 rounded py-16 text-center">
            <ShopOutlined className="text-5xl text-gray-300 mb-3" />
            <div className="text-gray-500 mb-4">
              Không tìm thấy nền tảng với ID này
            </div>
            <Link
              href="/nen-tang"
              className="text-[#0143DF] hover:underline inline-flex items-center gap-1"
            >
              <LeftOutlined /> Về danh sách nền tảng
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 border border-gray-200 rounded">
              <div className="p-6">
                <div className="flex items-start gap-4 mb-5 pb-5 border-b border-gray-200">
                  <div
                    className="border border-gray-200 rounded bg-white flex items-center justify-center shrink-0"
                    style={{ width: 88, height: 88 }}
                  >
                    {item.logo ? (
                      <img
                        src={buildFileServerUrl(item.logo)}
                        alt={item.name}
                        style={{
                          maxWidth: 80,
                          maxHeight: 80,
                          width: "auto",
                          objectFit: "contain",
                        }}
                      />
                    ) : (
                      <ShopOutlined className="text-3xl text-gray-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">
                      {item.name}
                    </h1>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mb-2">
                      {item.domain && (
                        <a
                          href={
                            item.domain.startsWith("http")
                              ? item.domain
                              : `https://${item.domain}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-[#0143DF] hover:underline inline-flex items-center gap-1.5"
                        >
                          <GlobalOutlined />
                          {item.domain}
                        </a>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      {item.categoryLabel && (
                        <span className="inline-block bg-[#f4f8ff] text-[#0143DF] px-2.5 py-1 rounded text-[11px] font-semibold uppercase border border-[#bcdcff]">
                          {item.categoryLabel}
                        </span>
                      )}
                      {item.statusName && item.status !== 5 && (
                        <span className="inline-block bg-amber-50 text-amber-700 px-2.5 py-1 rounded text-[11px] font-semibold uppercase border border-amber-200">
                          {item.statusName}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      {item.isApproved && (
                        <img
                          src="/logoCCDV.png"
                          alt="Đã đăng ký với Bộ Công Thương"
                          title="Đã đăng ký với Bộ Công Thương"
                          style={{ height: 44, width: "auto" }}
                        />
                      )}
                      {(() => {
                        const androidLink = item.apps?.find((a) =>
                          matchOs(a.osCode, "android"),
                        )?.appLink;
                        const iosLink = item.apps?.find((a) =>
                          matchOs(a.osCode, "ios"),
                        )?.appLink;
                        return (
                          <>
                            {androidLink && (
                              <a
                                href={androidLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Tải ứng dụng trên Google Play"
                              >
                                <img
                                  src="/CHPLAY.png"
                                  alt="Tải trên CH Play"
                                  style={{ height: 44, width: "auto" }}
                                />
                              </a>
                            )}
                            {iosLink && (
                              <a
                                href={iosLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Tải ứng dụng trên App Store"
                              >
                                <img
                                  src="/APPSTORE.png"
                                  alt="Tải trên App Store"
                                  style={{ height: 44, width: "auto" }}
                                />
                              </a>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                <h2 className="text-base font-bold text-[#0143DF] uppercase mb-2 pb-2 border-b-[3px] border-[#0143DF] inline-block">
                  Thông tin doanh nghiệp
                </h2>
                <div className="mb-5 mt-1">
                  <Row label="Tên doanh nghiệp" value={item.companyName} />
                  <Row label="Mã số thuế" value={item.companyTaxCode} />
                  <Row label="Chủ sở hữu" value={item.chuSoHuu} />
                  <Row label="Địa chỉ" value={item.companyAddress} />
                  <Row label="Điện thoại" value={item.companyPhone} />
                  <Row label="Email" value={item.companyEmail} />
                </div>

                <h2 className="text-base font-bold text-[#0143DF] uppercase mb-2 pb-2 border-b-[3px] border-[#0143DF] inline-block">
                  Người đại diện
                </h2>
                <div className="mb-5 mt-1">
                  <Row label="Họ tên" value={item.representerName} />
                  <Row label="Chức vụ" value={item.representerJob} />
                  <Row label="Điện thoại" value={item.representerMobile} />
                  <Row label="Email" value={item.representerEmail} />
                </div>

               {/* {(item.chucNangNenTang || item.ngonNgu || item.urlApp) && (
                  <>
                    <h2 className="text-base font-bold text-[#0143DF] uppercase mb-2 pb-2 border-b-[3px] border-[#0143DF] inline-block">
                      Thông tin nền tảng
                    </h2>
                    <div className="mt-1">
                      <Row
                        label="Chức năng"
                        value={item.chucNangNenTang}
                      />
                      <Row label="Ngôn ngữ" value={item.ngonNgu} />
                       <Row
                        label="URL ứng dụng"
                        value={
                          item.urlApp ? (
                            <a
                              href={item.urlApp}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#0143DF] hover:underline"
                            >
                              {item.urlApp}
                            </a>
                          ) : undefined
                        }
                      /> 
                    </div>
                  </>
                )}*/}
              </div>
            </div>

            <aside className="lg:col-span-1 space-y-4">
              <SidebarSection title="Thông báo mới" items={thongBaoLatest} />
              <SidebarSection title="Cảnh báo mới" items={canhBaoLatest} />
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
