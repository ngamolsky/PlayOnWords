import { NextApiResponse } from "next";
import nextConnect from "next-connect";
import passport from "../config/passport";
import { withSession } from "./withSession";
import { XWordRequest } from "../../../types";

export const withPassport = nextConnect<XWordRequest, NextApiResponse>();
withPassport.use(withSession);
withPassport.use(passport.initialize());
withPassport.use(passport.session());
