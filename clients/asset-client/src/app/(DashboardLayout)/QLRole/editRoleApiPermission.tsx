import apiPermissionsService from "@/services/apiPermissions/apiPermissionsService";
import {
  ApiPermissionActionType,
  ApiPermissionGroupDataType,
} from "@/types/apiPermissions/dto";
import { ApiPermissionsSaveVMType } from "@/types/apiPermissions/request";
import { RightOutlined } from "@ant-design/icons";
import {
  Button,
  Checkbox,
  Col,
  Collapse,
  Divider,
  Drawer,
  Form,
  Row,
  Space,
  message,
} from "antd";
import React, { useCallback, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import classes from "./page.module.css";

interface Props {
  onClose: () => void;
  roleId: string;
}

interface TableRowHeader {
  //   lstOperation: tableOperationType[]
  isAllChecked: boolean;
  isIndeterminate: boolean;
  name: string;
}

enum SELECT_FULL_ENUM {
  NONE,
  SELECT_ALL,
  INDETERMINATE,
}

const EditRoleApiPermission: React.FC<Props> = (props: Props) => {
  const [apiPermissionGroup, setApiPermissionGroup] = useState<
    ApiPermissionGroupDataType[]
  >([]);
  const [expandedKeys, setExpandedKeys] = useState([]); // Track expanded Collapse panels

  const [selectFull, setSelectFull] = useState<SELECT_FULL_ENUM>(
    SELECT_FULL_ENUM.NONE,
  );
  const handleCheckboxChange = useCallback(
    (name: string, path: string, checked: boolean) => {
      setApiPermissionGroup((prevGroups) => {
        if (!prevGroups) return prevGroups;

        const updatedGroups = prevGroups.map((group) => {
          if (group.name === name) {
            const actions = group.actions?.map((ac) => {
              if (ac.path === path) {
                return {
                  ...ac,
                  checked: checked,
                };
              }
              return ac;
            });
            const groupChecked = actions?.every((ac) => ac.checked);
            return {
              ...group,
              checked: groupChecked ?? false,
              actions: actions,
            };
          }
          return group;
        });
        const allChecked = updatedGroups.every((group) => group.checked);
        const someChecked = updatedGroups.some(
          (group) => group.checked && !group.actions?.every((ac) => ac.checked),
        );
        setSelectFull(
          allChecked
            ? SELECT_FULL_ENUM.SELECT_ALL
            : someChecked
              ? SELECT_FULL_ENUM.INDETERMINATE
              : SELECT_FULL_ENUM.NONE,
        );
        return updatedGroups;
      });
    },
    [],
  );

  const handleSelectFull = (checked: boolean) => {
    setSelectFull(
      checked ? SELECT_FULL_ENUM.SELECT_ALL : SELECT_FULL_ENUM.NONE,
    );

    setApiPermissionGroup((prevGroups) => {
      if (!prevGroups) return prevGroups;

      return prevGroups.map((group) => {
        const actions = group.actions?.map((ac) => {
          return {
            ...ac,
            checked: checked,
          };
        });
        return {
          ...group,
          checked: checked,
          actions: actions,
        };
      });
    });
  };

  const handleSelectAll = useCallback((name: string, checked: boolean) => {
    setApiPermissionGroup((prevGroups) => {
      if (!prevGroups) return prevGroups;

      const updatedGroups = prevGroups.map((group) => {
        if (group.name === name) {
          return {
            ...group,
            checked: checked,
            actions: group.actions?.map((op) => {
              return {
                ...op,
                checked: checked,
              };
            }),
          };
        }
        return group;
      });
      const allChecked = updatedGroups.every((group) => group.checked);
      const someChecked = updatedGroups.some((group) => group.checked);
      setSelectFull(
        allChecked
          ? SELECT_FULL_ENUM.SELECT_ALL
          : someChecked
            ? SELECT_FULL_ENUM.INDETERMINATE
            : SELECT_FULL_ENUM.NONE,
      );
      return updatedGroups;
    });
  }, []);

  const TableRow = React.memo(function tableRow({
    name,
    operation,
    idx,
  }: {
    operation: ApiPermissionActionType;
    idx: number;
    name: string;
  }) {
    return (
      <tr key={uuidv4()}>
        <td className={`${classes.cssTHead}`}>{idx}</td>
        <td className={`${classes.cssTHead} ${classes.cssChuTrongTable}`}>
          {operation.name}
        </td>
        <td className={`${classes.cssTHead} text-center`}>
          <Checkbox
            checked={operation.checked}
            onChange={(e) =>
              handleCheckboxChange(name, operation.path ?? "", e.target.checked)
            }
          />
        </td>
      </tr>
    );
  });

  const TableHeader = React.memo(function tableHeader({
    name,
    isAllChecked,
    isIndeterminate,
  }: TableRowHeader) {
    return (
      <tr style={{ backgroundColor: "#f5f5f5", textAlign: "left" }}>
        <th className={`${classes.cssTHead}`}>STT</th>
        <th className={`${classes.cssTHead} ${classes.cssTheadWidth}`}>
          Action
        </th>
        <th className={`${classes.cssTHead} text-center`}>
          <Checkbox
            checked={isAllChecked}
            indeterminate={isIndeterminate}
            onChange={(e) => handleSelectAll(name, e.target.checked)}
          />
        </th>
      </tr>
    );
  });

  const handleGetApiPermissionGroupData = async (roleId: string) => {
    try {
      const respone = await apiPermissionsService.getByRoleId(roleId);
      if (respone.status) {
        // console.log(respone.data);

        setApiPermissionGroup(respone.data);
        const allChecked = respone.data.every((group) => group.checked);
        const someChecked = respone.data.some((group) => group.checked);
        setSelectFull(
          allChecked
            ? SELECT_FULL_ENUM.SELECT_ALL
            : someChecked
              ? SELECT_FULL_ENUM.INDETERMINATE
              : SELECT_FULL_ENUM.NONE,
        );
      } else {
        message.error("Có lỗi xảy ra");
      }
    } catch (error) {
      message.error("Có lỗi xảy ra: " + error);
    }
  };

  const onCollapseChange = (keys: any) => {
    setExpandedKeys(keys); // Update expanded keys to control the collapse state
  };

  const handleSaveApiPermission = async () => {
    try {
      const paths: string[] = [];
      const controllers: string[] = [];
      apiPermissionGroup?.map((item) => {
        if (item.checked) {
          controllers.push(item.path ?? "");
        }
        if (item.actions) {
          item.actions.map((action) => {
            if (action.checked) {
              paths.push(action.path ?? "");
            }
          });
        }
      });

      const saveModel: ApiPermissionsSaveVMType = {
        fullPermission: selectFull === SELECT_FULL_ENUM.SELECT_ALL,
        roleId: props.roleId,
        paths: paths,
        controllers: controllers,
      };
      const respone = await apiPermissionsService.save(saveModel);
      if (respone.status) {
        message.success("Cập nhật dữ liệu thành công");
      }
    } catch (ex) {
      message.error("Có lỗi xảy ra: " + ex);
    }
  };

  useEffect(() => {
    if (props.roleId !== "") {
      handleGetApiPermissionGroupData(props.roleId);
    }
  }, [props.roleId]);

  return (
    <>
      <Drawer
        title={`Phân quyền API`}
        width="95%"
        closable={true}
        open={true}
        onClose={props.onClose}
        extra={
          <Space>
            <Button
              onClick={() => {
                handleSaveApiPermission();
              }}
              variant="solid"
              color="primary"
            >
              Lưu lại
            </Button>
            <Button onClick={props.onClose} variant="outlined" color="primary">
              Hủy
            </Button>
          </Space>
        }
      >
        <Form.Item label="Phân quyền tất cả api" name={"selectAll"}>
          <Checkbox
            checked={selectFull === SELECT_FULL_ENUM.SELECT_ALL}
            indeterminate={selectFull === SELECT_FULL_ENUM.INDETERMINATE}
            onChange={(e) => handleSelectFull(e.target.checked)}
          />
        </Form.Item>
        <Divider />
        <Row gutter={[20, 20]}>
          {apiPermissionGroup &&
            apiPermissionGroup.length > 0 &&
            apiPermissionGroup.map((group) => {
              if (!group) return group;

              const isAllChecked =
                group.actions && group.actions.every((op) => op.checked);

              const isIndeterminate =
                group.actions &&
                group.actions.length > 0 &&
                group.actions.some((op) => op.checked) && // Ít nhất một cái được chọn
                !group.actions.every((op) => op.checked); // Không phải tất cả đều được chọn

              return (
                <Col className="gutter-row" span={6} key={uuidv4()}>
                  <Collapse
                    // type="primary"

                    activeKey={expandedKeys} // Control which Collapse panel is expanded
                    onChange={onCollapseChange} // Update the expanded keys when the user toggles the Collapse
                    items={[
                      {
                        key: `${group?.name}`,
                        label: `${group?.name}`,
                        children: (
                          <div>
                            <table
                              style={{
                                width: "100%",
                                borderCollapse: "collapse",
                              }}
                              className={`${classes.cssTable}`}
                            >
                              <thead>
                                <TableHeader
                                  name={group.name ?? ""}
                                  isAllChecked={isAllChecked ?? false}
                                  isIndeterminate={isIndeterminate ?? false}
                                />
                              </thead>
                              <tbody>
                                {group.actions &&
                                  group.actions.map((op, idx) => (
                                    <TableRow
                                      key={uuidv4()}
                                      operation={op}
                                      idx={idx + 1}
                                      name={group.name ?? ""}
                                    />
                                  ))}
                              </tbody>
                            </table>
                          </div>
                        ),
                      },
                    ]}
                    expandIcon={({ isActive }) => (
                      <RightOutlined
                        style={{
                          transform: isActive
                            ? "rotate(90deg)"
                            : "rotate(0deg)",
                          transition: "transform 0.2s ease",
                        }}
                      />
                    )}
                  />
                </Col>
              );
            })}
        </Row>
      </Drawer>
    </>
  );
};

export default EditRoleApiPermission;
