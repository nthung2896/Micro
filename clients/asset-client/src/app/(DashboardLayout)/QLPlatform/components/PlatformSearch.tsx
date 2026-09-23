"use client";
import React, { useCallback, useEffect, useState } from "react";
import { Button, Card, Col, Form, Input, Row, Select, DatePicker } from "antd";
import {
  DownOutlined,
  FileExcelOutlined,
  ReloadOutlined,
  SearchOutlined,
  UpOutlined,
} from "@ant-design/icons";
import Flex from "@/components/shared-components/Flex";
import { useForm } from "antd/es/form/Form";
import { PlatformManageSearchType } from "@/types/platformManage/request";
import PlatformStatusConstant from "@/constants/PlatformStatusConstant";

import userService from "@/services/user/user.service";
import { useSelector } from "@/store/hooks";

export interface PlatformSearchProps {
  /** Tên tab đang active (dùng để reset field loại nền tảng) */
  activeTab?: string;
  /** Key tab đang active để disable/preset trường trạng thái */
  activeTabKey?: string;
  /** true = giao diện cán bộ (đầy đủ filter), false = giao diện doanh nghiệp */
  isStaff?: boolean;
  /** Alias của isStaff: khi dùng từ NenTangTrucTuyen truyền isDoanhNghiep=true tức isStaff=false */
  isDoanhNghiep?: boolean;
  /** Callback khi submit tìm kiếm */
  onFinish: (values: PlatformManageSearchType) => void;
  /** Callback nút xuất Excel (không bắt buộc) */
  onExport?: () => void;
}

