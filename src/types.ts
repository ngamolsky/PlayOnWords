import { User as ModelUser } from "./pages/api/models/User";
import { NextApiRequest, NextApiResponse } from "next";
import { Session } from "express-session";

export type MyContext = {
  fs: FirebaseFirestore.Firestore;
  req: XWordRequest;
  res: NextApiResponse;
};

declare global {
  namespace Express {
    interface User extends ModelUser {}
  }
}

export interface XWordRequest extends NextApiRequest {
  user?: ModelUser;

  login(user: ModelUser, done: (err: any) => void): void;
  login(user: ModelUser, options: any, done: (err: any) => void): void;
  logIn(user: ModelUser, done: (err: any) => void): void;
  logIn(user: ModelUser, options: any, done: (err: any) => void): void;

  logout(): void;
  logOut(): void;

  isAuthenticated(): this is AuthenticatedRequest;
  isUnauthenticated(): this is UnauthenticatedRequest;

  session?: Session;
}

interface AuthenticatedRequest extends NextApiRequest {
  user: ModelUser;
}

interface UnauthenticatedRequest extends NextApiRequest {
  user?: undefined;
}
