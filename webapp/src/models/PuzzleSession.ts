import { User } from "./User";
import { Puzzle } from "./Puzzle";
import { PUZZLE_SESSIONS_COLLECTION } from "../constants";
import {
  getNextCellKey,
  getSharedBoardStateFromSolutions,
} from "../utils/puzzleSessionUtils";
import { v4 } from "uuid";
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
import { useState, useEffect, useReducer, Reducer, Dispatch } from "react";
import { SelectionState } from "../pages/Solve";

export enum OrientationType {
  HORIZONTAL = "horizontal",
  VERTICAL = "vertical",
}

export type PuzzleSession = {
  puzzleSessionID: string;
  puzzle: Puzzle;
  participantIDs: string[];
  ownerID: string;
  startTime: Timestamp;
  boardState: SharedBoardState;
};

export type SharedBoardState = {
  [key: string]: SharedCellState;
};

export type BoardState = {
  [key: string]: CellState;
};

export type CellState = SharedCellState & LocalCellState;

export type SharedCellState = {
  solutionState: CellSolutionState;
  currentLetter: string | null;
};

export type LocalCellState = {
  cellSelectionState: CellSelectionState;
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

// #region Hooks

export enum PuzzleSessionActionTypes {
  START_SESSION = "START_SESSION",
  JOIN_SESSION_PARTICIPANTS = "JOIN_SESSION_PARTICIPANTS",
  TOGGLE_ORIENTATION = "TOGGLE_ORIENTATION",
  SET_CELL_LETTER = "SET_CELL_LETTER",
  SET_CELL_SELECTED = "SET_CELL_SELECTED",
  SELECT_NEXT_CELL = "SELECT_NEXT_CELL",
}

type PuzzleSessionActions =
  | {
      type: PuzzleSessionActionTypes.START_SESSION;
      sessionID: string;
      puzzle: Puzzle;
      user: User;
    }
  | {
      type: PuzzleSessionActionTypes.JOIN_SESSION_PARTICIPANTS;
      userID: string;
      sessionID: string;
    }
  | { type: PuzzleSessionActionTypes.TOGGLE_ORIENTATION }
  | {
      type: PuzzleSessionActionTypes.SET_CELL_LETTER;
      cellKey: string;
      letter: string;
      sessionID: string;
    }
  | { type: PuzzleSessionActionTypes.SET_CELL_SELECTED; cellKey: string }
  | { type: PuzzleSessionActionTypes.SELECT_NEXT_CELL; puzzle: Puzzle };

export const sessionReducer: Reducer<SelectionState, PuzzleSessionActions> = (
  prevState: SelectionState,
  action: PuzzleSessionActions
) => {
  const { orientation: prevOrientation, selectedCellKey: prevSelectedCellKey } =
    prevState;

  switch (action.type) {
    case PuzzleSessionActionTypes.TOGGLE_ORIENTATION:
      return {
        ...prevState,
        orientation:
          prevOrientation == OrientationType.HORIZONTAL
            ? OrientationType.VERTICAL
            : OrientationType.HORIZONTAL,
      };
    case PuzzleSessionActionTypes.SET_CELL_SELECTED:
      return {
        ...prevState,
        selectedCellKey: action.cellKey,
      };
    case PuzzleSessionActionTypes.SET_CELL_LETTER: {
      const { letter, cellKey, sessionID } = action;
      const property = `boardState.${cellKey}.currentLetter`;
      updateDoc(doc(db, PUZZLE_SESSIONS_COLLECTION, sessionID), {
        [property]: letter,
      });
      return prevState;
    }
    case PuzzleSessionActionTypes.SELECT_NEXT_CELL: {
      const { puzzle } = action;
      const nextCell = getNextCellKey(
        prevSelectedCellKey,
        puzzle,
        prevOrientation
      );
      return {
        ...prevState,
        selectedCellKey: nextCell,
      };
    }
    case PuzzleSessionActionTypes.JOIN_SESSION_PARTICIPANTS: {
      const { sessionID } = action;
      updateDoc(doc(db, PUZZLE_SESSIONS_COLLECTION, sessionID), {
        participantIDs: arrayUnion(action.userID),
      });
      return prevState;
    }
    case PuzzleSessionActionTypes.START_SESSION: {
      const { puzzle, user, sessionID } = action;
      const session = {
        sessionID,
        puzzle,
        participantIDs: [user.userID],
        ownerID: user.userID,
        startTime: Timestamp.now(),
        boardState: getSharedBoardStateFromSolutions(puzzle.solutions),
      };

      setDoc(doc(db, PUZZLE_SESSIONS_COLLECTION, sessionID), session);
      console.log(`startPuzzleSession: Created session ${sessionID}`);
      return prevState;
    }
  }
  return prevState;
};

const STARTING_LOCAL_STATE = {
  orientation: OrientationType.HORIZONTAL,
  selectedCellKey: "0,0",
};

export const usePuzzleSessionActions = (): Dispatch<PuzzleSessionActions> => {
  const [_, dispatch] = useReducer(sessionReducer, {
    ...STARTING_LOCAL_STATE,
  });

  return dispatch;
};

export const usePuzzleSession = (
  puzzleSessionID: string
): [
  PuzzleSession | undefined,
  boolean,
  SelectionState,
  Dispatch<PuzzleSessionActions>
] => {
  const [sessionState, setSessionState] = useState<{
    session: PuzzleSession | undefined;
    loading: boolean;
  }>({
    session: undefined,
    loading: true,
  });

  const [selectionState, dispatch] = useReducer(sessionReducer, {
    ...STARTING_LOCAL_STATE,
  });

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, PUZZLE_SESSIONS_COLLECTION, puzzleSessionID).withConverter(
        sessionConverter
      ),
      (doc) => {
        console.log(`usePuzzleSession: Snapshot`);
        setSessionState({
          session: doc.data(),
          loading: false,
        });
      }
    );

    return unsub;
  }, []);

  return [sessionState.session, sessionState.loading, selectionState, dispatch];
};

// #endregion

export const isUserInSession = (
  session: PuzzleSession,
  userID: string
): boolean => {
  const matchingUser = session.participantIDs.find(
    (currentUserID) => currentUserID === userID
  );
  return !!matchingUser;
};

const sessionConverter: FirestoreDataConverter<PuzzleSession> = {
  fromFirestore: (snapshot) => snapshot.data() as PuzzleSession,
  toFirestore: (session: PuzzleSession) => session,
};


