import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Box } from "@chakra-ui/react";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Solve from "./pages/Solve";

export const App = () => {
  return (
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
  );
};
