import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInAnonymously,
  signInWithPopup,
  signOut as firebaseSignOut,
  Unsubscribe,
} from "firebase/auth";
import { ref, onValue, onDisconnect, set } from "firebase/database";
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
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import { v4 } from "uuid";
import { auth, db, rtDb } from "../config/firebase";
import { USERS_COLLECTION } from "../constants";
import { UserContext } from "../contexts/UserContext";
import { ManyUserFoundForFirebaseIDError } from "../errors";
import { LOG_LEVEL, LOG_LEVEL_TYPES } from "../settings";

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

export const getUserByID = async (
  userID: string
): Promise<User | undefined> => {
  const userDocument = await getDoc(
    doc(db, USERS_COLLECTION, userID).withConverter(userConverter)
  );

  if (LOG_LEVEL == LOG_LEVEL_TYPES.DEBUG) {
    console.log("Firestore Request: getUserByID. UserID: ", userID);
  }

  return userDocument.data();
};

export const getUserByFirebaseAuthID = async (
  firebaseAuthID: string
): Promise<User | undefined> => {
  const q = query(
    collection(db, USERS_COLLECTION).withConverter(userConverter),
    where("firebaseAuthID", "==", firebaseAuthID)
  );

  if (LOG_LEVEL == LOG_LEVEL_TYPES.DEBUG) {
    console.log(
      "Firestore Request: getUserByFirebaseAuthID. UserID: ",
      firebaseAuthID
    );
  }

  const users: User[] = [];

  const docs = await getDocs(q);
  docs.forEach((doc) => {
    users.push(doc.data());
  });
  if (!users) {
    return;
  } else if (users.length > 1) {
    throw ManyUserFoundForFirebaseIDError(firebaseAuthID);
  } else {
    const user = users[0];
    return user;
  }
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

  if (LOG_LEVEL == LOG_LEVEL_TYPES.DEBUG) {
    console.log(
      "Firestore Request: getUsersByID. Users: ",
      JSON.stringify(users)
    );
  }
  return users;
};

export const setUserOnlineStatus = async (
  userID: string,
  isOnline: boolean
): Promise<void> => {
  await updateDoc(doc(db, USERS_COLLECTION, userID), {
    isOnline,
  });
};

export const updateUsername = async (userID: string, newUsername: string) => {
  await updateDoc(doc(db, USERS_COLLECTION, userID), {
    username: newUsername,
  });
};

export const createOrSignInGoogleUser = async (
  username: string
): Promise<User> => {
  const provider = new GoogleAuthProvider();

  const googleUser = await signInWithPopup(auth, provider);

  const existingUser = await getUserByFirebaseAuthID(googleUser.user.uid);

  if (existingUser) {
    await updateUsername(existingUser.userID, username);
    return {
      ...existingUser,
      username,
    };
  }

  const userID = `user.${v4()}`;
  const user: User = {
    userID,
    username,
    firebaseAuthID: googleUser.user.uid,
    loginType: LoginType.GOOGLE,
    createDate: Timestamp.now(),
  };

  await setDoc(doc(db, USERS_COLLECTION, userID), user);

  if (LOG_LEVEL == LOG_LEVEL_TYPES.DEBUG) {
    console.log(
      "Firestore Request: createGoogleUser. username",
      username,
      "userID",
      userID
    );
  }
  return user;
};

export const createAnonymousUser = async (username: string): Promise<User> => {
  const anonymousUser = await signInAnonymously(auth);

  const userID = `user.${v4()}`;
  const user: User = {
    userID,
    username,
    firebaseAuthID: anonymousUser.user.uid,
    loginType: LoginType.ANONYMOUS,
    createDate: Timestamp.now(),
  };

  await setDoc(doc(db, USERS_COLLECTION, userID), user);

  if (LOG_LEVEL == LOG_LEVEL_TYPES.DEBUG) {
    console.log(
      "Firestore Request: createAnonymousUser. username",
      username,
      "userID",
      userID
    );
  }
  return user;
};

