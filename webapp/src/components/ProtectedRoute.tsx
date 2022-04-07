import React, { useContext } from "react";
import { Redirect, Route, RouteProps, useLocation } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";
import { XWordContainer } from "./XWordContainer";

export const ProtectedRoute: React.FC<RouteProps> = ({ children, ...rest }) => {
  const path = useLocation().pathname;

  const [user, userLoading] = useContext(UserContext);
  if (userLoading)
    return (
      <XWordContainer
        loadingMessage={userLoading ? "Loading user..." : undefined}
        showToolbar
      />
    );
  if (!user) {
    const nextUrl =
      path !== "/" && path !== "/signOut"
        ? `/username?continueUrl=${path}`
        : "/username";
    return <Redirect to={nextUrl} />;
  }

  return <Route {...rest}>{children}</Route>;
};
