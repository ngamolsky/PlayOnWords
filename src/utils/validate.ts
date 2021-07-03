import { FormikErrors } from "formik";
import { MIN_PASSWORD_LENGTH } from "../constants";

export type UserPasswordInput = {
  email: string;
  password: string;
};

export type RegisterInput = UserPasswordInput & {
  confirm_password: string;
};

export const validateUsername = (
  username: string,
  existingErrors?: FormikErrors<UserPasswordInput>
): FormikErrors<UserPasswordInput> => {
  const errors: FormikErrors<UserPasswordInput> = existingErrors
    ? existingErrors
    : {};
  if (!username) {
    errors.email = "Required";
  }
  return errors;
};

export const validatePassword = (
  password: string,
  existingErrors?: FormikErrors<UserPasswordInput>
): FormikErrors<UserPasswordInput> => {
  const errors: FormikErrors<UserPasswordInput> = existingErrors
    ? existingErrors
    : {};
  if (!password) {
    errors.password = "Required";
  } else if (password.length < MIN_PASSWORD_LENGTH) {
    errors.password = "Password to short";
  }
  return errors;
};

export const validatePasswordsMatch = (
  password: string,
  confirm_password: string,
  existingErrors?: FormikErrors<RegisterInput>
): FormikErrors<RegisterInput> => {
  const errors: FormikErrors<RegisterInput> = existingErrors
    ? existingErrors
    : {};
  if (password != confirm_password) {
    errors.confirm_password = "Passwords don't match";
  }
  return errors;
};
