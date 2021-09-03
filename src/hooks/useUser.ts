import firebase from "firebase/app";
import { useContext } from "react";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { USERS_COLLECTION } from "../constants";
import UserContext from "../contexts/UserContext";
import { User } from "../models/User";

const useUser = (): [
  User | undefined,
  boolean,
  firebase.auth.Error | undefined
] => {
  const { firebaseUser, authError } = useContext(UserContext);
  const [userData, userLoading] = useCollectionData<User>(
    firebase
      .firestore()
      .collection(USERS_COLLECTION)
      .where("firebaseAuthID", "==", firebaseUser?.uid)
  );

  let user: User | undefined;
  if (!userLoading) {
    if (!userData) {
      throw new Error(`No user found for firebase ID: ${firebaseUser?.uid}`);
    } else if (userData.length > 1) {
      throw new Error(
        `More than one user found for firebase ID: ${firebaseUser?.uid}`
      );
    } else {
      user = userData[0];
    }
  }

  return [user, userLoading, authError];
};
export default useUser;
