import { MIN_PASSWORD_LENGTH } from "../constants";

export type UserPasswordInput = {
  email: string;
  password: string;
};

export type RegisterInput = UserPasswordInput & {
  confirmPassword: string;
};

export const validateEmail = (email: string): string | undefined => {
  let error;
  if (!email) {
    error = "Required";
  } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email)) {
    error = "Invalid email address";
  }
  return error;
};

export const validatePassword = (password: string): string | undefined => {
  let error;
  if (!password) {
    error = "Required";
  } else if (password.length < MIN_PASSWORD_LENGTH) {
    error = "Password to short";
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
