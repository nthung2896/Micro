import moduleService from "@/services/module/module.service";
import roleOperationService from "@/services/roleOperation/roleOperation.service";
import { ModuleGroupType } from "@/types/module/dto";
import {
  OperationIdRequestType,
  RoleOperationRequestType,
} from "@/types/roleOperation/request";
import { SearchOutlined } from "@ant-design/icons";
import {
  Badge,
  Button,
  Card,
  Checkbox,
  Drawer,
  Empty,
  Input,
  Space,
  Spin,
  Tag,
  message,
} from "antd";
import React, { useEffect, useMemo, useState } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  roleId: string;
}

const EditRoleOperation: React.FC<Props> = ({ isOpen, onClose, roleId }) => {
  const [groups, setGroups] = useState<ModuleGroupType[]>([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await moduleService.getModuleGroupData(roleId);
      if (res.status) {
        setGroups(res.data ?? []);
      } else {
        message.error("Không lấy được dữ liệu");
      }
    } catch (e: any) {
      message.error("Có lỗi xảy ra: " + e?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && roleId) {
      setKeyword("");
      fetchData();
    }
  }, [isOpen, roleId]);

  const toggleOne = (moduleCode: string, opId: string, checked: boolean) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.moduleCode === moduleCode
          ? {
            ...g,
            operations: g.operations?.map((op) =>
              op.id === opId ? { ...op, isAccess: checked } : op,
            ),
          }
          : g,
      ),
    );
  };

  const toggleModule = (moduleCode: string, checked: boolean) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.moduleCode === moduleCode
          ? {
            ...g,
            operations: g.operations?.map((op) => ({
              ...op,
              isAccess: checked,
            })),
          }
          : g,
      ),
    );
  };

  const toggleAll = (checked: boolean) => {
    setGroups((prev) =>
      prev.map((g) => ({
        ...g,
        operations: g.operations?.map((op) => ({ ...op, isAccess: checked })),
      })),
    );
  };

  // Filter by keyword (search ở module name + operation name + code)
  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    if (!kw) return groups;
    return groups
      .map((g) => {
        const moduleMatch = g.moduleName?.toLowerCase().includes(kw);
        const ops = (g.operations ?? []).filter(
          (op) =>
            moduleMatch ||
            op.name?.toLowerCase().includes(kw) ||
            op.code?.toLowerCase().includes(kw),
        );
        return { ...g, operations: ops };
      })
      .filter((g) => (g.operations?.length ?? 0) > 0);
  }, [groups, keyword]);

  // Stats
  const total = useMemo(
    () => groups.reduce((sum, g) => sum + (g.operations?.length ?? 0), 0),
    [groups],
  );
  const selected = useMemo(
    () =>
      groups.reduce(
        (sum, g) =>
          sum + (g.operations?.filter((op) => op.isAccess).length ?? 0),
        0,
      ),
    [groups],
  );

  const allChecked = total > 0 && selected === total;
  const someChecked = selected > 0 && selected < total;

  const handleSave = async () => {
    setSaving(true);
    try {
      const listOperation: OperationIdRequestType[] = [];
      groups.forEach((g) => {
        g.operations?.forEach((op) => {
          listOperation.push({
            operationId: op.id ?? "",
            isAccess: op.isAccess ? 1 : 0,
          });
        });
      });

      const payload: RoleOperationRequestType = {
        roleId,
        listOperationRequest: listOperation,
      };
      const res = await roleOperationService.create(payload);
      if (res.status) {
        message.success("Cập nhật quyền thành công");
        onClose();
      } else {
        message.error(res.message ?? "Cập nhật thất bại");
      }
    } catch (e: any) {
      message.error("Có lỗi xảy ra: " + e?.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Drawer
      title="Phân quyền cho vai trò"
      width={"calc(100vw - 200px)"}
      open={isOpen}
      onClose={onClose}
      destroyOnClose
      extra={
        <Space>
          <Button onClick={onClose}>Hủy</Button>
          <Button type="primary" loading={saving} onClick={handleSave}>
            Lưu lại
          </Button>
        </Space>
      }
    >
      <Spin spinning={loading}>
        {/* Toolbar */}
        <div className="mb-3 flex items-center gap-3">
          <Input
            allowClear
            prefix={<SearchOutlined className="text-gray-400" />}
            placeholder="Tìm theo tên module / quyền..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            style={{ flex: 1 }}
          />
          <Tag color="blue" style={{ margin: 0 }}>
            Đã chọn: {selected}/{total}
          </Tag>
        </div>

        {/* Master select-all */}
        <div className="mb-3 px-3 py-2 bg-gray-50 rounded border border-gray-200">
          <Checkbox
            checked={allChecked}
            indeterminate={someChecked}
            onChange={(e) => toggleAll(e.target.checked)}
          >
            <span className="font-semibold">Chọn tất cả</span>
          </Checkbox>
        </div>

        {/* Module cards */}
        {filtered.length === 0 ? (
          <Empty description="Không có dữ liệu" />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 items-start">
            {filtered.map((g) => {
              const ops = g.operations ?? [];
              const checkedCount = ops.filter((op) => op.isAccess).length;
              const allOn = ops.length > 0 && checkedCount === ops.length;
              const someOn = checkedCount > 0 && checkedCount < ops.length;

              return (
                <Card
                  key={g.moduleId}
                  size="small"
                  title={
                    <div className="flex items-center justify-between">
                      <Checkbox
                        checked={allOn}
                        indeterminate={someOn}
                        onChange={(e) =>
                          toggleModule(g.moduleCode, e.target.checked)
                        }
                      >
                        <span className="font-semibold">{g.moduleName}</span>
                      </Checkbox>
                      <Badge
                        count={`${checkedCount}/${ops.length}`}
                        style={{
                          backgroundColor: allOn
                            ? "#52c41a"
                            : checkedCount > 0
                              ? "#0355a2"
                              : "#bfbfbf",
                        }}
                      />
                    </div>
                  }
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {ops.map((op) => (
                      <Checkbox
                        key={op.id}
                        checked={!!op.isAccess}
                        onChange={(e) =>
                          toggleOne(
                            g.moduleCode,
                            op.id ?? "",
                            e.target.checked,
                          )
                        }
                      >
                        <span>{op.name}</span>
                        {op.code && (
                          <Tag color="default" className="ml-2 text-xs">
                            {op.code}
                          </Tag>
                        )}
                      </Checkbox>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </Spin>
    </Drawer>
  );
};

export default EditRoleOperation;
