import { Spinner } from "@chakra-ui/react";
import React, { useContext } from "react";
import { Redirect, Route, RouteProps, useLocation } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";
import { XWordContainer } from "./XWordContainer";

export const ProtectedRoute: React.FC<RouteProps> = ({ children, ...rest }) => {
  const path = useLocation().pathname;
  const [user, userLoading] = useContext(UserContext);
  if (userLoading)
    return (
      <XWordContainer>
        <Spinner size="xl" m="auto" />
      </XWordContainer>
    );
  if (!user) {
    const nextUrl = path !== "/" ? `/login?continueUrl=${path}` : "/login";
    return <Redirect to={nextUrl} />;
  }

  return <Route {...rest}>{children}</Route>;
};
