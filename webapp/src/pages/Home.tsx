import React from "react";
import { XWordContainer } from "../components/XWordContainer";
import { NUM_PUZZLES_TO_SHOW_ON_HOME } from "../constants";
import { useHistory } from "react-router-dom";
import { useRecentPuzzles } from "../models/Puzzle";
import { useLoggedInUser } from "../models/User";
import Avatar from "../components/Avatar";
import { toXWordDate } from "../utils/timeAndDateUtils";
import { PuzzleCard } from "../components/PuzzleCard";

const Home: React.FC = () => {
  const history = useHistory();
  const [puzzles, loading] = useRecentPuzzles(NUM_PUZZLES_TO_SHOW_ON_HOME);

  const user = useLoggedInUser();

  return (
    <XWordContainer
      isLoading={loading}
      toolbarChildren={<Avatar user={user} />}
    >
      {puzzles &&
        puzzles.map((puzzle) => (
          <PuzzleCard
            key={puzzle.puzzleID}
            puzzle={puzzle}
            onClick={(action) => console.log(action)}
          />
        ))}
    </XWordContainer>
  );
};

export default Home;
