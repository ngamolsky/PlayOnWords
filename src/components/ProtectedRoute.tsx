import { Spinner } from "@chakra-ui/react";
import React, { useContext } from "react";
import { Redirect, Route, RouteProps } from "react-router-dom";
import UserContext from "../contexts/UserContext";
import useQueryParams from "../hooks/useQueryParams";
import { XWordContainer } from "./XWordContainer";

export const ProtectedRoute: React.FC<RouteProps> = ({ children, ...rest }) => {
  const queryParams = useQueryParams();
  const [user, userLoading] = useContext(UserContext);
  const continueUrl = queryParams.get("continueUrl");
  if (userLoading)
    return (
      <XWordContainer>
        <Spinner size="xl" m="auto" />
      </XWordContainer>
    );
  if (!user) {
    const nextUrl = continueUrl
      ? `/login?continueUrl=${continueUrl}`
      : "/login";
    return <Redirect to={nextUrl} />;
  }
  return <Route {...rest}>{children}</Route>;
};
