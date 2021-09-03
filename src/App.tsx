import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import firebase from "firebase/app";
import { useAuthState } from "react-firebase-hooks/auth";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Box } from "@chakra-ui/react";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Solve from "./pages/Solve";
import UserContext from "./contexts/UserContext";

export const App = () => {
  const auth = firebase.auth();
  const [firebaseUser, authLoading, authError] = useAuthState(auth);

  return (
    <UserContext.Provider value={{ firebaseUser, authLoading, authError }}>
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
