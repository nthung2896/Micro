import { createConstant } from "./Constant";

const UserConstant = createConstant(
  {
    DefaultPassword: "DefaultPassword",
  } as const,
  {
    DefaultPassword: { displayName: "Mật khẩu mặc định" },
  }
);

export default UserConstant;
