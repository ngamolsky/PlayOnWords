import { Button, Heading } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import React from "react";
import { XWordContainer } from "../components/XWordContainer";
import { InputField } from "../components/InputField";
import { ColorModeSwitcher } from "../components/ColorModeSwitcher";
import { validateEmail, validatePassword } from "../utils/validate";
import { Link, useHistory } from "react-router-dom";
import useUser from "../hooks/useUser";
import { APP_NAME } from "../constants";

const Login: React.FC = () => {
  const history = useHistory();
  const [, { createOrLoginGoogleUser, loginEmailUser }] = useUser();
  return (
    <XWordContainer>
      <ColorModeSwitcher my={4} mr={4} ml="auto" />
      <Heading mb={16} mt={8}>
        {APP_NAME}
      </Heading>
      <XWordContainer maxW="400px">
        <Formik
          initialValues={{ email: "", password: "" }}
          onSubmit={async ({ email, password }, { setErrors }) => {
            try {
              await loginEmailUser(email, password);
              history.push("/");
            } catch (error) {
              const errorCode = error.code;
              const errorMessage = error.message;

              if (errorCode === "auth/user-not-found") {
                setErrors({
                  email: "User does not exist.",
                });

                return;
              }
              throw new Error(`(${errorCode}): ${errorMessage}`);
            }
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
                  history.push("/");
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
    </XWordContainer>
  );
};

export default Login;
