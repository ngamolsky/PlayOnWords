import { Form, Formik } from "formik";
import React, { useContext, useEffect, useState } from "react";
import { XWordContainer } from "../components/XWordContainer";
import { InputField } from "../components/InputField";
import { validateEmail, validatePassword } from "../utils/validationUtils";
import { Link, useHistory } from "react-router-dom";
import { loginEmailUser, createOrLoginGoogleUser } from "../models/User";
import useQueryParams from "../hooks/useQueryParams";
import { UserContext } from "../contexts/UserContext";

const Login: React.FC = () => {
  const history = useHistory();
  const queryParams = useQueryParams();
  const [user, userLoading] = useContext(UserContext);
  const continueUrl = queryParams.get("continueUrl");
  const [googleLoading, setGoogleLoading] = useState<boolean>(false);
  const loading = userLoading || googleLoading;

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
        initialValues={{ email: "", password: "" }}
        onSubmit={async ({ email, password }, { setErrors }) => {
          await loginEmailUser(email, password).catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorCode);

            if (errorCode === "auth/user-not-found") {
              setErrors({
                email: "User does not exist.",
              });

              return;
            }

            if (errorCode === "auth/wrong-password") {
              setErrors({
                password: "Password is incorrect.",
              });

              return;
            }
            throw new Error(`(${errorCode}): ${errorMessage}`);
          });
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
          <button
            type="submit"
            className="bg-blue-400 mx-auto rounded-lg py-2 px-8"
          >
            Login
          </button>
          <button
            type="button"
            onClick={async () => {
              setGoogleLoading(true);
              await createOrLoginGoogleUser();
            }}
            className="bg-blue-400 mx-auto rounded-lg py-2 px-8"
          >
            Login with Google
          </button>
          <button
            className="bg-blue-400 mx-auto rounded-lg py-2 px-8"
            type="button"
          >
            <Link to="/register">Click Here to Register</Link>
          </button>
        </Form>
      </Formik>
    </XWordContainer>
  );
};

export default Login;
