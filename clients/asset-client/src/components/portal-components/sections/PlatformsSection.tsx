"use client";
import { Tag } from "antd";
import {
  CERT_PROVIDERS,
  Platform,
  PLATFORMS_DOMESTIC,
  PLATFORMS_FOREIGN,
  SOCIAL_DOMESTIC,
  SOCIAL_FOREIGN,
} from "../mockData";

function PlatformCard({ p }: { p: Platform }) {
  return (
    <div className="border border-gray-200 rounded-lg p-3 flex items-center gap-3 hover:shadow-sm transition-shadow bg-white">
      <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-lg font-bold text-[#0143DF]">
        {p.name.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-gray-800 truncate">{p.name}</div>
        <div className="text-[11px] text-gray-500 truncate">{p.logo}</div>
      </div>
      <Tag color="green" className="!m-0">Đã duyệt</Tag>
    </div>
  );
}

function Block({
  title,
  items,
  badge,
}: {
  title: string;
  items: Platform[];
  badge: string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="font-semibold text-gray-800 text-sm uppercase">{title}</div>
        <Tag color="blue" className="!rounded-full">{badge}</Tag>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {items.map((p) => (
          <PlatformCard key={p.name} p={p} />
        ))}
      </div>
    </div>
  );
}

export default function PlatformsSection() {
  return (
    <section className="bg-[#f4f8ff] pb-10">
      <div className="max-w-[1200px] mx-auto px-4">
        <h2 className="text-center text-2xl font-bold text-[#0143DF] py-6">
          NỀN TẢNG ĐƯỢC DUYỆT
        </h2>

        <div className="bg-white/60 rounded-xl p-3">
          <div className="text-sm font-bold text-gray-700 px-2 mb-2">
            Nền tảng kinh doanh trực tiếp có đặt hàng
          </div>
          <Block title="Trong nước" items={PLATFORMS_DOMESTIC} badge="Trong nước" />
          <Block title="Nước ngoài" items={PLATFORMS_FOREIGN} badge="Nước ngoài" />
        </div>

        <div className="bg-white/60 rounded-xl p-3 mt-4">
          <div className="text-sm font-bold text-gray-700 px-2 mb-2">
            Nền tảng TMĐT trung gian, mạng xã hội hoạt động TMĐT, TMĐT tích hợp
          </div>
          <Block title="Trong nước" items={SOCIAL_DOMESTIC} badge="Trong nước" />
          <Block title="Nước ngoài" items={SOCIAL_FOREIGN} badge="Nước ngoài" />
        </div>

        <div className="bg-white/60 rounded-xl p-3 mt-4">
          <div className="text-sm font-bold text-gray-700 px-2 mb-2">
            Dịch vụ chứng thực hợp đồng điện tử
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {CERT_PROVIDERS.map((p) => (
                <PlatformCard key={p.name} p={p} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
