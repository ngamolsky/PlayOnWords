import { Puzzle, SpecialCellType } from "./Puzzle";
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
  arrayUnion,
  deleteDoc,
} from "firebase/firestore";
import { useState, useEffect, Dispatch, useReducer } from "react";
import { db } from "../config/firebase";
import {
  SESSIONS_COLLECTION,
  STARTING_ORIENTATION,
  FIRST_CELL_KEY,
} from "../constants";
import {
  SessionActions,
  SessionActionTypes,
  SessionState,
  sessionReducer,
} from "../reducers/session";
import { LOG_LEVEL, LOG_LEVEL_TYPES } from "../settings";
import { getBoardStateFromSolutions } from "../utils/sessionUtils";
import { User } from "./User";

export type Session = {
  sessionID: string;
  puzzle: Puzzle;
  participantData: SessionParticipantData[];
  participantIDs: string[];
  startedBy: User;
  startTime: Timestamp;
  boardState: BoardState;
  sessionStatus: SessionStatus;
  endTime?: Timestamp;
  lastUpdatedTime: Timestamp;
};

export type SessionParticipantData = {
  username: string;
  userID: string;
  isOnline: boolean;
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
  RELATED_CLUE_SELECTED = "related_clue_selected",
}

export enum SessionStatus {
  STARTED = "started",
  COMPLETE = "complete",
}

export type CombinedCellState = CellState & {
  cellSelectionState: CellSelectionState;
  specialCellType?: SpecialCellType;
};

export type CombinedBoardState = {
  [key: string]: CombinedCellState;
};

export const startSession = async (
  sessionID: string,
  puzzle: Puzzle,
  user: User,
  participants?: User[]
): Promise<Session> => {
  const sessionRef = doc(db, SESSIONS_COLLECTION, sessionID).withConverter(
    sessionConverter
  );

  const currentUserData = {
    username: user.username,
    userID: user.userID,
    isOnline: true,
  };

  const session: Session = {
    sessionID,
    puzzle,
    participantData: participants
      ? [currentUserData].concat(
          participants.map((user) => ({
            username: user.username,
            userID: user.userID,
            isOnline: false,
          }))
        )
      : [currentUserData],
    participantIDs: participants
      ? [currentUserData.userID].concat(participants.map((user) => user.userID))
      : [currentUserData.userID],
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
  return session;
};

export const deleteSession = async (sessionID: string): Promise<void> => {
  const sessionRef = doc(db, SESSIONS_COLLECTION, sessionID).withConverter(
    sessionConverter
  );

  if (LOG_LEVEL == LOG_LEVEL_TYPES.DEBUG) {
    console.log("Deleting Session:", sessionID);
  }

  await deleteDoc(sessionRef);
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
  cellState: CellState,
  deleteFieldName?: keyof CellState
) => {
  const sessionRef = doc(db, SESSIONS_COLLECTION, sessionID);
  const fieldPath: keyof BoardState = `boardState.${cellKey}`;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fieldData: { [key: string]: any } = {};

  fieldData[fieldPath] = cellState;

  if (deleteFieldName) {
    const result = `${fieldPath}.${deleteFieldName}`;
    fieldData[result] = deleteField();
  }

  console.log("here", sessionID, cellState);

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

export const joinSessionParticipants = async (
  sessionID: string,
  user: User
) => {
  const sessionRef = doc(db, SESSIONS_COLLECTION, sessionID).withConverter(
    sessionConverter
  );

  return updateDoc<Session>(sessionRef, {
    participantData: arrayUnion({
      username: user.username,
      userID: user.userID,
      isOnline: true,
    }),
    participantIDs: arrayUnion(user.userID),
  });
};

export const setUserOnlineForSession = async (
  sessionID: string,
  userID: string,
  isOnline: boolean
): Promise<void> => {
  const existingSession = await getSession(sessionID);

  const newParticipantData = existingSession.participantData.reduce<
    SessionParticipantData[]
  >((result, userData) => {
    if (userData.userID == userID) {
      result.push({
        ...userData,
        isOnline,
      });
    } else {
      result.push({
        ...userData,
      });
    }

    return result;
  }, []);

  const sessionRef = doc(db, SESSIONS_COLLECTION, sessionID).withConverter(
    sessionConverter
  );

  if (LOG_LEVEL == LOG_LEVEL_TYPES.DEBUG) {
    console.log(
      "Firestore action: setting user online for session",
      JSON.stringify(newParticipantData),
      sessionID
    );
  }
  await setDoc<Session>(
    sessionRef,
    {
      participantData: newParticipantData,
    },
    { merge: true }
  );
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

    setUserOnlineForSession(sessionID, currentUserID, true);
    setInitialState(sessionID, dispatch);
    return () => {
      setUserOnlineForSession(sessionID, currentUserID, false);
    };
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

  const onVisibilityChange = () => {
    if (sessionState.session) {
      setUserOnlineForSession(
        sessionState.session.sessionID,
        currentUserID,
        document.visibilityState === "visible"
      );
    }
  };

  useEffect(() => {
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
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
  puzzle?: Puzzle,
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
    if (puzzle) {
      const q = query(
        collection(db, SESSIONS_COLLECTION).withConverter(sessionConverter),
        where("participantIDs", "array-contains", participant.userID),
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
    }
  }, [numSessions]);

  return [sessionsState.sessions, sessionsState.loadingMessage];
};

//#endregion

export const sessionConverter: FirestoreDataConverter<Session> = {
  fromFirestore: (snapshot) => snapshot.data() as Session,
  toFirestore: (session: Session) => session,
};
