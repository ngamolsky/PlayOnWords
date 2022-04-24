import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Login from "./pages/Username";
import Home from "./pages/Home/Home";
import Solve from "./pages/Solve/Solve";
import { UserContext } from "./contexts/UserContext";
import { useAuth } from "./models/User";
import SignOut from "./pages/SignOut";

export const App = () => {
  const [user, userLoading] = useAuth();
  return (
    <UserContext.Provider value={[user, userLoading]}>
      <Router>
        <Switch>
          <Route path="/username">
            <Login />
          </Route>
          <ProtectedRoute path="/solve/:sessionID">
            <Solve />
          </ProtectedRoute>
          <ProtectedRoute path="/signOut">
            <SignOut />
          </ProtectedRoute>
          <ProtectedRoute path="/">
            <Home />
          </ProtectedRoute>
        </Switch>
      </Router>
    </UserContext.Provider>
  );
};