const PlatformSearch: React.FC<PlatformSearchProps> = ({
  activeTab,
  activeTabKey,
  isStaff,
  isDoanhNghiep,
  onFinish,
  onExport,
}) => {
  // Nếu isDoanhNghiep=true thì tương đương isStaff=false
  // isStaff mặc định true (cán bộ), trừ khi isDoanhNghiep=true hoặc isStaff=false tường minh
  const isStaffMode = isDoanhNghiep === true ? false : (isStaff ?? true);

  const [form] = useForm<PlatformManageSearchType>();
  const [isExpanded, setIsExpanded] = useState(false);


  const [specialistOptions, setSpecialistOptions] = useState<{ value: string; label: string }[]>([]);
  const [loadingSpecialists, setLoadingSpecialists] = useState(false);

  // Lấy vai trò hiện tại để xác định nhóm chuyên viên cần fetch
  const authState = useSelector((state: any) => state.auth);
  const currentUser = authState?.User;
  const userRoles: string[] = currentUser?.listRole || authState?.ListRole || [];


  // ── Fetch danh sách chuyên viên ───────────────────────────────────────────
  const fetchSpecialists = useCallback(async () => {
    if (!isStaffMode) return;
    setLoadingSpecialists(true);
    try {
      // Cán bộ Cục hoặc Admin thì lấy ChuyenVienCuc và ChuyenVienSo ở tất cả các Sở
      // Chuyên viên Sở thì chỉ lấy ChuyenVienSo và lọc theo donViId cùng Sở
      const hasCucRole = userRoles.some(
        (r) =>
          r.includes("Cuc") ||
          r.includes("Admin") ||
          r.toLowerCase() === "admin"
      );

      const vaiTro = hasCucRole
        ? ["ChuyenVienCuc", "ChuyenVienSo"]
        : ["ChuyenVienSo"];

      const userDonViId = currentUser?.donViId || currentUser?.donviId;
      const filterDonViId = hasCucRole ? undefined : userDonViId;

      const response = await userService.getUserByRole({
        pageIndex: 1,
        pageSize: 1000,
        vaiTro,
        donViId: filterDonViId,
      });
      const itemsList = response?.data?.items || [];
      const opts = itemsList
        .filter((u: any) => u?.id)
        .map((u: any) => ({
          value: u.id,
          label:
            u.name && u.userName
              ? `${u.name} (${u.userName})`
              : u.name || u.userName || u.id,
        }));

      setSpecialistOptions([
        { value: "00000000-0000-0000-0000-000000000000", label: "⚠️ Chưa phân công" },
        ...opts,
      ]);
    } catch (err) {
      console.error("Không tải được danh sách chuyên viên xử lý:", err);
    } finally {
      setLoadingSpecialists(false);
    }
  }, [isStaffMode, userRoles, currentUser]);

  useEffect(() => {
    fetchSpecialists();
  }, [fetchSpecialists]);

  // ── Reset field loại nền tảng khi đổi activeTab ───────────────────────────
  useEffect(() => {
    form.setFieldValue("platformManageTypeId", undefined);
  }, [activeTab, form]);

  // ── Đồng bộ trạng thái với tab đang active ────────────────────────────────
  useEffect(() => {
    if (activeTabKey && activeTabKey !== "All") {
      form.setFieldsValue({ status: parseInt(activeTabKey, 10) });
    } else {
      form.setFieldsValue({ status: undefined });
    }
  }, [activeTabKey, form]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleReset = () => {
    form.resetFields();
    if (activeTabKey && activeTabKey !== "All") {
      form.setFieldsValue({ status: parseInt(activeTabKey, 10) });
    }
    form.submit();
  };

  const handleFormFinish = (values: any) => {
    const searchParams: PlatformManageSearchType = { ...values };

    if (values.submitDateRange && values.submitDateRange.length === 2) {
      searchParams.submitDateFrom = values.submitDateRange[0].format("YYYY-MM-DD");
      searchParams.submitDateTo = values.submitDateRange[1].format("YYYY-MM-DD");
    }
    if (values.createdDateRange && values.createdDateRange.length === 2) {
      searchParams.createdDateFrom = values.createdDateRange[0].format("YYYY-MM-DD");
      searchParams.createdDateTo = values.createdDateRange[1].format("YYYY-MM-DD");
    }

    onFinish(searchParams);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Card className="customCardShadow mb-3" style={{ borderRadius: 12, border: "1px solid #e2e8f0" }}>
      <Form
        form={form}
        layout="vertical"
        name="platform-search-shared"
        labelCol={{ span: 24 }}
        wrapperCol={{ span: 24 }}
        onFinish={handleFormFinish}
        autoComplete="off"

      >
        <Row gutter={[24, 0]}>
          {/* ── LUÔN HIỂN THỊ ─────────────────────────────────────── */}

          {/* Tên nền tảng */}
          <Col xl={8} lg={8} md={12} xs={24}>
            <Form.Item<PlatformManageSearchType> label="Tên nền tảng" name="name">
              <Input
                placeholder="Nhập tên ứng dụng hoặc nền tảng..."
                allowClear
                style={{ borderRadius: 6 }}
              />
            </Form.Item>
          </Col>

          {/* Địa chỉ tên miền */}
          <Col xl={8} lg={8} md={12} xs={24}>
            <Form.Item<PlatformManageSearchType> label="Địa chỉ tên miền / Website" name="domain">
              <Input
                placeholder="Nhập tên miền (ví dụ: lazada.vn)..."
                allowClear
                style={{ borderRadius: 6 }}
              />
            </Form.Item>
          </Col>

          {/* Trạng thái hồ sơ */}
          <Col xl={8} lg={8} md={12} xs={24}>
            <Form.Item<PlatformManageSearchType> label="Trạng thái hồ sơ" name="status">
              <Select
                disabled={activeTabKey !== undefined && activeTabKey !== "All"}
                allowClear
                placeholder="-- Chọn trạng thái --"
                options={PlatformStatusConstant.getDropdownListKey()}
                style={{ borderRadius: 6 }}
              />
            </Form.Item>
          </Col>

          {/* Tên doanh nghiệp (chỉ cán bộ) */}
          {isStaffMode && (
            <Col xl={8} lg={8} md={12} xs={24}>
              <Form.Item<PlatformManageSearchType> label="Doanh nghiệp chủ quản" name="companyName">
                <Input
                  placeholder="Nhập tên doanh nghiệp chủ quản..."
                  allowClear
                  style={{ borderRadius: 6 }}
                />
              </Form.Item>
            </Col>
          )}

          {/* Mã số thuế (chỉ cán bộ) */}
          {isStaffMode && (
            <Col xl={8} lg={8} md={12} xs={24}>
              <Form.Item<PlatformManageSearchType> label="Mã số thuế" name="companyTaxCode">
                <Input
                  placeholder="Nhập mã số thuế doanh nghiệp..."
                  allowClear
                  style={{ borderRadius: 6 }}
                />
              </Form.Item>
            </Col>
          )}

          {/* Người nhận xử lý (chỉ cán bộ, luôn hiển thị) */}
          {isStaffMode && (
            <Col xl={8} lg={8} md={12} xs={24}>
              <Form.Item<PlatformManageSearchType> label="Người nhận xử lý" name="reviewId">
                <Select
                  allowClear
                  placeholder="Chọn người nhận xử lý"
                  loading={loadingSpecialists}
                  showSearch
                  optionFilterProp="label"
                  options={specialistOptions}
                  filterOption={(input, option) =>
                    ((option?.label as string) ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  style={{ borderRadius: 6 }}
                />
              </Form.Item>
            </Col>
          )}

          {/* Khoảng ngày gửi duyệt */}
          {isStaffMode && (
            <Col xl={8} lg={8} md={12} xs={24}>
              <Form.Item<PlatformManageSearchType>
                label={isStaffMode ? "Khoảng ngày gửi duyệt" : "Khoảng ngày tạo hồ sơ"}
                name={isStaffMode ? "submitDateRange" : "createdDateRange"}
              >
                <DatePicker.RangePicker
                  format="DD/MM/YYYY"
                  placeholder={["Từ ngày", "Đến ngày"]}
                  style={{ width: "100%", borderRadius: 6 }}
                />
              </Form.Item>
            </Col>
          )}

          {/* ── BỘ LỌC NÂNG CAO (ẩn/hiện) ───────────────────────── */}

          {/* Khoảng ngày gửi duyệt / ngày tạo (nâng cao, cái còn lại) */}
          {isStaffMode && (
            <Col xl={8} lg={8} md={12} xs={24} style={{ display: isExpanded ? "block" : "none" }}>
              <Form.Item<PlatformManageSearchType>
                label={isStaffMode ? "Khoảng ngày tạo hồ sơ" : "Khoảng ngày gửi duyệt"}
                name={isStaffMode ? "createdDateRange" : "submitDateRange"}
              >
                <DatePicker.RangePicker
                  format="DD/MM/YYYY"
                  placeholder={["Từ ngày", "Đến ngày"]}
                  style={{ width: "100%", borderRadius: 6 }}
                />
              </Form.Item>
            </Col>
          )}

          {/* Tên người đại diện pháp luật (nâng cao) */}
          {isStaffMode && (
            <Col xl={8} lg={8} md={12} xs={24} style={{ display: isExpanded ? "block" : "none" }}>
              <Form.Item<PlatformManageSearchType>
                label="Tên người đại diện pháp luật"
                name="representerName"
              >
                <Input
                  placeholder="Nhập tên người đại diện..."
                  allowClear
                  style={{ borderRadius: 6 }}
                />
              </Form.Item>
            </Col>
          )}

          {/* Số điện thoại đại diện (nâng cao) */}
          {isStaffMode && (
            <Col xl={8} lg={8} md={12} xs={24} style={{ display: isExpanded ? "block" : "none" }}>
              <Form.Item<PlatformManageSearchType>
                label="Số điện thoại liên hệ đại diện"
                name="representerMobile"
              >
                <Input
                  placeholder="Nhập số điện thoại..."
                  allowClear
                  style={{ borderRadius: 6 }}
                />
              </Form.Item>
            </Col>
          )}

          {/* Quy mô nền tảng (nâng cao) */}
          {isStaffMode && (
            <Col xl={8} lg={8} md={12} xs={24} style={{ display: isExpanded ? "block" : "none" }}>
              <Form.Item<PlatformManageSearchType> label="Quy mô nền tảng" name="isNenTangLon">
                <Select
                  allowClear
                  placeholder="-- Tất cả quy mô --"
                  options={[
                    { value: true, label: "Nền tảng số lớn" },
                    { value: false, label: "Nền tảng thông thường" },
                  ]}
                  style={{ borderRadius: 6 }}
                />
              </Form.Item>
            </Col>
          )}
        </Row>

        {/* ── FOOTER BUTTONS ────────────────────────────────────────────── */}
        <Flex
          alignItems="center"
          justifyContent="center"
          className="btn-group"
          style={{ gap: 12, marginTop: 12 }}
        >
          <Button
            color="cyan" variant="solid"
            htmlType="submit"
            icon={<SearchOutlined />}
            size="middle"
            style={{
              borderRadius: 8,
              fontWeight: 600,
              padding: "0 24px",
              height: 38,
              border: "none",
              boxShadow: "0 4px 12px rgba(24, 144, 255, 0.2)",
            }}
          >
            Tìm kiếm
          </Button>

          <Button
            icon={<ReloadOutlined />}
            size="middle"
            onClick={handleReset}
            style={{ borderRadius: 8, fontWeight: 600, padding: "0 24px", height: 38 }}
          >
            Làm mới
          </Button>

          {isStaffMode && (
            <Button
              type="default"
              onClick={() => setIsExpanded(!isExpanded)}
              icon={isExpanded ? <UpOutlined /> : <DownOutlined />}
              size="middle"
              style={{ borderRadius: 8, height: 38 }}
            >
              {isExpanded ? "Thu gọn bộ lọc" : "Mở rộng bộ lọc"}
            </Button>
          )}

          {onExport && isStaffMode && (
            <Button
              type="default"
              onClick={onExport}
              icon={<FileExcelOutlined />}
              size="middle"
              style={{ borderRadius: 8, height: 38, color: "#16a34a", borderColor: "#16a34a" }}
            >
              Xuất Excel
            </Button>
          )}
        </Flex>
      </Form>
    </Card>
  );
};

export default PlatformSearch;
