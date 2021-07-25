import firebase from "firebase/app";
import { useAuthState } from "react-firebase-hooks/auth";
import { fromFirebaseAuthUser, userActions, User } from "../models/User";

const useUser = (): [
  User | undefined,
  typeof userActions,
  boolean,
  firebase.auth.Error | undefined
] => {
  const auth = firebase.auth();
  const [firebaseUser, loading, error] = useAuthState(auth);

  const user: User | undefined = firebaseUser
    ? fromFirebaseAuthUser(firebaseUser)
    : undefined;

  return [user, userActions, loading, error];
};

export default useUser;
