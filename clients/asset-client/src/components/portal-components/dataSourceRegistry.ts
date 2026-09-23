// Registry data source cho block trang chủ.
// Mỗi key là 1 "code" admin chọn trong form. Giá trị là async function trả về dữ liệu.
// Các nguồn dữ liệu chính đã chuyển sang gọi API thật, một số registry còn lại dùng mock.

import { apiService } from "@/services";
import {
  CERT_PROVIDERS,
  HERO_STATS,
  SOCIAL_DOMESTIC,
  SOCIAL_FOREIGN,
  STATS_CHART_DOMESTIC,
  STATS_CHART_FOREIGN,
  STATS_DOMESTIC,
  STATS_FOREIGN,
  buildOverviewStats,
} from "./mockData";

// Sinh CSS animation cho banner-fade-slider dựa trên SỐ LƯỢNG banner thực tế.
// Lý do cần hàm này: bản CSS cứng cũ (xem seed HOME_HERO) giả định luôn có đúng 4 slide
// (delay 0/4/8/12s trên 1 chu kỳ 16s cố định) — nếu chỉ có 1-3 banner active, các slot
// delay còn lại không có element nào khớp :nth-child(N) nên banner bị NHẤP NHÁY/ẨN suốt
// quãng thời gian dành cho các slide "thiếu". Hàm này tính lại duration/delay theo
// count thực tế để slide luôn lấp đầy toàn bộ chu kỳ, không có khoảng trống.
function buildBannerFadeCss(count: number): string {
  const base = `
.banner-fade-slide {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 1920px;
  height: 100%;
  display: block;
  text-decoration: none;
}
.banner-fade-slide img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}`;

  if (count <= 1) {
    // 0-1 slide: không cần animation, hiển thị tĩnh, tránh nhấp nháy vô nghĩa.
    return `${base}
.banner-fade-slide { opacity: 1; visibility: visible; }`;
  }

  const slotSeconds = 4;
  const totalSeconds = slotSeconds * count;
  const fadeInSeconds = 0.8;
  const visibleStartPct = (fadeInSeconds / totalSeconds) * 100;
  const visibleEndPct = (slotSeconds / totalSeconds) * 100;

  let css = `${base}
.banner-fade-slide {
  opacity: 0;
  visibility: hidden;
  animation: bannerFadeInOut ${totalSeconds}s infinite ease-in-out both;
}
@keyframes bannerFadeInOut {
  0%, ${visibleStartPct.toFixed(3)}% { opacity: 0; visibility: hidden; }
  ${(visibleStartPct + 0.01).toFixed(3)}%, ${visibleEndPct.toFixed(3)}% { opacity: 1; visibility: visible; }
  ${(visibleEndPct + 0.01).toFixed(3)}%, 100% { opacity: 0; visibility: hidden; }
}`;
  for (let i = 0; i < count; i++) {
    css += `\n.banner-fade-slide:nth-child(${i + 1}) { animation-delay: ${i * slotSeconds}s; }`;
  }
  return css;
}

export type DataSourceFn = (deptCode?: string) => Promise<Record<string, any>>;

export type DataSourceDoc = {
  code: string;
  label: string;
  description: string;
  apiPath: string; // gợi ý đường dẫn API backend cần expose
  /** Shape JSON mà API/registry function phải trả về */
  sampleResponse: Record<string, any>;
  /** Ví dụ template Mustache để admin tham khảo */
  templateExample: string;
};

