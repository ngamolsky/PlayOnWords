import React from "react";
import { Redirect, Route, RouteProps } from "react-router-dom";
import useUser from "../hooks/useUser";
import { User } from "../models/User";

interface ProtectedRouteProps extends RouteProps {
  children: (user: User, loading: boolean) => React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  ...rest
}) => {
  const [user, loading] = useUser();

  if (!user && !loading) return <Redirect to="/login" />;
  return <Route {...rest}>{children(user!, loading)}</Route>;
};
