import firebase from "firebase/app";
import { useDocument } from "react-firebase-hooks/firestore";
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
  const [sessionSnapshot, loading, error] = useDocument(
    firebase
      .firestore()
      .collection(PUZZLE_SESSIONS_COLLECTION)
      .doc(puzzleSessionID)
  );

  const puzzleSession = fromFirebasePuzzleSession(sessionSnapshot!);
  return [puzzleSession!, puzzleSessionActions, loading, error];
};

export default usePuzzleSession;
