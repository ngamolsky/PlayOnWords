import { onSnapshot, doc } from "firebase/firestore";
import { Dispatch, useReducer, useEffect } from "react";
import { db } from "../config/firebase";
import {
  PUZZLE_SESSIONS_COLLECTION,
  STARTING_ORIENTATION,
  STARTING_SELECTED_CELL,
} from "../constants";
import { sessionConverter } from "../models/Session";
import {
  getSession,
  SessionActions,
  SessionActionTypes,
  sessionReducer,
  SessionState,
} from "../reducers/session";

const setInitialState = async (
  sessionID: string,
  dispatch: Dispatch<SessionActions>
) => {
  const session = await getSession(sessionID);
  dispatch({
    type: SessionActionTypes.SET_ORIGINAL_STATE,
    session,
  });
};

export const useSessionState = (
  sessionID: string
): [SessionState, Dispatch<SessionActions>] => {
  const [sessionState, dispatch] = useReducer(sessionReducer, {
    loadingMessage: "Starting your session...",
    localState: {
      orientation: STARTING_ORIENTATION,
      selectedCellKey: STARTING_SELECTED_CELL,
      pencilMode: false,
      rebus: false,
      autocheck: false,
    },
  });

  useEffect(() => {
    setInitialState(sessionID, dispatch);
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, PUZZLE_SESSIONS_COLLECTION, sessionID).withConverter(
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
      autocheck: false,
    },
  });

  return dispatch;
};
