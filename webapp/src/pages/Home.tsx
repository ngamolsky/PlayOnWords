import React from "react";
import { XWordContainer } from "../components/XWordContainer";
import { XWordToolbar } from "../components/XWordToolbar";
import { SimpleGrid, Spinner } from "@chakra-ui/react";
import { PuzzleCard, PuzzleCardAction } from "../components/PuzzleCard";
import { NUM_PUZZLES_TO_SHOW_ON_HOME } from "../constants";
import { startPuzzleSession } from "../models/PuzzleSession";
import { useHistory } from "react-router-dom";
import { UserGroup } from "../components/UserGroup";
import { useRecentPuzzles } from "../models/Puzzle";
import { useLoggedInUser } from "../models/User";

const Home: React.FC = () => {
  const history = useHistory();
  const [puzzles, loading] = useRecentPuzzles(NUM_PUZZLES_TO_SHOW_ON_HOME);

  const user = useLoggedInUser();

  let screen = undefined;
  if (loading) screen = <Spinner size="xl" m="auto" />;
  else if (puzzles)
    screen = (
      <SimpleGrid minChildWidth="220px" gap={6} my={8} w={"80%"}>
        {puzzles.map((puzzle) => {
          return (
            <PuzzleCard
              key={puzzle.puzzleID}
              hasSession={false}
              puzzleDate={puzzle.puzzleTimestamp.toDate()}
              onClick={async (action) => {
                switch (action) {
                  case PuzzleCardAction.NEW_GAME: {
                    if (user) {
                      const { puzzleSessionID } = await startPuzzleSession(
                        puzzle,
                        user
                      );
                      history.push(`/solve/${puzzleSessionID}`);
                    } else {
                      throw new Error("No User Found");
                    }

                    return;
                  }

                  case PuzzleCardAction.CONTINUE_GAME:
                    console.log("CONTINUE GAME");
                    return;
                  case PuzzleCardAction.END_GAME:
                    console.log("END GAME");
                    return;
                }
              }}
            />
          );
        })}
      </SimpleGrid>
    );

  return (
    <XWordContainer>
      <XWordToolbar>{user && <UserGroup currentUser={user} />}</XWordToolbar>
      {screen}
    </XWordContainer>
  );
};

export default Home;
