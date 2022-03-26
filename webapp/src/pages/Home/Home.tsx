import React, { useState } from "react";
import { XWordContainer } from "../../components/XWordContainer";
import { NUM_PUZZLES_TO_SHOW_ON_HOME } from "../../constants";
import { useHistory } from "react-router-dom";
import { Puzzle, useRecentPuzzles } from "../../models/Puzzle";
import { signOut, useLoggedInUser } from "../../models/User";
import Avatar from "../../components/Avatar";
import { PuzzleCard } from "../../components/PuzzleCard";
import StartSessionModal from "./StartSessionModal";

const Home: React.FC = () => {
  const history = useHistory();
  const [puzzles, puzzleLoadingMessage] = useRecentPuzzles(
    NUM_PUZZLES_TO_SHOW_ON_HOME
  );

  const [sessionLoading, setSessionLoading] = useState<boolean>(false);
  const [modalShowing, setModalShowing] = useState<boolean>(false);
  const [selectedPuzzle, setSelectedPuzzle] = useState<Puzzle>();

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
      toolbarChildren={
        <Avatar
          user={user}
          onClick={() => {
            signOut(user.username);
          }}
        />
      }
    >
      {selectedPuzzle && (
        <StartSessionModal
          modalShowing={modalShowing}
          selectedPuzzle={selectedPuzzle}
          user={user}
          setSessionLoading={setSessionLoading}
          setModalShowing={setModalShowing}
          setSessionID={(sessionID) => {
            history.push(`/solve/${sessionID}`);
          }}
        />
      )}

      <div className="flex flex-col">
        {puzzles &&
          puzzles.map((puzzle) => (
            <PuzzleCard
              key={puzzle.puzzleID}
              puzzle={puzzle}
              onClick={async () => {
                setSelectedPuzzle(puzzle);
                setModalShowing(true);
              }}
            />
          ))}
      </div>
    </XWordContainer>
  );
};

export default Home;
