import { ModuleType } from "@/types/module/dto";
import { Drawer } from "antd";

interface UserViewProps {
  user?: ModuleType | null;
  isOpen: boolean;
  onClose: () => void;
}

const ConfigureOperation: React.FC<UserViewProps> = () => {
  return (
    <Drawer
      title={`Phân quyền vai trò`}
      width="80%"
      placement="right"
      //   onClose={onClose}
      closable={true}
      //   open={isOpen}
    ></Drawer>
  );
};

export default ConfigureOperation;
