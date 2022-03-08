import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Solve from "./pages/Solve/Solve";
import { UserContext } from "./contexts/UserContext";
import { useAuth } from "./models/User";

export const App = () => {
  const [user, userLoading] = useAuth();
  return (
    <UserContext.Provider value={[user, userLoading]}>
      <Router>
        <Switch>
          <Route path="/login">
            <Login />
          </Route>

          <ProtectedRoute path="/solve/:sessionID">
            <Solve />
          </ProtectedRoute>
          <ProtectedRoute path="/">
            <Home />
          </ProtectedRoute>
        </Switch>
      </Router>
    </UserContext.Provider>
  );
};
