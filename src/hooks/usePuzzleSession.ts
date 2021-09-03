import firebase from "firebase/app";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { PUZZLE_SESSIONS_COLLECTION } from "../constants";
import { PuzzleSession } from "../models/PuzzleSession";

const usePuzzleSession = (
  puzzleSessionID: string
): [PuzzleSession | undefined, boolean, firebase.auth.Error | undefined] => {
  const [sessionData, loading, error] = useDocumentData<PuzzleSession>(
    firebase
      .firestore()
      .collection(PUZZLE_SESSIONS_COLLECTION)
      .doc(puzzleSessionID),
    {
      transform: (data) => {
        return {
          ...data,
          participants: data.participants.map(
            (each: firebase.firestore.DocumentData) => ({
              ...each,
              createDate: each.createDate.toDate(),
            })
          ),
          startTime: data.startTime.toDate(),
        };
      },
    }
  );

  return [sessionData, loading, error];
};

export default usePuzzleSession;