export const DATA_SOURCE_DOCS: DataSourceDoc[] = [
  {
    code: "",
    label: "(Không cần dữ liệu)",
    description: "Block tĩnh, không fetch API. Body HTML không cần biến.",
    apiPath: "-",
    sampleResponse: {},
    templateExample: `<section>Nội dung HTML cố định</section>`,
  },
  {
    code: "hero.stats",
    label: "Hero - 4 chỉ số nổi bật",
    description: "Trả về 4 thẻ số liệu hiển thị trên banner trang chủ.",
    apiPath: "GET /api/Portal/HeroStats",
    sampleResponse: {
      items: [
        { label: "Nền tảng đăng ký", value: "1.245" },
        { label: "Doanh nghiệp đã cấp", value: "8.526" },
        { label: "Hồ sơ đã duyệt", value: "12.450" },
        { label: "Báo cáo trực tuyến 24/7", value: "Trực tuyến" },
      ],
    },
    templateExample: `<div className="grid grid-cols-4 gap-3">
  {{#each items}}
    <div className="bg-white/10 rounded-lg p-3">
      <div className="text-yellow-300 font-bold">{{value}}</div>
      <div className="text-xs uppercase opacity-80">{{label}}</div>
    </div>
  {{/each}}
</div>`,
  },
  {
    code: "platforms.all",
    label: "Nền tảng - 12 nền tảng đã xác nhận mới nhất",
    description:
      "Lấy 12 nền tảng có Status=Đã xác nhận mới nhất, rải đều 4 nhóm: NenTangTrucTuyen (Mẫu 01), DatHangNuocNgoai (Mẫu 02), TrungGianTrongNuoc (Mẫu 03), TrungGianNuocNgoai (Mẫu 04).",
    apiPath: "GET /api/HomeBlock/PlatformsApproved?top=12",
    sampleResponse: {
      items: [
        {
          id: "...",
          name: "Tiki",
          domain: "tiki.vn",
          logo: "https://.../logo.png",
          mauSo: "Mẫu 01",
          categoryCode: "NenTangTrucTuyen",
          categoryLabel: "Nền tảng trực tuyến",
          reviewDate: "2025-05-09T09:00:00",
        },
      ],
    },
    templateExample: `<div className="grid grid-cols-4 gap-3">
  {{#each items}}
    <div className="border rounded p-3">
      <div className="font-semibold">{{name}}</div>
      <div className="text-xs text-gray-500">{{domain}} · {{categoryLabel}}</div>
    </div>
  {{/each}}
</div>`,
  },
  {
    code: "social.domestic",
    label: "Mạng xã hội TMĐT - Trong nước",
    description: "Sàn TMĐT trung gian / mạng xã hội trong nước.",
    apiPath: "GET /api/Portal/SocialPlatforms?region=domestic",
    sampleResponse: {
      items: [
        { name: "Chợ Tốt", logo: "chotot.com", status: "approved" },
        { name: "Zalo Shop", logo: "zalo.me", status: "approved" },
      ],
    },
    templateExample: `<div className="grid grid-cols-4 gap-3">
  {{#each items}}
    <div className="p-3 border rounded text-center">{{name}}</div>
  {{/each}}
</div>`,
  },
  {
    code: "social.foreign",
    label: "Mạng xã hội TMĐT - Nước ngoài",
    description: "Sàn TMĐT trung gian / mạng xã hội nước ngoài.",
    apiPath: "GET /api/Portal/SocialPlatforms?region=foreign",
    sampleResponse: {
      items: [
        { name: "Facebook Marketplace", logo: "facebook.com", status: "approved" },
        { name: "TikTok Shop", logo: "tiktok.com", status: "approved" },
      ],
    },
    templateExample: `<div className="grid grid-cols-4 gap-3">
  {{#each items}}
    <div className="p-3 border rounded text-center">{{name}}</div>
  {{/each}}
</div>`,
  },
  {
    code: "cert.providers",
    label: "Dịch vụ chứng thực HĐĐT",
    description: "List nhà cung cấp dịch vụ chứng thực hợp đồng điện tử.",
    apiPath: "GET /api/Portal/CertProviders",
    sampleResponse: {
      items: [
        { name: "CeCA", logo: "ceca.vn", status: "approved" },
        { name: "FPT.eContract", logo: "fpt.com.vn", status: "approved" },
      ],
    },
    templateExample: `<div className="grid grid-cols-4 gap-3">
  {{#each items}}
    <div className="p-3 border rounded text-center">{{name}}</div>
  {{/each}}
</div>`,
  },
  {
    code: "stats.growth",
    label: "Thống kê tăng trưởng",
    description:
      "2 nhóm số liệu (trong nước / nước ngoài), mỗi nhóm gồm 3 chỉ số + chart theo năm.",
    apiPath: "GET /api/Portal/GrowthStats",
    sampleResponse: {
      domestic: [
        { label: "Nền tảng đăng ký", value: "1.325", delta: "+28%" },
        { label: "Doanh nghiệp", value: "3.256", delta: "+35%" },
        { label: "Giao dịch", value: "843", delta: "+1%" },
      ],
      foreign: [
        { label: "Nền tảng đăng ký", value: "45.678", delta: "+32%" },
        { label: "Doanh nghiệp", value: "98.256", delta: "+30%" },
        { label: "Giao dịch", value: "12.458", delta: "+2%" },
      ],
      chartDomestic: [
        { year: "2023", value: 980 },
        { year: "2024", value: 1325 },
      ],
      chartForeign: [
        { year: "2023", value: 39800 },
        { year: "2024", value: 45678 },
      ],
    },
    templateExample: `<div className="grid grid-cols-2 gap-4">
  <div className="bg-white/5 rounded-xl p-4">
    <h3 className="text-yellow-300 font-bold mb-3">Trong nước</h3>
    {{#each domestic}}
      <div className="flex justify-between text-sm py-1">
        <span>{{label}}</span>
        <span className="font-bold">{{value}} <em className="text-green-400 text-xs">{{delta}}</em></span>
      </div>
    {{/each}}
  </div>
  <div className="bg-white/5 rounded-xl p-4">
    <h3 className="text-yellow-300 font-bold mb-3">Nước ngoài</h3>
    {{#each foreign}}
      <div className="flex justify-between text-sm py-1">
        <span>{{label}}</span>
        <span className="font-bold">{{value}} <em className="text-green-400 text-xs">{{delta}}</em></span>
      </div>
    {{/each}}
  </div>
</div>`,
  },
  {
    code: "notifications.latest",
    label: "Tin tức - 6 tin mới nhất (Thông báo + Cảnh báo)",
    description:
      "Lấy 6 tin tức (TinTuc) mới nhất TrangThai=Đã xuất bản, CHỈ thuộc danh mục 'Thông báo' hoặc 'Cảnh báo'. Cảnh báo hiển thị màu đỏ, Thông báo màu xanh.",
    apiPath: "GET /api/HomeBlock/NotificationsLatest?top=6",
    sampleResponse: {
      items: [
        {
          id: "...",
          title: "Yêu cầu ngừng kinh doanh nhãn hiệu X",
          loaiThongBao: "Cảnh báo",
          type: "CẢNH BÁO",
          color: "#ff4d4f",
          thumb: "⚠️",
          date: "09:00 09/05/2025",
          createdDate: "2025-05-09T09:00:00",
        },
      ],
    },
    templateExample: `<div className="grid grid-cols-3 gap-4">
  {{#each items}}
    <div className="border rounded-lg p-4 flex gap-3">
      <div className="text-2xl">{{thumb}}</div>
      <div className="flex-1">
        <span className="text-xs font-bold uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-700">{{type}}</span>
        <div className="text-sm mt-1">{{title}}</div>
        <div className="text-xs text-gray-500 mt-1">🕒 {{date}}</div>
      </div>
    </div>
  {{/each}}
</div>`,
  },
  {
    code: "departments.list",
    label: "Danh sách Sở Công Thương",
    description:
      "Lấy danh sách Sở Công Thương từ bảng Department, filter Code prefix 'SCT_' và IsActive=true.",
    apiPath: "GET /api/HomeBlock/SctDepartments",
    sampleResponse: {
      items: [
        { id: "...", name: "Sở Công Thương thành phố Hà Nội", shortName: "SCT Hà Nội", code: "SCT_HN", index: 1 },
        { id: "...", name: "Sở Công Thương Thành phố Hồ Chí Minh", shortName: "SCT TP.HCM", code: "SCT_HCM", index: 2 },
      ],
    },
    templateExample: `<div className="grid grid-cols-3 gap-x-6 gap-y-2">
  {{#each items}}
    <div className="flex gap-2 py-1 border-b border-dashed border-gray-100 text-sm">
      <span className="text-gray-400 w-6 text-right">{{index}}</span>
      <span className="hover:text-blue-600 cursor-pointer">{{name}}</span>
    </div>
  {{/each}}
</div>`,
  },
  {
    code: "banners.public",
    label: "Danh sách Banner hoạt động",
    description: "Lấy danh sách các banner ở vị trí Slide chính (SLIDE) đã xuất bản.",
    apiPath: "GET /api/Banner/GetPublicData?position=SLIDE",
    sampleResponse: {
      data: [
        { id: "...", name: "Banner 1", image: "/uploads/banner/img1.png", link: "https://example.com" }
      ]
    },
    templateExample: `<div className="banner-fade-slider">
  {{#each data}}
    <a href="{{link}}" className="banner-fade-slide">
      <img src="{{image}}" alt="{{name}}" />
    </a>
  {{/each}}
</div>`,
  },
  {
    code: "stats.overview",
    label: "Thống kê toàn cảnh (theo Sở)",
    description:
      "6 chỉ số tổng quan (nền tảng, doanh nghiệp, người bán, sản phẩm, khiếu nại, đang bị kiểm tra) + biểu đồ tăng trưởng theo tháng, scoped theo deptCode. " +
      "Hiện đang dùng MOCK seeded theo deptCode/năm — cần thay bằng API thật: GET /api/HomeBlock/OverviewStats?deptCode=&year=. " +
      "Dropdown năm trong template chỉ hiển thị, chưa wire để refetch theo năm (cần backend nhận thêm tham số year).",
    apiPath: "GET /api/HomeBlock/OverviewStats?deptCode=&year= (đề xuất, chưa có backend)",
    sampleResponse: {
      year: 2025,
      platforms: "2.516",
      enterprises: "65.821",
      sellers: "4.231.665",
      products: "98.421.000",
      complaints: "1.254",
      underInspection: "145",
      years: [{ value: 2025, label: "Năm 2025", selectedAttr: "selected" }],
      yTicks: [{ y: "210.0", label: "0" }],
      monthLabels: [{ x: "50.0", label: "T1" }],
      platformsPoints: "50.0,150.0 99.1,140.2 ...",
      enterprisesPoints: "50.0,170.0 99.1,160.4 ...",
      platformsDots: [{ x: "50.0", y: "150.0" }],
      enterprisesDots: [{ x: "50.0", y: "170.0" }],
    },
    templateExample: `<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
  <div className="rounded-2xl p-5" style={{ background: "linear-gradient(135deg, #0a2358 0%, #143d8c 100%)" }}>
    {{#each platformsDots}}{{/each}}
  </div>
</div>`,
  },
  {
    code: "banners.public.dept",
    label: "Danh sách Banner hoạt động (Sở)",
    description: "Lấy danh sách các banner ở vị trí Slide chính cho Sở (SLIDE_DEPT) đã xuất bản.",
    apiPath: "GET /api/Banner/GetPublicData?position=SLIDE_DEPT",
    sampleResponse: {
      data: [
        { id: "...", name: "Banner Sở 1", image: "/uploads/banner/img1.png", link: "https://example.com" }
      ]
    },
    templateExample: `<div className="banner-fade-slider">
  {{#each data}}
    <a href="{{link}}" className="banner-fade-slide">
      <img src="{{image}}" alt="{{name}}" />
    </a>
  {{/each}}
</div>`,
  },
];

