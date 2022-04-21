import { Timestamp } from "firebase-admin/firestore";

import db from "../config/firebase";

export type User = {
  userID: string;
  email?: string;
  username: string;
  displayName?: string;
  firebaseAuthID: string;
  loginType: LoginType;
  createDate: Timestamp;
  isOnline?: boolean;
};

export enum LoginType {
  PASSWORD = "password",
  ANONYMOUS = "anonymous",
  GOOGLE = "google",
}

const USERS_COLLECTION = "users";

export const setUserOnlineStatus = async (
  user: User,
  isOnline: boolean
): Promise<void> => {
  await db
    .collection(USERS_COLLECTION)
    .withConverter(userConverter)
    .doc(user.userID)
    .update({
      isOnline,
    });
};

export const getUserByFirebaseAuthUserId = async (
  firebaseAuthID: string
): Promise<User> => {
  const snapshot = await db
    .collection(USERS_COLLECTION)
    .withConverter(userConverter)
    .where("firebaseAuthID", "==", firebaseAuthID)
    .get();

  const users: User[] = [];
  snapshot.forEach((doc) => {
    users.push(doc.data());
  });

  if (!users) {
    throw new Error(`No user found for firebase auth ID: ${firebaseAuthID}`);
  } else if (users.length > 1) {
    throw new Error(
      `More than one user found for firebase auth ID: ${firebaseAuthID}`
    );
  } else {
    const user = users[0];
    return user;
  }
};


export const getUserByID = async (userID: string): Promise<User> => {
  const snapshot = await db
    .collection(USERS_COLLECTION)
    .doc(userID)
    .withConverter(userConverter)
    .get();

  const user = snapshot.data();

  if (!user) {
    throw new Error(`No user found for userID: ${userID}`);
  } else {
    return user;
  }
};

export const userConverter = {
  toFirestore(user: User): User {
    return user;
  },
  fromFirestore(snapshot: FirebaseFirestore.QueryDocumentSnapshot<User>): User {
    const data = snapshot.data();
    return data;
  },
};
