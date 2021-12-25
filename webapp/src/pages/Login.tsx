import { Button, Heading, Spinner } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import React, { ReactElement, useContext, useEffect } from "react";
import { XWordContainer } from "../components/XWordContainer";
import { InputField } from "../components/InputField";
import { ColorModeSwitcher } from "../components/ColorModeSwitcher";
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

  let screen: ReactElement;
  if (userLoading) screen = <Spinner size="xl" m="auto" />;
  else
    screen = (
      <XWordContainer maxW="400px">
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
              <Button
                type="submit"
                isLoading={isSubmitting}
                width="100%"
                mb={4}
              >
                Login
              </Button>
              <Button
                width="100%"
                colorScheme="blue"
                onClick={async () => {
                  await createOrLoginGoogleUser();
                }}
              >
                Login with Google
              </Button>
            </Form>
          )}
        </Formik>
        <Link to="/register">
          <Button mb={4} mt={16}>
            Click Here to Register
          </Button>
        </Link>
      </XWordContainer>
    );
  return (
    <XWordContainer>
      <ColorModeSwitcher my={4} mr={4} ml="auto" />
      <Heading mb={16} mt={8}>
        {APP_NAME}
      </Heading>
      {screen}
    </XWordContainer>
  );
};

export default Login;
