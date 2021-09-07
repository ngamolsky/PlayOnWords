import firebase from "firebase/app";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { USERS_COLLECTION } from "../constants";
import { User, userConverter } from "../models/User";

const useUser = (): [User | undefined, boolean] => {
  const auth = firebase.auth();
  const [firebaseUser, authLoading] = useAuthState(auth);
  const [userState, setUserState] = useState<{
    user: User | undefined;
    userLoading: boolean;
  }>({
    user: undefined,
    userLoading: true,
  });

  useEffect(() => {
    if (authLoading) return;

    if (firebaseUser) {
      const unsubscribe = firebase
        .firestore()
        .collection(USERS_COLLECTION)
        .where("firebaseAuthID", "==", firebaseUser.uid)
        .withConverter(userConverter)
        .onSnapshot((snapshot) => {
          const usersData = snapshot.docs;
          if (!usersData) {
            throw new Error(
              `No user found for firebase ID: ${firebaseUser.uid}`
            );
          } else if (usersData.length > 1) {
            throw new Error(
              `More than one user found for firebase ID: ${firebaseUser.uid}`
            );
          } else {
            const userData = usersData[0].data();

            setUserState({
              user: userData,
              userLoading: false,
            });
          }
        });
      return unsubscribe;
    } else {
      setUserState({
        user: undefined,
        userLoading: false,
      });
    }
  }, [firebaseUser, authLoading]);

  return [userState?.user, userState?.userLoading];
};
export default useUser;
