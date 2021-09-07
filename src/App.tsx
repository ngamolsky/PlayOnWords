import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Box } from "@chakra-ui/react";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Solve from "./pages/Solve";
import UserContext from "./contexts/UserContext";
import useUser from "./hooks/useUser";

export const App = () => {
  const [user, userLoading] = useUser();
  return (
    <UserContext.Provider value={[user, userLoading]}>
      <Router>
        <Box textAlign="center" fontSize="xl">
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
        </Box>
      </Router>
    </UserContext.Provider>
  );
};
