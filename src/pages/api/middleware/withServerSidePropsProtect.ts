import { NextApiResponse } from "next";
import { XWordRequest } from "../../../types";
import { User } from "../models/User";
import { withPassport } from "./withPassport";

export const withServerSidePropsProtect = async (
  req: XWordRequest,
  res: NextApiResponse
) => {
  await withPassport.run(req, res);
  const user = req.user;
  if (!user) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  let userWithFixedDate: User = {
    ...user,
    createDate: JSON.parse(JSON.stringify(user.createDate)),
    updateDate: JSON.parse(JSON.stringify(user.createDate)),
  };

  return {
    props: {
      user: userWithFixedDate,
    },
  };
};
