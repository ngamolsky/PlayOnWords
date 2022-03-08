import { Form, Formik } from "formik";
import React, { useContext, useEffect, useState } from "react";
import { XWordContainer } from "../components/XWordContainer";
import { InputField } from "../components/InputField";
import { validateUsername, validatePassword } from "../utils/validationUtils";
import { Link, useHistory } from "react-router-dom";
import { createBasicUser } from "../models/User";
import useQueryParams from "../hooks/useQueryParams";
import { UserContext } from "../contexts/UserContext";
import { UserExistsError } from "../errors";

const Login: React.FC = () => {
  const history = useHistory();
  const queryParams = useQueryParams();
  const [user, userLoading] = useContext(UserContext);
  const continueUrl = queryParams.get("continueUrl");

  const loadingMessage = userLoading ? "Loading user..." : undefined;

  useEffect(() => {
    if (user) {
      const nextURL = continueUrl ? `${continueUrl}/` : "/";
      history.push(nextURL);
    }
  }, [user, continueUrl, history]);

  return (
    <XWordContainer loadingMessage={loadingMessage} showToolbar={false}>
      <h1 className="text-3xl mx-auto mt-8">XWord</h1>
      <Formik
        initialValues={{ username: "" }}
        onSubmit={async ({ username }, { setErrors }) => {
          await createBasicUser(username).catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;

            if (errorCode == UserExistsError.code) {
              setErrors({
                username: UserExistsError.message,
              });
            } else {
              throw new Error(`(${errorCode}): ${errorMessage}`);
            }
          });
        }}
      >
        <Form className="flex flex-col space-y-4 mt-8">
          <InputField
            label="Username"
            name="username"
            placeholder="Username"
            validate={validateUsername}
            required
          />

          <button
            type="submit"
            className="bg-blue-400 mx-auto rounded-lg py-2 px-8"
          >
            Start
          </button>
        </Form>
      </Formik>
    </XWordContainer>
  );
};

export default Login;
