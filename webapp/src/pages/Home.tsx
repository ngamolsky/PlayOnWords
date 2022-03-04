import React, { useState } from "react";
import { XWordContainer } from "../components/XWordContainer";
import { NUM_PUZZLES_TO_SHOW_ON_HOME } from "../constants";
import { useHistory } from "react-router-dom";
import { useRecentPuzzles } from "../models/Puzzle";
import { signOut, useLoggedInUser } from "../models/User";
import Avatar from "../components/Avatar";
import { PuzzleCard, PuzzleCardAction } from "../components/PuzzleCard";
import { v4 } from "uuid";
import { startSession } from "../reducers/session";

const Home: React.FC = () => {
  const history = useHistory();
  const [puzzles, puzzleLoadingMessage] = useRecentPuzzles(
    NUM_PUZZLES_TO_SHOW_ON_HOME
  );

  const [sessionLoading, setSessionLoading] = useState<boolean>(false);

  const user = useLoggedInUser();

  const loadingMessage = sessionLoading
    ? "Starting your session..."
    : puzzleLoadingMessage
    ? puzzleLoadingMessage
    : undefined;
  return (
    <XWordContainer
      showToolbar
      loadingMessage={loadingMessage}
      toolbarChildren={<Avatar user={user} onClick={signOut} />}
    >
      {puzzles &&
        puzzles.map((puzzle) => (
          <PuzzleCard
            key={puzzle.puzzleID}
            puzzle={puzzle}
            onClick={async (action) => {
              switch (action) {
                case PuzzleCardAction.NEW_GAME:
                  setSessionLoading(true);
                  const sessionID = `session.${v4()}`;

                  await startSession(sessionID, puzzle, user);
                  history.push(`/solve/${sessionID}`);
                  return;
                case PuzzleCardAction.CONTINUE_GAME:
                  console.log("CONTINUE GAME");
                  return;
                case PuzzleCardAction.END_GAME:
                  console.log("END GAME");
                  return;
              }
            }}
          />
        ))}
    </XWordContainer>
  );
};

export default Home;
