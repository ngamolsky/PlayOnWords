import firebase from "firebase/app";
import { createContext } from "react";

const UserContext = createContext<
  Partial<{
    firebaseUser: firebase.User | undefined | null;
    authLoading: boolean;
    authError: firebase.auth.Error;
  }>
>({});

export default UserContext;
