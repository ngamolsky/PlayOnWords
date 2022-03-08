import { MIN_PASSWORD_LENGTH } from "../constants";

export type UserPasswordInput = {
  email: string;
  password: string;
};

export type RegisterInput = UserPasswordInput & {
  confirmPassword: string;
};

export const validateUsername = async (
  username: string
): Promise<string | undefined> => {
  let error = undefined;
  if (!username) {
    error = "Required";
  } else if (username.length < 5) {
    error = "Username is too short.";
  }

  return error;
};

export const validatePassword = (password: string): string | undefined => {
  let error;
  if (!password) {
    error = "Required";
  } else if (password.length < MIN_PASSWORD_LENGTH) {
    error = "Password is too short";
  }
  return error;
};

export const validatePasswordsMatch = (
  password: string,
  confirmPassword: string
): string | undefined => {
  let error;
  if (password !== confirmPassword) {
    error = "Passwords don't match";
  }
  return error;
};
