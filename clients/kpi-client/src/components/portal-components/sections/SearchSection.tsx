"use client";
import { Button, Input, Tag } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { SEARCH_CARDS, SEARCH_QUICK_TAGS } from "../mockData";

export default function SearchSection() {
  return (
    <section className="bg-[#f4f8ff] py-10">
      <div className="max-w-[1200px] mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="text-[#0143DF] font-bold uppercase mb-3">
            Tra cứu nền tảng, chứng thực HĐĐT
          </div>
          <div className="flex gap-2 mb-3">
            <Input
              size="large"
              placeholder="Nhập tên doanh nghiệp, nền tảng..."
              prefix={<SearchOutlined />}
            />
            <Button type="primary" size="large">Tìm kiếm</Button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {SEARCH_QUICK_TAGS.map((t, i) => (
              <Tag
                key={t}
                color={i === 0 ? undefined : "blue"}
                className="!rounded-full !px-3 !py-1"
              >
                {t}
              </Tag>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {SEARCH_CARDS.map((c) => (
            <div
              key={c.title}
              className="rounded-xl p-4 text-center cursor-pointer hover:shadow-md transition-shadow"
              style={{ background: c.color }}
            >
              <div className="text-3xl mb-2">{c.icon}</div>
              <div className="text-sm font-semibold text-[#0143DF] leading-tight">
                {c.title}
              </div>
              <div className="text-[11px] text-gray-500 mt-1">{c.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
