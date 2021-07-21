import { FormikErrors } from "formik";
import { MIN_PASSWORD_LENGTH } from "../constants";

export type UserPasswordInput = {
  email: string;
  password: string;
};

export type RegisterInput = UserPasswordInput & {
  confirm_password: string;
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
  confirm_password: string,
  existingErrors?: FormikErrors<RegisterInput>
): FormikErrors<RegisterInput> => {
  const errors: FormikErrors<RegisterInput> = existingErrors
    ? existingErrors
    : {};
  if (password !== confirm_password) {
    errors.confirm_password = "Passwords don't match";
  }
  return errors;
};
