import * as React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import { ChakraProvider, Box, theme } from "@chakra-ui/react";
import { FirebaseAuthProvider } from "@react-firebase/auth";
import { firebaseConfig } from "./config/firebase";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Solve from "./pages/Solve";

export const App = () => {
  return (
    <ChakraProvider theme={theme}>
      <FirebaseAuthProvider firebase={firebase} {...firebaseConfig}>
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
      </FirebaseAuthProvider>
    </ChakraProvider>
  );
};
