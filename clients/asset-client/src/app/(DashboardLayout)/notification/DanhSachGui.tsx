// import React, { useEffect, useState } from "react";
// import { Drawer, Divider, Tag, TableColumnsType, Table, Button } from "antd";
// import { EyeOutlined } from "@ant-design/icons";

// import Link from "next/link";
// import { DropdownOption } from "@/types/general";

// import dynamic from "next/dynamic";
// const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

// const StaticFileUrl = process.env.NEXT_PUBLIC_STATIC_FILE_BASE_URL;

// interface NotificationViewProps {
//   isOpen: boolean;
//   data?: Notification;
//   onClose: () => void;
// }

// const NotificationThongKeTinDaGui: React.FC<NotificationViewProps> = ({
//   isOpen,
//   data,
//   onClose,
// }) => {
//   const [thongKe, setThongKe] = useState<ThongKeTinDaGui[]>([]);
//   const [selectedNotification, setSelectedNotification] =
//     useState<ThongKeTinDaGui | null>(null);
//   const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);

//   const tableThongTinColumns: TableColumnsType<ThongKeTinDaGui> = [
//     {
//       key: "index",
//       title: "STT",
//       dataIndex: "index",
//       align: "center",
//       width: "1%",
//       render: (_: any, __: ThongKeTinDaGui, index: number) => index + 1,
//     },
//     {
//       title: "Tiêu đề",
//       dataIndex: "tieuDe",
//       align: "center",
//     },
//     {
//       title: "Người tạo thông báo",
//       dataIndex: "nguoiTao",
//       align: "center",
//     },
//     // {
//     //     title: 'Loại thông báo',
//     //     dataIndex: 'loaiThongBao',
//     //     align: 'center',
//     // },
//     {
//       title: "Người nhận",
//       dataIndex: "nguoiNhan",
//       align: "center",
//     },
//     {
//       title: "Thời gian gửi mail",
//       dataIndex: "createdDate",
//       align: "center",
//       render: (_: any, record: ThongKeTinDaGui) => (
//         <span>
//           {record.createdDate
//             ? new Date(record.createdDate).toLocaleDateString("vi-VN")
//             : ""}
//         </span>
//       ),
//     },
//     {
//       title: "Thao tác",
//       dataIndex: "actions",
//       align: "center",
//       width: "5%",
//       fixed: "right",
//       render: (_: any, record: ThongKeTinDaGui) => (
//         <Button
//           type="primary"
//           icon={<EyeOutlined />}
//           style={{ fontSize: "12px", height: "100%" }}
//           onClick={() => {
//             setSelectedNotification(record);
//             setIsDetailOpen(true);
//           }}
//         >
//           Chi tiết
//         </Button>
//       ),
//     },
//   ];

//   useEffect(() => {
//     if (isOpen && data) {
//       thongKeTinDaGuiService.getDataThongBaoByItemId(data.id).then((res) => {
//         if (res.status) {
//           setThongKe(res.data);
//         } else {
//           console.error(res.message);
//         }
//       });
//     }
//   }, [isOpen, data]);
//   if (!data) return <></>;
//   return (
//     <>
//       <Drawer
//         open={isOpen}
//         title={`Thông kê thông tin đã gửi liên quan đến ${data.tieuDe}`}
//         onClose={onClose}
//         width={1000}
//       >
//         <Table<ThongKeTinDaGui>
//           columns={tableThongTinColumns}
//           bordered
//           dataSource={thongKe}
//           rowKey="id"
//           scroll={{ x: "max-content" }}
//           pagination={false}
//           tableLayout="fixed"
//         />
//       </Drawer>
//       <Drawer
//         open={isDetailOpen}
//         title="Chi tiết thông báo"
//         onClose={() => setIsDetailOpen(false)}
//         width={600}
//       >
//         {selectedNotification && (
//           <div>
//             <p>
//               <b>Tiêu đề:</b> {selectedNotification.tieuDe}
//             </p>
//             <p>
//               <b>Người tạo:</b> {selectedNotification.nguoiTao}
//             </p>
//             <p>
//               <b>Người nhận:</b> {selectedNotification.nguoiNhan}
//             </p>
//             <p>
//               <b>Loại thông báo:</b> {selectedNotification.loaiThongBao}
//             </p>
//             <p>
//               <b>Thời gian gửi:</b>{" "}
//               {selectedNotification.createdDate
//                 ? new Date(selectedNotification.createdDate).toLocaleString(
//                     "vi-VN"
//                   )
//                 : "Không có thông tin"}
//             </p>
//             <p>
//               <b>Nội dung:</b>
//             </p>
//             <ReactQuill
//               readOnly
//               value={selectedNotification.noiDung}
//               theme="snow"
//             />
//           </div>
//         )}
//       </Drawer>
//     </>
//   );
// };

// export default NotificationThongKeTinDaGui;
