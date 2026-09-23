"use client";
import {
  DownloadOutlined,
  FileExcelOutlined,
  FileImageOutlined,
  FilePdfOutlined,
  FileTextOutlined,
  FileWordOutlined,
  FileZipOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import bieuMauService from "@/services/bieuMau/bieuMau.service";
import { BieuMauDto } from "@/types/bieuMau";
import { Input, Select, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const StaticFileUrl = process.env.NEXT_PUBLIC_STATIC_FILE_BASE_URL;

function fileExt(url?: string | null): string {
  if (!url) return "";
  const parts = url.split(".");
  return (parts[parts.length - 1] || "").toLowerCase();
}

function InlineFileIcon({ file }: { file?: string | null }) {
  const ext = fileExt(file);
  const cls = "text-base";
  if (ext === "pdf")
    return <FilePdfOutlined className={`${cls} text-red-600`} />;
  if (["doc", "docx"].includes(ext))
    return <FileWordOutlined className={`${cls} text-blue-700`} />;
  if (["xls", "xlsx", "csv"].includes(ext))
    return <FileExcelOutlined className={`${cls} text-green-700`} />;
  if (["zip", "rar", "7z"].includes(ext))
    return <FileZipOutlined className={`${cls} text-purple-700`} />;
  if (["jpg", "jpeg", "png", "gif", "svg", "webp"].includes(ext))
    return <FileImageOutlined className={`${cls} text-amber-600`} />;
  return <FileTextOutlined className={`${cls} text-gray-500`} />;
}

export default function BieuMauPage() {
  const [items, setItems] = useState<BieuMauDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [loai, setLoai] = useState<string | undefined>(undefined);

  useEffect(() => {
    setLoading(true);
    bieuMauService
      .getPublicData({ trangThai: 1, pageIndex: 1, pageSize: 200 })
      .then((r) => {
        const list: BieuMauDto[] = Array.isArray(r?.data?.items)
          ? r.data!.items
          : [];
        list.sort((a, b) => (a.thuTu ?? 999) - (b.thuTu ?? 999));
        setItems(list);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const loaiOptions = useMemo(
    () =>
      Array.from(
        new Set(items.map((x) => x.loaiBieuMau).filter(Boolean) as string[]),
      ).map((v) => ({ label: v, value: v })),
    [items],
  );

  const filtered = useMemo(() => {
    let list = items;
    if (keyword.trim()) {
      const k = keyword.trim().toLowerCase();
      list = list.filter(
        (x) =>
          (x.tenTaiLieu || "").toLowerCase().includes(k) ||
          (x.moTa || "").toLowerCase().includes(k),
      );
    }
    if (loai) list = list.filter((x) => x.loaiBieuMau === loai);
    return list;
  }, [items, keyword, loai]);

  const fileUrl = (file?: string | null) =>
    !file ? "" : file.startsWith("http") ? file : `${StaticFileUrl}/${file}`;

  const columns: ColumnsType<BieuMauDto> = [
    {
      title: "STT",
      width: 55,
      align: "center",
      render: (_v, _r, i) => i + 1,
    },
    {
      title: "Tên tài liệu",
      dataIndex: "tenTaiLieu",
      render: (v: string, r) => (
        <div className="flex items-start gap-2">
          <span className="mt-1">
            <InlineFileIcon file={r.fileDinhKem} />
          </span>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-gray-900">{v}</div>
            {r.moTa && (
              <div className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                {r.moTa}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Loại biểu mẫu",
      dataIndex: "loaiBieuMau",
      width: 180,
      align: "center",
      render: (v: string) => v || "-",
    },
    {
      title: "Định dạng",
      width: 100,
      align: "center",
      render: (_v, r) => {
        const ext = fileExt(r.fileDinhKem);
        return ext ? (
          <span className="text-xs font-mono uppercase text-gray-700">
            {ext}
          </span>
        ) : (
          <span className="text-gray-300">-</span>
        );
      },
    },
    {
      title: "Tải về",
      width: 90,
      align: "center",
      fixed: "right",
      render: (_v, r) =>
        r.fileDinhKem ? (
          <a
            href={fileUrl(r.fileDinhKem)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#0143DF] hover:text-[#0143DF] underline inline-flex items-center gap-1"
          >
            <DownloadOutlined />
            Tải
          </a>
        ) : (
          <span className="text-gray-300">—</span>
        ),
    },
  ];

  return (
    <div className="bg-white">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-5">
        {/* Breadcrumb */}
        <div className="text-xs text-gray-600 mb-3 border-b border-gray-200 pb-2">
          <Link href="/" className="hover:text-[#0143DF]">
            Trang chủ
          </Link>
          <span className="mx-1.5 text-gray-400">›</span>
          <span className="text-gray-800 font-medium">Biểu mẫu</span>
        </div>

        {/* Title + Filter cùng hàng */}
        <div className="flex flex-wrap items-end justify-between gap-3 mb-4 pb-2 border-b-[3px] border-[#0143DF]">
          <h1 className="text-xl font-bold text-[#0143DF] uppercase">
            Biểu mẫu
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <Input
              placeholder="Tên tài liệu, mô tả..."
              prefix={<SearchOutlined className="text-gray-400" />}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              allowClear
              className="w-[260px]!"
            />
            <Select
              placeholder="Loại biểu mẫu"
              value={loai}
              onChange={setLoai}
              options={loaiOptions}
              allowClear
              className="w-[220px]!"
            />
          </div>
        </div>

        <div className="text-sm text-gray-700 mb-2">
          Tổng số:{" "}
          <span className="font-bold text-[#0143DF]">{filtered.length}</span>{" "}
          biểu mẫu
        </div>

        <Table<BieuMauDto>
          columns={columns}
          dataSource={filtered}
          rowKey="id"
          loading={loading}
          bordered
          scroll={{ x: 900 }}
          className="gov-table"
          pagination={{
            pageSize: 15,
            showSizeChanger: true,
            showTotal: (t, r) => `Hiển thị ${r[0]}-${r[1]} trên ${t}`,
          }}
        />
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            .gov-table .ant-table-cell { border-radius: 0 !important; }
            .gov-table .ant-table-container,
            .gov-table .ant-table-content,
            .gov-table table {
              border-radius: 6px !important;
              overflow: hidden;
            }
            .gov-table .ant-table-thead > tr:first-child > th:first-child {
              border-top-left-radius: 6px !important;
            }
            .gov-table .ant-table-thead > tr:first-child > th:last-child {
              border-top-right-radius: 6px !important;
            }
            .gov-table .ant-table-tbody > tr:last-child > td:first-child {
              border-bottom-left-radius: 6px !important;
            }
            .gov-table .ant-table-tbody > tr:last-child > td:last-child {
              border-bottom-right-radius: 6px !important;
            }
            .gov-table .ant-table { font-size: 14px; }
            .gov-table .ant-table-measure-row,
            .gov-table tr.ant-table-measure-row { display: none !important; }
            .gov-table table { border-collapse: collapse !important; border-spacing: 0 !important; }
            .gov-table .ant-table-thead > tr > th {
              background: #0143DF !important;
              color: #fff !important;
              font-weight: 600;
              border-right: 1px solid #1e5bb8 !important;
              padding: 12px 10px !important;
            }
            .gov-table .ant-table-thead > tr > th::before { display: none !important; }
            .gov-table .ant-table-tbody > tr > td {
              padding: 12px 10px !important;
              border-right: 1px solid #e5e7eb !important;
              border-bottom: 1px solid #e5e7eb !important;
            }
            .gov-table .ant-table-tbody > tr:hover > td {
              background: #eff6ff !important;
            }
            .gov-table .ant-table-container {
              border: 1px solid #d4d4d8 !important;
            }
            .gov-table .ant-pagination { margin-top: 16px !important; font-size: 14px; }
            .gov-table .ant-pagination .ant-pagination-item,
            .gov-table .ant-pagination .ant-pagination-prev,
            .gov-table .ant-pagination .ant-pagination-next,
            .gov-table .ant-pagination .ant-pagination-jump-prev,
            .gov-table .ant-pagination .ant-pagination-jump-next {
              min-width: 36px !important;
              height: 36px !important;
              line-height: 34px !important;
              border-radius: 6px !important;
            }
            .gov-table .ant-pagination .ant-pagination-item-active {
              border-color: #0143DF !important;
            }
            .gov-table .ant-pagination .ant-pagination-item-active a {
              color: #0143DF !important;
              font-weight: 600;
            }
            .gov-table .ant-pagination .ant-select-selector {
              height: 36px !important;
              border-radius: 6px !important;
            }
          `,
        }}
      />
    </div>
  );
}
