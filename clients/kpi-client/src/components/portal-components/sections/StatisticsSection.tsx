"use client";
import {
  STATS_CHART_DOMESTIC,
  STATS_CHART_FOREIGN,
  STATS_DOMESTIC,
  STATS_FOREIGN,
} from "../mockData";

type Stat = { label: string; value: string; delta: string };

function MiniBarChart({ data }: { data: { year: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value));
  return (
    <div className="flex items-end gap-1.5 sm:gap-2 h-24 sm:h-32 mt-3">
      {data.map((d) => {
        const h = Math.max(6, Math.round((d.value / max) * 100));
        return (
          <div key={d.year} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full rounded-t bg-gradient-to-t from-cyan-400 to-blue-400 hover:from-cyan-300 hover:to-blue-300 transition-all duration-200 cursor-pointer"
              style={{ height: `${h}%` }}
              title={d.value.toString()}
            />
            <div className="text-[9px] sm:text-[10px] text-white/70">{d.year}</div>
          </div>
        );
      })}
    </div>
  );
}

function StatBlock({
  title,
  stats,
  chart,
}: {
  title: string;
  stats: Stat[];
  chart: { year: string; value: number }[];
}) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-yellow-300">★</span>
        <span className="text-yellow-300 font-bold uppercase text-xs sm:text-sm">{title}</span>
      </div>
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {stats.map((s) => (
          <div key={s.label} className="text-center bg-white/5 border border-white/5 rounded-lg p-2 flex flex-col justify-between">
            <div className="text-lg sm:text-2xl font-black text-white leading-tight break-all">{s.value}</div>
            <div className="text-[9px] sm:text-[10px] text-green-300 font-semibold mt-0.5">{s.delta}</div>
            <div className="text-[9px] sm:text-[10px] text-white/70 mt-1.5 leading-snug break-words">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="mt-5">
        <div className="text-[10px] sm:text-[11px] text-white/60 uppercase font-semibold tracking-wider">
          Tăng trưởng các năm
        </div>
        <MiniBarChart data={chart} />
      </div>
    </div>
  );
}

export default function StatisticsSection() {
  return (
    <section className="bg-gradient-to-b from-[#0a2540] to-[#0a3a6e] text-white py-8 sm:py-12">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <h2 className="text-center text-yellow-300 text-lg sm:text-2xl font-bold uppercase tracking-wide">
          Thống kê tăng trưởng
        </h2>
        <div className="text-center text-white/80 text-xs sm:text-sm mb-6 sm:mb-8">
          Nền thương mại điện tử hàng năm
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <StatBlock title="Trong nước" stats={STATS_DOMESTIC} chart={STATS_CHART_DOMESTIC} />
          <StatBlock title="Nước ngoài" stats={STATS_FOREIGN} chart={STATS_CHART_FOREIGN} />
        </div>
        <div className="text-center text-[10px] sm:text-[11px] text-white/50 mt-6 max-w-2xl mx-auto leading-relaxed">
          Số liệu thống kê đến tháng 4/2024. Dữ liệu tăng trưởng so với năm trước.
        </div>
      </div>
    </section>
  );
}
