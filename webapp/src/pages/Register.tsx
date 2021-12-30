import { Button, Heading } from "@chakra-ui/react";
import "firebase/auth";
import { Form, Formik, FormikErrors } from "formik";
import React, { useContext, useEffect } from "react";
import { XWordContainer } from "../components/XWordContainer";
import { InputField } from "../components/InputField";
import { ColorModeSwitcher } from "../components/ColorModeSwitcher";
import {
  RegisterInput,
  validateEmail,
  validatePassword,
  validatePasswordsMatch,
} from "../utils/validationUtils";
import { Link, useHistory } from "react-router-dom";
import { APP_NAME } from "../constants";
import { createEmailUser, createOrLoginGoogleUser } from "../models/User";
import useQueryParams from "../hooks/useQueryParams";
import { UserContext } from "../contexts/UserContext";

const Register: React.FC = () => {
  const history = useHistory();
  const queryParams = useQueryParams();
  const [user] = useContext(UserContext);
  const continueUrl = queryParams.get("continueUrl");
  useEffect(() => {
    if (user) {
      const nextURL = continueUrl ? `${continueUrl}/` : "/";
      history.push(nextURL);
    }
  }, [user, continueUrl, history]);
  return (
    <XWordContainer isLoading={false}>
      <ColorModeSwitcher my={4} mr={4} ml="auto" />
      <Heading mb={16} mt={8}>
        {APP_NAME}
      </Heading>
      <XWordContainer maxW="400px" isLoading={false}>
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

              <InputField
                label="Confirm Password"
                name="confirmPassword"
                placeholder="Confirm Password"
                type="password"
                required
              />
              <Button
                type="submit"
                isLoading={isSubmitting}
                width="100%"
                mb={4}
              >
                Sign Up
              </Button>
              <Button
                width="100%"
                colorScheme="blue"
                onClick={async () => {
                  await createOrLoginGoogleUser();
                  const nextURL = continueUrl ? `/${continueUrl}` : "/";
                  history.push(nextURL);
                }}
              >
                Sign Up with Google
              </Button>
            </Form>
          )}
        </Formik>
        <Link to="/login">
          <Button mb={4} mt={16}>
            Click Here to Login
          </Button>
        </Link>
      </XWordContainer>
    </XWordContainer>
  );
};

export default Register;
