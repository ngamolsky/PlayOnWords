import { User } from "./User";
import { Puzzle } from "./Puzzle";
import { PUZZLE_SESSIONS_COLLECTION } from "../constants";
import {
  getCellKeysForClueAndOrientation,
  getNextCellKey,
  getPreviousCellKey,
  getSharedBoardStateFromSolutions,
} from "../utils/puzzleSessionUtils";
import {
  onSnapshot,
  doc,
  FirestoreDataConverter,
  setDoc,
  Timestamp,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { useEffect, useReducer, Reducer, Dispatch } from "react";

export enum OrientationType {
  HORIZONTAL = "horizontal",
  VERTICAL = "vertical",
}

export type Session = {
  sessionID: string;
  puzzle: Puzzle;
  participantIDs: string[];
  ownerID: string;
  startTime: Timestamp;
  boardState: SharedBoardState;
};

export type SessionState = {
  session?: Session;
  localState: LocalSessionState;
  isLoading: boolean;
};

export type LocalSessionState = {
  orientation: OrientationType;
  selectedCellKey: string;
};

export type SharedBoardState = {
  [key: string]: SharedCellState;
};

export type SharedCellState = {
  solutionState: CellSolutionState;
  currentLetter: string | null;
  lastEditedBy?: string;
};

export enum CellSelectionState {
  SELECTED_WORD = "selected_word",
  SELECTED_CELL = "selected_cell",
  UNSELECTED = "unselected",
  UNSELECTABLE = "unselectable",
}

export enum CellSolutionState {
  REVEALED = "revealed",
  WRONG = "wrong",
  NONE = "none",
}

export type CombinedCellState = SharedCellState & {
  cellSelectionState: CellSelectionState;
};

export type CombinedBoardState = {
  [key: string]: CombinedCellState;
};

// #region Hooks

export enum SessionActionTypes {
  SET_IS_LOADING = "SET_IS_LOADING",
  SET_SHARED_STATE = "SET_SHARED_STATE",
  TOGGLE_ORIENTATION = "TOGGLE_ORIENTATION",
  SET_CELL_SELECTED = "SET_CELL_SELECTED",
  SELECT_NEXT_CELL = "SELECT_NEXT_CELL",
  SELECT_PREVIOUS_CELL = "SELECT_PREVIOUS_CELL",
  START_SESSION = "START_SESSION",
  JOIN_SESSION_PARTICIPANTS = "JOIN_SESSION_PARTICIPANTS",
  SET_CELL_LETTER = "SET_CELL_LETTER",
  MOVE_TO_CLUE = "MOVE_TO_CLUE",
}

type SessionActions =
  | {
      type: SessionActionTypes.MOVE_TO_CLUE;
      puzzle: Puzzle;
      nextClueIndex: number;
    }
  | { type: SessionActionTypes.SET_IS_LOADING; isLoading: boolean }
  | { type: SessionActionTypes.SET_SHARED_STATE; session: Session }
  | { type: SessionActionTypes.TOGGLE_ORIENTATION }
  | { type: SessionActionTypes.SET_CELL_SELECTED; cellKey: string }
  | { type: SessionActionTypes.SELECT_NEXT_CELL; puzzle: Puzzle }
  | { type: SessionActionTypes.SELECT_PREVIOUS_CELL; puzzle: Puzzle }
  | {
      type: SessionActionTypes.START_SESSION;
      sessionID: string;
      puzzle: Puzzle;
      user: User;
    }
  | {
      type: SessionActionTypes.JOIN_SESSION_PARTICIPANTS;
      sessionID: string;
      userID: string;
    }
  | {
      type: SessionActionTypes.SET_CELL_LETTER;
      boardState: SharedBoardState;
      sessionID: string;
      cellKey: string;
      letter: string;
    };

export const sessionReducer: Reducer<SessionState, SessionActions> = (
  prevState,
  action
) => {
  const {
    localState: {
      orientation: prevOrientation,
      selectedCellKey: prevSelectedCellKey,
    },
  } = prevState;

  switch (action.type) {
    case SessionActionTypes.SET_IS_LOADING:
      const { isLoading } = action;
      return {
        ...prevState,
        isLoading,
      };
    case SessionActionTypes.SET_SHARED_STATE:
      const { session } = action;
      return {
        ...prevState,
        session,
      };
    case SessionActionTypes.TOGGLE_ORIENTATION:
      return {
        ...prevState,
        localState: {
          ...prevState.localState,
          orientation:
            prevOrientation == OrientationType.HORIZONTAL
              ? OrientationType.VERTICAL
              : OrientationType.HORIZONTAL,
        },
      };
    case SessionActionTypes.SET_CELL_SELECTED:
      return {
        ...prevState,
        localState: {
          ...prevState.localState,
          selectedCellKey: action.cellKey,
        },
      };

    case SessionActionTypes.SELECT_NEXT_CELL: {
      const { puzzle } = action;
      const nextCell = getNextCellKey(
        prevSelectedCellKey,
        puzzle,
        prevOrientation
      );
      return {
        ...prevState,
        localState: {
          ...prevState.localState,
          selectedCellKey: nextCell,
        },
      };
    }
    case SessionActionTypes.SELECT_PREVIOUS_CELL: {
      const { puzzle } = action;

      const previousCell = getPreviousCellKey(
        prevSelectedCellKey,
        puzzle,
        prevOrientation
      );

      return {
        ...prevState,
        localState: {
          ...prevState.localState,
          selectedCellKey: previousCell,
        },
      };
    }
    case SessionActionTypes.SET_CELL_LETTER: {
      const { letter, cellKey, sessionID, boardState } = action;
      const sessionRef = doc(db, PUZZLE_SESSIONS_COLLECTION, sessionID);
      const newCell: SharedCellState = {
        ...boardState[cellKey],
        currentLetter: letter,
      };

      const newBoardState: SharedBoardState = {
        ...boardState,
        [cellKey]: newCell,
      };

      updateDoc(sessionRef, {
        boardState: newBoardState,
      });

      return prevState;
    }
    case SessionActionTypes.JOIN_SESSION_PARTICIPANTS: {
      const sessionRef = doc(db, PUZZLE_SESSIONS_COLLECTION, action.sessionID);

      updateDoc(sessionRef, {
        participantIDs: arrayUnion(action.userID),
      });
      return prevState;
    }
    case SessionActionTypes.START_SESSION: {
      const { puzzle, user, sessionID } = action;
      const sessionRef = doc(db, PUZZLE_SESSIONS_COLLECTION, sessionID);

      const session = {
        sessionID,
        puzzle,
        participantIDs: [user.userID],
        ownerID: user.userID,
        startTime: Timestamp.now(),
        boardState: getSharedBoardStateFromSolutions(puzzle.solutions),
      };

      setDoc(sessionRef, session);
      console.log(`startPuzzleSession: Created session ${sessionID}`);
      return prevState;
    }
    case SessionActionTypes.MOVE_TO_CLUE: {
      const { puzzle, nextClueIndex } = action;

      if (nextClueIndex >= puzzle.clues[prevOrientation].length) {
        throw new Error("Clue index is out of bounds");
      }

      const nextClue = puzzle.clues[prevOrientation][nextClueIndex];
      const newSelectedCell = getCellKeysForClueAndOrientation(
        nextClue,
        prevOrientation
      )[0];

      return {
        ...prevState,
        localState: {
          ...prevState.localState,
          selectedCellKey: newSelectedCell,
        },
      };
    }
  }
};

const STARTING_LOCAL_STATE = {
  orientation: OrientationType.HORIZONTAL,
  selectedCellKey: "0,0",
};

export const useSessionActions = (): Dispatch<SessionActions> => {
  const [, dispatch] = useReducer(sessionReducer, {
    localState: STARTING_LOCAL_STATE,
    isLoading: true,
  });

  return dispatch;
};

export const useSessionState = (
  puzzleSessionID: string
): [SessionState, Dispatch<SessionActions>] => {
  const [sessionState, dispatch] = useReducer(sessionReducer, {
    localState: STARTING_LOCAL_STATE,
    isLoading: true,
  });

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, PUZZLE_SESSIONS_COLLECTION, puzzleSessionID).withConverter(
        sessionConverter
      ),
      (doc) => {
        console.log(`useSessionState: Snapshot`);
        const sessionData = doc.data();
        if (sessionData) {
          dispatch({
            type: SessionActionTypes.SET_SHARED_STATE,
            session: sessionData,
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

// #endregion

export const isUserInSession = (session: Session, userID: string): boolean => {
  const matchingUser = session.participantIDs.find(
    (currentUserID) => currentUserID === userID
  );
  return !!matchingUser;
};

const sessionConverter: FirestoreDataConverter<Session> = {
  fromFirestore: (snapshot) => snapshot.data() as Session,
  toFirestore: (session: Session) => session,
};


