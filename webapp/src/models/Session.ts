import { Puzzle } from "./Puzzle";
import {
  collection,
  deleteField,
  doc,
  FirestoreDataConverter,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  arrayUnion
} from "firebase/firestore";
import { useState, useEffect, Dispatch, useReducer } from "react";
import { db } from "../config/firebase";
import {
  SESSIONS_COLLECTION,
  STARTING_ORIENTATION,
  FIRST_CELL_KEY,
} from "../constants";
import { SessionActions, SessionActionTypes, SessionState, sessionReducer } from "../reducers/session";
import { LOG_LEVEL, LOG_LEVEL_TYPES } from "../settings";
import { getBoardStateFromSolutions } from "../utils/sessionUtils";
import { User } from "./User";

export enum SessionStatus {
  STARTED = "STARTED",
  COMPLETE = "COMPLETE",
}

export type Session = {
  sessionID: string;
  puzzle: Puzzle;
  participants: User[];
  startedBy: User;
  startTime: Timestamp;
  boardState: BoardState;
  sessionStatus: SessionStatus;
  endTime?: Timestamp;
  lastUpdatedTime: Timestamp;
};

export type BoardState = {
  [key: string]: CellState;
};

export type CellState = {
  solutionState: CellSolutionState;
  currentLetter: string | null;
  lastEditedBy?: string;
};

export enum CellSolutionState {
  REVEALED = "revealed",
  WRONG = "wrong",
  NONE = "none",
  PENCIL = "pencil",
}

export enum CellSelectionState {
  SELECTED_WORD = "selected_word",
  SELECTED_CELL = "selected_cell",
  UNSELECTED = "unselected",
  UNSELECTABLE = "unselectable",
}

export type CombinedCellState = CellState & {
  cellSelectionState: CellSelectionState;
};

export type CombinedBoardState = {
  [key: string]: CombinedCellState;
};

export const startSession = async (
  sessionID: string,
  puzzle: Puzzle,
  user: User,
  participants?: User[]
): Promise<void> => {
  const sessionRef = doc(db, SESSIONS_COLLECTION, sessionID).withConverter(
    sessionConverter
  );

  const session: Session = {
    sessionID,
    puzzle,
    participants: participants ? [user].concat(participants) : [user],
    startedBy: user,
    startTime: Timestamp.now(),
    boardState: getBoardStateFromSolutions(puzzle.solutions),
    sessionStatus: SessionStatus.STARTED,
    lastUpdatedTime: Timestamp.now(),
  };

  if (LOG_LEVEL == LOG_LEVEL_TYPES.DEBUG) {
    console.log("Starting Session:", sessionID);
  }

  await setDoc(sessionRef, session);
};

export const getSession = async (sessionID: string): Promise<Session> => {
  const sessionRef = doc(db, SESSIONS_COLLECTION, sessionID).withConverter(
    sessionConverter
  );

  if (LOG_LEVEL == LOG_LEVEL_TYPES.DEBUG) {
    console.log("Getting Session:", sessionID);
  }

  const session = (await getDoc(sessionRef)).data();

  if (!session) {
    throw Error("No session found");
  }
  return session;
};

export const updateBoardState = async (
  sessionID: string,
  boardState: BoardState
) => {
  const sessionRef = doc(db, SESSIONS_COLLECTION, sessionID);
  return updateDoc(sessionRef, {
    boardState,
    lastUpdatedTime: Timestamp.now(),
  });
};

export const updateCellState = async (
  sessionID: string,
  cellKey: string,
  cellState: CellState
) => {
  const sessionRef = doc(db, SESSIONS_COLLECTION, sessionID);
  const fieldPath = `boardState.${cellKey}`;
  const fieldData: { [key: string]: Timestamp | CellState } = {};

  fieldData[fieldPath] = cellState;
  fieldData.lastUpdatedTime = Timestamp.now();

  return updateDoc(sessionRef, fieldData);
};

