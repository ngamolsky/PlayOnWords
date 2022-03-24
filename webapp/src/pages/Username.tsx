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
    <XWordContainer loadingMessage={loadingMessage} showToolbar={false}>
      <h1 className="text-3xl mx-auto mt-8 font-alfa">X WORD</h1>
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
        <Form className="flex grow flex-col">
          <img src={puzzleSVG} className="w-full p-8" />
          <div className="grow" />

          <InputField
            className="mx-8"
            label="Username"
            name="username"
            placeholder="Username"
            validate={validateUsername}
            required
          />

          <button
            type="submit"
            className="text-white bg-teal-600 active:bg-teal-700 rounded-lg py-2 mx-8 mb-4"
          >
            Start
          </button>
        </Form>
      </Formik>
    </XWordContainer>
  );
};

export default Login;
