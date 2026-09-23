import { createConstant } from "./Constant";

const ConstractGroupCodeConstant = createConstant(
  {
    AuthContractCategoryCode: "AuthContractCategoryCode",
    NgonNgu: "NgonNgu",
    OSCODE: "OSCODE",
    DVCCHOSTING: "DVCCHOSTING",
  } as const,
  {
    AuthContractCategoryCode: { displayName: "" },
    NgonNgu: { displayName: "" },
    OSCODE: { displayName: "" },
    DVCCHOSTING: { displayName: "" },
  }
);

export default ConstractGroupCodeConstant;
