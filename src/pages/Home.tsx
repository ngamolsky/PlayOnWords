import React from "react";
import firebase from "firebase/app";
import "firebase/firestore";
import { useCollectionDataOnce } from "react-firebase-hooks/firestore";

import { XWordContainer } from "../components/XWordContainer";
import { XWordToolbar } from "../components/XWordToolbar";
import { User } from "../models/User";
import { fromFirebasePuzzle } from "../models/Puzzles";
import { Grid, Spinner } from "@chakra-ui/react";
import { PuzzleCard, PuzzleCardAction } from "../components/PuzzleCard";
import { NUM_PUZZLES_TO_SHOW_ON_HOME, PUZZLES_COLLECTION } from "../constants";

const Home: React.FC<{ user: User }> = ({ user }) => {
  const [puzzles, loading] = useCollectionDataOnce(
    firebase
      .firestore()
      .collection(PUZZLES_COLLECTION)
      .orderBy("date", "desc")
      .limit(NUM_PUZZLES_TO_SHOW_ON_HOME),
    {
      transform: fromFirebasePuzzle,
    }
  );

  let screen;
  if (loading) screen = <Spinner size="xl" m="auto" />;
  else if (puzzles)
    screen = (
      <Grid templateColumns="repeat(5, 1fr)" gap={6} mt={8} w={"80%"}>
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
      </Grid>
    );

  return (
    <XWordContainer>
      <XWordToolbar isSignedIn={!!user} user={user} />
      {screen}
    </XWordContainer>
  );
};

export default Home;
