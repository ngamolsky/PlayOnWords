import { Box, Spinner, Grid } from "@chakra-ui/react";
import React, { useEffect } from "react";
import { XWordContainer } from "../components/XWordContainer";
import { NextApiResponse } from "next";

import { XWordRequest } from "../types";
import { User } from "./api/models/User";
import {
  useEndPuzzleSessionMutation,
  useGetPuzzleSessionsForUserQuery,
  useRecentPuzzlesQuery,
} from "../generated/graphql";
import { XWordToolbar } from "../components/XWordToolbar";
import { PuzzleCard, PuzzleCardAction } from "../components/PuzzleCard";
import { withServerSidePropsProtect } from "./api/middleware/withServerSidePropsProtect";
import { makeVar } from "@apollo/client";
import { PuzzleSession } from "./api/models/PuzzleSession";
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
const isMounted = makeVar(false);

const Index: React.FC<{
  user: User;
}> = ({ user }) => {
  useEffect(() => {
    isMounted(true);
  }, []);

  // Get recent puzzles
  const { data: puzzlesData, loading: puzzlesLoading } = useRecentPuzzlesQuery({
    variables: {
      limit: NUM_PUZZLES_TO_LOAD,
    },
  });

  // Get user puzzle session data
  const { data: userSessionsData } = useGetPuzzleSessionsForUserQuery({
    variables: {
      userID: user.userID,
    },
  });

  const [endPuzzleSessionMutation] = useEndPuzzleSessionMutation();

  const router = useRouter();

  const screen =
    puzzlesLoading || !isMounted() ? (
      <Spinner size="xl" m="auto" />
    ) : (
      <Box w="80%">
        <Grid templateColumns="repeat(5, 1fr)" gap={6} mt={8}>
          {puzzlesData &&
            puzzlesData.recentPuzzles.map((puzzle) => {
              const existingSessionData =
                userSessionsData?.getPuzzleSessionsForUser.filter(
                  (sessionData) =>
                    sessionData.puzzle.puzzleID == puzzle.puzzleID
                );

              const sessionData =
                existingSessionData?.length == 1
                  ? existingSessionData[0]
                  : null;
              return (
                <PuzzleCard
                  hasSession={!!sessionData}
                  puzzleDate={new Date(puzzle.date)}
                  key={puzzle.puzzleID}
                  onClick={async (action) => {
                    switch (action) {
                      case PuzzleCardAction.NEW_GAME:
                        const sessionID = PuzzleSession.generateID();
                        router.push(
                          `solve/${sessionID}?puzzleID=${puzzle.puzzleID}`
                        );
                        return;
                      case PuzzleCardAction.CONTINUE_GAME:
                        // setCurrentSessionID(sessionData!.sessionID);
                        return;
                      case PuzzleCardAction.END_GAME:
                        await endPuzzleSessionMutation({
                          variables: {
                            sessionID: sessionData!.sessionID!,
                          },
                        });
                        return;
                    }
                  }}
                />
              );
            })}
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
