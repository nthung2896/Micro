"use client";
import { Button } from "antd";
import { useState } from "react";
import { DEPARTMENTS } from "../mockData";

const REGIONS = ["Tất cả miền", "Miền Bắc", "Miền Trung", "Miền Nam"];

export default function DepartmentsSection() {
  const [region, setRegion] = useState(REGIONS[0]);
  return (
    <section className="bg-[#f4f8ff] py-10">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[#0143DF] font-bold uppercase text-lg">
            Danh sách 34 sở công thương
          </h2>
          <div className="flex gap-2">
            {REGIONS.map((r) => (
              <Button
                key={r}
                size="small"
                type={region === r ? "primary" : "default"}
                onClick={() => setRegion(r)}
              >
                {r}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-4">
            <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2 text-sm text-gray-700">
              {DEPARTMENTS.map((d, i) => (
                <li
                  key={d}
                  className="flex gap-2 py-1 border-b border-dashed border-gray-100"
                >
                  <span className="text-gray-400 w-6 text-right">{i + 1}</span>
                  <span className="truncate hover:text-[#0143DF] cursor-pointer">
                    {d}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col items-center justify-center">
            <div className="text-8xl">🇻🇳</div>
            <div className="text-sm text-gray-600 mt-3 text-center">
              Bản đồ vị trí các Sở Công Thương trên toàn quốc
            </div>
            <div className="mt-4 flex flex-col gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-400" /> Miền Bắc
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-yellow-400" /> Miền Trung
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-400" /> Miền Nam
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
