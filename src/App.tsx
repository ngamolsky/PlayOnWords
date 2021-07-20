import * as React from "react";
import firebase from "firebase/app";
import "firebase/auth";
import {
  ChakraProvider,
  Box,
  VStack,
  Grid,
  theme,
  Button,
} from "@chakra-ui/react";
import { ColorModeSwitcher } from "./components/ColorModeSwitcher";
import { FirebaseAuthProvider } from "@react-firebase/auth";
import { firebaseConfig } from "./config/firebase";
import { Form, Formik } from "formik";
import { InputField } from "./components/InputField";

export const App = () => (
  <ChakraProvider theme={theme}>
    <FirebaseAuthProvider firebase={firebase} {...firebaseConfig}>
      <Box textAlign="center" fontSize="xl">
        <Grid minH="100vh" p={3}>
          <ColorModeSwitcher justifySelf="flex-end" />
          <VStack spacing={8} w={800} mx="auto">
            <Formik
              initialValues={{ username: "", password: "" }}
              onSubmit={(values, { setSubmitting }) => {
                setTimeout(() => {
                  alert(JSON.stringify(values, null, 2));
                  setSubmitting(false);
                }, 400);
              }}
            >
              {({ isSubmitting }) => (
                <Form style={{ width: "90%" }}>
                  <InputField
                    label="Username"
                    name="username"
                    placeholder="Username"
                  />
                  <InputField
                    label="Password"
                    name="password"
                    placeholder="Password"
                    type="password"
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
                const googleAuthProvider =
                  new firebase.auth.GoogleAuthProvider();
                firebase.auth().signInWithPopup(googleAuthProvider);
              }}
            >
              Login with Google
            </Button>
          </VStack>
        </Grid>
      </Box>
    </FirebaseAuthProvider>
  </ChakraProvider>
);
