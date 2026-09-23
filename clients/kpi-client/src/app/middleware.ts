import { NextApiRequest, NextApiResponse } from "next";

const middleware = (
  handler: (req: NextApiRequest, res: NextApiResponse) => void,
) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    console.log("Middleware executed");
    return handler(req, res);
  };
};

export default middleware;
