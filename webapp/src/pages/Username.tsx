import { Form, Formik } from "formik";
import React, { useContext, useEffect, useState } from "react";
import { XWordContainer } from "../components/XWordContainer";
import { InputField } from "../components/InputField";
import { validateUsername } from "../utils/validationUtils";
import { useHistory } from "react-router-dom";
import { createAnonymousUser, createGoogleUser } from "../models/User";
import useQueryParams from "../hooks/useQueryParams";
import { UserContext } from "../contexts/UserContext";
import puzzleSVG from "../images/XWordSquare.svg";
import { APP_NAME } from "../constants";
import Button from "../components/Button";

const Login: React.FC = () => {
  const history = useHistory();
  const queryParams = useQueryParams();
  const [user, userLoading] = useContext(UserContext);
  const continueUrl = queryParams.get("continueUrl");
  const [creatingUser, setCreatingUser] = useState<boolean>(false);

  const loadingMessage =
    userLoading || creatingUser ? "Loading user..." : undefined;

  useEffect(() => {
    if (user) {
      const nextURL = continueUrl ? continueUrl : "/";
      history.push(nextURL);
    }
  }, [user, continueUrl, history]);

  return (
    <XWordContainer loadingMessage={loadingMessage} className="p-8">
      <h1 className="mx-auto my-8 text-3xl font-alfa">{APP_NAME}</h1>
      <Formik
        initialValues={{ username: "", type: "" }}
        onSubmit={async ({ username, type }) => {
          setCreatingUser(true);
          if (type == "google") {
            await createGoogleUser(username);
          } else {
            await createAnonymousUser(username);
          }
        }}
      >
        {({ setFieldValue, handleSubmit }) => (
          <Form className="flex flex-col grow">
            <img src={puzzleSVG} className="w-full" />
            <div className="grow" />

            <InputField
              label="Username"
              name="username"
              placeholder="Username"
              validate={validateUsername}
              required
            />

            <Button
              type="button"
              onClick={() => {
                setFieldValue("type", "anonymous");
                handleSubmit();
              }}
            >
              Start
            </Button>
          </Form>
        )}
      </Formik>
    </XWordContainer>
  );
};

export default Login;
