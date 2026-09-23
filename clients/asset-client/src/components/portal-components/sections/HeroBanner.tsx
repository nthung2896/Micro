"use client";
import { HERO_STATS } from "../mockData";

export default function HeroBanner() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-[#0143DF] via-[#0b5bbf] to-[#1e88e5] text-white">
      <div className="max-w-[1200px] mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative z-10">
        <div>
          <div className="inline-block bg-white/15 px-3 py-1 rounded text-xs uppercase tracking-wide mb-3">
            Cổng thông tin
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold leading-tight mb-3">
            QUẢN LÝ HOẠT ĐỘNG <br />
            <span className="text-yellow-300">THƯƠNG MẠI ĐIỆN TỬ</span>
          </h1>
          <p className="text-sm opacity-90 mb-6 max-w-md">
            Hỗ trợ doanh nghiệp, tổ chức, cá nhân thực hiện thông báo và đăng ký
            hoạt động thương mại điện tử trực tuyến.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {HERO_STATS.map((s) => (
              <div
                key={s.label}
                className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/15"
              >
                <div className="text-lg font-bold text-yellow-300">{s.value}</div>
                <div className="text-[11px] uppercase opacity-80">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="hidden md:flex justify-center">
          <div className="text-[200px] leading-none opacity-90 select-none">🛒</div>
        </div>
      </div>

      {/* decoration */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-cyan-300/30 blur-3xl" />
        <div className="absolute bottom-0 left-10 w-60 h-60 rounded-full bg-blue-400/30 blur-3xl" />
      </div>
    </section>
  );
}
