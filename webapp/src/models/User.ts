import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  Unsubscribe,
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
import { useContext, useEffect, useState } from "react";
import { v4 } from "uuid";
import { auth, db } from "../config/firebase";
import { USERS_COLLECTION } from "../constants";
import { UserContext } from "../contexts/UserContext";

export type User = {
  userID: string;
  email: string;
  username?: string;
  displayName?: string;
  firebaseAuthID: string;
  loginType: LoginType;
  createDate: Timestamp;
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

    return undefined;
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
  console.log(`createOrLoginGoogleUser: Creating/logging in google user`);

  const googleAuthProvider = new GoogleAuthProvider();
  const { user: firebaseUser } = await signInWithPopup(
    auth,
    googleAuthProvider
  );

  console.log(`createOrLoginGoogleUser: got firebase User: ${firebaseUser}`);

  let userID: string | undefined;
  if (firebaseUser) {
    if (!firebaseUser.email) {
      throw new Error("No email set on firebaseUser");
    }

    if (!firebaseUser.metadata.creationTime) {
      throw new Error("No creatime time set on firebaseUser");
    }
    userID = await getUserIDFromFirebaseAuthUser(firebaseUser);
    if (!userID) {
      userID = `user.${v4()}`;
      const user: User = {
        userID,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName
          ? firebaseUser.displayName
          : undefined,
        createDate: Timestamp.fromDate(
          new Date(firebaseUser.metadata.creationTime)
        ),
        loginType:
          firebaseUser.providerData[0].providerId === "google.com"
            ? LoginType.GOOGLE
            : LoginType.EMAIL,
        firebaseAuthID: firebaseUser.uid,
      };

      await setDoc(doc(db, USERS_COLLECTION, user.userID), user);
      console.log(`createOrLoginGoogleUser: Created user: ${user}`);
    } else {
      console.log(`createOrLoginGoogleUser: User already exists: ${userID}`);
    }
  }
  if (!userID) {
    throw new Error("No user ID found");
  }
  return userID;
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
              throw new Error(
                `More than one user found for firebase ID: ${authUser.uid}`
              );
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
        // If we are signed out, remove the snapsho
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

export const useUsersByID = (userIDs: string[] | undefined): User[] => {
  const [userState, setUserState] = useState<User[]>([]);

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
