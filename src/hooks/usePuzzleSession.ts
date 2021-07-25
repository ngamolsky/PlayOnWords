import firebase from "firebase/app";
import { useDocumentDataOnce } from "react-firebase-hooks/firestore";
import { PUZZLE_SESSIONS_COLLECTION } from "../constants";
import {
  fromFirebasePuzzleSession,
  PuzzleSession,
  puzzleSessionActions,
} from "../models/PuzzleSession";

const usePuzzleSession = (
  puzzleSessionID: string
): [
  PuzzleSession,
  typeof puzzleSessionActions,
  boolean,
  firebase.auth.Error | undefined
] => {
  const [puzzleSession, loading, error] = useDocumentDataOnce(
    firebase
      .firestore()
      .collection(PUZZLE_SESSIONS_COLLECTION)
      .doc(puzzleSessionID),
    { transform: fromFirebasePuzzleSession }
  );

  return [puzzleSession!, puzzleSessionActions, loading, error];
};

export default usePuzzleSession;
