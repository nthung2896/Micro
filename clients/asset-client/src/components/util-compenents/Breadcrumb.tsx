import { CalendarOutlined, HomeOutlined } from "@ant-design/icons";
import { Breadcrumb } from "antd";
import dayjs from "dayjs";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useSelector } from "@/store/hooks";
import operationService from "@/services/operation/operation.service";

const weekdays = [
  "Chủ nhật",
  "Thứ 2",
  "Thứ 3",
  "Thứ 4",
  "Thứ 5",
  "Thứ 6",
  "Thứ 7",
];
const today = dayjs();

type Operation = {
  name: string;
  url: string;
};

export type BreadcrumbItemType = {
  title: React.ReactNode;
  path?: string;
  href?: string;
};

interface AutoBreadcrumbProps {
  items?: BreadcrumbItemType[];
}

const AutoBreadcrumb = ({ items: customItems }: AutoBreadcrumbProps) => {
  const [operations, setOperations] = useState<Operation[]>([]);
  const user = useSelector((state) => state.auth.User);

  const handleBuildBreadcrumb = () => {
    // Nếu có dữ liệu truyền vào từ props, ưu tiên sử dụng
    if (customItems && customItems.length > 0) {
      return customItems.map((item, index) => {
        const isLast = index === customItems.length - 1;
        const titleContent = item.href ? (
          <Link
            href={item.href}
            style={isLast ? { color: "var(--color-primary)" } : {}}
          >
            {item.title}
          </Link>
        ) : (
          <span style={isLast ? { color: "var(--color-primary)" } : {}}>
            {item.title}
          </span>
        );

        return {
          title: titleContent,
        };
      });
    }

    // Logic xử lý tự động mặc định
    const items = [
      {
        title: <Link href="/dashboard">Trang chủ</Link>,
      },
    ];
    const pathName = window.location.pathname;
    pathName
      .slice(1)
      .split("/")
      .forEach((op) => {
        const matchedOperation = operations.find((x) =>
          x.url.toUpperCase().includes(op.toUpperCase()),
        );
        if (matchedOperation) {
          items.push({
            title: (
              <Link href={matchedOperation.url}>{matchedOperation.name}</Link>
            ),
          });
        }
      });
    // Thêm style cho phần tử cuối cùng
    if (items.length > 1) {
      const lastItem = items[items.length - 1];
      items[items.length - 1] = {
        title: (
          <Link
            href={(lastItem.title as any).props.href}
            style={{ color: "var(--color-primary)" }}
          >
            {(lastItem.title as any).props.children}
          </Link>
        ),
      };
    }
    return items;
  };

  useEffect(() => {
    operationService
      .getBreadcrumb()
      .then((res) => {
        if (res.status) {
          setOperations(res.data);
        }
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  return (
    <div className="flex-1 min-w-[300px] flex justify-between items-center pb-2 border-b border-gray-300 mb-2">
      <Breadcrumb items={handleBuildBreadcrumb()} className="uppercase font-medium" />{" "}
      <div className="flex items-center gap-4">
        <span className="uppercase font-bold">{user?.tenDonVi_txt}</span>
        <span className="text-gray-500">
          <CalendarOutlined /> {weekdays[today.day()]} ngày{" "}
          {today.format("DD/MM/YYYY")}
        </span>
      </div>
    </div>
  );
};

export default AutoBreadcrumb;
