import { Button, Heading } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import axios from "axios";
import React, { useState } from "react";
import { XWordContainer } from "../components/XWordContainer";
import { InputField } from "../components/InputField";
import { getErrorByCode, XWordErrors } from "./api/models/XWordError";
import { validateUsername } from "../utils/validate";
import useUser from "./api/hooks";
import { NextApiResponse } from "next";
import { XWordRequest } from "../types";
import { withPassport } from "./api/middleware/withPassport";
import Link from "next/link";

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

const Login: React.FC = () => {
  const { refetch } = useUser({
    redirectTo: "/",
    redirectIfFound: true,
  });
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isRegisterLoading, setIsRegisterLoading] = useState(false);
  return (
    <XWordContainer>
      <Heading mb={16} mt={8}>
        XWord
      </Heading>
      <XWordContainer maxW="400px">
        <Formik
          initialValues={{ username: "", password: "" }}
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
              .post("/api/auth/login", {
                ...values,
              })
              .catch((err) => {
                const xWordError = getErrorByCode(err.response.status);
                switch (xWordError) {
                  case XWordErrors.USERNAME_NOT_FOUND:
                    setErrors({
                      username: xWordError.message,
                    });
                    return;
                  case XWordErrors.WRONG_PASSWORD:
                    setErrors({
                      password: xWordError.message,
                    });
                    return;
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

            return errors;
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
        <Link href="/api/auth/google" passHref>
          <Button
            width="90%"
            colorScheme="blue"
            isLoading={isGoogleLoading}
            onClick={() => {
              setIsGoogleLoading(true);
            }}
          >
            Login with Google
          </Button>
        </Link>
        <Link href="/register" passHref>
          <Button
            width="60%"
            mb={4}
            mt={16}
            isLoading={isRegisterLoading}
            onClick={() => {
              setIsRegisterLoading(true);
            }}
          >
            Click Here to Register
          </Button>
        </Link>
      </XWordContainer>
    </XWordContainer>
  );
};

export default Login;
