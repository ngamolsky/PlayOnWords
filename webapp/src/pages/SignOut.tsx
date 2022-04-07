import React, { useEffect } from "react";
import { XWordContainer } from "../components/XWordContainer";
import { signOut, useLoggedInUser } from "../models/User";

const SignOut: React.FC = () => {
  const user = useLoggedInUser();

  useEffect(() => {
    signOut(user);
  }, [user]);

  return <XWordContainer loadingMessage={"Signing Out"} className="p-8" />;
};

export default SignOut;
