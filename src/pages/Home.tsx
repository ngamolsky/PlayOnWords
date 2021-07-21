import React from "react";
import { XWordContainer } from "../components/XWordContainer";
import { XWordToolbar } from "../components/XWordToolbar";
import { User } from "../models/User";

interface HomeProps {
  user: User;
}

const Home: React.FC<HomeProps> = ({ user }) => {
  return (
    <XWordContainer>
      <XWordToolbar isSignedIn={true} user={user} />
    </XWordContainer>
  );
};

export default Home;
