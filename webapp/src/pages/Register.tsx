import "firebase/auth";
import { Form, Formik, FormikErrors } from "formik";
import React, { useContext, useEffect, useState } from "react";
import { XWordContainer } from "../components/XWordContainer";
import { InputField } from "../components/InputField";
import {
  RegisterInput,
  validateEmail,
  validatePassword,
  validatePasswordsMatch,
} from "../utils/validationUtils";
import { Link, useHistory } from "react-router-dom";
import { createEmailUser, createOrLoginGoogleUser } from "../models/User";
import useQueryParams from "../hooks/useQueryParams";
import { UserContext } from "../contexts/UserContext";

const Register: React.FC = () => {
  const history = useHistory();
  const queryParams = useQueryParams();
  const [user, userLoading] = useContext(UserContext);
  const [googleLoading, setGoogleLoading] = useState<boolean>(false);
  const loading = userLoading || googleLoading;

  const continueUrl = queryParams.get("continueUrl");
  useEffect(() => {
    if (user) {
      const nextURL = continueUrl ? `${continueUrl}/` : "/";
      history.push(nextURL);
    }
  }, [user, continueUrl, history]);
  return (
    <XWordContainer isLoading={loading} showToolbar={false}>
      <h1 className="text-3xl mx-auto mt-8">XWord</h1>

      <Formik
        initialValues={{ email: "", password: "", confirmPassword: "" }}
        onSubmit={async ({ email, password }) => {
          await createEmailUser(email, password);
          const nextURL = continueUrl ? `/${continueUrl}` : "/";
          history.push(nextURL);
        }}
        validate={({ password, confirmPassword }) => {
          const errors: FormikErrors<RegisterInput> = {};
          const passwordsMatch = validatePasswordsMatch(
            password,
            confirmPassword
          );
          if (passwordsMatch) {
            errors.confirmPassword = passwordsMatch;
          }
          return errors;
        }}
      >
        <Form className="flex flex-col space-y-4 mt-8">
          <InputField
            label="Email"
            name="email"
            placeholder="Email"
            validate={validateEmail}
            required
          />
          <InputField
            label="Password"
            name="password"
            placeholder="Password"
            type="password"
            validate={validatePassword}
            required
          />

          <InputField
            label="Confirm Password"
            name="confirmPassword"
            placeholder="Confirm Password"
            type="password"
            required
          />
          <button
            type="submit"
            className="bg-blue-400 mx-auto rounded-lg py-2 px-8"
          >
            Sign Up
          </button>
          <button
            className="bg-blue-400 mx-auto rounded-lg py-2 px-8"
            onClick={async () => {
              setGoogleLoading(true);
              await createOrLoginGoogleUser();
              const nextURL = continueUrl ? `/${continueUrl}` : "/";
              history.push(nextURL);
            }}
          >
            Sign Up with Google
          </button>
          <button className="bg-blue-400 mx-auto rounded-lg py-2 px-8">
            <Link to="/login">Click Here to Login</Link>
          </button>
        </Form>
      </Formik>
    </XWordContainer>
  );
};

export default Register;
