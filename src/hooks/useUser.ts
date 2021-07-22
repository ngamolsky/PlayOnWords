import firebase from "firebase/app";
import { useAuthState } from "react-firebase-hooks/auth";
import { LoginType, User } from "../models/User";

const useUser = (): [
  User | undefined,
  boolean,
  firebase.auth.Error | undefined
] => {
  const [firebaseUser, loading, error] = useAuthState(firebase.auth());
  const user: User | undefined = firebaseUser
    ? {
        userID: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName: firebaseUser.displayName
          ? firebaseUser.displayName
          : undefined,
        createDate: new Date(firebaseUser.metadata.creationTime!),
        loginType:
          firebaseUser.providerId === "google.com"
            ? LoginType.GOOGLE
            : LoginType.LOCAL,
      }
    : undefined;

  return [user, loading, error];
};

export default useUser;
