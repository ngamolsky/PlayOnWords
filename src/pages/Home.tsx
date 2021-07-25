import React from "react";
import "firebase/firestore";
import { XWordContainer } from "../components/XWordContainer";
import { XWordToolbar } from "../components/XWordToolbar";
import { SimpleGrid, Spinner } from "@chakra-ui/react";
import { PuzzleCard, PuzzleCardAction } from "../components/PuzzleCard";
import useRecentPuzzles from "../hooks/useRecentPuzzles";
import { NUM_PUZZLES_TO_SHOW_ON_HOME } from "../constants";

const Home: React.FC = () => {
  const [puzzles, loading] = useRecentPuzzles(NUM_PUZZLES_TO_SHOW_ON_HOME);

  let screen;
  if (loading) screen = <Spinner size="xl" m="auto" />;
  else if (puzzles)
    screen = (
      <SimpleGrid minChildWidth="220px" gap={6} my={8} w={"80%"}>
        {puzzles.map((puzzle) => {
          return (
            <PuzzleCard
              key={puzzle.puzzleID}
              hasSession={false}
              puzzleDate={puzzle.date}
              onClick={async (action) => {
                switch (action) {
                  case PuzzleCardAction.NEW_GAME:
                    console.log("NEW GAME");
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
          );
        })}
      </SimpleGrid>
    );

  return (
    <XWordContainer>
      <XWordToolbar />
      {screen}
    </XWordContainer>
  );
};

export default Home;
