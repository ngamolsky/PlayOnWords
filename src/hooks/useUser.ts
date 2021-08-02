import firebase from "firebase/app";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { userActions, User } from "../models/User";

const useUser = (): [
  User | undefined,
  boolean,
  firebase.auth.Error | undefined
] => {
  const auth = firebase.auth();

  const [firebaseUser, authLoading, error] = useAuthState(auth);
  const [userLoading, setUserLoading] = useState(true);
  const [user, setUser] = useState<User | undefined>();
  const loading = authLoading || userLoading;

  useEffect(() => {
    const getUserByFirebaseAuthID = async () => {
      setUserLoading(true);
      if (!authLoading) {
        if (firebaseUser) {
          const existingUser = await userActions.getUserByFirebaseAuthID(
            firebaseUser.uid!
          );
          setUser(existingUser);
        } else {
          setUser(undefined);
        }

        setUserLoading(false);
      }
    };

    getUserByFirebaseAuthID();
  }, [authLoading, firebaseUser]);

  return [user, loading, error];
};
export default useUser;
