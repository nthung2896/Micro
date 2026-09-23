"use client";
import { HomeBlockDto } from "@/types/homeBlock";
import { useEffect, useState } from "react";
import BlockSkeleton from "./BlockSkeleton";
import { fetchDataSource } from "./dataSourceRegistry";
import { renderTemplate } from "./templateEngine";
import { useRouter } from "next/navigation";

type Props = {
  block: HomeBlockDto;
  deptCode?: string;
};

export default function BlockRenderer({ block, deptCode }: Props) {
  const router = useRouter();
  const [data, setData] = useState<Record<string, any> | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchDataSource(block.dataSource, deptCode)
      .then((d) => !cancelled && setData(d))
      .catch(() => !cancelled && setData({}))
      .finally(() => !cancelled && setLoaded(true));
    return () => {
      cancelled = true;
    };
  }, [block.dataSource, deptCode]);

  const handleSubmit = (e: React.FormEvent<HTMLDivElement>) => {
    const target = e.target as HTMLFormElement;
    if (target.tagName === "FORM") {
      e.preventDefault();
      const input = target.querySelector("input[type='text']") as HTMLInputElement;
      const query = input?.value || "";

      const params = new URLSearchParams();
      if (query.trim()) params.set("q", query.trim());
      if (deptCode) params.set("deptCode", deptCode);

      router.push(`/tim-kiem?${params.toString()}`);
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;

    // Xử lý nút Tìm kiếm thủ công (cho các block không bọc thẻ <form>)
    const isSearchButton = target.tagName === "BUTTON" && target.textContent?.trim() === "Tìm kiếm";
    if (isSearchButton) {
      e.preventDefault();
      const container = target.closest("div") || target.parentElement;
      const input = (container?.querySelector("input[name='q']") ||
        container?.querySelector("input[type='text']") ||
        container?.querySelector("input")) as HTMLInputElement;
      const query = input?.value || "";

      const params = new URLSearchParams();
      if (query.trim()) params.set("q", query.trim());
      if (deptCode) params.set("deptCode", deptCode);

      router.push(`/tim-kiem?${params.toString()}`);
      return;
    }

    // Xử lý click tag tìm kiếm phổ biến (Shopee, Lazada...)
    const popularContainer = target.closest(".flex.flex-wrap.gap-2") || target.closest(".flex.flex-wrap.items-center.gap-2");
    const isPopularTag = popularContainer && (target.tagName === "A" || target.tagName === "SPAN") && target.textContent && !target.textContent.includes("Tìm kiếm phổ biến");

    if (isPopularTag) {
      e.preventDefault();
      const query = target.textContent?.trim() || "";
      if (query) {
        const params = new URLSearchParams();
        params.set("q", query);
        if (deptCode) params.set("deptCode", deptCode);
        router.push(`/tim-kiem?${params.toString()}`);
      }
    }
  };

  if (!loaded) {
    return (
      <div data-block-code={block.code || undefined}>
        <BlockSkeleton code={block.code} />
      </div>
    );
  }

  const body = block.body || "";
  return (
    <div
      data-block-code={block.code || undefined}
      onSubmit={handleSubmit}
      onClick={handleClick}
      dangerouslySetInnerHTML={{
        __html: renderTemplate(body, data || {}),
      }}
    />
  );
}
