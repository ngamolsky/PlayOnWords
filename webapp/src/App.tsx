import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Solve from "./pages/Solve";
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
          <Route path="/register">
            <Register />
          </Route>
          <ProtectedRoute path="/solve/:puzzleSessionID">
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
