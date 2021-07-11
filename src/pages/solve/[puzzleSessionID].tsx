import { AspectRatio, Spinner } from "@chakra-ui/react";
import React from "react";
import { XWordContainer } from "../../components/XWordContainer";
import { NextApiResponse } from "next";
import { XWordRequest } from "../../types";
import { User } from "../api/models/User";
import { XWordToolbar } from "../../components/XWordToolbar";
import { withServerSidePropsProtect } from "../api/middleware/withServerSidePropsProtect";
import { useStartPuzzleSessionMutation } from "../../generated/graphql";
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
  const { puzzleSessionID, puzzleID } = router.query;

  const [startPuzzleSessionMutation, { data, loading }] =
    useStartPuzzleSessionMutation({
      variables: {
        puzzleID: puzzleID as string,
        sessionID: puzzleSessionID as string,
      },
    });

  startPuzzleSessionMutation();

  console.log(loading, data?.startPuzzleSession);

  const screen =
    loading || !data?.startPuzzleSession ? (
      <Spinner size="xl" m="auto" />
    ) : (
      <AspectRatio
        ratio={1}
        w={["50vh", "70vh", "80vh", "80vh"]}
        mx="auto"
        my="16"
      >
        <Board boardState={JSON.parse(data?.startPuzzleSession.boardState)} />
      </AspectRatio>
    );

  return (
    <XWordContainer>
      <XWordToolbar
        user={user}
        puzzleStartTime={
          data?.startPuzzleSession.startTime
            ? new Date(data?.startPuzzleSession.startTime)
            : undefined
        }
      />
      {screen}
    </XWordContainer>
  );
};
export default Index;