export const DATA_SOURCE_OPTIONS = DATA_SOURCE_DOCS.map((d) => ({
  label: d.label,
  value: d.code,
}));

/** Giá trị đặc biệt khi admin chọn nguồn dữ liệu tùy chọn (gõ URL API thẳng). */
export const CUSTOM_DATA_SOURCE_VALUE = "__custom__";

/**
 * Fetch dữ liệu cho 1 dataSource.
 * - Nếu là key trong registry → gọi function tương ứng (mock hoặc service thật).
 * - Nếu là URL (http://, https:// hoặc /) → fetch GET, parse JSON, trả về NGUYÊN VẸN
 *   không tự đổi field. Admin tự gõ đúng path trong template, vd {{#each data.items}}
 *   hoặc {{#each result.list}}.
 * - Trường hợp đặc biệt: nếu API trả thẳng mảng [...], bọc thành {items: [...]} vì
 *   context của template engine bắt buộc là object.
 */
export async function fetchDataSource(
  source: string | undefined | null,
  deptCode?: string,
): Promise<Record<string, any>> {
  if (!source) return {};
  if (source in dataSourceRegistry) {
    return dataSourceRegistry[source](deptCode);
  }
  const isUrl =
    source.startsWith("http://") ||
    source.startsWith("https://") ||
    source.startsWith("/");
  if (!isUrl) return {};
  try {
    const res = await fetch(source, { headers: { Accept: "application/json" } });
    if (!res.ok) return {};
    const json = await res.json();
    if (Array.isArray(json)) return { items: json };
    if (json && typeof json === "object") return json;
    return {};
  } catch {
    return {};
  }
}

