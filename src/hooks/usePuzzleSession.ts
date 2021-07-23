import firebase from "firebase/app";
import { useDocumentDataOnce } from "react-firebase-hooks/firestore";
import { useParams } from "react-router-dom";
import { PUZZLE_SESSIONS_COLLECTION } from "../constants";
import {
  fromFirebasePuzzleSession,
  PuzzleSession,
  PuzzleSessionActions,
  puzzleSessionActions,
} from "../models/PuzzleSession";

const usePuzzleSession = (): [
  PuzzleSession | undefined,
  PuzzleSessionActions,
  boolean,
  firebase.auth.Error | undefined
] => {
  const { puzzleSessionID } = useParams<{ puzzleSessionID?: string }>();

  const [puzzleSession, loading, error] = useDocumentDataOnce(
    firebase
      .firestore()
      .collection(PUZZLE_SESSIONS_COLLECTION)
      .doc(puzzleSessionID),
    { transform: fromFirebasePuzzleSession }
  );

  return [puzzleSession, puzzleSessionActions, loading, error];
};

export default usePuzzleSession;
