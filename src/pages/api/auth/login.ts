import { NextApiResponse } from "next";
import nextConnect from "next-connect";
import passport from "../config/passport";
import { withOptions } from "../middleware/withOptions";
import { XWordRequest } from "../../../types";
import { withPassport } from "../middleware/withPassport";
import { XWordErrors } from "../models/XWordError";

const authHandler = nextConnect<XWordRequest, NextApiResponse>(withOptions());
authHandler.use(withPassport);
authHandler.post(
  (req, _, next) => {
    const { password } = req.body;
    if (!password) {
      throw XWordErrors.PASSWORD_TOO_SHORT;
    }
    next();
  },
  passport.authenticate("local", {
    failWithError: true,
  }),
  (_, res) => {
    res.status(200).end();
  }
);

export default authHandler;