export const dataSourceRegistry: Record<string, DataSourceFn> = {
  "hero.stats": async () => ({ items: HERO_STATS }),
  "platforms.all": async (deptCode) => {
    // Gọi API thật — 18 nền tảng đã xác nhận mới nhất (đủ 3 hàng x 6 cột)
    const r = await apiService.get<any[]>(`/HomeBlock/PlatformsApproved?top=18${deptCode ? `&deptCode=${deptCode}` : ""}`);
    return { items: Array.isArray(r?.data) ? r.data : [] };
  },
  "platforms.grouped": async (deptCode) => {
    // 3 nhóm gộp chung trong+ngoài nước: direct (Mẫu 01+02), intermediary (Mẫu 03+04), ccdv
    const r = await apiService.get<{
      direct?: unknown[];
      intermediary?: unknown[];
      ccdv?: unknown[];
    }>(`/HomeBlock/PlatformsGrouped${deptCode ? `?deptCode=${deptCode}` : ""}`);
    const d = r?.data || {};
    return {
      direct: d.direct || [],
      intermediary: d.intermediary || [],
      ccdv: d.ccdv || [],
    };
  },
  "social.domestic": async () => ({ items: SOCIAL_DOMESTIC }),
  "social.foreign": async () => ({ items: SOCIAL_FOREIGN }),
  "cert.providers": async () => ({ items: CERT_PROVIDERS }),
  "stats.growth": async () => ({
    domestic: STATS_DOMESTIC,
    foreign: STATS_FOREIGN,
    chartDomestic: STATS_CHART_DOMESTIC,
    chartForeign: STATS_CHART_FOREIGN,
  }),
  "notifications.latest": async (deptCode) => {
    // Gọi API thật — lấy 12 mục mới nhất rồi tách thành 2 tab Thông báo / Cảnh báo
    const r = await apiService.get<any[]>(`/HomeBlock/NotificationsLatest?top=12${deptCode ? `&deptCode=${deptCode}` : ""}`);
    const items = Array.isArray(r?.data) ? r.data : [];
    const norm = (s: unknown) => (s || "").toString().trim().toLowerCase();
    return {
      items,
      thongBao: items
        .filter((x) => norm(x.loaiThongBao) === "thông báo")
        .slice(0, 6),
      canhBao: items
        .filter((x) => norm(x.loaiThongBao) === "cảnh báo")
        .slice(0, 6),
    };
  },
  "departments.list": async () => {
    // Gọi API thật — danh sách Sở Công Thương từ bảng Department (Code prefix SCT_)
    const r = await apiService.get<any[] | null>("/HomeBlock/SctDepartments");
    const rawItems = Array.isArray(r?.data) ? r.data : [];
    const items = rawItems.map((x: any) => {
      let name = x.name || "";
      name = name.replace(/Thành phố/g, "TP.").replace(/thành phố/g, "TP.");
      return { ...x, name };
    });
    return { items };
  },
  "banners.public": async () => {
    const r = await apiService.get<any[]>("/Banner/GetPublicData?position=SLIDE");
    const rawList = Array.isArray(r?.data) ? r.data : [];
    const staticUrl = process.env.NEXT_PUBLIC_STATIC_FILE_BASE_URL || "";
    const list = rawList.map((item: any) => {
      let image = item.image || "";
      if (image && !image.startsWith("http")) {
        const base = staticUrl.endsWith("/") ? staticUrl.slice(0, -1) : staticUrl;
        const imgPath = image.startsWith("/") ? image : "/" + image;
        image = `${base}${imgPath}`;
      }
      return { ...item, image };
    });
    return { data: list, bannerAnimationCss: buildBannerFadeCss(list.length) };
  },
  "stats.overview": async (deptCode) => {
    // MOCK seeded theo deptCode + năm hiện tại — TODO: thay bằng API thật khi backend có
    // GET /api/HomeBlock/OverviewStats?deptCode=&year= (xem mô tả trong DATA_SOURCE_DOCS).
    return buildOverviewStats(deptCode || "default", new Date().getFullYear());
  },
  "banners.public.dept": async () => {
    const r = await apiService.get<any[]>("/Banner/GetPublicData?position=SLIDE_DEPT");
    const rawList = Array.isArray(r?.data) ? r.data : [];
    const staticUrl = process.env.NEXT_PUBLIC_STATIC_FILE_BASE_URL || "";
    const list = rawList.map((item: any) => {
      let image = item.image || "";
      if (image && !image.startsWith("http")) {
        const base = staticUrl.endsWith("/") ? staticUrl.slice(0, -1) : staticUrl;
        const imgPath = image.startsWith("/") ? image : "/" + image;
        image = `${base}${imgPath}`;
      }
      return { ...item, image };
    });
    return { data: list, bannerAnimationCss: buildBannerFadeCss(list.length) };
  },
};
