export type XWordError = {
  code: number;
  message: string;
} & Error;

export const UserExistsError: XWordError = {
  code: 600,
  message: "A user with this username already exists",
  name: "UserExistsError",
};

export const ManyUserFoundForFirebaseIDError = (
  firebaseID: string
): XWordError => {
  return {
    code: 601,
    message: `Found more than one user for firebase auth ID: ${firebaseID}`,
    name: "ManyUserFoundForFirebaseIDError",
  };
};
