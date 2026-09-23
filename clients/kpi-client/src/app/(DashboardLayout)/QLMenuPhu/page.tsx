"use client";

import Flex from "@/components/shared-components/Flex";
import AutoBreadcrumb from "@/components/util-compenents/Breadcrumb";
import withAuthorization from "@/libs/authentication";
import navMenuService from "@/services/navMenu/navMenu.service";
import { setIsLoading } from "@/store/general/GeneralSlice";
import { useSelector } from "@/store/hooks";
import { AppDispatch } from "@/store/store";
import { NavMenuDto } from "@/types/navMenu";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusCircleOutlined,
  SearchOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  FormProps,
  Popconfirm,
  Tree,
  Tooltip,
  message,
} from "antd";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import CreateOrUpdate from "./createOrUpdate";
import classes from "./page.module.css";
import Search from "./search";

const QLMenuPhu: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [listMenu, setListMenu] = useState<NavMenuDto[]>([]);
  const [isPanelVisible, setIsPanelVisible] = useState<boolean>(false);
  const [searchValues, setSearchValues] = useState<any>(null);
  const loading = useSelector((state) => state.general.isLoading);
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);

  const [currentMenu, setCurrentMenu] = useState<NavMenuDto | null>();
  const [initialParentId, setInitialParentId] = useState<string | undefined>(undefined);

  const handleCreateEditSuccess = () => {
    handleGetListMenu();
  };

  const handleDeleteMenu = async (id: string) => {
    try {
      const response = await navMenuService.delete(id);
      if (response.status) {
        message.success("Xóa menu phụ thành công");
        handleGetListMenu();
      } else {
        message.error(response.message || "Xóa menu phụ thất bại");
      }
    } catch (error: any) {
      message.error("Có lỗi xảy ra: " + (error.message || error));
    }
  };

  const toggleSearch = () => {
    setIsPanelVisible(!isPanelVisible);
  };

  const onFinishSearch: FormProps<any>["onFinish"] = async (values) => {
    try {
      setSearchValues(values);
      await handleGetListMenu({
        pageSize: -1,
        menuType: "MEGA",
        ...values,
      });
    } catch (error) {
      console.error("Lỗi khi tìm kiếm:", error);
    }
  };

  const onResetSearch = () => {
    setSearchValues(null);
    handleGetListMenu({
      pageSize: -1,
      menuType: "MEGA",
    });
  };

  const handleGetListMenu = useCallback(
    async (searchDataOverride?: any) => {
      dispatch(setIsLoading(true));
      try {
        const searchData = searchDataOverride || {
          pageSize: -1,
          menuType: "MEGA",
          ...(searchValues || {}),
        };
        const response = await navMenuService.getData(searchData);

        if (response != null && response.data != null) {
          const data = response.data;
          setListMenu(data.items || []);
        }
      } catch (error) {
        console.error(error);
      } finally {
        dispatch(setIsLoading(false));
      }
    },
    [searchValues, dispatch]
  );

  const handleShowModal = (isEdit?: boolean, menuItem?: NavMenuDto) => {
    setIsOpenModal(true);
    setInitialParentId(undefined);
    if (isEdit) {
      setCurrentMenu(menuItem);
    }
  };

  const handleClose = () => {
    setIsOpenModal(false);
    setCurrentMenu(null);
    setInitialParentId(undefined);
  };

  const handleSwitchActiveMenu = async (record: NavMenuDto) => {
    try {
      const response = await navMenuService.update({
        id: record.id,
        label: record.label,
        href: record.href,
        parentId: record.parentId,
        sortOrder: record.sortOrder,
        isActive: !record.isActive,
        menuType: "MEGA",
      });
      if (response.status) {
        message.success(
          `${
            response.data?.isActive
              ? "Mở khóa menu phụ thành công"
              : "Khóa menu phụ thành công"
          } `
        );
        handleGetListMenu();
      } else {
        message.error(response.message || "Thay đổi trạng thái thất bại");
      }
    } catch (error: any) {
      message.error("Có lỗi xảy ra: " + (error.message || error));
    }
  };

  const buildMenuTree = (items: NavMenuDto[]): NavMenuDto[] => {
    const itemMap: { [key: string]: any } = {};
    items.forEach((item) => {
      itemMap[item.id] = { ...item, children: [] };
    });

    const roots: any[] = [];
    items.forEach((item) => {
      const mappedItem = itemMap[item.id];
      if (item.parentId && itemMap[item.parentId]) {
        itemMap[item.parentId].children.push(mappedItem);
      } else {
        roots.push(mappedItem);
      }
    });

    const cleanChildren = (node: any) => {
      if (node.children && node.children.length > 0) {
        node.children.sort((a: any, b: any) => a.sortOrder - b.sortOrder);
        node.children.forEach(cleanChildren);
      } else {
        delete node.children;
      }
    };

    roots.forEach(cleanChildren);
    return roots.sort((a, b) => a.sortOrder - b.sortOrder);
  };

  const treeData = buildMenuTree(listMenu);

  const mapTreeNodes = (items: NavMenuDto[]): any[] => {
    return items.map((item) => {
      const titleNode = (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "6px 12px", borderBottom: "1px solid #f5f5f5" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>{item.label}</span>
            <span style={{ color: "#8c8c8c", fontSize: 13 }}>({item.href})</span>
            <span style={{ fontSize: 12, padding: "1px 6px", borderRadius: 4, background: item.isActive ? "#e6f7ff" : "#fff1f0", color: item.isActive ? "#096dd9" : "#cf1322", border: `1px solid ${item.isActive ? "#91d5ff" : "#ffa39e"}` }}>
              {item.isActive ? "Hoạt động" : "Tạm ngưng"}
            </span>
            <span style={{ color: "#bfbfbf", fontSize: 12 }}>Thứ tự: {item.sortOrder}</span>
          </div>
          <div style={{ display: "flex", gap: 8 }} onClick={(e) => e.stopPropagation()}>
            <Tooltip title="Thêm menu con">
              <Button
                type="text"
                
                icon={<PlusCircleOutlined style={{ color: "#52c41a" }} />}
                onClick={() => {
                  setCurrentMenu(null);
                  setInitialParentId(item.id);
                  setIsOpenModal(true);
                }}
              />
            </Tooltip>
            <Tooltip title="Chỉnh sửa">
              <Button
                type="text"
                
                icon={<EditOutlined style={{ color: "#1890ff" }} />}
                onClick={() => handleShowModal(true, item)}
              />
            </Tooltip>
            <Tooltip title={item.isActive ? "Khóa menu" : "Mở khóa menu"}>
              <Button
                type="text"
                
                icon={<SettingOutlined style={{ color: item.isActive ? "#faad14" : "#52c41a" }} />}
                onClick={() => handleSwitchActiveMenu(item)}
              />
            </Tooltip>
            <Popconfirm
              title="Xác nhận xóa"
              description="Bạn có muốn xóa mục menu này?"
              okText="Xóa"
              cancelText="Hủy"
              onConfirm={() => handleDeleteMenu(item.id || "")}
            >
              <Tooltip title="Xóa">
                <Button
                  type="text"
                  
                  danger
                  icon={<DeleteOutlined />}
                />
              </Tooltip>
            </Popconfirm>
          </div>
        </div>
      );

      return {
        key: item.id,
        title: titleNode,
        children: item.children ? mapTreeNodes(item.children) : undefined,
      };
    });
  };

  const treeNodes = mapTreeNodes(treeData);

  useEffect(() => {
    handleGetListMenu();
  }, [handleGetListMenu]);

  return (
    <>
      <Flex
        alignItems="center"
        justifyContent="space-between"
        className="mb-2 flex-wrap justify-content-end"
      >
        <AutoBreadcrumb />
        <div>
          <Button
            onClick={() => toggleSearch()}
            type="primary"
            icon={isPanelVisible ? <CloseOutlined /> : <SearchOutlined />}
            className={classes.mgright5}
          >
            {isPanelVisible ? "Ẩn tìm kiếm" : "Tìm kiếm"}
          </Button>

          <Button
            onClick={() => {
              handleShowModal();
            }}
            type="primary"
            icon={<PlusCircleOutlined />}
          >
            Thêm mới
          </Button>
          <CreateOrUpdate
            isOpen={isOpenModal}
            onSuccess={handleCreateEditSuccess}
            onClose={handleClose}
            menuItem={currentMenu}
            initialParentId={initialParentId}
          />
        </div>
      </Flex>
      {isPanelVisible && <Search onFinish={onFinishSearch} onReset={onResetSearch} />}
      
      <Card style={{ padding: "16px" }} className={classes.customCardShadow}>
        {treeNodes.length > 0 ? (
          <Tree
            treeData={treeNodes}
            defaultExpandAll
            blockNode
            selectable={false}
            showLine={{ showLeafIcon: false }}
          />
        ) : (
          <div style={{ padding: "24px", textAlign: "center", color: "#8c8c8c" }}>
            Không có dữ liệu menu phụ
          </div>
        )}
      </Card>
    </>
  );
};

export default withAuthorization(QLMenuPhu, "");
