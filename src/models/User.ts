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
  activeSessionIDs: string[];
};

// User Actions
export const getUserIDFromFirebaseAuthUser = async (
  firebaseUser: firebase.User
): Promise<string | undefined> => {
  const userResult = await firebase
    .firestore()
    .collection(USERS_COLLECTION)
    .where("firebaseAuthID", "==", firebaseUser.uid)
    .get();

  if (userResult.docs.length === 0) return;
  if (userResult.docs.length > 1) {
    throw Error(
      `Found more than one user with firebaseAuthID: ${firebaseUser.uid}`
    );
  }

  const firstResult = userResult.docs[0].data();
  return firstResult.userID;
};

export const listenForUserChanges = (
  userID: string,
  callback: (user: User | undefined) => void
) => {
  const unsubscribe = firebase
    .firestore()
    .collection(USERS_COLLECTION)
    .doc(userID)
    .onSnapshot((userResult) => {
      const userData = userResult.data();
      if (userData) {
        let user: User = {
          userID: userData.userID,
          email: userData.email,
          createDate: userData.createDate.toDate(),
          loginType: userData.loginType,
          firebaseAuthID: userData.firebaseAuthID,
          activeSessionIDs: userData.activeSessionIDs,
        };

        if (userData.displayName) {
          user.displayName = userData.displayName;
        }

        if (userData.username) {
          user.username = userData.username;
        }
        callback(user);
      }
    });
  return unsubscribe;
};

export const createOrLoginGoogleUser = async (): Promise<string> => {
  const googleAuthProvider = new firebase.auth.GoogleAuthProvider();
  const { user: firebaseUser } = await firebase
    .auth()
    .signInWithPopup(googleAuthProvider);

  let userID: string | undefined;
  if (firebaseUser) {
    userID = await getUserIDFromFirebaseAuthUser(firebaseUser);
    if (!userID) {
      userID = `user.${v4()}`;
      const user = {
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
        activeSessionIDs: [],
      };
      await firebase
        .firestore()
        .collection(USERS_COLLECTION)
        .doc(user.userID)
        .set(user);
    }
  }
  return userID!;
};

export const createEmailUser = async (
  email: string,
  password: string
): Promise<User> => {
  const { user: firebaseUser } = await firebase
    .auth()
    .createUserWithEmailAndPassword(email, password);
  const user: User = {
    userID: `user.${v4()}`,
    firebaseAuthID: firebaseUser!.uid,
    email,
    loginType: LoginType.EMAIL,
    createDate: new Date(),
    activeSessionIDs: [],
  };
  await firebase
    .firestore()
    .collection(USERS_COLLECTION)
    .doc(user.userID)
    .set(user);

  return user;
};

export const loginEmailUser = async (email: string, password: string) => {
  // Sign in using firebase
  await firebase.auth().signInWithEmailAndPassword(email, password);
};

export const signOut = async () => {
  return firebase.auth().signOut();
};

export const userConverter: firebase.firestore.FirestoreDataConverter<User> = {
  fromFirestore: (snapshot) => {
    const userData = snapshot.data();
    const user: User = {
      userID: userData.userID,
      email: userData.email,
      createDate: userData.createDate.toDate(),
      loginType: userData.loginType,
      firebaseAuthID: userData.firebaseAuthID,
      activeSessionIDs: userData.activeSessionIDs,
    };

    if (userData.displayName) {
      user.displayName = userData.displayName;
    }
    return user;
  },
  toFirestore: (user) => user,
};
