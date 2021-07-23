import { Spinner } from "@chakra-ui/react";
import React from "react";
import { Redirect, Route, RouteProps } from "react-router-dom";
import useUser from "../hooks/useUser";
import { User, UserActions } from "../models/User";
import { XWordContainer } from "./XWordContainer";

interface ProtectedRouteProps extends RouteProps {
  children: (user: User, userActions: UserActions) => React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  ...rest
}) => {
  const [user, actions, loading] = useUser();

  if (loading)
    return (
      <XWordContainer>
        <Spinner size="xl" m="auto" />
      </XWordContainer>
    );
  if (!user) return <Redirect to="/login" />;
  return <Route {...rest}>{children(user, actions)}</Route>;
};
