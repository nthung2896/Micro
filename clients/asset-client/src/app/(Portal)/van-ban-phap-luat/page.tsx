"use client";
import { DownloadOutlined, SearchOutlined, EyeOutlined, FileTextOutlined, CalendarOutlined, BookOutlined, SafetyCertificateOutlined, BankOutlined, TagOutlined, FilePdfOutlined } from "@ant-design/icons";
import legalDocumentService from "@/services/legalDocument/legalDocument.service";
import { VanBanPhapLuatDto } from "@/types/vanBanPhapLuat";
import { Input, Select, Table, Modal, Button } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

dayjs.locale("vi");

const StaticFileUrl = process.env.NEXT_PUBLIC_STATIC_FILE_BASE_URL;

export default function VanBanPhapLuatPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [loaiVanBan, setLoaiVanBan] = useState<string | undefined>(undefined);
  const [linhVuc, setLinhVuc] = useState<string | undefined>(undefined);

  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);
      try {
        const r = await legalDocumentService.getPublicData({
          pageIndex: 1,
          pageSize: 200,
        });
        const rawItems = Array.isArray(r?.data?.items) ? r.data!.items : [];
        const list: any[] = rawItems.map((x) => ({
          id: x.id ?? "",
          soHieu: x.code ?? "",
          tenVanBan: x.document ?? "",
          trichYeu: x.description ?? "",
          loaiVanBan: x.loaiVanBan ?? "",
          linhVuc: x.loaiHeThongName ?? "",
          donViBanHanh: x.publicBy ?? "",
          ngayBanHanh: x.publicDate ?? "",
          ngayHieuLuc: x.activedDate ?? "",
          fileDinhKem: x.document ?? "",
          trangThai: 1,
          content: x.content ?? "",
        }));
        list.sort((a, b) => {
          const da = a.ngayBanHanh ? new Date(a.ngayBanHanh).getTime() : 0;
          const db = b.ngayBanHanh ? new Date(b.ngayBanHanh).getTime() : 0;
          return db - da;
        });
        setItems(list);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  const loaiOptions = useMemo(
    () =>
      Array.from(
        new Set(items.map((x) => x.loaiVanBan).filter(Boolean) as string[]),
      ).map((v) => ({ label: v, value: v })),
    [items],
  );
  const linhVucOptions = useMemo(
    () =>
      Array.from(
        new Set(items.map((x) => x.linhVuc).filter(Boolean) as string[]),
      ).map((v) => ({ label: v, value: v })),
    [items],
  );

  const filtered = useMemo(() => {
    let list = items;
    if (keyword.trim()) {
      const k = keyword.trim().toLowerCase();
      list = list.filter(
        (x) =>
          (x.soHieu || "").toLowerCase().includes(k) ||
          (x.tenVanBan || "").toLowerCase().includes(k) ||
          (x.trichYeu || "").toLowerCase().includes(k),
      );
    }
    if (loaiVanBan) list = list.filter((x) => x.loaiVanBan === loaiVanBan);
    if (linhVuc) list = list.filter((x) => x.linhVuc === linhVuc);
    return list;
  }, [items, keyword, loaiVanBan, linhVuc]);

  const fileUrl = (file?: string | null) =>
    !file ? "" : file.startsWith("http") ? file : `${StaticFileUrl}/${file}`;

  const columns: ColumnsType<VanBanPhapLuatDto> = [
    {
      title: "STT",
      width: 55,
      align: "center",
      render: (_v, _r, i) => i + 1,
    },
    {
      title: "Số hiệu",
      dataIndex: "soHieu",
      width: 140,
      render: (v: string) => (
        <span className="font-semibold text-[#0143DF]">{v}</span>
      ),
    },
    {
      title: "Trích yếu nội dung",
      dataIndex: "tenVanBan",
      render: (v: string, r) => (
        <div>
          {r.trichYeu && (
            <div className="text-xs text-gray-600 mt-1 leading-relaxed">
              {r.trichYeu}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Loại văn bản",
      dataIndex: "loaiVanBan",
      width: 130,
      align: "center",
      render: (v: string) => v || "-",
    },
    {
      title: "Lĩnh vực",
      dataIndex: "linhVuc",
      width: 140,
      align: "center",
      render: (v: string) => v || "-",
    },
    {
      title: "Cơ quan ban hành",
      dataIndex: "donViBanHanh",
      width: 170,
      render: (v: string) => v || "-",
    },
    {
      title: "Ngày ban hành",
      dataIndex: "ngayBanHanh",
      width: 120,
      align: "center",
      render: (v?: string) => (v ? dayjs(v).format("DD/MM/YYYY") : "-"),
    },
    {
      title: "Ngày hiệu lực",
      dataIndex: "ngayHieuLuc",
      width: 120,
      align: "center",
      render: (v?: string) => (v ? dayjs(v).format("DD/MM/YYYY") : "-"),
    },
    {
      title: "Thao tác",
      width: 120,
      align: "center",
      fixed: "right",
      render: (_v, r) => (
        <div className="flex flex-col gap-2 items-start justify-center pl-2">
          <button
            type="button"
            onClick={() => {
              setSelectedDoc(r);
              setDetailModalOpen(true);
            }}
            className="text-[#0143DF] hover:text-[#0136B5] underline inline-flex items-center gap-1 cursor-pointer bg-transparent border-0 p-0 text-sm font-semibold"
          >
            <FileTextOutlined />
            Chi tiết
          </button>
          {r.fileDinhKem ? (
            <>
              <a
                href={fileUrl(r.fileDinhKem)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-800 underline inline-flex items-center gap-1 text-sm"
              >
                <EyeOutlined />
                Xem file
              </a>
              <a
                href={fileUrl(r.fileDinhKem)}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 hover:text-emerald-700 underline inline-flex items-center gap-1 text-sm"
              >
                <DownloadOutlined />
                Tải về
              </a>
            </>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-5">
        {/* Breadcrumb đơn giản */}
        <div className="text-xs text-gray-600 mb-3 border-b border-gray-200 pb-2">
          <Link href="/" className="hover:text-[#0143DF]">
            Trang chủ
          </Link>
          <span className="mx-1.5 text-gray-400">›</span>
          <span className="text-gray-800 font-medium">Văn bản pháp luật</span>
        </div>

        {/* Title + Filter cùng hàng */}
        <div className="flex flex-wrap items-end justify-between gap-3 mb-4 pb-2 border-b-[3px] border-[#0143DF]">
          <h1 className="text-xl font-bold text-[#0143DF] uppercase">
            Văn bản pháp luật
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <Input
              placeholder="Số hiệu, tên văn bản..."
              prefix={<SearchOutlined className="text-gray-400" />}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              allowClear
              className="w-[260px]!"
            />
            <Select
              placeholder="Loại văn bản"
              value={loaiVanBan}
              onChange={setLoaiVanBan}
              options={loaiOptions}
              allowClear
              className="w-[180px]!"
            />
            <Select
              placeholder="Lĩnh vực"
              value={linhVuc}
              onChange={setLinhVuc}
              options={linhVucOptions}
              allowClear
              className="w-[180px]!"
            />
          </div>
        </div>

        {/* Kết quả */}
        <div className="text-sm text-gray-700 mb-2">
          Tổng số:{" "}
          <span className="font-bold text-[#0143DF]">{filtered.length}</span>{" "}
          văn bản
        </div>

        {/* Table — bordered, dense */}
        <Table<any>
          columns={columns}
          dataSource={filtered}
          rowKey="id"
          loading={loading}
          bordered
          scroll={{ x: 1200 }}
          className="gov-table cursor-pointer"
          onRow={(record) => ({
            onClick: (e) => {
              const target = e.target as HTMLElement;
              if (target.closest("a") || target.closest("button")) {
                return;
              }
              setSelectedDoc(record);
              setDetailModalOpen(true);
            },
          })}
          pagination={{
            pageSize: 15,
            showSizeChanger: true,
            showTotal: (t, r) => `Hiển thị ${r[0]}-${r[1]} trên ${t}`,
          }}
        />
      </div>

      {/* Modal chi tiết văn bản */}
      <Modal
        title={
          <div className="flex items-center gap-3 border-b pb-3.5 border-gray-100 pr-6">
            <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center text-[#0143DF] shrink-0 text-xl font-bold">
              <BookOutlined />
            </div>
            <div>
              <span className="inline-block px-2 py-0.5 text-[11px] font-bold bg-[#0143DF]/10 text-[#0143DF] rounded uppercase tracking-wider mb-0.5">
                Chi tiết văn bản pháp luật
              </span>
              <h2 className="text-gray-900 font-extrabold text-lg leading-snug">
                Số hiệu: <span className="text-[#0143DF]">{selectedDoc?.soHieu}</span>
              </h2>
            </div>
          </div>
        }
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalOpen(false)}>
            Đóng
          </Button>,
          selectedDoc?.fileDinhKem && (
            <Button
              key="download"
              type="primary"
              icon={<DownloadOutlined />}
              href={fileUrl(selectedDoc.fileDinhKem)}
              download
              target="_blank"
              rel="noopener noreferrer"
            >
              Tải văn bản
            </Button>
          ),
        ]}
        width={750}
        centered
      >
        {selectedDoc && (
          <div className="py-4 flex flex-col gap-6 max-h-[70vh] overflow-y-auto pr-1">
            {/* Tên văn bản / Trích yếu nội dung chính */}


            {/* Bảng thông tin thuộc tính */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-5 rounded-xl border border-slate-100 text-sm">
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-md bg-blue-100/60 text-[#0143DF] text-base shrink-0">
                  <BankOutlined />
                </div>
                <div>
                  <span className="text-[11px] text-gray-400 block font-bold uppercase tracking-wider mb-0.5">Cơ quan ban hành</span>
                  <strong className="text-gray-700 font-semibold">{selectedDoc.donViBanHanh || "—"}</strong>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-md bg-orange-100/60 text-orange-600 text-base shrink-0">
                  <TagOutlined />
                </div>
                <div>
                  <span className="text-[11px] text-gray-400 block font-bold uppercase tracking-wider mb-0.5">Loại văn bản</span>
                  <strong className="text-gray-700 font-semibold">{selectedDoc.loaiVanBan || "—"}</strong>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-md bg-teal-100/60 text-teal-600 text-base shrink-0">
                  <SafetyCertificateOutlined />
                </div>
                <div>
                  <span className="text-[11px] text-gray-400 block font-bold uppercase tracking-wider mb-0.5">Lĩnh vực</span>
                  <strong className="text-gray-700 font-semibold">{selectedDoc.linhVuc || "—"}</strong>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-md bg-purple-100/60 text-purple-600 text-base shrink-0">
                  <CalendarOutlined />
                </div>
                <div>
                  <span className="text-[11px] text-gray-400 block font-bold uppercase tracking-wider mb-0.5">Ngày ban hành</span>
                  <strong className="text-gray-700 font-semibold">
                    {selectedDoc.ngayBanHanh ? dayjs(selectedDoc.ngayBanHanh).format("DD/MM/YYYY") : "—"}
                  </strong>
                </div>
              </div>

              <div className="flex items-start gap-2.5 sm:col-span-2">
                <div className="p-1.5 rounded-md bg-rose-100/60 text-rose-600 text-base shrink-0">
                  <CalendarOutlined />
                </div>
                <div>
                  <span className="text-[11px] text-gray-400 block font-bold uppercase tracking-wider mb-0.5">Ngày hiệu lực</span>
                  <strong className="text-gray-700 font-semibold">
                    {selectedDoc.ngayHieuLuc ? dayjs(selectedDoc.ngayHieuLuc).format("DD/MM/YYYY") : "—"}
                  </strong>
                </div>
              </div>
            </div>

            {/* Trích yếu tóm tắt */}
            {selectedDoc.trichYeu && (
              <div className="bg-slate-50/40 p-4 rounded-xl border border-slate-100">
                <h3 className="text-xs font-bold text-[#0143DF] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <span className="h-3.5 w-1 bg-[#0143DF] rounded-full inline-block" />
                  Mô tả / Trích yếu nội dung
                </h3>
                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line pl-2.5 border-l-2 border-slate-200">
                  {selectedDoc.trichYeu}
                </p>
              </div>
            )}

            {/* Đính kèm File Preview Card */}
            {selectedDoc.fileDinhKem && (
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 text-lg">
                    <FilePdfOutlined />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-800">Tài liệu đính kèm</h4>
                    <p className="text-xs text-gray-500">Định dạng PDF/Văn bản chính thức</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={fileUrl(selectedDoc.fileDinhKem)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 text-xs font-semibold text-[#0143DF] hover:text-[#0136B5] bg-white border border-[#0143DF] hover:border-[#0136B5] rounded-lg transition"
                  >
                    Xem trực tiếp
                  </a>
                  <a
                    href={fileUrl(selectedDoc.fileDinhKem)}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition"
                  >
                    Tải về máy
                  </a>
                </div>
              </div>
            )}

            {/* Nội dung chi tiết */}
            {selectedDoc.content && (
              <div>
                <h3 className="text-xs font-bold text-[#0143DF] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <span className="h-3.5 w-1 bg-[#0143DF] rounded-full inline-block" />
                  Nội dung chi tiết
                </h3>
                <div
                  className="prose max-w-none text-sm text-gray-700 leading-relaxed border border-slate-100 p-5 rounded-xl bg-white shadow-sm"
                  dangerouslySetInnerHTML={{ __html: selectedDoc.content }}
                />
              </div>
            )}
          </div>
        )}
      </Modal>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            /* Bo nhẹ ngoài 4 góc bảng — đồng bộ với button */
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
            /* Ẩn measure row (hàng ẩn dùng đo cột) gây khoảng trắng dưới header */
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
            /* Pagination — kích thước to, đồng bộ */
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
