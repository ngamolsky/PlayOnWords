import { Button, Heading } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import axios from "axios";
import React, { useState } from "react";
import Link from "next/link";
import { XWordContainer } from "../components/XWordContainer";
import { InputField } from "../components/InputField";
import { getErrorByCode, XWordErrors } from "./api/models/XWordError";
import {
  validateUsername,
  validatePassword,
  validatePasswordsMatch,
} from "../utils/validate";
import { useUser } from "./api/hooks";
import { XWordRequest } from "../types";
import { NextApiResponse } from "next";
import { withPassport } from "./api/middleware/withPassport";

export const getServerSideProps = async ({
  req,
  res,
}: {
  req: XWordRequest;
  res: NextApiResponse;
}) => {
  await withPassport.run(req, res);

  const user = req.user;
  if (user) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};

const Register: React.FC = () => {
  const { refetch } = useUser({
    redirectTo: "/",
    redirectIfFound: true,
  });
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  return (
    <XWordContainer>
      <Heading mb={16}>XWord</Heading>
      <XWordContainer maxW="400px">
        <Formik
          initialValues={{
            username: "",
            password: "",
            confirmPassword: "",
            displayName: "",
          }}
          onSubmit={async (values, { setErrors }) => {
            if (!values.username) {
              setErrors({
                username: "Required",
              });
              return;
            }

            if (!values.password) {
              setErrors({
                password: "Required",
              });
              return;
            }
            const response = await axios
              .post("/api/auth/register", {
                ...values,
              })
              .catch((err) => {
                const xWordError = getErrorByCode(err.response.status);
                switch (xWordError) {
                  case XWordErrors.USERNAME_TAKEN:
                    setErrors({
                      username: xWordError.message,
                    });
                    break;
                  case XWordErrors.PASSWORD_TOO_SHORT:
                    setErrors({
                      password: xWordError.message,
                    });
                    break;
                  case undefined:
                    console.error(err);
                    throw err;
                  default:
                    setErrors({
                      username: xWordError?.message,
                    });
                    console.error(xWordError?.message);
                    return;
                }
              });
            await refetch();
            return response;
          }}
          validate={(values) => {
            let errors;
            if (values.username) {
              errors = validateUsername(values.username, errors);
            }
            if (values.password) {
              errors = validatePassword(values.password, errors);
            }
            if (values.confirmPassword) {
              errors = validatePasswordsMatch(
                values.password,
                values.confirmPassword,
                errors
              );
            }

            return errors;
          }}
        >
          {({ isSubmitting }) => (
            <Form style={{ width: "90%" }}>
              <InputField
                label="Username"
                name="username"
                placeholder="Username"
                required
              />
              <InputField
                label="Display Name"
                name="displayName"
                placeholder="First Last"
              />
              <InputField
                label="Enter a password"
                name="password"
                placeholder="Password"
                type="password"
                required
              />
              <InputField
                label="Confirm your password"
                name="confirmPassword"
                placeholder="Password"
                type="password"
                required
              />
              <Button
                type="submit"
                isLoading={isSubmitting}
                width="100%"
                mb={4}
              >
                Register
              </Button>
            </Form>
          )}
        </Formik>
        <Link href="/api/auth/google" passHref>
          <Button
            width="90%"
            colorScheme="blue"
            isLoading={isGoogleLoading}
            onClick={() => {
              setIsGoogleLoading(true);
            }}
          >
            Sign Up with Google
          </Button>
        </Link>
        <Link href="/login" passHref>
          <Button
            width="60%"
            mb={4}
            mt={16}
            isLoading={isLoginLoading}
            onClick={() => {
              setIsLoginLoading(true);
            }}
          >
            Click Here to Login
          </Button>
        </Link>
      </XWordContainer>
    </XWordContainer>
  );
};

export default Register;
