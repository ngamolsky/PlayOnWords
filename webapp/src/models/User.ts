import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  User as FirebaseUser,
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
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { v4 } from "uuid";
import { auth, db } from "../config/firebase";
import { USERS_COLLECTION } from "../constants";

export type User = {
  userID: string;
  email: string;
  username?: string;
  displayName?: string;
  firebaseAuthID: string;
  loginType: LoginType;
  createDate: Timestamp;
  activeSessionIDs: string[];
};

export enum LoginType {
  EMAIL = "email",
  GOOGLE = "google",
}

export const getUserIDFromFirebaseAuthUser = async (
  firebaseUser: FirebaseUser
): Promise<string | undefined> => {
  console.log(
    `getUserIDFromFirebaseAuthUser: getting User for ${firebaseUser}`
  );

  const q = query(
    collection(db, USERS_COLLECTION).withConverter(userConverter),
    where("firebaseAuthID", "==", firebaseUser.uid)
  );

  const userResult = await getDocs(q);

  if (userResult.docs.length === 0) {
    console.log(
      `getUserIDFromFirebaseAuthUser: No user found for firebaseUser: ${firebaseUser}`
    );
  }
  if (userResult.docs.length > 1) {
    throw Error(
      `Found more than one user with firebaseAuthID: ${firebaseUser.uid}`
    );
  }

  const firstResult = userResult.docs[0].data();
  return firstResult.userID;
};

export const createOrLoginGoogleUser = async (): Promise<string> => {
  console.log(`createOrLoginGoogleUser: Creating/loging in google user`);

  const googleAuthProvider = new GoogleAuthProvider();
  const { user: firebaseUser } = await signInWithPopup(
    auth,
    googleAuthProvider
  );

  console.log(`createOrLoginGoogleUser: got firebase User: ${firebaseUser}`);

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

      await setDoc(doc(db, USERS_COLLECTION, user.userID), user);
      console.log(`createOrLoginGoogleUser: Created user: ${user}`);
    } else {
      console.log(`createOrLoginGoogleUser: User already exists: ${userID}`);
    }
  }
  return userID!;
};

export const createEmailUser = async (
  email: string,
  password: string
): Promise<User> => {
  console.log(`createEmailUser: Creating email user: ${email}`);

  const { user: firebaseUser } = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
  console.log(`createEmailUser: Created firebaseUser: ${firebaseUser}`);

  const user: User = {
    userID: `user.${v4()}`,
    firebaseAuthID: firebaseUser.uid,
    email,
    loginType: LoginType.EMAIL,
    createDate: Timestamp.now(),
    activeSessionIDs: [],
  };
  await setDoc(doc(db, USERS_COLLECTION, user.userID), user);
  console.log(`createEmailUser: Created user: ${user}`);
  return user;
};

export const loginEmailUser = async (email: string, password: string) => {
  console.log(`loginEmailUser: ${email}`);
  return signInWithEmailAndPassword(auth, email, password);
};

export const signOut = async () => {
  console.log("signOut");
  return firebaseSignOut(auth);
};

//#region Hooks

export const useCurrentUser = (): [User | undefined, boolean] => {
  const [userState, setUserState] = useState<{
    user: User | undefined;
    userLoading: boolean;
  }>({
    user: undefined,
    userLoading: true,
  });

  useEffect(() => {
    console.log("Use Effect Running");
    const unsub = onAuthStateChanged(auth, (authUser) => {
      if (authUser) {
        const q = query(
          collection(db, USERS_COLLECTION).withConverter(userConverter),
          where("firebaseAuthID", "==", authUser.uid)
        );

        console.log(
          `useCurrentUser: Querying Users Collection for User with firebaseAuthID: ${authUser.uid}`
        );
        const unsub = onSnapshot(q, (querySnapshot) => {
          if (authUser) {
            const users: User[] = [];
            querySnapshot.forEach((doc) => {
              users.push(doc.data());
            });
            if (!users) {
              throw new Error(`No user found for firebase ID: ${authUser.uid}`);
            } else if (users.length > 1) {
              throw new Error(
                `More than one user found for firebase ID: ${authUser.uid}`
              );
            } else {
              const user = users[0];
              console.log(
                `useCurrentUser: Updating UserState: ${JSON.stringify({
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

        return unsub;
      } else {
        console.log(
          `useCurrentUser: Updating UserState: ${JSON.stringify({
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

    return unsub;
  }, []);

  return [userState.user, userState.userLoading];
};

export const useUsersByID = (userIDs: string[] | undefined): User[] => {
  const [userState, setUserState] = useState<User[]>([]);

  useEffect(() => {
    if (userIDs) {
      const q = query(
        collection(db, USERS_COLLECTION).withConverter(userConverter),
        where(documentId(), "in", userIDs)
      );

      console.log(
        `useUsersByID: Querying Users Collection for Users with IDs: ${userIDs}`
      );
      const unsub = onSnapshot(q, (querySnapshot) => {
        const users: User[] = [];
        querySnapshot.forEach((doc) => {
          users.push(doc.data());
        });
        console.log(`useUsersByID: Setting userState: ${userState}`);
        setUserState(users);
      });
      return unsub();
    }
  }, [userIDs, userState]);

  return userState;
};
//#endregion

const userConverter: FirestoreDataConverter<User> = {
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

    if (userData.username) {
      user.username = userData.username;
    }
    return user;
  },
  toFirestore: (user) => user,
};
