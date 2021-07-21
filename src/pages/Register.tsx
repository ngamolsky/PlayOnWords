import { Button, Heading } from "@chakra-ui/react";
import firebase from "firebase/app";
import "firebase/auth";
import { Form, Formik } from "formik";
import React from "react";
import { XWordContainer } from "../components/XWordContainer";
import { InputField } from "../components/InputField";
import { ColorModeSwitcher } from "../components/ColorModeSwitcher";
import { validateEmail, validatePassword } from "../utils/validate";

const Register: React.FC = () => {
  return (
    <XWordContainer>
      <ColorModeSwitcher my={4} mr={4} ml="auto" />
      <Heading mb={16} mt={8}>
        XWord
      </Heading>
      <XWordContainer maxW="400px">
        <Formik
          initialValues={{ email: "", password: "" }}
          onSubmit={async ({ email, password }, { setErrors }) => {
            firebase
              .auth()
              .signInWithEmailAndPassword(email, password)
              .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;

                if (errorCode === "auth/user-not-found") {
                  setErrors({
                    email: "User does not exist.",
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
            </Form>
          )}
        </Formik>
        <Button
          width="90%"
          colorScheme="blue"
          onClick={() => {
            const googleAuthProvider = new firebase.auth.GoogleAuthProvider();
            firebase.auth().signInWithPopup(googleAuthProvider);
          }}
        >
          Login with Google
        </Button>
        <Button width="60%" mb={4} mt={16}>
          Click Here to Register
        </Button>
      </XWordContainer>
    </XWordContainer>
  );
};

export default Register;
