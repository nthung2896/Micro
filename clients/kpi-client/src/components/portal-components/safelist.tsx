// Safelist các class arbitrary CHỈ xuất hiện trong DB body của HomeBlock.
// Tailwind v4 scan source files để compile CSS — class chỉ có trong DB sẽ bị purge.
// File này đảm bảo các class hex/spec có sẵn ở production CSS bundle.
// Render trong root layout ẩn đi, không ảnh hưởng UI.

export default function TailwindSafelist() {
  return (
    <div className="hidden" aria-hidden="true">
      {/* Background colors */}
      <div className="bg-[#0143DF] bg-[#0136B5] bg-[#083f85] bg-[#dcfce7] bg-[#f0f7ff] bg-[#f4f8ff] bg-[#f9fbff] bg-[#fef2f2] bg-[#fee2e2] bg-[#fef3c7] bg-[#dbeafe] bg-[#ede9fe] bg-[#bbf7d0] bg-[#bcdcff]" />

      {/* Text colors */}
      <div className="text-[#0143DF] text-[#0136B5] text-[#083f85] text-[#15803d] text-[#b91c1c] text-[#b45309] text-[#1d4ed8] text-[#6d28d9] text-[#1f2937] text-[10px] text-[11px]" />

      {/* Border colors + width */}
      <div className="border-[#0143DF] border-[#0136B5] border-[#bbf7d0] border-[#bcdcff] border-[#0a4ea2] border-[3px] border-l-4 border-l-[#0143DF]" />

      {/* Hover variants */}
      <div className="hover:bg-[#0143DF] hover:bg-[#0136B5] hover:bg-[#083f85] hover:bg-[#e8f1ff] hover:bg-[#f4f8ff] hover:bg-[#fef2f2] hover:text-[#0143DF] hover:text-[#0136B5] hover:text-[#b91c1c] hover:border-[#0143DF] hover:border-[#0136B5] hover:border-[#b91c1c]" />

      {/* Focus variants */}
      <div className="focus:border-[#0143DF] focus:ring-blue-300" />

      {/* Sizing arbitrary */}
      <div className="min-w-[180px] min-w-[200px] min-w-[210px] min-w-[220px] min-w-[260px] max-w-[1280px] max-w-[1200px] max-w-[340px] max-w-2xl max-w-3xl max-w-md max-h-14 max-h-none w-14 w-16 h-14 h-9 h-11 h-12" />

      {/* Rounded fragments */}
      <div className="rounded-r-xl rounded-l-xl rounded-r-full rounded-l-full" />

      {/* Shadow arbitrary */}
      <div
        className="shadow-md"
        style={{
          boxShadow:
            "0 14px 40px -12px rgba(1, 54, 181, 0.45), 0 12px 32px -8px rgba(1, 54, 181, 0.25)",
        }}
      />
    </div>
  );
}
