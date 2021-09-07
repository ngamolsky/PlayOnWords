import { createContext } from "react";
import { User } from "../models/User";

const UserContext = createContext<[User | undefined, boolean]>([
  undefined,
  true,
]);

export default UserContext;
