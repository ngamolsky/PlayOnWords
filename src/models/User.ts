import firebase from "firebase/app";
import { USERS_COLLECTION } from "../constants";
import { v4 } from "uuid";

export enum LoginType {
  EMAIL = "email",
  GOOGLE = "google",
}

export type User = {
  email: string;
  username?: string;
  displayName?: string;
  googleID?: string;
  loginType: LoginType;
  createDate: Date;
};

export const fromFirebaseAuthUser = (firebaseUser: firebase.User): User => {
  return {
    email: firebaseUser.email!,
    displayName: firebaseUser.displayName
      ? firebaseUser.displayName
      : undefined,
    createDate: new Date(firebaseUser.metadata.creationTime!),
    loginType:
      firebaseUser.providerData[0]!.providerId === "google.com"
        ? LoginType.GOOGLE
        : LoginType.EMAIL,
    googleID:
      firebaseUser.providerData[0]!.providerId === "google.com"
        ? firebaseUser.uid
        : undefined,
  };
};

export type UserActions = {
  signOut(): Promise<void>;
  createEmailUser(email: string, password: string): Promise<User>;
  createOrLoginGoogleUser(): Promise<User>;
};

export const userActions: UserActions = {
  signOut: async () => {
    return firebase.auth().signOut();
  },
  createEmailUser: async (email, password) => {
    const user = {
      email,
      loginType: LoginType.EMAIL,
      createDate: new Date(),
    };
    await firebase.auth().createUserWithEmailAndPassword(email, password);
    await firebase
      .firestore()
      .collection(USERS_COLLECTION)
      .doc(`user.${v4()}`)
      .set(user);

    return user;
  },
  createOrLoginGoogleUser: async () => {
    const googleAuthProvider = new firebase.auth.GoogleAuthProvider();
    const { user: firebaseUser } = await firebase
      .auth()
      .signInWithPopup(googleAuthProvider);

    let user: User;
    if (firebaseUser) {
      user = fromFirebaseAuthUser(firebaseUser);

      await firebase
        .firestore()
        .collection(USERS_COLLECTION)
        .doc(`user.${v4()}`)
        .set(user);
    }

    return user!;
  },
};
