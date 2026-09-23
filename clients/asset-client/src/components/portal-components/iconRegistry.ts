// Registry icon AntD dùng được trong template body.
// Cú pháp: <Icon name="HomeOutlined" className="text-xl text-white" />
//
// Vì template engine render bằng dangerouslySetInnerHTML (HTML, không phải React),
// ta convert IconDefinition của @ant-design/icons-svg → SVG string tĩnh.
//
// Để thêm icon mới: import ở dưới + thêm vào ICONS map.

import type { IconDefinition } from "@ant-design/icons-svg/es/types";

// Common icons — chỉ import những cái cần dùng để tránh bloat bundle.
// Thêm bất kỳ icon nào từ https://ant.design/components/icon vào đây.
import AppstoreOutlined from "@ant-design/icons-svg/es/asn/AppstoreOutlined";
import AuditOutlined from "@ant-design/icons-svg/es/asn/AuditOutlined";
import BankOutlined from "@ant-design/icons-svg/es/asn/BankOutlined";
import BellOutlined from "@ant-design/icons-svg/es/asn/BellOutlined";
import BookOutlined from "@ant-design/icons-svg/es/asn/BookOutlined";
import CaretDownOutlined from "@ant-design/icons-svg/es/asn/CaretDownOutlined";
import CheckCircleOutlined from "@ant-design/icons-svg/es/asn/CheckCircleOutlined";
import ClockCircleOutlined from "@ant-design/icons-svg/es/asn/ClockCircleOutlined";
import CommentOutlined from "@ant-design/icons-svg/es/asn/CommentOutlined";
import ContainerOutlined from "@ant-design/icons-svg/es/asn/ContainerOutlined";
import EnvironmentOutlined from "@ant-design/icons-svg/es/asn/EnvironmentOutlined";
import ExclamationCircleOutlined from "@ant-design/icons-svg/es/asn/ExclamationCircleOutlined";
import FileSearchOutlined from "@ant-design/icons-svg/es/asn/FileSearchOutlined";
import FileTextOutlined from "@ant-design/icons-svg/es/asn/FileTextOutlined";
import GlobalOutlined from "@ant-design/icons-svg/es/asn/GlobalOutlined";
import HomeFilled from "@ant-design/icons-svg/es/asn/HomeFilled";
import HomeOutlined from "@ant-design/icons-svg/es/asn/HomeOutlined";
import LineChartOutlined from "@ant-design/icons-svg/es/asn/LineChartOutlined";
import MailOutlined from "@ant-design/icons-svg/es/asn/MailOutlined";
import MessageOutlined from "@ant-design/icons-svg/es/asn/MessageOutlined";
import NotificationOutlined from "@ant-design/icons-svg/es/asn/NotificationOutlined";
import PhoneOutlined from "@ant-design/icons-svg/es/asn/PhoneOutlined";
import ProfileOutlined from "@ant-design/icons-svg/es/asn/ProfileOutlined";
import RiseOutlined from "@ant-design/icons-svg/es/asn/RiseOutlined";
import SafetyCertificateOutlined from "@ant-design/icons-svg/es/asn/SafetyCertificateOutlined";
import SearchOutlined from "@ant-design/icons-svg/es/asn/SearchOutlined";
import ShopOutlined from "@ant-design/icons-svg/es/asn/ShopOutlined";
import ShoppingCartOutlined from "@ant-design/icons-svg/es/asn/ShoppingCartOutlined";
import SolutionOutlined from "@ant-design/icons-svg/es/asn/SolutionOutlined";
import StarFilled from "@ant-design/icons-svg/es/asn/StarFilled";
import TeamOutlined from "@ant-design/icons-svg/es/asn/TeamOutlined";
import UserOutlined from "@ant-design/icons-svg/es/asn/UserOutlined";
import WarningOutlined from "@ant-design/icons-svg/es/asn/WarningOutlined";

const ICONS: Record<string, IconDefinition> = {
  AppstoreOutlined,
  AuditOutlined,
  BankOutlined,
  BellOutlined,
  BookOutlined,
  CaretDownOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CommentOutlined,
  ContainerOutlined,
  EnvironmentOutlined,
  ExclamationCircleOutlined,
  FileSearchOutlined,
  FileTextOutlined,
  GlobalOutlined,
  HomeFilled,
  HomeOutlined,
  LineChartOutlined,
  MailOutlined,
  MessageOutlined,
  NotificationOutlined,
  PhoneOutlined,
  ProfileOutlined,
  RiseOutlined,
  SafetyCertificateOutlined,
  SearchOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  SolutionOutlined,
  StarFilled,
  TeamOutlined,
  UserOutlined,
  WarningOutlined,
};

export const AVAILABLE_ICONS = Object.keys(ICONS).sort();

type AbstractNode = {
  tag: string;
  attrs: Record<string, string>;
  children?: AbstractNode[];
};

function nodeToSvg(node: AbstractNode): string {
  const attrs = Object.entries(node.attrs || {})
    .map(([k, v]) => `${k}="${String(v).replace(/"/g, "&quot;")}"`)
    .join(" ");
  const children = (node.children || []).map(nodeToSvg).join("");
  return children
    ? `<${node.tag} ${attrs}>${children}</${node.tag}>`
    : `<${node.tag} ${attrs}/>`;
}

/** Render 1 icon AntD ra chuỗi SVG. */
export function renderIcon(
  name: string,
  attrs: Record<string, string> = {},
): string {
  const def = ICONS[name];
  if (!def) {
    // Fallback im lặng: span trống 1em x 1em để không gãy layout, không lộ text "?Name".
    // Lúc dev sẽ thấy warning console; production user không thấy gì xấu.
    if (typeof console !== "undefined") {
      console.warn(`[iconRegistry] Icon '${name}' chưa được register.`);
    }
    return `<span style="display:inline-block;width:1em;height:1em" aria-hidden="true"></span>`;
  }
  const svgRoot = def.icon as AbstractNode;
  const merged: AbstractNode = {
    tag: "svg",
    attrs: {
      ...svgRoot.attrs,
      width: "1em",
      height: "1em",
      fill: "currentColor",
      ...attrs,
    },
    children: svgRoot.children,
  };
  return nodeToSvg(merged);
}
