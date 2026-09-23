import Flex from "@/components/shared-components/Flex";
import { DownloadOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Card, Col, Form, Input, Row, Select } from "antd";
import { useEffect, useState } from "react";
import classes from "./page.module.css";

import roleService from "@/services/role/role.service";
import departmentService from "@/services/department/department.service";
import { AspNetUsersSearchType } from "@/types/aspNetUsers/request";
import { DropdownOption } from "@/types/general";
import { fetchDropdown } from "@/utils/fetchDropdown";

interface SearchProps {
  onFinish: ((values: AspNetUsersSearchType) => void) | undefined;
  dropVaiTros: DropdownOption[];
  setDropVaiTros: React.Dispatch<React.SetStateAction<DropdownOption[]>>;
  type?: string;
  handleExport: () => void;
}
const Search: React.FC<SearchProps> = ({
  onFinish,
  dropVaiTros,
  setDropVaiTros,
  type = "",
  handleExport,
}) => {
  const [donViOptions, setDonViOptions] = useState<any[]>([]);

  useEffect(() => {
    const fetchAllDropdowns = async () => {
      await Promise.all([
        fetchDropdown(
          dropVaiTros,
          () => roleService.getDropVaiTro(),
          setDropVaiTros,
        ),
      ]);
    };
    fetchAllDropdowns();
  }, [dropVaiTros, setDropVaiTros]);

  useEffect(() => {
    const fetchDropDown = async () => {
      try {
        const depRes = await departmentService.getDropdownTrucThuocBTC();
        if (depRes.status && depRes.data) {
          setDonViOptions(depRes.data);
        }
      } catch (error) {
        console.error("Lỗi khi lấy dropdown đơn vị trong tìm kiếm", error);
      }
    };
    fetchDropDown();
  }, []);

  return (
    <>
      <Card className={classes.customCardShadow + classes.mgButton10}>
        <Form
          layout="vertical"
          name="basic"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 24 }}
          initialValues={{ remember: true }}
          onFinish={onFinish}
          autoComplete="off"
        >
          <Row gutter={24}>
            <Col span={6}>
              <Form.Item<AspNetUsersSearchType> label="Họ tên" name="name">
                <Input placeholder="Họ tên" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item<AspNetUsersSearchType>
                label="Tài khoản"
                name="userName"
              >
                <Input placeholder="Tài khoản" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item<AspNetUsersSearchType> label="Email" name="email">
                <Input placeholder="Email" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item<AspNetUsersSearchType> label="Địa chỉ" name="diaChi">
                <Input placeholder="Địa chỉ" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            {type == "" && (
              <Col span={6}>
                <Form.Item<AspNetUsersSearchType> label="Vai trò" name="vaiTro">
                  <Select
                    mode="multiple"
                    allowClear
                    placeholder="Vai trò"
                    fieldNames={{ label: "label", value: "value" }}
                    options={dropVaiTros}
                  >
                    <Select.Option value="All">All</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            )}
            <Col span={6}>
              <Form.Item<AspNetUsersSearchType> label="Đơn vị" name="donViId">
                <Select
                  allowClear
                  showSearch
                  placeholder="Chọn đơn vị"
                  options={donViOptions}
                  fieldNames={{ label: "label", value: "value" }}
                  optionFilterProp="label"
                  filterOption={(input, option) =>
                    ((option?.label as string) ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                />
              </Form.Item>
            </Col>
          </Row>

          <Flex alignItems="center" justifyContent="center">
            <Button
              color="cyan" variant="solid"
              htmlType="submit"
              icon={<SearchOutlined />}
              className={classes.mgright5}
            >
              Tìm kiếm
            </Button>
            <Button
              onClick={handleExport}
              color="pink"
              variant="solid"
              icon={<DownloadOutlined />}
              className={`${classes.mgright5} ${classes.colorKetXuat}`}
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
