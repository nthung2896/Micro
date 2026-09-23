import React from "react";
import { Button, Card, Col, Form, Input, Select, DatePicker, Row, TreeSelect } from "antd";
import { DownloadOutlined, SearchOutlined } from "@ant-design/icons";
import Flex from "@/components/shared-components/Flex";
import { downloadFileFromBase64 } from "@/utils/fileDownload";
import { useForm } from "antd/es/form/Form";
import { toast } from "react-toastify";
import * as extensions from "@/utils/extensions";
import { exportExcelMultiPage } from "@/utils/exportExcelUtils";

import { KPI_LyLich2CSearchType } from "@/types/kPI_LyLich2C/kPI_LyLich2C";
import kPI_LyLich2CService from "@/services/kPI_LyLich2C/kPI_LyLich2CService";
import departmentService from "@/services/department/department.service";
import nhomDanhMucService from "@/services/nhomDanhMuc/nhomDanhMuc.service";
import duLieuDanhMucService from "@/services/duLieuDanhMuc/duLieuDanhMuc.service";
import roleService from "@/services/role/role.service";
import { useSelector } from "@/store/hooks";
import { DropdownOption } from "@/types/general";

const CHUC_VU_GROUP_CODE = "CHUCVUVNU";

interface SearchProps {
  onFinish: ((values: KPI_LyLich2CSearchType) => void) | undefined;
  pageIndex: number;
  pageSize: number;
  columns?: any[];
}
const Search: React.FC<SearchProps> = ({ onFinish, pageIndex, pageSize, columns = [] }) => {
  const [form] = useForm<KPI_LyLich2CSearchType>();

  const currentUser = useSelector((state: any) => state.auth.User);
  const userRoles: string[] = currentUser?.listRole || [];
  const isAdmin = userRoles.some((r: string) =>
    r.toLowerCase().includes("admin") ||
    r === "SuperAdmin" ||
    r === "Admin"
  );

  const [donViTree, setDonViTree] = React.useState<any[]>([]);
  const [phongBanOptions, setPhongBanOptions] = React.useState<any[]>([]);
  const [chucVuOptions, setChucVuOptions] = React.useState<DropdownOption[]>([]);
  const [vaiTroOptions, setVaiTroOptions] = React.useState<DropdownOption[]>([]);
  const donViSuDungId = Form.useWatch('donViSuDungId', form);

  React.useEffect(() => {
    let isMounted = true;

    const fetchChucVu = async () => {
      try {
        const groupResponse = await nhomDanhMucService.getData({
          groupCode: CHUC_VU_GROUP_CODE,
          pageIndex: 1,
          pageSize: 20,
        });
        const group = groupResponse?.data?.items?.find(
          (item) => item.groupCode === CHUC_VU_GROUP_CODE,
        );

        if (!group?.id) {
          if (isMounted) {
            setChucVuOptions([]);
          }
          return;
        }

        const dataResponse = await duLieuDanhMucService.getData({
          groupId: group.id,
          pageIndex: 1,
          pageSize: -1,
        });
        const danhMucData = dataResponse?.data?.items ?? [];

        if (isMounted) {
          setChucVuOptions(
            danhMucData
              .filter((item) => item.code && item.name)
              .map((item) => ({
                value: item.code,
                label: item.name,
              })),
          );
        }
      } catch (err) {
        console.error("Lỗi tải danh mục chức vụ:", err);
        if (isMounted) {
          setChucVuOptions([]);
        }
      }
    };

    fetchChucVu();

    return () => {
      isMounted = false;
    };
  }, []);

  React.useEffect(() => {
    let isMounted = true;

    const fetchVaiTro = async () => {
      try {
        const response = await roleService.getDropdownId();
        if (isMounted) {
          setVaiTroOptions(response?.data ?? []);
        }
      } catch (err) {
        console.error("Lỗi tải danh sách vai trò:", err);
        if (isMounted) {
          setVaiTroOptions([]);
        }
      }
    };

    fetchVaiTro();

    return () => {
      isMounted = false;
    };
  }, []);

  React.useEffect(() => {
    const fetchDonVi = async () => {
      try {
        const resDonVi = await departmentService.getDepartmentsWithHierarchy();
        if (resDonVi.status) {
          const buildTreeData = (nodes: any[]): any[] =>
            nodes.map((n) => ({
              title: n.title,
              value: n.id,
              key: n.id,
              children: n.children?.length ? buildTreeData(n.children) : undefined,
            }));
          setDonViTree(buildTreeData((resDonVi.data as unknown as any[]) || []));
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchDonVi();
  }, []);

  React.useEffect(() => {
    const fetchPhongBan = async () => {
      try {
        if (donViSuDungId) {
          const res = await departmentService.getDropdownLevel1(donViSuDungId);
          if (res?.status && res?.data) {
            setPhongBanOptions(res.data);
          } else {
            setPhongBanOptions([]);
          }
        } else {
          const res = await departmentService.getDropDownPhong();
          if (res?.status && res?.data) {
            setPhongBanOptions(res.data);
          } else {
            setPhongBanOptions([]);
          }
        }
      } catch (err) {
        console.error("Lỗi tải phòng ban theo đơn vị:", err);
        setPhongBanOptions([]);
      }
    };

    fetchPhongBan();
  }, [donViSuDungId]);

  React.useEffect(() => {
    if (!isAdmin && currentUser) {
      const userDonVi = currentUser.donViSuDungId || currentUser.idDonVi;
      const userPhongBan = currentUser.phongBanId || currentUser.idPhongBan;
      if (userDonVi) {
        form.setFieldValue("donViSuDungId", userDonVi);
      }
      if (userPhongBan) {
        form.setFieldValue("phongBanId", userPhongBan);
      }
    }
  }, [isAdmin, currentUser, form]);

  const Export = async () => {
    if (!columns || columns.length === 0) {
      toast.warning("Không tìm thấy cấu hình cột để xuất file!");
      return;
    }

    const formValues = form.getFieldsValue();

    await exportExcelMultiPage({
      fetchDataFn: kPI_LyLich2CService.getData,
      formValues,
      fileName: "Danh_sach_LyLich2C",
      sheetName: "Danh sách Lý lịch 2C",
      columns: columns
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
            <Col xl={6} lg={8} md={12} xs={24}>
              <Form.Item<KPI_LyLich2CSearchType> name="hoTen" label="Họ và Tên">
                <Input placeholder="Nhập họ và tên" allowClear />
              </Form.Item>
            </Col>
            <Col xl={6} lg={8} md={12} xs={24}>
              <Form.Item<KPI_LyLich2CSearchType> name="userName" label="Tài khoản">
                <Input placeholder="Nhập tên tài khoản" allowClear />
              </Form.Item>
            </Col>
            <Col xl={6} lg={8} md={12} xs={24}>
              <Form.Item<KPI_LyLich2CSearchType> name="donViSuDungId" label="Đơn vị">
                <TreeSelect
                  showSearch
                  allowClear={isAdmin}
                  disabled={!isAdmin}
                  treeNodeFilterProp="title"
                  placeholder="Chọn đơn vị"
                  treeData={donViTree}
                  treeDefaultExpandAll={false}
                  onChange={() => form.setFieldValue("phongBanId", undefined)}
                />
              </Form.Item>
            </Col>
            <Col xl={6} lg={8} md={12} xs={24}>
              <Form.Item<KPI_LyLich2CSearchType> name="phongBanId" label="Phòng ban">
                <Select
                  showSearch
                  allowClear={isAdmin}
                  disabled={!isAdmin}
                  placeholder="Chọn phòng ban"
                  options={phongBanOptions}
                  filterOption={(input, option) =>
                    (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
                  }
                />
              </Form.Item>
            </Col>
            <Col xl={6} lg={8} md={12} xs={24}>
              <Form.Item<KPI_LyLich2CSearchType> name="gioiTinh" label="Giới tính">
                <Select
                  allowClear
                  placeholder="Chọn giới tính"
                  options={[
                    { value: 1, label: 'Nam' },
                    { value: 2, label: 'Nữ' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xl={6} lg={8} md={12} xs={24}>
              <Form.Item label="Ngày sinh (Từ - Đến)">
                <Row gutter={8}>
                  <Col span={12}>
                    <Form.Item name="ngaysinhFrom" noStyle>
                      <DatePicker format="DD/MM/YYYY" placeholder="Từ ngày" style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="ngaysinhTo" noStyle>
                      <DatePicker format="DD/MM/YYYY" placeholder="Đến ngày" style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                </Row>
              </Form.Item>
            </Col>
            <Col xl={6} lg={8} md={12} xs={24}>
              <Form.Item<KPI_LyLich2CSearchType> name="chucVuHienTai" label="Chức vụ hiện tại">
                <Select
                  showSearch
                  allowClear
                  placeholder="Chọn chức vụ"
                  options={chucVuOptions}
                  filterOption={(input, option) =>
                    (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
                  }
                />
              </Form.Item>
            </Col>
            <Col xl={6} lg={8} md={12} xs={24}>
              <Form.Item<KPI_LyLich2CSearchType> name="roleId" label="Vai trò">
                <Select
                  showSearch
                  allowClear
                  placeholder="Chọn vai trò"
                  options={vaiTroOptions}
                  optionFilterProp="label"
                  filterOption={(input, option) =>
                    (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
                  }
                />
              </Form.Item>
            </Col>
            <Col xl={6} lg={8} md={12} xs={24}>
              <Form.Item<KPI_LyLich2CSearchType> name="lyLuanChinhTri" label="Lý luận chính trị">
                <Input placeholder="Nhập lý luận chính trị" />
              </Form.Item>
            </Col>
            <Col xl={6} lg={8} md={12} xs={24}>
              <Form.Item<KPI_LyLich2CSearchType> name="loaiHopDong" label="Loại hợp đồng">
                <Input placeholder="Nhập loại hợp đồng" />
              </Form.Item>
            </Col>
            <Col xl={6} lg={8} md={12} xs={24}>
              <Form.Item<KPI_LyLich2CSearchType> name="email" label="Email">
                <Input placeholder="Nhập email" />
              </Form.Item>
            </Col>
            <Col xl={6} lg={8} md={12} xs={24}>
              <Form.Item<KPI_LyLich2CSearchType> name="phone" label="Điện thoại">
                <Input placeholder="Nhập số điện thoại" />
              </Form.Item>
            </Col>
          </Row>

          <Flex
            alignItems="center"
            justifyContent="center"
            className="btn-group" style={{ gap: "10px" }}>
            <Button
              type="primary" style={{ backgroundColor: "#13c2c2", borderColor: "#13c2c2" }}
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
