import { createContext } from "react";
import { User } from "../models/User";

type UserContextType = {
  user: User | undefined;
  userLoading: boolean;
};

export const UserContext = createContext<UserContextType>({
  user: undefined,
  userLoading: true,
});
