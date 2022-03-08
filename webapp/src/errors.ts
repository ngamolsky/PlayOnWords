export type XWordError = {
  code: number;
  message: string;
};

export const UserExistsError: XWordError = {
  code: 600,
  message: "A user with this username already exists",
};

export const ManyUserFoundForFirebaseIDError = (
  firebaseID: string
): XWordError => {
  return {
    code: 601,
    message: `Foudn more than one user for firebase auth ID: ${firebaseID}`,
  };
};
