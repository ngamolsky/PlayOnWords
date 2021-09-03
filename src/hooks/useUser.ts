import firebase from "firebase/app";
import { useContext, useEffect, useState } from "react";
import UserContext from "../contexts/UserContext";
import {
  getUserIDFromFirebaseAuthUser,
  listenForUserChanges,
  User,
} from "../models/User";

const useUser = (): [
  User | undefined,
  boolean,
  firebase.auth.Error | undefined
] => {
  const { firebaseUser, authLoading, authError } = useContext(UserContext);
  const [userID, setUserID] = useState<string>();
  const [{ user, userLoading }, setUserState] = useState<{
    user: User | undefined;
    userLoading: boolean;
  }>({
    user: undefined,
    userLoading: true,
  });

  useEffect(() => {
    const getUserIDFromAuthUser = async (firebaseUser: firebase.User) => {
      const userID = await getUserIDFromFirebaseAuthUser(firebaseUser);
      setUserID(userID);
    };

    if (authLoading) return;
    if (firebaseUser) {
      getUserIDFromAuthUser(firebaseUser);
    } else {
      setUserState({
        user: undefined,
        userLoading: false,
      });
    }
  }, [firebaseUser, authLoading]);

  useEffect(() => {
    let unsubscribe: () => void;
    if (userID) {
      unsubscribe = listenForUserChanges(userID, (user) => {
        setUserState({
          user,
          userLoading: false,
        });
      });
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [userID]);

  return [user, userLoading, authError];
};
export default useUser;
