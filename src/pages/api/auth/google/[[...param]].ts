import nextConnect from "next-connect";
import passport from "../../config/passport";
import { NextApiResponse } from "next";
import { withOptions } from "../../middleware/withOptions";
import { XWordRequest } from "../../../../types";
import { withPassport } from "../../middleware/withPassport";

const googleAuthHandler = nextConnect<XWordRequest, NextApiResponse>(
  withOptions(true)
);

googleAuthHandler.use(withPassport);

googleAuthHandler.get((req, res, next) => {
  if (req.query.param && req.query.param.includes("callback")) {
    passport.authenticate("google", { successRedirect: "/" })(req, res, next);
  } else {
    passport.authenticate("google", { scope: ["email", "profile"] })(
      req,
      res,
      next
    );
  }
});

export default googleAuthHandler;
