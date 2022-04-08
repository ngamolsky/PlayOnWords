import React, { useState } from "react";
import { XWordContainer } from "../../components/XWordContainer";
import { useHistory } from "react-router-dom";
import {
  Puzzle,
  usePuzzlesByDayOfWeek,
  useRecentPuzzles,
} from "../../models/Puzzle";
import { useLoggedInUser } from "../../models/User";
import Avatar from "../../components/Avatar";
import { PuzzleCard } from "./PuzzleCard";
import StartSessionModal from "./StartSessionModal";
import Tabs from "../../components/Tabs";
import { NUM_PUZZLES_TO_SHOW_ON_HOME } from "../../constants";

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
            history.push("/signOut");
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
      <Tabs
        tabArray={[
          {
            title: "Recent Puzzles",
            content: (
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
            ),
          },
          {
            title: "Puzzles By Day Of Week",
            content: (
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
            ),
          },
          {
            title: "Puzzles By Date",
            content: (
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
            ),
          },
        ]}
      />
    </XWordContainer>
  );
};

export default Home;
