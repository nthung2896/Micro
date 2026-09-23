import React, { useCallback, useEffect, useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { Form, Modal, TreeSelect, Button, Table, Space, Popconfirm, Card, Tag, Typography, Spin, Tooltip } from "antd";
import {
  DeleteOutlined,
  PlusOutlined,
  SettingOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  SaveOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import { KPI_DotTheoDoiDanhGiaType } from "@/types/kPI_DotTheoDoiDanhGia/kPI_DotTheoDoiDanhGia";
import kPI_DotDanhGia_DonViService from "@/services/kPI_DotDanhGia_DonVi/kPI_DotDanhGia_DonViService";
import departmentService from "@/services/department/department.service";
import kPI_BoTieuChiDonViService from "@/services/kPI_BoTieuChiDonVi/kPI_BoTieuChiDonViService";
import kPI_BoTieuChiChungService from "@/services/kPI_BoTieuChiChung/kPI_BoTieuChiChungService";
import { DropdownOptionTree } from "@/types/general";
import ModalXemBoTieuChi from "@/app/(DashboardLayout)/kPI_BieuChamDiem/ModalXemBoTieuChi";
import ModalXemBoTieuChiChung from "./ModalXemBoTieuChiChung";

const { Text } = Typography;

interface Props {
  item: KPI_DotTheoDoiDanhGiaType | null;
  onClose: () => void;
  onSuccess?: () => void;
}

interface PendingConfigItem {
  id: string;
  isPending: boolean;
  idDotDanhGia?: string;
  idDonVi: string;
  tenDonVi: string;
  idBoChiSoNhiemVu: string | null;
  tenBoChiSoNhiemVu: string | null;
  soQuyetDinhBoChiSoNhiemVu?: string;
  idBoTieuChiChung: string | null;
  tenBoTieuChiChung: string | null;
  soQuyetDinhBoTieuChiChung?: string;
}

const ModalCauHinhDanhGia: React.FC<Props> = ({ item, onClose, onSuccess }) => {
  const router = useRouter();
  const [form] = Form.useForm<{ idDonVi: string[] }>();
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchingBtc, setFetchingBtc] = useState<boolean>(false);
  const [listConfig, setListConfig] = useState<any[]>([]);
  const [pendingConfigs, setPendingConfigs] = useState<PendingConfigItem[]>([]);
  const [removedConfigIds, setRemovedConfigIds] = useState<string[]>([]);
  const [modifiedConfigs, setModifiedConfigs] = useState<Map<string, any>>(new Map());
  const [donViOptions, setDonViOptions] = useState<DropdownOptionTree[]>([]);
  const [reloadingId, setReloadingId] = useState<string | null>(null);
  const [reloadingAll, setReloadingAll] = useState<boolean>(false);

  const [viewBoTieuChiDonViModal, setViewBoTieuChiDonViModal] = useState<{ visible: boolean; id: string | null }>({
    visible: false,
    id: null,
  });
  const [viewBoTieuChiChungModal, setViewBoTieuChiChungModal] = useState<{ visible: boolean; id: string | null; ten: string | null }>({
    visible: false,
    id: null,
    ten: null,
  });

  // Cache kết quả bộ tiêu chí theo đơn vị để tối ưu tốc độ
  const btcCacheRef = useRef<Map<string, { donViBtc: any; chungBtc: any }>>(new Map());

  const getDonViLabel = useCallback((id: string, nodes = donViOptions): string | undefined => {
    for (const node of nodes) {
      if (node.value === id) return node.title;
      const label = getDonViLabel(id, node.children || []);
      if (label) return label;
    }
    return undefined;
  }, [donViOptions]);

  const loadDropdowns = useCallback(async () => {
    try {
      const donViRes = await departmentService.getDropdownTreeUnderMinistryRoot();
      if (donViRes?.data) {
        setDonViOptions(donViRes.data);
      }
    } catch (err) {
      console.error("Lỗi tải danh mục phòng ban đơn vị trực thuộc BTC:", err);
    }
  }, []);

  const loadConfigList = useCallback(async () => {
    if (!item?.id) return;
    setLoading(true);
    try {
      const res = await kPI_DotDanhGia_DonViService.getData({
        idDotDanhGia: item.id,
        pageSize: 1000,
        pageIndex: 1,
      });
      if (res?.data?.items) {
        setListConfig(res.data.items);
        setPendingConfigs([]);
        setRemovedConfigIds([]);
        setModifiedConfigs(new Map());
        const configuredIds = res.data.items.map((cfg: any) => cfg.idDonVi);
        form.setFieldsValue({ idDonVi: configuredIds });
      } else {
        setListConfig([]);
        setPendingConfigs([]);
        setRemovedConfigIds([]);
        setModifiedConfigs(new Map());
        form.setFieldsValue({ idDonVi: [] });
      }
    } catch (err) {
      console.error("Lỗi tải danh sách cấu hình:", err);
    } finally {
      setLoading(false);
    }
  }, [item?.id, form]);

  useEffect(() => {
    setPendingConfigs([]);
    setRemovedConfigIds([]);
    setModifiedConfigs(new Map());
    form.resetFields();
    loadDropdowns();
    loadConfigList();
  }, [item?.id, loadDropdowns, loadConfigList, form]);

  // Xử lý khi chọn đơn vị: Ngay lập tức nạp và hiển thị bộ tiêu chí tương ứng
  const handleSelectDonViChange = async (selectedIds: string[]) => {
    const selectedSet = new Set(selectedIds);

    // 1. Phát hiện các đơn vị đã lưu nhưng vừa bị người dùng bấm 'x' bỏ chọn -> Đánh dấu sẽ xóa
    const newlyRemovedDbIds = listConfig
      .filter((cfg) => !selectedSet.has(cfg.idDonVi))
      .map((cfg) => cfg.id);
    setRemovedConfigIds(newlyRemovedDbIds);

    // Xóa khỏi modifiedConfigs nếu đơn vị đã lưu vừa bị bỏ chọn
    setModifiedConfigs((prev) => {
      const next = new Map(prev);
      listConfig
        .filter((cfg) => !selectedSet.has(cfg.idDonVi))
        .forEach((cfg) => next.delete(cfg.idDonVi));
      return next;
    });

    const savedUnitIds = new Set(listConfig.map((cfg) => cfg.idDonVi));

    // 2. Tìm các đơn vị hoàn toàn mới (chưa có trong DB)
    const pendingSelectedUnitIds = selectedIds.filter((id) => !savedUnitIds.has(id));
    const remainingPending = pendingConfigs.filter((cfg) => pendingSelectedUnitIds.includes(cfg.idDonVi));
    const existingPendingUnitIds = new Set(remainingPending.map((cfg) => cfg.idDonVi));
    const brandNewIds = pendingSelectedUnitIds.filter((id) => !existingPendingUnitIds.has(id));

    // 3. Tìm các đơn vị đã lưu trong DB trước đó bị xóa và nay được chọn lại
    const readdedSavedIds = selectedIds.filter(
      (id) => savedUnitIds.has(id) && removedConfigIds.some((rmId) => listConfig.find((c) => c.id === rmId)?.idDonVi === id)
    );

    const idsToFetch = [...brandNewIds, ...readdedSavedIds];

    if (idsToFetch.length === 0) {
      setPendingConfigs(remainingPending);
      return;
    }

    setFetchingBtc(true);
    try {
      const fetchedItems = await Promise.all(
        idsToFetch.map(async (donViId) => {
          // Xóa cache của đơn vị để luôn lấy bộ tiêu chí mới nhất khi chọn
          btcCacheRef.current.delete(donViId);

          let donViBtc: any = null;
          let chungBtc: any = null;

          try {
            const [btcDonViRes, btcChungRes] = await Promise.all([
              kPI_BoTieuChiDonViService.getDropdown(donViId),
              kPI_BoTieuChiChungService.getDropdown(donViId, undefined, item?.type),
            ]);
            donViBtc = btcDonViRes?.data?.find((opt) => opt.selected) || btcDonViRes?.data?.[0];
            chungBtc = btcChungRes?.data?.find((opt) => opt.selected) || btcChungRes?.data?.[0];
            if (!chungBtc) {
              try {
                const generalChungRes = await kPI_BoTieuChiChungService.getDropdown(undefined, undefined, item?.type);
                chungBtc = generalChungRes?.data?.find((opt) => opt.selected) || generalChungRes?.data?.[0];
              } catch {}
            }
            btcCacheRef.current.set(donViId, { donViBtc, chungBtc });
          } catch (err) {
            console.error(`Lỗi tải bộ tiêu chí cho đơn vị ${donViId}:`, err);
          }

          const donViLabel = getDonViLabel(donViId) || donViId;

          return {
            donViId,
            donViLabel,
            donViBtc,
            chungBtc,
          };
        })
      );

      // Thêm các đơn vị mới hoàn toàn vào pendingConfigs
      const newPendingItems = fetchedItems
        .filter((fItem) => brandNewIds.includes(fItem.donViId))
        .map((fItem) => ({
          id: `pending_${fItem.donViId}`,
          isPending: true,
          idDotDanhGia: item?.id,
          idDonVi: fItem.donViId,
          tenDonVi: fItem.donViLabel,
          idBoChiSoNhiemVu: fItem.donViBtc?.value || null,
          tenBoChiSoNhiemVu: fItem.donViBtc?.label || null,
          soQuyetDinhBoChiSoNhiemVu: "",
          idBoTieuChiChung: fItem.chungBtc?.value || null,
          tenBoTieuChiChung: fItem.chungBtc?.label || null,
          soQuyetDinhBoTieuChiChung: "",
        }));
      setPendingConfigs([...remainingPending, ...newPendingItems]);

      // Cập nhật modifiedConfigs cho các đơn vị đã lưu vừa được chọn lại để lấy bộ tiêu chí mới nhất
      setModifiedConfigs((prev) => {
        const next = new Map(prev);
        fetchedItems
          .filter((fItem) => readdedSavedIds.includes(fItem.donViId))
          .forEach((fItem) => {
            const savedRecord = listConfig.find((c) => c.idDonVi === fItem.donViId);
            if (savedRecord) {
              next.set(fItem.donViId, {
                id: savedRecord.id,
                idDonVi: fItem.donViId,
                idBoChiSoNhiemVu: fItem.donViBtc?.value || null,
                tenBoChiSoNhiemVu: fItem.donViBtc?.label || null,
                idBoTieuChiChung: fItem.chungBtc?.value || null,
                tenBoTieuChiChung: fItem.chungBtc?.label || null,
                soQuyetDinhBoChiSoNhiemVu: "",
                soQuyetDinhBoTieuChiChung: "",
              });
            }
          });
        return next;
      });
    } catch (err) {
      console.error("Lỗi khi tải thông tin bộ tiêu chí đơn vị:", err);
    } finally {
      setFetchingBtc(false);
    }
  };

  const handleRemovePending = (donViId: string) => {
    const updated = pendingConfigs.filter((item) => item.idDonVi !== donViId);
    setPendingConfigs(updated);
    const configuredIds = listConfig
      .filter((cfg) => !removedConfigIds.includes(cfg.id))
      .map((cfg) => cfg.idDonVi);
    form.setFieldsValue({
      idDonVi: [...configuredIds, ...updated.map((item) => item.idDonVi)],
    });
  };

  const handleSave = async () => {
    if (!item?.id) return;
    const hasAdditions = pendingConfigs.length > 0;
    const hasDeletions = removedConfigIds.length > 0;
    const hasUpdates = modifiedConfigs.size > 0;

    if (!hasAdditions && !hasDeletions && !hasUpdates) {
      toast.info("Cấu hình hiện tại đã được đồng bộ với hệ thống.");
      return;
    }

    try {
      setLoading(true);
      let successCount = 0;
      let failCount = 0;

      // 1. Thực hiện xóa các cấu hình đã bỏ chọn 'x'
      if (hasDeletions) {
        await Promise.all(
          removedConfigIds.map(async (dbId) => {
            try {
              const res = await kPI_DotDanhGia_DonViService.delete(dbId);
              if (res?.status) {
                successCount++;
              } else {
                failCount++;
              }
            } catch (err) {
              console.error(`Lỗi xóa cấu hình ${dbId}:`, err);
              failCount++;
            }
          })
        );
      }

      // 2. Thực hiện tạo mới các cấu hình vừa chọn thêm
      if (hasAdditions) {
        await Promise.all(
          pendingConfigs.map(async (cfg) => {
            try {
              const payload = {
                idDotDanhGia: item.id,
                idDonVi: cfg.idDonVi,
                idBoChiSoNhiemVu: cfg.idBoChiSoNhiemVu || null,
                idBoTieuChiChung: cfg.idBoTieuChiChung || null,
              };

              const res = await kPI_DotDanhGia_DonViService.create(payload as any);
              if (res?.status) {
                successCount++;
              } else {
                failCount++;
              }
            } catch (err) {
              console.error(`Lỗi lưu cấu hình cho đơn vị ${cfg.idDonVi}:`, err);
              failCount++;
            }
          })
        );
      }

      // 3. Thực hiện cập nhật các cấu hình đã lưu được chọn lại / làm mới bộ tiêu chí
      if (hasUpdates) {
        const modifiedList = Array.from(modifiedConfigs.values()).filter(
          (m) => !removedConfigIds.includes(m.id)
        );
        await Promise.all(
          modifiedList.map(async (cfg) => {
            try {
              const payload = {
                id: cfg.id,
                idDotDanhGia: item.id,
                idDonVi: cfg.idDonVi,
                idBoChiSoNhiemVu: cfg.idBoChiSoNhiemVu || null,
                idBoTieuChiChung: cfg.idBoTieuChiChung || null,
              };

              const res = await kPI_DotDanhGia_DonViService.update(payload as any);
              if (res?.status) {
                successCount++;
              } else {
                failCount++;
              }
            } catch (err) {
              console.error(`Lỗi cập nhật cấu hình cho đơn vị ${cfg.idDonVi}:`, err);
              failCount++;
            }
          })
        );
      }

      if (successCount > 0 || (!failCount && (hasAdditions || hasDeletions || hasUpdates))) {
        toast.success("Cập nhật cấu hình thành công!");
        setPendingConfigs([]);
        setRemovedConfigIds([]);
        setModifiedConfigs(new Map());
        await loadConfigList();
        onSuccess?.();
      } else if (failCount > 0) {
        toast.error("Cập nhật cấu hình thất bại");
      }
    } catch (err) {
      console.error("Lỗi lưu cấu hình:", err);
      toast.error("Đã xảy ra lỗi khi lưu cấu hình");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfig = async (id: string) => {
    try {
      setLoading(true);
      const res = await kPI_DotDanhGia_DonViService.delete(id);
      if (res?.status) {
        toast.success("Xóa cấu hình thành công");
        loadConfigList();
        onSuccess?.();
      } else {
        toast.error(res?.message || "Xóa thất bại");
      }
    } catch (err) {
      console.error("Lỗi xóa cấu hình:", err);
      toast.error("Đã xảy ra lỗi khi xóa cấu hình");
    } finally {
      setLoading(false);
    }
  };

  const handleReloadBtc = async (record: any) => {
    if (!record?.idDonVi) return;
    setReloadingId(record.id);
    try {
      // Xóa cache của đơn vị để lấy dữ liệu mới nhất
      btcCacheRef.current.delete(record.idDonVi);

      const [btcDonViRes, btcChungRes] = await Promise.all([
        kPI_BoTieuChiDonViService.getDropdown(record.idDonVi),
        kPI_BoTieuChiChungService.getDropdown(record.idDonVi, undefined, item?.type),
      ]);
      const donViBtc = btcDonViRes?.data?.find((opt) => opt.selected) || btcDonViRes?.data?.[0];
      let chungBtc = btcChungRes?.data?.find((opt) => opt.selected) || btcChungRes?.data?.[0];
      if (!chungBtc) {
        try {
          const generalChungRes = await kPI_BoTieuChiChungService.getDropdown(undefined, undefined, item?.type);
          chungBtc = generalChungRes?.data?.find((opt) => opt.selected) || generalChungRes?.data?.[0];
        } catch (err) {
          console.error("Lỗi tải bộ tiêu chí chung mặc định:", err);
        }
      }

      btcCacheRef.current.set(record.idDonVi, { donViBtc, chungBtc });

      if (record.isPending) {
        // Đơn vị chưa lưu: Cập nhật trong state pendingConfigs
        setPendingConfigs((prev) =>
          prev.map((item) =>
            item.idDonVi === record.idDonVi
              ? {
                  ...item,
                  idBoChiSoNhiemVu: donViBtc?.value || null,
                  tenBoChiSoNhiemVu: donViBtc?.label || null,
                  idBoTieuChiChung: chungBtc?.value || null,
                  tenBoTieuChiChung: chungBtc?.label || null,
                }
              : item
          )
        );
        toast.success(`Đã lấy bộ tiêu chí mới nhất cho đơn vị ${record.tenDonVi || ""}`);
      } else {
        // Đơn vị đã lưu trong CSDL: Cập nhật trực tiếp qua API
        const payload = {
          id: record.id,
          idDotDanhGia: record.idDotDanhGia || item?.id,
          idDonVi: record.idDonVi,
          idBoChiSoNhiemVu: donViBtc?.value || null,
          idBoTieuChiChung: chungBtc?.value || null,
        };

        const res = await kPI_DotDanhGia_DonViService.update(payload as any);
        if (res?.status) {
          toast.success(`Đã cập nhật bộ tiêu chí mới nhất cho đơn vị ${record.tenDonVi || ""}`);
          await loadConfigList();
          onSuccess?.();
        } else {
          toast.error(res?.message || "Cập nhật bộ tiêu chí thất bại");
        }
      }
    } catch (err) {
      console.error("Lỗi làm mới bộ tiêu chí:", err);
      toast.error("Đã xảy ra lỗi khi lấy bộ tiêu chí mới nhất");
    } finally {
      setReloadingId(null);
    }
  };

  const handleReloadAll = async () => {
    if (combinedDataSource.length === 0) return;
    setReloadingAll(true);
    btcCacheRef.current.clear();
    try {
      // 1. Cập nhật các đơn vị pending
      if (pendingConfigs.length > 0) {
        const updatedPending = await Promise.all(
          pendingConfigs.map(async (pItem) => {
            const [btcDonViRes, btcChungRes] = await Promise.all([
              kPI_BoTieuChiDonViService.getDropdown(pItem.idDonVi),
              kPI_BoTieuChiChungService.getDropdown(pItem.idDonVi, undefined, item?.type),
            ]);
            const donViBtc = btcDonViRes?.data?.find((opt) => opt.selected) || btcDonViRes?.data?.[0];
            let chungBtc = btcChungRes?.data?.find((opt) => opt.selected) || btcChungRes?.data?.[0];
            if (!chungBtc) {
              try {
                const generalChungRes = await kPI_BoTieuChiChungService.getDropdown(undefined, undefined, item?.type);
                chungBtc = generalChungRes?.data?.find((opt) => opt.selected) || generalChungRes?.data?.[0];
              } catch {}
            }
            btcCacheRef.current.set(pItem.idDonVi, { donViBtc, chungBtc });
            return {
              ...pItem,
              idBoChiSoNhiemVu: donViBtc?.value || null,
              tenBoChiSoNhiemVu: donViBtc?.label || null,
              idBoTieuChiChung: chungBtc?.value || null,
              tenBoTieuChiChung: chungBtc?.label || null,
            };
          })
        );
        setPendingConfigs(updatedPending);
      }

      // 2. Cập nhật các đơn vị đã lưu
      const activeSavedConfigs = listConfig.filter((cfg) => !removedConfigIds.includes(cfg.id));
      if (activeSavedConfigs.length > 0) {
        await Promise.all(
          activeSavedConfigs.map(async (cfg) => {
            try {
              let donViBtc: any = null;
              let chungBtc: any = null;
              if (btcCacheRef.current.has(cfg.idDonVi)) {
                const cached = btcCacheRef.current.get(cfg.idDonVi)!;
                donViBtc = cached.donViBtc;
                chungBtc = cached.chungBtc;
              } else {
                const [btcDonViRes, btcChungRes] = await Promise.all([
                  kPI_BoTieuChiDonViService.getDropdown(cfg.idDonVi),
                  kPI_BoTieuChiChungService.getDropdown(cfg.idDonVi, undefined, item?.type),
                ]);
                donViBtc = btcDonViRes?.data?.find((opt) => opt.selected) || btcDonViRes?.data?.[0];
                chungBtc = btcChungRes?.data?.find((opt) => opt.selected) || btcChungRes?.data?.[0];
                if (!chungBtc) {
                  try {
                    const generalChungRes = await kPI_BoTieuChiChungService.getDropdown(undefined, undefined, item?.type);
                    chungBtc = generalChungRes?.data?.find((opt) => opt.selected) || generalChungRes?.data?.[0];
                  } catch {}
                }
                btcCacheRef.current.set(cfg.idDonVi, { donViBtc, chungBtc });
              }

              const payload = {
                id: cfg.id,
                idDotDanhGia: cfg.idDotDanhGia || item?.id,
                idDonVi: cfg.idDonVi,
                idBoChiSoNhiemVu: donViBtc?.value || null,
                idBoTieuChiChung: chungBtc?.value || null,
              };
              await kPI_DotDanhGia_DonViService.update(payload as any);
            } catch (err) {
              console.error(`Lỗi cập nhật cấu hình cho đơn vị ${cfg.idDonVi}:`, err);
            }
          })
        );
        await loadConfigList();
        onSuccess?.();
      }

      toast.success("Đã làm mới bộ tiêu chí cho tất cả các đơn vị!");
    } catch (err) {
      console.error("Lỗi làm mới tất cả bộ tiêu chí:", err);
      toast.error("Đã xảy ra lỗi khi làm mới bộ tiêu chí");
    } finally {
      setReloadingAll(false);
    }
  };

  // Ghép danh sách đơn vị mới chọn (pending) và danh sách đã lưu
  const combinedDataSource = useMemo(() => {
    const formattedSaved = listConfig.map((cfg) => {
      const isRemoved = removedConfigIds.includes(cfg.id);
      const modified = modifiedConfigs.get(cfg.idDonVi);
      if (modified && !isRemoved) {
        return {
          ...cfg,
          ...modified,
          isModified: true,
          isRemoved: false,
        };
      }
      return {
        ...cfg,
        isRemoved,
        isModified: false,
      };
    });
    return [...pendingConfigs, ...formattedSaved];
  }, [pendingConfigs, listConfig, removedConfigIds, modifiedConfigs]);

  const totalChanges = pendingConfigs.length + removedConfigIds.length + modifiedConfigs.size;

  const columns = [
    {
      title: "STT",
      dataIndex: "index",
      key: "index",
      width: 50,
      align: "center" as const,
      render: (_: any, __: any, idx: number) => idx + 1,
    },
    {
      title: "Trạng thái",
      key: "isPending",
      width: 105,
      align: "center" as const,
      render: (_: any, record: any) =>
        record.isPending ? (
          <Tag color="warning" icon={<ClockCircleOutlined />} style={{ margin: 0 }}>
            Chưa lưu
          </Tag>
        ) : record.isRemoved ? (
          <Tag color="error" icon={<DeleteOutlined />} style={{ margin: 0 }}>
            Sẽ xóa
          </Tag>
        ) : record.isModified ? (
          <Tag color="processing" icon={<ClockCircleOutlined />} style={{ margin: 0 }}>
            Chưa lưu
          </Tag>
        ) : (
          <Tag color="success" icon={<CheckCircleOutlined />} style={{ margin: 0 }}>
            Đã lưu
          </Tag>
        ),
    },
    {
      title: "Đơn vị",
      dataIndex: "tenDonVi",
      key: "tenDonVi",
      width: 250,
      render: (val: string, record: any) => (
        <span
          style={{
            fontWeight: 600,
            color: record.isPending || record.isModified ? "#d97706" : "#1f2937",
          }}
        >
          {val || "—"}
        </span>
      ),
    },
    {
      title: "Bộ tiêu chí đơn vị",
      dataIndex: "tenBoChiSoNhiemVu",
      key: "tenBoChiSoNhiemVu",
      width: 240,
      render: (val: string, record: any) =>
        val ? (
          <Tag
            color="blue"
            style={{
              whiteSpace: "normal",
              height: "auto",
              wordBreak: "break-word",
              padding: "2px 6px",
              lineHeight: "1.3",
              display: "inline-block",
              cursor: record.idBoChiSoNhiemVu ? "pointer" : "default",
            }}
            title={record.idBoChiSoNhiemVu ? "Nhấn để xem danh sách tiêu chí đơn vị" : undefined}
            onClick={() => {
              if (record.idBoChiSoNhiemVu) {
                setViewBoTieuChiDonViModal({ visible: true, id: record.idBoChiSoNhiemVu });
              }
            }}
          >
            {val} {record.soQuyetDinhBoChiSoNhiemVu ? `(Số QĐ: ${record.soQuyetDinhBoChiSoNhiemVu})` : ""}
          </Tag>
        ) : (
          <Text type="secondary" style={{ fontStyle: "italic", fontSize: "12px" }}>
            Chưa có bộ tiêu chí
          </Text>
        ),
    },
    {
      title: "Bộ tiêu chí chung",
      dataIndex: "tenBoTieuChiChung",
      key: "tenBoTieuChiChung",
      width: 240,
      render: (val: string, record: any) =>
        val ? (
          <Tag
            color="green"
            style={{
              whiteSpace: "normal",
              height: "auto",
              wordBreak: "break-word",
              padding: "2px 6px",
              lineHeight: "1.3",
              display: "inline-block",
              cursor: record.idBoTieuChiChung ? "pointer" : "default",
            }}
            title={record.idBoTieuChiChung ? "Nhấn để xem danh sách tiêu chí chung" : undefined}
            onClick={() => {
              if (record.idBoTieuChiChung) {
                setViewBoTieuChiChungModal({ visible: true, id: record.idBoTieuChiChung, ten: record.tenBoTieuChiChung });
              }
            }}
          >
            {val} {record.soQuyetDinhBoTieuChiChung ? `(Số QĐ: ${record.soQuyetDinhBoTieuChiChung})` : ""}
          </Tag>
        ) : (
          <Text type="secondary" style={{ fontStyle: "italic", fontSize: "12px" }}>
            Chưa có bộ tiêu chí
          </Text>
        ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 100,
      align: "center" as const,
      render: (_: any, record: any) => {
        const isReloading = reloadingId === record.id;
        return (
          <Space size={4}>
            {!record.isRemoved && (
              <Tooltip title="Lấy bộ tiêu chí chung và đơn vị mới nhất">
                <Button
                  type="text"
                  size="small"
                  icon={<ReloadOutlined spin={isReloading} style={{ color: "#1890ff" }} />}
                  loading={isReloading}
                  disabled={loading || reloadingAll}
                  onClick={() => handleReloadBtc(record)}
                />
              </Tooltip>
            )}
            {record.isPending ? (
              <Tooltip title="Bỏ chọn (chưa lưu)">
                <Button
                  type="text"
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={() => handleRemovePending(record.idDonVi)}
                />
              </Tooltip>
            ) : (
              <Popconfirm
                title="Xóa cấu hình"
                description="Bạn có chắc chắn muốn xóa cấu hình đánh giá này?"
                onConfirm={() => handleDeleteConfig(record.id)}
                okText="Xóa"
                cancelText="Hủy"
              >
                <Tooltip title="Xóa cấu hình">
                  <Button type="text" danger size="small" icon={<DeleteOutlined />} />
                </Tooltip>
              </Popconfirm>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <Modal
      title={
        <div
          style={{
            backgroundColor: "transparent",
            color: "#ffffff",
            padding: "5px 16px",
            fontSize: "15px",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            textAlign: "center",
            width: "100%",
          }}
        >
          <SettingOutlined style={{ color: "#ffffff", fontSize: "16px" }} />
          <span>Cấu hình đánh giá - {item?.tenDotTheoDoiDanhGia}</span>
        </div>
      }
      closeIcon={<span style={{ color: "#ffffff", fontSize: "15px", fontWeight: "bold" }}>✕</span>}
      styles={{
        header: {
          padding: 0,
          margin: 0,
          backgroundColor: "transparent",
          borderRadius: "8px 8px 0 0",
          overflow: "hidden",
        },
        // content: {
        //   padding: 0,
        //   borderRadius: "8px",
        //   overflow: "hidden",
        // },
        body: {
          padding: 0,
          maxHeight: "calc(100vh - 150px)",
          overflowY: "auto",
        },
      }}
      open={true}
      onCancel={onClose}
      footer={[
        fetchingBtc && (
          <Space key="loading" size={4} style={{ color: "#64748b", fontSize: "12px", marginRight: 8 }}>
            <Spin size="small" />
            <span>Đang tải bộ tiêu chí...</span>
          </Space>
        ),
        <Button
          key="save"
          type="primary"
          onClick={() => form.submit()}
          icon={<SaveOutlined />}
          loading={loading}
          disabled={totalChanges === 0}
          style={{ color: "white" }}
          size="middle"
        >
          Lưu cấu hình {totalChanges > 0 ? `(${totalChanges})` : ""}
        </Button>,
        <Button key="close" onClick={onClose} size="middle">
          Đóng
        </Button>,
      ]}
      width="90vw"
      centered
      style={{ top: 20 }}
    >
      <Card
        title={<span style={{ fontSize: "13px", fontWeight: 600 }}>Thêm cấu hình đơn vị đánh giá</span>}
        size="small"
        styles={{ body: { padding: "8px 12px" }, header: { minHeight: "36px", padding: "0 12px" } }}
        style={{ marginBottom: 10 }}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item
            name="idDonVi"
            label={<span style={{ fontWeight: 500, fontSize: "13px" }}>Chọn Đơn vị</span>}
            style={{ marginBottom: 8 }}
          >
            <TreeSelect
              multiple
              allowClear
              placeholder="-- Chọn các đơn vị --"
              treeData={donViOptions}
              onChange={handleSelectDonViChange}
              showSearch
              style={{ width: "100%" }}
              treeNodeFilterProp="title"
            />
          </Form.Item>

        </Form>
      </Card>

      <Card
        title={
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "13px", fontWeight: 600 }}>
              Danh sách đơn vị cấu hình ({combinedDataSource.length})
            </span>
            <Space size={8}>
              {combinedDataSource.length > 0 && (
                <Button
                  size="small"
                  icon={<ReloadOutlined spin={reloadingAll} style={{ color: "#1890ff" }} />}
                  loading={reloadingAll}
                  disabled={loading}
                  onClick={handleReloadAll}
                  title="Lấy bộ tiêu chí chung và đơn vị mới nhất cho tất cả các đơn vị trong danh sách"
                >
                  Làm mới tất cả bộ tiêu chí
                </Button>
              )}
              {pendingConfigs.length > 0 && (
                <Tag color="warning" style={{ fontWeight: "normal", fontSize: "11px", margin: 0 }}>
                  {pendingConfigs.length} đơn vị chưa lưu
                </Tag>
              )}
            </Space>
          </div>
        }
        size="small"
        styles={{ body: { padding: "8px 12px" }, header: { minHeight: "36px", padding: "0 12px" } }}
      >
        <Table
          columns={columns}
          dataSource={combinedDataSource}
          rowKey="id"
          loading={loading}
          pagination={false}
          size="small"
          bordered
          scroll={{ x: "max-content" }}
        />
      </Card>

      {viewBoTieuChiDonViModal.visible && (
        <ModalXemBoTieuChi
          visible={viewBoTieuChiDonViModal.visible}
          onClose={() => setViewBoTieuChiDonViModal({ visible: false, id: null })}
          idBoTieuChiDonVi={viewBoTieuChiDonViModal.id}
        />
      )}

      {viewBoTieuChiChungModal.visible && (
        <ModalXemBoTieuChiChung
          visible={viewBoTieuChiChungModal.visible}
          onClose={() => setViewBoTieuChiChungModal({ visible: false, id: null, ten: null })}
          idBoTieuChiChung={viewBoTieuChiChungModal.id}
          tenBoTieuChiChung={viewBoTieuChiChungModal.ten}
        />
      )}
    </Modal>
  );
};

export default ModalCauHinhDanhGia;
