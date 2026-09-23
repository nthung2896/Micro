import { createConstant } from "./Constant";

const TypeOrganizationConstant = createConstant(
  {
    Company: "Company",
    Personal: "Personal",
    Organization: "Organization",
  } as const,
  {
    Company: { displayName: "Doanh nghiệp" },
    Personal: { displayName: "Cá nhân" },
    Organization: { displayName: "Tổ chức" },
  }
);

export default TypeOrganizationConstant;
