import fs from "../config/firebase";
import "reflect-metadata";
import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";
import { Field, ID, ObjectType, registerEnumType } from "type-graphql";
import {
  MIN_PASSWORD_LENGTH,
  NUM_SALT_ROUNDS,
  USERS_COLLECTION,
} from "../../../constants";
import { XWordErrors } from "./XWordError";
import { DateScalar } from "./DateScalar";

export enum LoginType {
  LOCAL = "local",
  GOOGLE = "google",
}

@ObjectType()
export class User {
  @Field(() => ID)
  userID: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  username?: string;

  @Field({ nullable: true })
  displayName?: string;

  @Field({ nullable: true })
  hashedPassword?: string;

  @Field({ nullable: true })
  googleID?: string;

  @Field()
  loginType: LoginType;

  @Field(() => DateScalar)
  createDate: Date;

  @Field(() => DateScalar)
  updateDate: Date;
}

registerEnumType(LoginType, {
  name: "LoginType",
});

export const userConverter = {
  toFirestore(user: User) {
    return user;
  },
  fromFirestore(snapshot: FirebaseFirestore.QueryDocumentSnapshot): User {
    const data = snapshot.data()!;
    return firebaseResultToUser(data);
  },
};

export const firebaseResultToUser = (
  data: FirebaseFirestore.DocumentData
): User => {
  const user: User = {
    displayName: data.displayName,
    userID: data.userID,
    loginType: data.loginType,
    updateDate: data.updateDate.toDate(),
    createDate: data.createDate.toDate(),
  };
  if (data.username) {
    user.username = data.username;
  }
  return user;
};

export const addUser = async (user: User) => {
  // Check for existing user
  if (user.loginType == LoginType.GOOGLE) {
    const existingUser = await getUserByGoogleID(user.googleID!);
    if (existingUser) {
      throw XWordErrors.GOOGLE_USER_EXISTS;
    }
  } else if (user.loginType == LoginType.LOCAL) {
    const existingUser = await getUserByUsername(user.username!);
    if (existingUser) {
      throw XWordErrors.LOCAL_USER_EXISTS;
    }
  }

  await fs
    .collection(USERS_COLLECTION)
    .withConverter(userConverter)
    .doc(user.userID)
    .set(user);
  return true;
};

export const getUserByID = async (userID: string): Promise<User> => {
  const result = await fs
    .collection(USERS_COLLECTION)
    .withConverter(userConverter)
    .doc(userID)
    .get();

  const user = result.data();
  if (!user) {
    throw new Error("No user found.");
  } else {
    return user;
  }
};

export const getUserByUsername = async (
  username: string
): Promise<User | undefined> => {
  const snapshot = await fs
    .collection(USERS_COLLECTION)
    .withConverter(userConverter)
    .where("username", "==", username)
    .get();
  if (snapshot.empty) {
    return;
  }

  if (snapshot.docs.length > 1) {
    throw new Error(`More than one user found with username ${username}`);
  }

  const result = snapshot.docs[0].data();
  return result;
};

export const getUserByGoogleID = async (
  googleID: string
): Promise<User | undefined> => {
  const snapshot = await fs
    .collection(USERS_COLLECTION)
    .withConverter(userConverter)
    .where("googleID", "==", googleID)
    .get();

  if (snapshot.empty) {
    return;
  }

  if (snapshot.docs.length > 1) {
    throw new Error(`More than one user found with google ID ${googleID}`);
  }

  const result = snapshot.docs[0].data();
  return result;
};

export const verifyPassword = async (
  rawPasswordInput: string,
  hashedPassword: string
): Promise<boolean> => {
  const result = await bcrypt.compare(rawPasswordInput, hashedPassword);
  return result;
};

export const registerLocalUser = async (
  username: string,
  rawPasswordInput: string,
  displayName?: string
): Promise<User> => {
  if (rawPasswordInput.length < MIN_PASSWORD_LENGTH) {
    throw XWordErrors.PASSWORD_TOO_SHORT;
  }
  const hashedPassword = await bcrypt.hash(rawPasswordInput, NUM_SALT_ROUNDS);
  const user: User = {
    username,
    hashedPassword,
    userID: `user.${uuid()}`,
    loginType: LoginType.LOCAL,
    displayName,
    createDate: new Date(),
    updateDate: new Date(),
  };
  await addUser(user);
  return user;
};
