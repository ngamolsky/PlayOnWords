import { onSnapshot, doc, FirestoreDataConverter } from "firebase/firestore";
import { Dispatch, useReducer, useEffect } from "react";
import { db } from "../config/firebase";
import {
  PUZZLE_SESSIONS_COLLECTION,
  STARTING_ORIENTATION,
  STARTING_SELECTED_CELL,
} from "../constants";
import { SessionState, Session } from "../models/Session";
import {
  SessionActions,
  SessionActionTypes,
  sessionReducer,
} from "../reducers/session";

export const useSessionState = (
  puzzleSessionID: string
): [SessionState, Dispatch<SessionActions>] => {
  const [sessionState, dispatch] = useReducer(sessionReducer, {
    localState: {
      orientation: STARTING_ORIENTATION,
      selectedCellKey: STARTING_SELECTED_CELL,
      pencilMode: false,
      rebus: false,
    },
  });

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, PUZZLE_SESSIONS_COLLECTION, puzzleSessionID).withConverter(
        sessionConverter
      ),
      (doc) => {
        const session = doc.data();
        if (session) {
          dispatch({
            type: SessionActionTypes.SET_SHARED_STATE,
            session: session,
          });
        } else {
          console.log("No session data found");
        }
      }
    );

    return unsub;
  }, []);

  return [sessionState, dispatch];
};

export const useSessionActions = (): Dispatch<SessionActions> => {
  const [, dispatch] = useReducer(sessionReducer, {
    localState: {
      orientation: STARTING_ORIENTATION,
      selectedCellKey: STARTING_SELECTED_CELL,
      pencilMode: false,
      rebus: false,
    },
  });

  return dispatch;
};

const sessionConverter: FirestoreDataConverter<Session> = {
  fromFirestore: (snapshot) => snapshot.data() as Session,
  toFirestore: (session: Session) => session,
};
