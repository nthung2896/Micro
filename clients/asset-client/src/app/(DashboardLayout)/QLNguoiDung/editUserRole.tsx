import roleService from "@/services/role/role.service";
import userRoleService from "@/services/userRole/userRole.service";
import { DropdownOption } from "@/types/general";
import {
  UserRoleBulkRequestType,
  UserRoleRequestType,
} from "@/types/userRole/request";
import {
  Card,
  Col,
  Form,
  FormProps,
  Input,
  Modal,
  Popover,
  Row,
  Select,
  Space,
  Steps,
  Tag,
  Typography,
  message,
} from "antd";
import React, { useEffect, useState } from "react";
export interface UserRoleAssignmentUser {
  id?: string;
  name?: string;
  vaiTro?: string[];
}

interface Props {
  isOpen: boolean;
  user?: UserRoleAssignmentUser | null;
  onClose: () => void;
  onSuccess: () => void;
  dropVaiTros: DropdownOption[];
  setDropVaiTros: React.Dispatch<React.SetStateAction<DropdownOption[]>>;
}

interface KhoiPhongData {
  khoiCode: string;
  khoiLabel: string;
  phongOptions: DropdownOption[];
  selectedPhongs: string[];
}

interface PhongRoleData {
  khoiCode: string;
  departmentId: string;
  departmentLabel: string;
  roleCodes: string[];
}

