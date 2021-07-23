import React from "react";

import { XWordContainer } from "../components/XWordContainer";
import { XWordToolbar } from "../components/XWordToolbar";
import { Spinner } from "@chakra-ui/react";
import usePuzzleSession from "../hooks/usePuzzleSession";

const Solve: React.FC = () => {
  const [session, loading, error] = usePuzzleSession();
  console.log(session, loading, error);
  return (
    <XWordContainer>
      <XWordToolbar />
      <Spinner size="xl" m="auto" />
    </XWordContainer>
  );
};

export default Solve;
