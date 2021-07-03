import { NextApiResponse } from "next";
import nextConnect from "next-connect";
import { XWordRequest } from "../../../types";
import { withOptions } from "../middleware/withOptions";
import { withPassport } from "../middleware/withPassport";

const logoutHandler = nextConnect<XWordRequest, NextApiResponse>(withOptions());
logoutHandler.use(withPassport);

logoutHandler.post(async (req, res) => {
  req.session?.destroy(() => {
    req.logOut!();
    res.status(200).end();
  });
});

export default logoutHandler;
