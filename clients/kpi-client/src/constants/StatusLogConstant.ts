import { createConstant } from "./Constant";

const StatusLogConstant = createConstant(
  {
    SUCCESS: "SUCCESS",
    FAILURE: "FAILURE",
  } as const,
  {
    SUCCESS: { displayName: "" },
    FAILURE: { displayName: "" },
  }
);

export default StatusLogConstant;
