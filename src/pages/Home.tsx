import { Spinner } from "@chakra-ui/react";
import React from "react";
import { XWordContainer } from "../components/XWordContainer";
import { XWordToolbar } from "../components/XWordToolbar";
import { User } from "../models/User";

const Home: React.FC<{ user: User; loading: boolean }> = ({
  user,
  loading,
}) => {
  return (
    <XWordContainer>
      {loading ? (
        <Spinner size="xl" m="auto" />
      ) : (
        <XWordToolbar isSignedIn={!!user} user={user} />
      )}
    </XWordContainer>
  );
};

export default Home;