const EditUserRole: React.FC<Props> = (props: Props) => {
  const [form] = Form.useForm();
  const [isOpen, setIsOpen] = useState<boolean>(props.isOpen);
  const [dropKCQCN, setDropKCQCN] = useState<DropdownOption[]>([]);
  const [selectedKhois, setSelectedKhois] = useState<string[]>([]);
  const [khoiPhongMap, setKhoiPhongMap] = useState<Map<string, KhoiPhongData>>(
    new Map(),
  );
  const [phongRoleMap, setPhongRoleMap] = useState<Map<string, PhongRoleData>>(
    new Map(),
  );

  const handleLoadDropdowns = async () => {
    if (props.dropVaiTros.length === 0) {
      try {
        const response = await roleService.getDropVaiTro();
        if (response.status && response.data) {
          props.setDropVaiTros(response.data);
        }
      } catch (error) {
        console.error("Error loading roles:", error);
      }
    }

    try {
      const response = await userRoleService.getDropdownKCQCN();
      if (response.status && response.data) {
        setDropKCQCN(response.data);
      }
    } catch (error) {
      console.error("Error loading KCQCN:", error);
    }
  };

  const loadExistingPermissions = async () => {
    if (!props.user?.id) return;

    try {
      const response = await userRoleService.getUserPermissions(props.user.id);
      if (response.status && response.data && response.data.length > 0) {
        const permissions = response.data;

        // Extract unique Khoi codes
        const uniqueKhois = [
          ...new Set(permissions.map((p) => p.khoiCode).filter((k) => k)),
        ];
        setSelectedKhois(uniqueKhois);

        // For each Khoi, load its departments and set selected phongs
        const newKhoiPhongMap = new Map<string, KhoiPhongData>();
        const newPhongRoleMap = new Map<string, PhongRoleData>();

        for (const khoiCode of uniqueKhois) {
          const khoiLabel =
            dropKCQCN.find((k) => k.value === khoiCode)?.label || khoiCode;

          // Load phong options for this khoi
          try {
            const phongResponse =
              await userRoleService.getDropdownPhongByKCQCN(khoiCode);
            if (phongResponse.status && phongResponse.data) {
              // Get phongs for this khoi from permissions
              const phongsForKhoi = permissions
                .filter((p) => p.khoiCode === khoiCode)
                .map((p) => p.departmentId);

              newKhoiPhongMap.set(khoiCode, {
                khoiCode,
                khoiLabel,
                phongOptions: phongResponse.data,
                selectedPhongs: phongsForKhoi,
              });

              // Populate phongRoleMap
              permissions
                .filter((p) => p.khoiCode === khoiCode)
                .forEach((p) => {
                  const key = `${khoiCode}-${p.departmentId}`;
                  const phongLabel =
                    phongResponse.data.find(
                      (opt) => opt.value === p.departmentId,
                    )?.label || p.departmentId;

                  newPhongRoleMap.set(key, {
                    khoiCode,
                    departmentId: p.departmentId,
                    departmentLabel: phongLabel,
                    roleCodes: p.roleCodes,
                  });
                });
            }
          } catch (error) {
            console.error(`Error loading departments for ${khoiCode}:`, error);
          }
        }

        setKhoiPhongMap(newKhoiPhongMap);
        setPhongRoleMap(newPhongRoleMap);
      }
    } catch (error) {
      console.error("Error loading existing permissions:", error);
    }
  };

  const handleKhoiChange = async (values: string[]) => {
    setSelectedKhois(values);
    const newMap = new Map<string, KhoiPhongData>();

    for (const khoiCode of values) {
      const khoiLabel =
        dropKCQCN.find((k) => k.value === khoiCode)?.label || khoiCode;
      const existing = khoiPhongMap.get(khoiCode);

      if (existing) {
        newMap.set(khoiCode, existing);
      } else {
        try {
          const response =
            await userRoleService.getDropdownPhongByKCQCN(khoiCode);
          if (response.status && response.data) {
            newMap.set(khoiCode, {
              khoiCode,
              khoiLabel,
              phongOptions: response.data,
              selectedPhongs: [],
            });
          }
        } catch (error) {
          console.error(`Error loading departments for ${khoiCode}:`, error);
        }
      }
    }

    setKhoiPhongMap(newMap);

    const newPhongRoleMap = new Map(phongRoleMap);
    phongRoleMap.forEach((value, key) => {
      if (!values.includes(value.khoiCode)) {
        newPhongRoleMap.delete(key);
      }
    });
    setPhongRoleMap(newPhongRoleMap);
  };

  const handlePhongChange = (khoiCode: string, phongIds: string[]) => {
    const khoiData = khoiPhongMap.get(khoiCode);
    if (khoiData) {
      const updated = { ...khoiData, selectedPhongs: phongIds };
      const newMap = new Map(khoiPhongMap);
      newMap.set(khoiCode, updated);
      setKhoiPhongMap(newMap);

      const newPhongRoleMap = new Map(phongRoleMap);

      phongRoleMap.forEach((value, key) => {
        if (
          value.khoiCode === khoiCode &&
          !phongIds.includes(value.departmentId)
        ) {
          newPhongRoleMap.delete(key);
        }
      });

      phongIds.forEach((phongId) => {
        const key = `${khoiCode}-${phongId}`;
        if (!newPhongRoleMap.has(key)) {
          const phongLabel =
            khoiData.phongOptions.find((p) => p.value === phongId)?.label ||
            phongId;
          newPhongRoleMap.set(key, {
            khoiCode,
            departmentId: phongId,
            departmentLabel: phongLabel,
            roleCodes: [],
          });
        }
      });

      setPhongRoleMap(newPhongRoleMap);
    }
  };

  const handleRoleChange = (key: string, roleCodes: string[]) => {
    const entry = phongRoleMap.get(key);
    if (entry) {
      const updated = { ...entry, roleCodes };
      const newMap = new Map(phongRoleMap);
      newMap.set(key, updated);
      setPhongRoleMap(newMap);
    }
  };

  const handleSubmit = async () => {
    try {
      const permissions = Array.from(phongRoleMap.values())
        .filter((entry) => entry.roleCodes.length > 0)
        .map((entry) => ({
          khoiCode: entry.khoiCode,
          departmentId: entry.departmentId,
          roleCodes: entry.roleCodes,
        }));

      if (permissions.length === 0) {
        message.error("Vui lòng chọn ít nhất một phòng và phân quyền");
        return;
      }

      const requestData: UserRoleBulkRequestType = {
        userId: props.user?.id ?? "",
        permissions,
      };

      const response = await userRoleService.createBulk(requestData);
      if (response.status) {
        message.success("Phân nhóm quyền thành công");
        handleReset();
        props.onSuccess();
        props.onClose();
      } else {
        message.error(response.message);
      }
    } catch (error) {
      message.error("Có lỗi xảy ra: " + error);
    }
  };

  const handleOnFinish: FormProps<UserRoleRequestType>["onFinish"] = async (
    formData,
  ) => {
    try {
      if (props.user) {
        formData.userId = props.user?.id ?? "";
        const response = await userRoleService.create(formData);
        if (response.status) {
          message.success("Phân nhóm quyền thành công");
          form.resetFields();
          props.onSuccess();
          props.onClose();
        } else {
          message.error(response.message);
        }
      }
    } catch (error) {
      message.error("Có lỗi xảy ra: " + error);
    }
  };

  const handleMapEdit = async () => {
    if (props.user && props.user.vaiTro) {
      form.setFieldsValue({
        roleCode: props.user.vaiTro,
      });
    }
  };

  const handleReset = () => {
    form.resetFields();
    setSelectedKhois([]);
    setKhoiPhongMap(new Map());
    setPhongRoleMap(new Map());
  };

  const handleCancel = () => {
    setIsOpen(false);
    handleReset();
    props.onClose();
  };

  useEffect(() => {
    setIsOpen(props.isOpen);
    if (props.isOpen) {
      handleMapEdit();
      handleLoadDropdowns().then(() => {
        loadExistingPermissions();
      });
    } else {
      handleReset();
    }
  }, [props.isOpen]);

  const getCurrentStep = () => {
    if (phongRoleMap.size > 0) return 2;
    if (selectedKhois.length > 0) return 1;
    return 0;
  };

  // Get phong blocks for a specific Khoi
  const getPhongBlocksForKhoi = (khoiCode: string) => {
    return Array.from(phongRoleMap.entries()).filter(
      ([key, data]) => data.khoiCode === khoiCode,
    );
  };

  return (
    <Modal
      maskClosable={false}
      title={"Phân nhóm quyền"}
      open={isOpen}
      onOk={() => form.submit()}
      onCancel={handleCancel}
      okText="Xác nhận"
      cancelText="Đóng"
    // width={600}
    >
      <Form
        layout="vertical"
        form={form}
        name="formCreateUpdate"
        onFinish={handleOnFinish}
        autoComplete="off"
      >
        {props.user && (
          <Form.Item<UserRoleRequestType>
            name="userId"
            initialValue={props.user?.id}
            hidden
          >
            <Input />
          </Form.Item>
        )}
        <Form.Item>
          <Typography.Text>
            Người dùng: <strong>{props.user?.name}</strong>
          </Typography.Text>
        </Form.Item>

        <Form.Item<UserRoleRequestType> label="Chọn nhóm quyền" name="roleCode">
          <Select
            mode="multiple"
            placeholder="Chọn nhóm quyền người dùng"
            options={props.dropVaiTros}
            fieldNames={{ label: "label", value: "value" }}
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditUserRole;
