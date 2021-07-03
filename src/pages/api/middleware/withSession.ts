import expressSession from "express-session";
import { NextApiRequest, NextApiResponse } from "next";
import nextConnect from "next-connect";
import { COOKIE_NAME, __prod__ } from "../../../constants";
import { FirestoreStore } from "@google-cloud/connect-firestore";
import firebase from "../config/firebase";

export const withSession = nextConnect<NextApiRequest, NextApiResponse>();

const session = expressSession({
  name: COOKIE_NAME,
  store: new FirestoreStore({
    dataset: firebase,
    kind: "express-sessions",
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 5, // 5 days
    httpOnly: true,
    sameSite: "lax",
    secure: __prod__,
  },
  saveUninitialized: false,
  secret: "fsgfdgslfkgjlsfkdjglsfkdj",
  resave: false,
  proxy: true,
});

withSession.use(session);
