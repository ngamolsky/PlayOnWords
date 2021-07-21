export enum LoginType {
  LOCAL = "local",
  GOOGLE = "google",
}

export type User = {
  userID: string;
  email?: string;
  username?: string;
  displayName?: string;
  hashedPassword?: string;
  googleID?: string;
  loginType: LoginType;
  createDate: Date;
  updateDate: Date;
};
