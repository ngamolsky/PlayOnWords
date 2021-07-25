import firebase from "firebase/app";
import { useCollectionOnce } from "react-firebase-hooks/firestore";
import { PUZZLES_COLLECTION } from "../constants";
import { fromFirebasePuzzle, Puzzle } from "../models/Puzzle";

const useRecentPuzzles = (
  num_puzzles: number
): [Puzzle[] | undefined, boolean, firebase.auth.Error | undefined] => {
  const [puzzlesSnapshot, loading, error] = useCollectionOnce(
    firebase
      .firestore()
      .collection(PUZZLES_COLLECTION)
      .orderBy("date", "desc")
      .limit(num_puzzles)
  );

  const puzzles = puzzlesSnapshot?.docs.map((puzzleSnapshot) =>
    fromFirebasePuzzle(puzzleSnapshot)
  );
  return [puzzles, loading, error];
};

export default useRecentPuzzles;
