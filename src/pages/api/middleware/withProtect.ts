import { NextApiResponse } from "next";
import nextConnect from "next-connect";
import passport from "passport";
import { __prod__ } from "../../../constants";
import { XWordRequest } from "../../../types";
import { withPassport } from "./withPassport";

export const withProtect = nextConnect<XWordRequest, NextApiResponse>();
withProtect.use(withPassport);
withProtect.use(passport.initialize());
withProtect.use((req, res, next) => {
  if (req.isAuthenticated!()) {
    next();
  } else {
    res.redirect("/login");
  }
});
