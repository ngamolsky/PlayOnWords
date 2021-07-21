import * as React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import firebase from "firebase/app";
import "firebase/auth";
import { ChakraProvider, Box, theme } from "@chakra-ui/react";
import {
  FirebaseAuthProvider,
  IfFirebaseAuthed,
  IfFirebaseUnAuthed,
} from "@react-firebase/auth";
import { firebaseConfig } from "./config/firebase";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Register from "./pages/Register";

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
              <Route path="/">
                <IfFirebaseAuthed>
                  {({ user }) => <Home user={user} />}
                </IfFirebaseAuthed>
                <IfFirebaseUnAuthed>
                  {() => <Redirect to="/login" />}
                </IfFirebaseUnAuthed>
              </Route>
            </Switch>
          </Box>
        </FirebaseAuthProvider>
      </Router>
    </ChakraProvider>
  );
};
