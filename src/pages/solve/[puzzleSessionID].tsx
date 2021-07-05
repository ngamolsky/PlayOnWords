import { AspectRatio, Spinner } from "@chakra-ui/react";
import React from "react";
import { XWordContainer } from "../../components/XWordContainer";
import { NextApiResponse } from "next";
import { XWordRequest } from "../../types";
import { User } from "../api/models/User";
import { XWordToolbar } from "../../components/XWordToolbar";
import { withServerSidePropsProtect } from "../api/middleware/withServerSidePropsProtect";
import { useGetPuzzleSessionQuery } from "../../generated/graphql";
import { useRouter } from "next/router";
import { Board } from "../../components/XBoard/Board";

export const getServerSideProps = async ({
  req,
  res,
}: {
  req: XWordRequest;
  res: NextApiResponse;
}) => {
  return withServerSidePropsProtect(req, res);
};

const Index: React.FC<{ user: User }> = ({ user }) => {
  const router = useRouter();
  const { puzzleSessionID } = router.query;

  const { data } = useGetPuzzleSessionQuery({
    variables: {
      sessionID: puzzleSessionID as string,
    },
  });

  const screen = !data?.getPuzzleSession.boardState ? (
    <Spinner size="xl" m="auto" />
  ) : (
    <AspectRatio
      ratio={1}
      w={["50vh", "70vh", "80vh", "80vh"]}
      mx="auto"
      my="16"
    >
      <Board boardState={JSON.parse(data?.getPuzzleSession.boardState)} />
    </AspectRatio>
  );

  return (
    <XWordContainer>
      <XWordToolbar user={user} />
      {screen}
    </XWordContainer>
  );
};
export default Index;
