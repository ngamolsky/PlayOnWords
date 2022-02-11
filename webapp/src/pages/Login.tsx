import { Form, Formik } from "formik";
import React, { useContext, useEffect } from "react";
import { XWordContainer } from "../components/XWordContainer";
import { InputField } from "../components/InputField";
import { validateEmail, validatePassword } from "../utils/validationUtils";
import { Link, useHistory } from "react-router-dom";
import { APP_NAME } from "../constants";
import { loginEmailUser, createOrLoginGoogleUser } from "../models/User";
import useQueryParams from "../hooks/useQueryParams";
import { UserContext } from "../contexts/UserContext";

const Login: React.FC = () => {
  const history = useHistory();
  const queryParams = useQueryParams();
  const [user, userLoading] = useContext(UserContext);
  const continueUrl = queryParams.get("continueUrl");

  useEffect(() => {
    if (user) {
      const nextURL = continueUrl ? `${continueUrl}/` : "/";
      history.push(nextURL);
    }
  }, [user, continueUrl, history]);

  return (
    <XWordContainer isLoading={false}>
      <h1>{APP_NAME}</h1>
      <XWordContainer isLoading={true}>
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
          {({ isSubmitting }) => (
            <Form style={{ width: "90%" }}>
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
              <button type="submit">Login</button>
              <button
                onClick={async () => {
                  await createOrLoginGoogleUser();
                }}
              >
                Login with Google
              </button>
            </Form>
          )}
        </Formik>
        <Link to="/register">
          <button>Click Here to Register</button>
        </Link>
      </XWordContainer>
    </XWordContainer>
  );
};

export default Login;
