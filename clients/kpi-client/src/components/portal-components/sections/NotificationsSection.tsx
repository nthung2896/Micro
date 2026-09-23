"use client";
import { NOTIFICATIONS } from "../mockData";

export default function NotificationsSection() {
  return (
    <section className="py-10">
      <div className="max-w-[1200px] mx-auto px-4">
        <h2 className="text-[#0143DF] font-bold uppercase text-lg mb-5">
          Thông báo - Cảnh báo
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {NOTIFICATIONS.map((n, i) => (
            <div
              key={i}
              className="bg-white border border-gray-200 rounded-lg p-4 flex gap-3 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div
                className="w-12 h-12 rounded-md flex items-center justify-center text-xl shrink-0"
                style={{ background: `${n.color}20`, color: n.color }}
              >
                {n.thumb}
              </div>
              <div className="flex-1 min-w-0">
                <span
                  className="inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded mb-1"
                  style={{ background: `${n.color}20`, color: n.color }}
                >
                  {n.type}
                </span>
                <div className="text-sm text-gray-800 leading-snug line-clamp-3">
                  {n.title}
                </div>
                <div className="text-[11px] text-gray-500 mt-2">🕒 {n.date}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
