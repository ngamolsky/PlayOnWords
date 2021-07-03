import { Box, Spinner, Grid } from "@chakra-ui/react";
import React, { useEffect } from "react";
import { XWordContainer } from "../components/XWordContainer";
import { NextApiResponse } from "next";
import { XWordRequest } from "../types";
import { User } from "./api/models/User";
import {
  useRecentPuzzlesQuery,
  useStartPuzzleSessionMutation,
} from "../generated/graphql";
import { XWordToolbar } from "../components/XWordToolbar";
import { PuzzleCard } from "../components/PuzzleCard";
import { withServerSidePropsProtect } from "./api/middleware/withServerSidePropsProtect";
import { useRouter } from "next/router";

export const getServerSideProps = async ({
  req,
  res,
}: {
  req: XWordRequest;
  res: NextApiResponse;
}) => {
  return withServerSidePropsProtect(req, res);
};

const NUM_PUZZLES_TO_LOAD = 10;

const Index: React.FC<{ user: User }> = ({ user }) => {
  const [
    startPuzzleSessionMutation,
    { loading: sessionLoading, data: sessionData },
  ] = useStartPuzzleSessionMutation();

  const { data: puzzlesData, loading: puzzlesLoading } = useRecentPuzzlesQuery({
    variables: {
      limit: NUM_PUZZLES_TO_LOAD,
    },
  });

  const router = useRouter();

  useEffect(() => {
    if (!sessionData) return;
    router.push(`/solve/${sessionData!.startPuzzleSession.sessionID}`);
  }, [sessionData, sessionLoading, router]);

  const screen =
    puzzlesLoading || sessionLoading || sessionData ? (
      <Spinner size="xl" m="auto" />
    ) : (
      <Box w="80%" h="100vh">
        <Grid templateColumns="repeat(5, 1fr)" gap={6} mt={8}>
          {puzzlesData?.recentPuzzles.map((puzzle) => (
            <PuzzleCard
              puzzleDate={new Date(puzzle.date)}
              puzzleID={puzzle.puzzleID}
              key={puzzle.puzzleID}
              onClick={async (puzzleID) => {
                await startPuzzleSessionMutation({
                  variables: {
                    puzzleID,
                  },
                });
              }}
            />
          ))}
        </Grid>
      </Box>
    );

  return (
    <XWordContainer>
      <XWordToolbar user={user} />
      {screen}
    </XWordContainer>
  );
};
export default Index;
