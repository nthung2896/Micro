"use client";
import { lightTheme } from "@/constants/ThemeConstant";
import { ArrowLeftOutlined, HomeOutlined } from "@ant-design/icons";
import { Button, ConfigProvider, Image, Typography } from "antd";
import Link from "next/link";
const { Title, Paragraph, Text } = Typography;

const Error = () => {
  return (
    <ConfigProvider theme={lightTheme}>
      <div className="min-h-screen flex justify-center items-stretch px-4 md:px-8">
        <div className="w-full max-w-[1320px] rounded-2xl">
          <div className="flex justify-center mt-10 mb-3">
            <Image src="/logo.png" alt="Logo" width={140} preview={false} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-9 items-center min-h-[calc(100dvh-220px)]">
            <div>
              <Text type="secondary">Lỗi điều hướng</Text>
              <Title level={2} className="mt-2! mb-2!">
                Không tìm thấy trang bạn cần
              </Title>
              <Paragraph type="secondary" className="mb-5!">
                Đường dẫn có thể đã thay đổi, bị xóa hoặc bạn chưa có quyền truy
                cập. Vui lòng quay lại trang chủ hoặc trở về trang trước đó.
              </Paragraph>

              <div className="flex flex-wrap gap-3">
                <Link href="/dashboard">
                  <Button type="primary" icon={<HomeOutlined />}>
                    Về trang chủ
                  </Button>
                </Link>
                <Button
                  icon={<ArrowLeftOutlined />}
                  onClick={() => window.history.back()}
                  variant="outlined"
                  color="primary"
                >
                  Quay lại
                </Button>
              </div>
            </div>

            <div className="text-center text-9xl font-extrabold text-red-700">
              404
            </div>
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
};

export default Error;
