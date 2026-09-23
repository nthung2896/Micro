"use client";

/**
 * Skeleton riêng cho từng loại HomeBlock dựa vào code.
 * Mỗi layout giả nội dung thật để giảm cảm giác "nhảy giật" khi load xong.
 */
export default function BlockSkeleton({ code }: { code?: string | null }) {
  switch (code) {
    case "HOME_HERO":
      return <HeroSkeleton />;
    case "HOME_SEARCH":
      return <SearchSkeleton />;
    case "HOME_PLATFORMS":
      return <PlatformsSkeleton />;
    case "HOME_STATS":
      return <StatsSkeleton />;
    case "HOME_NOTIFICATIONS":
      return <NotificationsSkeleton />;
    case "HOME_DEPARTMENTS":
      return <DepartmentsSkeleton />;
    default:
      return <GenericSkeleton />;
  }
}

const bar = "bg-gray-200 rounded";
const card = "bg-gray-100 rounded-xl";

function HeroSkeleton() {
  return (
    <section
      className="relative animate-pulse"
      style={{ background: "#ffffff" }}
    >
      <div className="max-w-[1280px] mx-auto px-6 pt-14 pb-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <div className="lg:col-span-7">
          <div className={`h-4 w-48 ${bar} mb-3`}></div>
          <div className={`h-12 w-md max-w-full ${bar} mb-4`}></div>
          <div className={`h-4 w-72 ${bar} mb-6`}></div>
          <div
            className="flex items-center max-w-xl bg-white rounded-lg p-1.5"
            style={{
              border: "1px solid #bfdbfe",
              boxShadow: "0 14px 40px -12px rgba(1,54,181,0.18)",
            }}
          >
            <div className={`flex-1 h-10 mx-3 ${bar}`}></div>
            <div className="w-24 h-10 rounded-md bg-[#0143DF]/30"></div>
          </div>
        </div>
        <div className="hidden lg:block lg:col-span-5"></div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 pb-10 pt-6">
        <div
          className="rounded-2xl px-4 py-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-0"
          style={{
            background: "#ffffff",
            border: "1px solid #bfdbfe",
            boxShadow: "0 10px 24px -6px rgba(1,54,181,0.3)",
          }}
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="relative flex flex-col items-center text-center px-3 py-4"
            >
              {i > 0 && (
                <span
                  className="absolute hidden md:block"
                  style={{
                    left: 0,
                    top: "18%",
                    bottom: "18%",
                    width: 1,
                    background: "#e5e7eb",
                  }}
                ></span>
              )}
              <div className={`w-16 h-16 rounded-2xl ${bar} mb-3`}></div>
              <div
                className={`h-3 w-24 ${bar} mb-2 pb-2`}
                style={{ borderBottom: "1px solid #e5e7eb" }}
              ></div>
              <div className={`h-2 w-28 ${bar}`}></div>
              <div className={`h-2 w-20 ${bar} mt-1`}></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SearchSkeleton() {
  return (
    <section className="bg-white py-8 animate-pulse">
      <div className="max-w-[1280px] mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="border border-gray-200 rounded p-5 space-y-3">
          <div className={`h-5 w-56 ${bar}`}></div>
          <div className={`h-10 w-full ${bar} rounded-md`}></div>
          <div className="flex gap-2">
            {[60, 60, 50, 80].map((w, i) => (
              <div key={i} className={`h-6 rounded ${bar}`} style={{ width: w }}></div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border border-gray-200 rounded p-4 flex flex-col items-center space-y-2">
              <div className={`w-8 h-8 ${bar}`}></div>
              <div className={`h-3 w-24 ${bar}`}></div>
              <div className={`h-2 w-28 ${bar}`}></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PlatformsSkeleton() {
  return (
    <section className="bg-white py-8 animate-pulse">
      <div className="max-w-[1280px] mx-auto px-4">
        <div className="flex items-end justify-between mb-4 pb-2 border-b-[3px] border-[#0143DF]">
          <div className={`h-6 w-44 ${bar}`}></div>
          <div className={`h-3 w-24 ${bar}`}></div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {Array.from({ length: 18 }).map((_, i) => (
            <div
              key={i}
              className="border border-gray-200 rounded p-3 flex flex-col items-center justify-center text-center"
              style={{ aspectRatio: "16 / 9" }}
            >
              <div className={`w-2/3 h-6 ${bar} mb-2`}></div>
              <div className={`h-3 w-20 ${bar} mb-1`}></div>
              <div className={`h-2 w-16 ${bar}`}></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatsSkeleton() {
  return (
    <section className="bg-[#f4f8ff] py-8 animate-pulse">
      <div className="max-w-[1280px] mx-auto px-4">
        <div className="flex items-end justify-between mb-4 pb-2 border-b-[3px] border-[#0143DF]">
          <div className={`h-6 w-56 ${bar}`}></div>
          <div className={`h-3 w-40 ${bar}`}></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[0, 1].map((idx) => (
            <div key={idx} className="bg-white border border-gray-200 rounded p-5 space-y-4">
              <div className={`h-4 w-40 ${bar} pb-2 border-b border-gray-200`}></div>
              <div className="grid grid-cols-3 gap-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="border border-gray-100 rounded p-3 space-y-2">
                    <div className={`h-6 w-16 mx-auto ${bar}`}></div>
                    <div className={`h-2 w-10 mx-auto ${bar}`}></div>
                    <div className={`h-2 w-20 mx-auto ${bar}`}></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function NotificationsSkeleton() {
  return (
    <section className="bg-white py-8 animate-pulse">
      <div className="max-w-[1280px] mx-auto px-4">
        {/* Tabs */}
        <div className="flex items-end justify-between mb-4 border-b border-gray-200">
          <div className="flex items-end gap-0">
            <div
              className="px-5 py-2 -mb-px flex items-center gap-1.5"
              style={{ borderBottom: "3px solid #0143DF" }}
            >
              <div className={`w-4 h-4 ${bar}`}></div>
              <div className={`h-3 w-20 ${bar}`}></div>
            </div>
            <div className="px-5 py-2 -mb-px flex items-center gap-1.5">
              <div className={`w-4 h-4 ${bar}`}></div>
              <div className={`h-3 w-18 ${bar}`}></div>
            </div>
          </div>
          <div className={`h-3 w-24 ${bar} pb-2`}></div>
        </div>
        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white border border-gray-200 rounded p-4 flex gap-3"
            >
              <div
                className={`${bar} shrink-0`}
                style={{ width: 48, height: 48, borderRadius: 12 }}
              ></div>
              <div className="flex-1 space-y-2">
                <div className={`h-3 w-20 rounded ${bar}`}></div>
                <div className={`h-3 w-full ${bar}`}></div>
                <div className={`h-3 w-3/4 ${bar}`}></div>
                <div className={`h-2 w-28 ${bar} mt-3`}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DepartmentsSkeleton() {
  return (
    <section className="bg-[#f4f8ff] py-8 animate-pulse">
      <div className="max-w-[1280px] mx-auto px-4">
        <div className="flex items-end justify-between mb-4 pb-2 border-b-[3px] border-[#0143DF]">
          <div className={`h-6 w-64 ${bar}`}></div>
          <div className={`h-3 w-24 ${bar}`}></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-white rounded border border-gray-200 p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
              {Array.from({ length: 21 }).map((_, i) => (
                <div key={i} className={`h-4 ${bar}`}></div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded border border-gray-200 p-4 flex flex-col items-center justify-center space-y-3">
            <div className={`w-44 h-72 ${bar}`}></div>
            <div className="flex flex-wrap gap-3 justify-center mt-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className={`h-3 w-20 ${bar}`}></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function GenericSkeleton() {
  return (
    <section className="py-8 animate-pulse">
      <div className="max-w-[1200px] mx-auto px-4 space-y-3">
        <div className={`h-5 w-48 ${bar}`}></div>
        <div className={`h-32 w-full ${card}`}></div>
      </div>
    </section>
  );
}
