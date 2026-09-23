import React from "react";
import { Button, Card, Col, Form, Input, Select, DatePicker, Row } from "antd";
import { DownloadOutlined, SearchOutlined } from "@ant-design/icons";
import Flex from "@/components/shared-components/Flex";
import { downloadFileFromBase64 } from "@/utils/fileDownload";
import { useForm } from "antd/es/form/Form";
import { toast } from "react-toastify";
import * as extensions from "@/utils/extensions";

import { KPI_BoTieuChiDonViSearchType } from "@/types/kPI_BoTieuChiDonVi/kPI_BoTieuChiDonVi";
import kPI_BoTieuChiDonViService from "@/services/kPI_BoTieuChiDonVi/kPI_BoTieuChiDonViService";
import departmentService from "@/services/department/department.service";
import kPI_DotTheoDoiDanhGiaService from "@/services/kPI_DotTheoDoiDanhGia/kPI_DotTheoDoiDanhGiaService";

interface SearchProps {
	onFinish: ((values: KPI_BoTieuChiDonViSearchType) => void) | undefined;
	pageIndex: number;
	pageSize: number;
}
const Search: React.FC<SearchProps> = ({ onFinish, pageIndex, pageSize }) => {
	const [form] = useForm<KPI_BoTieuChiDonViSearchType>();
	const [donViList, setDonViList] = React.useState<any[]>([]);
	const [dotDanhGiaList, setDotDanhGiaList] = React.useState<any[]>([]);

	React.useEffect(() => {
		const fetchDropdowns = async () => {
			try {
				const donViRes = await departmentService.getDropdownTrucThuocBTC();
				if (donViRes.status) setDonViList(donViRes.data || []);

				const dotRes = await kPI_DotTheoDoiDanhGiaService.getListDotDanhGiaDropdown();
				setDotDanhGiaList(dotRes || []);
			} catch (err) {
				console.error(err);
			}
		};
		fetchDropdowns();
	}, []);

	const Export = async () => {
		const formValues = form.getFieldsValue();

		const exportData = {
			...formValues,
			pageIndex,
			pageSize,
		};

		const response = await kPI_BoTieuChiDonViService.exportExcel(exportData);
		if (response.status) {
			downloadFileFromBase64(response.data, "Danh sách .xlsx");
		} else {
			toast.error(response.message);
		}
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
					size="middle"
				>
					<Row gutter={24}>
						<Col xl={6} lg={8} md={12} xs={24}>
							<Form.Item<KPI_BoTieuChiDonViSearchType>
								key="soQuyetDinh"
								label="Số quyết định"
								name="soQuyetDinh">
								<Input placeholder="Nhập số quyết định" />
							</Form.Item>
						</Col>
						<Col xl={6} lg={8} md={12} xs={24}>
							<Form.Item<KPI_BoTieuChiDonViSearchType>
								key="tenBoTieuChiDonVi"
								label="Tên bộ tiêu chí"
								name="tenBoTieuChiDonVi">
								<Input placeholder="Nhập tên bộ tiêu chí" />
							</Form.Item>
						</Col>
						<Col xl={6} lg={8} md={12} xs={24}>
							<Form.Item<KPI_BoTieuChiDonViSearchType>
								key="listIdDonVi"
								label="Đơn vị"
								name="listIdDonVi">
								<Select
									options={donViList}
									placeholder="Chọn đơn vị"
									showSearch
									allowClear
									mode="multiple"
									filterOption={(input, option) =>
										(option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
									}
								/>
							</Form.Item>
						</Col>

						<Col xl={6} lg={8} md={12} xs={24}>
							<Form.Item<KPI_BoTieuChiDonViSearchType>
								key="is_locked"
								label="Trạng thái"
								name="is_locked">
								<Select
									options={[
										{ label: "Đã khóa", value: true },
										{ label: "Mở", value: false },
									]}
									placeholder="Chọn trạng thái"
									allowClear
								/>
							</Form.Item>
						</Col>
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
