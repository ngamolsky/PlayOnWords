import { MIN_PASSWORD_LENGTH } from "../../../constants";

export class XWordError extends Error {
  constructor(code: number, message: string) {
    super(message);
    this.code = code;
    this.message = message;
  }
  code: number;
  message: string;
}

export const XWordErrors = {
  USERNAME_TAKEN: new XWordError(
    601,
    "User already exists with this username."
  ),
  PASSWORD_TOO_SHORT: new XWordError(
    602,
    `Your password must be atleast ${MIN_PASSWORD_LENGTH} characters.`
  ),
  GOOGLE_USER_EXISTS: new XWordError(603, "This google user already exists."),
  LOCAL_USER_EXISTS: new XWordError(
    604,
    "A user with this username already exists"
  ),
  USERNAME_NOT_FOUND: new XWordError(605, "No user exists for this username."),
  WRONG_PASSWORD: new XWordError(606, "Wrong password."),
  GOOGLE_EMAIL_THROUGH_LOCAL: new XWordError(
    607,
    "Please sign in using your google account."
  ),
};

export const getErrorByCode = (code: number): XWordError | undefined => {
  for (const error of Object.values(XWordErrors)) {
    if (error.code == code) return error;
  }
  return;
};