export const updateSessionStatus = async (
  sessionID: string,
  sessionStatus: SessionStatus
) => {
  const sessionRef = doc(db, SESSIONS_COLLECTION, sessionID);

  if (sessionStatus == SessionStatus.COMPLETE) {
    return updateDoc(sessionRef, {
      sessionStatus,
      endTime: Timestamp.now(),
      lastUpdatedTime: Timestamp.now(),
    });
  } else {
    return updateDoc(sessionRef, {
      sessionStatus,
      endTime: deleteField(),
      startTime: Timestamp.now(),
      lastUpdatedTime: Timestamp.now(),
    });
  }
};

export const joinSessionParticipants = async (sessionID: string, user: User) => {
  const sessionRef = doc(db, SESSIONS_COLLECTION, sessionID).withConverter(
    sessionConverter
  );

  return updateDoc<Session>(sessionRef, {
    participants: arrayUnion(user),
  });
};

//#region Hooks

export const useSessionState = (
  sessionID: string,
  currentUserID: string
): [SessionState, Dispatch<SessionActions>] => {
  const [sessionState, dispatch] = useReducer(sessionReducer, {
    loadingMessage: "Starting your session...",
    localState: {
      orientation: STARTING_ORIENTATION,
      selectedCellKey: FIRST_CELL_KEY,
      pencilMode: false,
      rebus: false,
      autocheck: false,
    },
  });

  useEffect(() => {
    const setInitialState = async (
      sessionID: string,
      dispatch: Dispatch<SessionActions>
    ) => {
      const session = await getSession(sessionID);
      dispatch({
        type: SessionActionTypes.SET_ORIGINAL_STATE,
        session,
      });

      if (LOG_LEVEL == LOG_LEVEL_TYPES.DEBUG) {
        console.log(
          "Firestore Request: useSessionState. Loaded initial session",
          session.sessionID
        );
      }
    };

    setInitialState(sessionID, dispatch);
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, SESSIONS_COLLECTION, sessionID).withConverter(sessionConverter),
      (doc) => {
        const session = doc.data();
        if (session) {
          if (LOG_LEVEL == LOG_LEVEL_TYPES.DEBUG) {
            console.log(
              "Firestore Request: useSessionState. Session updated:",
              session.sessionID
            );
          }
          dispatch({
            type: SessionActionTypes.SET_SHARED_STATE,
            session: session,
            currentUserID,
          });
        } else {
          if (LOG_LEVEL == LOG_LEVEL_TYPES.DEBUG) {
            console.log(
              "Firestore Request: useSessionState. No Session Found."
            );
          }
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
      selectedCellKey: FIRST_CELL_KEY,
      pencilMode: false,
      rebus: false,
      autocheck: false,
    },
  });

  return dispatch;
};

export const useRecentSessionsForUser = (
  numSessions: number,
  participant: User,
  puzzle: Puzzle,
  completed?: boolean
): [Session[] | undefined, string | undefined] => {
  const [sessionsState, setSessionsState] = useState<{
    sessions: Session[];
    loadingMessage?: string;
  }>({
    sessions: [],
    loadingMessage: "Loading recent sessions...",
  });

  useEffect(() => {
    const q = query(
      collection(db, SESSIONS_COLLECTION).withConverter(sessionConverter),
      where("participants", "array-contains", participant),
      where(
        "sessionStatus",
        "==",
        completed ? SessionStatus.COMPLETE : SessionStatus.STARTED
      ),
      where("puzzle.puzzleID", "==", puzzle.puzzleID),
      orderBy("lastUpdatedTime", "desc"),
      limit(numSessions)
    );
      
    const unsub = onSnapshot(q, (querySnapshot) => {
      const sessions: Session[] = [];
      querySnapshot.forEach((doc) => {
        sessions.push(doc.data());
      });

      if (LOG_LEVEL == LOG_LEVEL_TYPES.DEBUG) {
        console.log(
          "Firestore Request: useRecentSessionsForUser. Sessions updated:",
          JSON.stringify(sessions.map((session) => session.sessionID))
        );
      }

      setSessionsState({
        sessions,
        loadingMessage: undefined,
      });
    });
    return unsub;
  }, [numSessions]);

  return [sessionsState.sessions, sessionsState.loadingMessage];
};

//#endregion

export const sessionConverter: FirestoreDataConverter<Session> = {
  fromFirestore: (snapshot) => snapshot.data() as Session,
  toFirestore: (session: Session) => session,
};
