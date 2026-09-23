import React, { Component, JSX } from "react";
import { Breadcrumb } from "antd";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector } from "@/store/hooks";
import { MenuDataType } from "@/types/operation/dto";

interface BreadcrumbData {
  [key: string]: JSX.Element | string;
}

const breadcrumbData: BreadcrumbData = {
  "/dashboard": "Trang chủ",
};

const BreadcrumbRoute: React.FC = () => {
  const menuData: MenuDataType[] | null = useSelector(
    (state) => state.menu.menuData,
  );

  if (menuData != null) {
    menuData.forEach((elm: MenuDataType) => {
      const assignBreadcrumb = (obj: MenuDataType) => {
        if (obj.url) {
          breadcrumbData[obj.url] = obj.name || "";
        }
      };
      assignBreadcrumb(elm);

      if (elm.listMenu) {
        elm.listMenu.forEach((subElm: MenuDataType) => {
          const assignChildBreadcrumb = (obj: MenuDataType) => {
            if (obj.url) {
              breadcrumbData[obj.url] = obj.name || "";
            }
          };
          assignChildBreadcrumb(subElm);
        });
      }
    });
  }

  const pathname = usePathname();
  const pathSnippets = pathname?.split("/").filter((i: string) => i) ?? [];

  const breadcrumbItems = pathSnippets.map((_, index: number) => {
    const url = `/${pathSnippets.slice(0, index + 1).join("/")}`;
    return {
      title: breadcrumbData[url] ? (
        <Link href={url}>{breadcrumbData[url]}</Link>
      ) : null,
    };
  });

  return (
    <Breadcrumb
      items={breadcrumbItems.filter(
        (item: { title: JSX.Element | null }) => item.title !== null,
      )}
    />
  );
};

export class AppBreadcrumb extends Component {
  render() {
    return <BreadcrumbRoute />;
  }
}

export default AppBreadcrumb;
