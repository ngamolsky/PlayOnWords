import { createContext } from "react";
import { User } from "../models/User";

type UserContextType = [User | undefined, boolean];

export const UserContext = createContext<UserContextType>([undefined, true]);
