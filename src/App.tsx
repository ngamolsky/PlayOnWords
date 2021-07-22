import * as React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import firebase from "firebase/app";
import "firebase/auth";
import { ChakraProvider, Box, theme } from "@chakra-ui/react";
import { FirebaseAuthProvider } from "@react-firebase/auth";
import { firebaseConfig } from "./config/firebase";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Register from "./pages/Register";
import { ProtectedRoute } from "./components/ProtectedRoute";

export const App = () => {
  return (
    <ChakraProvider theme={theme}>
      <Router>
        <FirebaseAuthProvider firebase={firebase} {...firebaseConfig}>
          <Box textAlign="center" fontSize="xl">
            <Switch>
              <Route path="/login">
                <Login />
              </Route>
              <Route path="/register">
                <Register />
              </Route>
              <ProtectedRoute path="/">
                {(user, loading) => <Home user={user} loading={loading} />}
              </ProtectedRoute>
            </Switch>
          </Box>
        </FirebaseAuthProvider>
      </Router>
    </ChakraProvider>
  );
};
