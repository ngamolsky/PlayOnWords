import {
  onAuthStateChanged,
  signInAnonymously,
  signOut as firebaseSignOut,
  Unsubscribe,
} from "firebase/auth";
import {
  collection,
  query,
  where,
  onSnapshot,
  FirestoreDataConverter,
  documentId,
  doc,
  setDoc,
  getDoc,
  Timestamp,
  deleteDoc,
  getDocs,
} from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import { auth, db } from "../config/firebase";
import { USERS_COLLECTION } from "../constants";
import { UserContext } from "../contexts/UserContext";
import { ManyUserFoundForFirebaseIDError } from "../errors";

export type User = {
  email?: string;
  username: string;
  displayName?: string;
  firebaseAuthID: string;
  loginType: LoginType;
  createDate: Timestamp;
};

export enum LoginType {
  BASIC = "basic",
  ANONYMOUS = "anonymous",
  GOOGLE = "google",
}

export const getUserByID = async (
  firebaseAuthID: string
): Promise<User | undefined> => {
  const userDocument = await getDoc(
    doc(db, USERS_COLLECTION, firebaseAuthID).withConverter(userConverter)
  );

  return userDocument.data();
};

export const createBasicUser = async (username: string): Promise<User> => {
  console.log(`createBasicUser: Creating anonymous user: ${username}`);

  const anonymousUser = await signInAnonymously(auth);

  console.log(`createBasicUser: Created anonymousUser: ${anonymousUser}`);

  const user: User = {
    username,
    firebaseAuthID: anonymousUser.user.uid,
    loginType: LoginType.ANONYMOUS,
    createDate: Timestamp.now(),
  };
  await setDoc(doc(db, USERS_COLLECTION, anonymousUser.user.uid), user);
  console.log(`createBasicUser: Created user: ${user}`);
  return user;
};

export const signOut = async (firebaseAuthID: string) => {
  // Delete the user
  await deleteDoc(doc(db, USERS_COLLECTION, firebaseAuthID));

  return firebaseSignOut(auth);
};

//#region Hooks

export const useAuth = (): [User | undefined, boolean] => {
  const [userState, setUserState] = useState<{
    user: User | undefined;
    userLoading: boolean;
  }>({
    user: undefined,
    userLoading: true,
  });

  useEffect(() => {
    let snapshotUnsub: Unsubscribe;

    const authUnsub = onAuthStateChanged(auth, (authUser) => {
      if (authUser) {
        const q = query(
          collection(db, USERS_COLLECTION).withConverter(userConverter),
          where("firebaseAuthID", "==", authUser.uid)
        );

        console.log(
          `useAuth: Querying Users Collection for User with firebaseAuthID: ${authUser.uid}`
        );
        snapshotUnsub = onSnapshot(q, (querySnapshot) => {
          if (authUser) {
            const users: User[] = [];
            querySnapshot.forEach((doc) => {
              users.push(doc.data());
            });
            if (!users) {
              throw new Error(`No user found for firebase ID: ${authUser.uid}`);
            } else if (users.length > 1) {
              throw ManyUserFoundForFirebaseIDError(authUser.uid);
            } else {
              const user = users[0];
              console.log(
                `useAuth: Updating UserState: ${JSON.stringify({
                  user,
                  userLoading: false,
                })}`
              );

              setUserState({
                user,
                userLoading: false,
              });
            }
          }
        });
      } else {
        // If we are signed out, remove the snapshot
        if (snapshotUnsub) {
          snapshotUnsub();
        }

        console.log(
          `useAuth: Updating UserState: ${JSON.stringify({
            user: undefined,
            userLoading: false,
          })}`
        );
        setUserState({
          user: undefined,
          userLoading: false,
        });
      }
    });

    return authUnsub;
  }, []);

  return [userState.user, userState.userLoading];
};

export const getUsersByID = async (
  userIDs: string[] | undefined
): Promise<User[]> => {
  const q = query(
    collection(db, USERS_COLLECTION).withConverter(userConverter),
    where(documentId(), "in", userIDs)
  );

  const results = await getDocs(q);

  const users = results.docs.map((result) => result.data());

  return users;
};

export const useUsersByID = (userIDs: string[] | undefined): User[] => {
  const [userState, setUserState] = useState<User[]>([]);

  console.log(userIDs);

  useEffect(() => {
    if (userIDs) {
      const q = query(
        collection(db, USERS_COLLECTION).withConverter(userConverter),
        where(documentId(), "in", userIDs)
      );

      console.log(
        `useUsersByID: Watching Users Collection for Users with IDs: ${userIDs}`
      );
      const unsub = onSnapshot(q, (querySnapshot) => {
        const users: User[] = [];
        querySnapshot.docs.forEach((doc) => {
          users.push(doc.data());
        });
        console.log(
          `useUsersByID: Setting userState: ${JSON.stringify(users)}`
        );
        setUserState(users);
      });
      return unsub;
    }
  }, [userIDs]);

  return userState;
};

export const useLoggedInUser = (): User => {
  const [user] = useContext(UserContext);
  if (user === undefined) {
    throw new Error("useLoggedInUser used without a valid user");
  }

  return user;
};
//#endregion

export const userConverter: FirestoreDataConverter<User> = {
  fromFirestore: (snapshot) => snapshot.data() as User,
  toFirestore: (user: User) => user,
};
