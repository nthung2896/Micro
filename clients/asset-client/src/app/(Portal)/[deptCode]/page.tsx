"use client";
import BlockRenderer from "@/components/portal-components/BlockRenderer";
import BlockSkeleton from "@/components/portal-components/BlockSkeleton";
import homeBlockService from "@/services/homeBlock/homeBlock.service";
import { HomeBlockDto } from "@/types/homeBlock";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

// Skeletons cho trang của Sở Công Thương (ẩn HOME_STATS và HOME_DEPARTMENTS)
const SKELETON_CODES = [
  "HOME_HERO_DEPT",
  "HOME_SEARCH",
  "HOME_PLATFORMS",
  "HOME_NOTIFICATIONS",
];

export default function DepartmentPortalPage() {
  const params = useParams();
  const deptCode = params.deptCode as string;

  const [blocks, setBlocks] = useState<HomeBlockDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    homeBlockService
      .getActiveByPosition("deptHome")
      .then((r) => {
        if (cancelled) return;
        const items = Array.isArray(r?.data) ? r.data : [];
        items.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

        // Lọc bỏ khối HOME_STATS và HOME_DEPARTMENTS khi ở trang riêng của Sở
        const filtered = items.filter(
          (b) => b.code !== "HOME_STATS" && b.code !== "HOME_DEPARTMENTS"
        );
        setBlocks(filtered);
      })
      .catch(() => {
        if (!cancelled) setBlocks([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <>
        {SKELETON_CODES.map((code) => (
          <BlockSkeleton key={code} code={code} />
        ))}
      </>
    );
  }

  return (
    <>
      {blocks.map((b) => (
        <BlockRenderer key={b.id || b.code} block={b} deptCode={deptCode} />
      ))}
    </>
  );
}
