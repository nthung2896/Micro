import React, { useEffect, useState } from "react";
import { Button, Card, Col, Form, Select, Row } from "antd";
import { DownloadOutlined, SearchOutlined } from "@ant-design/icons";
import Flex from "@/components/shared-components/Flex";
import { useForm } from "antd/es/form/Form";
import { useSelector } from "react-redux";

import { KPI_PhieuDanhGiaSearchType } from "@/types/kPI_PhieuDanhGia/kPI_PhieuDanhGia";
import kPI_PhieuDanhGiaService from "@/services/kPI_PhieuDanhGia/kPI_PhieuDanhGiaService";
import kPI_DotTheoDoiDanhGiaService from "@/services/kPI_DotTheoDoiDanhGia/kPI_DotTheoDoiDanhGiaService";
import departmentService from "@/services/department/department.service";
import kPI_LyLich2CService from "@/services/kPI_LyLich2C/kPI_LyLich2CService";
import { DropdownOption } from "@/types/general";
import { exportExcelMultiPage } from "@/utils/exportExcelUtils";

interface SearchProps {
  onFinish: ((values: KPI_PhieuDanhGiaSearchType) => void) | undefined;
  pageIndex: number;
  pageSize: number;
  columns?: any[];
  extraFilter?: any;
  fetchDataFn?: (params: any) => Promise<any>;
  onlyDotFilter?: boolean;
  showLyLichFilter?: boolean;
  colorExcelHeader?: boolean;
  dotType?: string;
}
const Search: React.FC<SearchProps> = ({
  onFinish,
  pageIndex,
  pageSize,
  columns = [],
  extraFilter = {},
  fetchDataFn,
  onlyDotFilter = false,
  showLyLichFilter = true,
  colorExcelHeader = false,
  dotType,
}) => {
  const [form] = useForm<KPI_PhieuDanhGiaSearchType>();
  const [dotOptions, setDotOptions] = useState<DropdownOption[]>([]);
  const [donViOptions, setDonViOptions] = useState<DropdownOption[]>([]);
  const [phongBanOptions, setPhongBanOptions] = useState<DropdownOption[]>([]);
  const [lyLichOptions, setLyLichOptions] = useState<DropdownOption[]>([]);

  const selectedDonVi = Form.useWatch("donVi", form);
  const filterColSpan = showLyLichFilter ? 6 : 8;
  const filterColLgSpan = showLyLichFilter ? 8 : 12;

  const user = useSelector((state: any) => state.auth.User);
  const userRoles: string[] = user?.listRole || [];
  const isDisableDonVi = userRoles.some((r: string) =>
    r.toLowerCase().includes("truongphong") ||
    r.toLowerCase().includes("photruongphong") ||
    r.includes("TruongPhong") ||
    r.includes("PhoTruongPhong")
  );

  useEffect(() => {
    if (!onlyDotFilter && isDisableDonVi && user) {
      const userDonVi = user.donViId || user.donViSuDungId || user.idDonVi;
      if (userDonVi) {
        form.setFieldValue("donVi", userDonVi);
      }
    }
  }, [isDisableDonVi, onlyDotFilter, user, form]);

  useEffect(() => {
    const fetchDots = async () => {
      try {
        const dots = await kPI_DotTheoDoiDanhGiaService.getListDotDanhGiaDropdown(false, dotType);
        setDotOptions(dots || []);
      } catch (err) {
        console.error(err);
      }
    };

    const fetchDonVi = async () => {
      try {
        const res = await departmentService.getDropdownTrucThuocBTC();
        if (res && res.data) {
          setDonViOptions(res.data);
        }
      } catch (err) {
        console.error(err);
      }
    };

    const fetchLyLich = async () => {
      try {
        const res = await kPI_LyLich2CService.getDropdown();
        if (res) {
          const options = Array.isArray(res) ? res : (res as any).data || [];
          setLyLichOptions(options);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchDots();
    if (onlyDotFilter) return;
    fetchDonVi();
    if (showLyLichFilter) fetchLyLich();
  }, [onlyDotFilter, showLyLichFilter, user?.donViId]);

  useEffect(() => {
    if (onlyDotFilter) return;

    const fetchPhongBan = async () => {
      try {
        let pbs;
        if (selectedDonVi && selectedDonVi !== "" && selectedDonVi !== "undefined") {
          pbs = await departmentService.getDropdownLevel1(selectedDonVi);
        } else {
          pbs = await departmentService.getDropDownPhong();
        }
        if (pbs) {
          const list = Array.isArray(pbs) ? pbs : (pbs.data || []);
          const normalized = list.map((item: any) => ({
            value: (item.value || item.id || item.key || "").toString(),
            label: (item.label || item.text || item.name || item.title || "").toString()
          })).filter((item: any) => item.value && item.label);
          setPhongBanOptions(normalized);
        } else {
          setPhongBanOptions([]);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchPhongBan();
  }, [onlyDotFilter, selectedDonVi]);

  const Export = async () => {
    const formValues = form.getFieldsValue();
    const combinedSearch = {
      ...(formValues || {}),
      ...(extraFilter || {}),
    };

    const fnToCall =
      fetchDataFn ||
      (async (params: any) => {
        if (user?.id) {
          return kPI_PhieuDanhGiaService.getDotDanhGiaWithPhieu(user.id, params);
        }
        return kPI_PhieuDanhGiaService.getData(params);
      });

    await exportExcelMultiPage({
      fetchDataFn: fnToCall,
      formValues: combinedSearch,
      fileName: "DanhSachPhieuDanhGia",
      sheetName: "Phiếu đánh giá",
      columns: columns && columns.length > 0 ? columns : [],
      excludeKeys: ["actions", "index"],
      batchSize: 100,
      colorHeader: colorExcelHeader,
    });
  };

  return (
    <>
      <Card className="customCardShadow mb-3">
        <Form
          form={form}
          layout="vertical"
          name="basic"
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
          initialValues={{ remember: true }}
          onFinish={onFinish}
          autoComplete="off"
        >
          <Row gutter={24}>
            {!onlyDotFilter && showLyLichFilter && (
              <Col xl={filterColSpan} lg={filterColLgSpan} md={12} xs={24}>
              <Form.Item<KPI_PhieuDanhGiaSearchType>
                key="idLyLich"
                label="Cán bộ đánh giá"
                name="idLyLich"
              >
                <Select
                  placeholder="Chọn cán bộ đánh giá"
                  allowClear
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? "").toString().toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {lyLichOptions.map((opt) => (
                    <Select.Option key={opt.value} value={opt.value}>
                      {opt.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              </Col>
            )}
            <Col xl={filterColSpan} lg={filterColLgSpan} md={12} xs={24}>
              <Form.Item<KPI_PhieuDanhGiaSearchType>
                key="idDotDanhGia"
                label="Đợt đánh giá"
                name="idDotDanhGia"
              >
                <Select placeholder="Chọn đợt đánh giá" allowClear showSearch filterOption={(input, option) => (option?.label ?? "").toString().toLowerCase().includes(input.toLowerCase())}>
                  {dotOptions.map((opt) => (
                    <Select.Option key={opt.value} value={opt.value}>
                      {opt.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            {!onlyDotFilter && (
              <>
                <Col xl={filterColSpan} lg={filterColLgSpan} md={12} xs={24}>
                  <Form.Item<KPI_PhieuDanhGiaSearchType>
                    key="donVi"
                label="Đơn vị"
                name="donVi"
              >
                <Select
                  placeholder="Chọn đơn vị"
                  allowClear={!isDisableDonVi}
                  disabled={isDisableDonVi}
                  showSearch
                  onChange={() => form.setFieldValue("phongBan", undefined)}
                  filterOption={(input, option) =>
                    (option?.label ?? "").toString().toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {donViOptions.map((opt) => (
                    <Select.Option key={opt.value} value={opt.value}>
                      {opt.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xl={filterColSpan} lg={filterColLgSpan} md={12} xs={24}>
              <Form.Item<KPI_PhieuDanhGiaSearchType>
                key="phongBan"
                label="Phòng ban"
                name="phongBan"
              >
                <Select
                  placeholder="Chọn phòng ban"
                  allowClear
                  showSearch
                  options={phongBanOptions}
                  filterOption={(input, option) =>
                    (option?.label ?? "").toString().toLowerCase().includes(input.toLowerCase())
                  }
                />
              </Form.Item>
            </Col>
                </>
              )}
          </Row>

          <Flex
            alignItems="center"
            justifyContent="center"
            className="btn-group"
          >
            <Button
              type="primary"
              htmlType="submit"
              icon={<SearchOutlined />}

            >
              Tìm kiếm
            </Button>
            <Button
              onClick={Export}
              type="primary"
              icon={<DownloadOutlined />}
              className="colorKetXuat"

            >
              Kết xuất
            </Button>
          </Flex>
        </Form>
      </Card>
    </>
  );
};

export default Search;
