import firebase from "firebase/app";
import { useCollectionDataOnce } from "react-firebase-hooks/firestore";
import { PUZZLES_COLLECTION } from "../constants";
import { fromFirebasePuzzle, Puzzle } from "../models/Puzzle";

const useRecentPuzzles = (
  num_puzzles: number
): [Puzzle[] | undefined, boolean, firebase.auth.Error | undefined] => {
  const [puzzles, loading, error] = useCollectionDataOnce(
    firebase
      .firestore()
      .collection(PUZZLES_COLLECTION)
      .orderBy("date", "desc")
      .limit(num_puzzles),
    {
      transform: fromFirebasePuzzle,
    }
  );

  return [puzzles, loading, error];
};

export default useRecentPuzzles;
