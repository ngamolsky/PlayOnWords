import firebase from "firebase/app";
import { v4 } from "uuid";
import { USERS_COLLECTION } from "../constants";

export enum LoginType {
  EMAIL = "email",
  GOOGLE = "google",
}

export type User = {
  userID: string;
  email: string;
  username?: string;
  displayName?: string;
  firebaseAuthID: string;
  loginType: LoginType;
  createDate: Date;
};

export const fromFirebaseAuthUser = (firebaseUser: firebase.User): User => {
  const userID = `user.${v4()}`;

  return {
    userID,
    email: firebaseUser.email!,
    displayName: firebaseUser.displayName
      ? firebaseUser.displayName
      : undefined,
    createDate: new Date(firebaseUser.metadata.creationTime!),
    loginType:
      firebaseUser.providerData[0]!.providerId === "google.com"
        ? LoginType.GOOGLE
        : LoginType.EMAIL,
    firebaseAuthID: firebaseUser.uid,
  };
};

export const userActions = {
  signOut: async () => {
    return firebase.auth().signOut();
  },
  createEmailUser: async (email: string, password: string): Promise<User> => {
    const { user: firebaseUser } = await firebase
      .auth()
      .createUserWithEmailAndPassword(email, password);
    const user: User = {
      userID: `user.${v4()}`,
      firebaseAuthID: firebaseUser!.uid,
      email,
      loginType: LoginType.EMAIL,
      createDate: new Date(),
    };
    await firebase.firestore().collection(USERS_COLLECTION).add(user);

    return user;
  },
  loginEmailUser: async (email: string, password: string): Promise<void> => {
    await firebase.auth().signInWithEmailAndPassword(email, password);
  },
  createOrLoginGoogleUser: async (): Promise<User> => {
    const googleAuthProvider = new firebase.auth.GoogleAuthProvider();
    const { user: firebaseUser } = await firebase
      .auth()
      .signInWithPopup(googleAuthProvider);

    let user: User;
    if (firebaseUser) {
      user = fromFirebaseAuthUser(firebaseUser);

      const userResult = await firebase
        .firestore()
        .collection(USERS_COLLECTION)
        .where("firebaseAuthID", "==", firebaseUser.uid)
        .get();

      if (userResult.docs.length === 0) {
        await firebase
          .firestore()
          .collection(USERS_COLLECTION)
          .doc(user.userID)
          .set(user);
      } else if (userResult.docs.length > 1) {
        throw Error(
          `Found more than one user with firebaseAuthID: ${firebaseUser.uid}`
        );
      } else {
        const firstResult = userResult.docs[0].data();
        user = {
          userID: firstResult.userID,
          firebaseAuthID: firstResult.firebaseAuthID,
          displayName: firstResult.displayName,
          email: firstResult.email,
          loginType: firstResult.loginType,
          createDate: firstResult.createDate.toDate(),
        };
      }
    }

    return user!;
  },
  getUserByFirebaseAuthID: async (
    firebaseAuthID: string
  ): Promise<User | undefined> => {
    const userResult = await firebase
      .firestore()
      .collection(USERS_COLLECTION)
      .where("firebaseAuthID", "==", firebaseAuthID)
      .get();

    if (userResult.docs.length === 0) return;
    if (userResult.docs.length > 1) {
      throw Error(
        `Found more than one user with firebaseAuthID: ${firebaseAuthID}`
      );
    }

    const firstResult = userResult.docs[0].data();
    return {
      userID: firstResult.userID,
      firebaseAuthID: firstResult.firebaseAuthID,
      displayName: firstResult.displayName,
      email: firstResult.email,
      loginType: firstResult.loginType,
      createDate: firstResult.createDate.toDate(),
    };
  },
};