export const signOut = async (user: User) => {
  // If this is an anonymous user, delete the user on logout
  if (user.loginType == LoginType.ANONYMOUS) {
    await deleteDoc(doc(db, USERS_COLLECTION, user.userID));
  }

  if (LOG_LEVEL == LOG_LEVEL_TYPES.DEBUG) {
    console.log("Firestore Request: signOut. UserID: ", user.userID);
  }

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

        if (LOG_LEVEL == LOG_LEVEL_TYPES.DEBUG) {
          console.log(
            "Firestore Request: useAuth. Watching user with firebaseAuthID:",
            authUser.uid
          );
        }

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
              if (LOG_LEVEL == LOG_LEVEL_TYPES.DEBUG) {
                console.log(
                  "Firestore Request: useAuth. Auth State Updated:",
                  JSON.stringify(user)
                );
              }

              setUserState({
                user,
                userLoading: false,
              });

              // In order to add a "presence feature" that can monitor whether a user is online, we use the firebase
              // real time database as per https://firebase.google.com/docs/firestore/solutions/presence#solution_cloud_functions_with_realtime_database

              if (user) {
                const sanitizedUserID = user.userID.replace(/\./g, "%%%");
                const statusPath = `/status/${sanitizedUserID}`;
                const userStatusDatabaseRef = ref(rtDb, statusPath);
                const connectedRef = ref(rtDb, ".info/connected");

                onValue(connectedRef, async (snapshot) => {
                  const data = snapshot.val();

                  if (data == false) {
                    setUserOnlineStatus(user.userID, false);
                    return;
                  }

                  await onDisconnect(userStatusDatabaseRef).set({
                    state: "offline",
                    last_changed: serverTimestamp(),
                  });

                  set(userStatusDatabaseRef, {
                    state: "online",
                    last_changed: serverTimestamp(),
                  });
                  setUserOnlineStatus(user.userID, true);
                });
              }
            }
          }
        });
      } else {
        // If we are signed out, remove the snapshot
        if (snapshotUnsub) {
          snapshotUnsub();
        }

        if (LOG_LEVEL == LOG_LEVEL_TYPES.DEBUG) {
          console.log("Firestore Request: useAuth. Signed out.");
        }
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

export const useUsersByID = (userIDs?: string[]): User[] => {
  const [userState, setUserState] = useState<User[]>([]);

  useEffect(() => {
    if (userIDs) {
      const q = query(
        collection(db, USERS_COLLECTION).withConverter(userConverter),
        where(documentId(), "in", userIDs)
      );

      if (LOG_LEVEL == LOG_LEVEL_TYPES.DEBUG) {
        console.log(
          "Firestore Request: useUsersByID. Watching Users Collection for Users with IDs:",
          userIDs
        );
      }

      const unsub = onSnapshot(q, (querySnapshot) => {
        const users: User[] = [];
        querySnapshot.docs.forEach((doc) => {
          users.push(doc.data());
        });

        setUserState(users);

        if (LOG_LEVEL == LOG_LEVEL_TYPES.DEBUG) {
          console.log(
            "Firestore Request: useUsersByID. Updating Users:",
            JSON.stringify(users)
          );
        }
      });
      return unsub;
    }
  }, []);

  return userState;
};

export const useLoggedInUser = (): User => {
  const [user] = useContext(UserContext);
  if (user === undefined) {
    throw new Error("useLoggedInUser used without a valid user");
  }

  return user;
};

export const useOnlineUsers = (): User[] => {
  const [userState, setUserState] = useState<User[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, USERS_COLLECTION).withConverter(userConverter),
      where("isOnline", "==", true)
    );

    if (LOG_LEVEL == LOG_LEVEL_TYPES.DEBUG) {
      console.log(
        "Firestore Request: useOnlineUsers. Getting all online users"
      );
    }

    const unsub = onSnapshot(q, (querySnapshot) => {
      const users: User[] = [];
      querySnapshot.docs.forEach((doc) => {
        users.push(doc.data());
      });

      setUserState(users);

      if (LOG_LEVEL == LOG_LEVEL_TYPES.DEBUG) {
        console.log(
          "Firestore Request: useOnlineUsers. Updating Users:",
          JSON.stringify(users)
        );
      }
    });
    return unsub;
  }, []);

  return userState;
};
//#endregion

export const userConverter: FirestoreDataConverter<User> = {
  fromFirestore: (snapshot) => snapshot.data() as User,
  toFirestore: (user: User) => user,
};
