import { Form, Formik } from "formik";
import React, { useContext, useEffect, useState } from "react";
import { XWordContainer } from "../components/XWordContainer";
import { InputField } from "../components/InputField";
import { validateUsername } from "../utils/validationUtils";
import { useHistory } from "react-router-dom";
import { createBasicUser } from "../models/User";
import useQueryParams from "../hooks/useQueryParams";
import { UserContext } from "../contexts/UserContext";
import { UserExistsError } from "../errors";
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
      const nextURL = continueUrl ? `${continueUrl}/` : "/";
      history.push(nextURL);
    }
  }, [user, continueUrl, history]);

  return (
    <XWordContainer
      loadingMessage={loadingMessage}
      showToolbar={false}
      className="p-8"
    >
      <h1 className="mx-auto my-8 text-3xl font-alfa">{APP_NAME}</h1>
      <Formik
        initialValues={{ username: "" }}
        onSubmit={async ({ username }, { setErrors }) => {
          setCreatingUser(true);
          await createBasicUser(username).catch((error) => {
            setCreatingUser(false);

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

          <Button type="submit">Start</Button>
        </Form>
      </Formik>
    </XWordContainer>
  );
};

export default Login;
