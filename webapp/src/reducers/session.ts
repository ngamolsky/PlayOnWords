import {
  doc,
  updateDoc,
  arrayUnion,
  Timestamp,
  setDoc,
} from "firebase/firestore";
import { Reducer } from "react";
import { db } from "../config/firebase";
import { PUZZLE_SESSIONS_COLLECTION } from "../constants";
import { Puzzle } from "../models/Puzzle";
import {
  SessionState,
  OrientationType,
  CellState,
  BoardState,
  Session,
  CellSelectionState,
} from "../models/Session";
import { User } from "../models/User";
import {
  getNextCellKey,
  getPreviousCellKey,
  getBoardStateFromSolutions,
  getCellKeysForClueAndOrientation,
  getCombinedBoardState,
} from "../utils/sessionUtils";

// #region Actions

export enum SessionActionTypes {
  START_SESSION = "START_SESSION",
  JOIN_SESSION_PARTICIPANTS = "JOIN_SESSION_PARTICIPANTS",
  SET_CELL_LETTER = "SET_CELL_LETTER",
  HANDLE_BACKSPACE = "HANDLE_BACKSPACE",
  HANDLE_CELL_CLICKED = "HANDLE_CELL_CLICKED",
  SET_SHARED_STATE = "SET_SHARED_STATE",
  TOGGLE_ORIENTATION = "TOGGLE_ORIENTATION",
  SET_CELL_SELECTED = "SET_CELL_SELECTED",
  SELECT_NEXT_CELL = "SELECT_NEXT_CELL",
  SELECT_PREVIOUS_CELL = "SELECT_PREVIOUS_CELL",
  MOVE_TO_CLUE = "MOVE_TO_CLUE",
  NEXT_CLUE = "NEXT_CLUE",
  PREVIOUS_CLUE = "PREVIOUS_CLUE",
}

export type SessionActions =
  | {
      type: SessionActionTypes.SET_SHARED_STATE;
      session: Session;
    }
  | {
      type: SessionActionTypes.START_SESSION;
      sessionID: string;
      user: User;
    }
  | {
      type: SessionActionTypes.JOIN_SESSION_PARTICIPANTS;
      userID: string;
    }
  | {
      type: SessionActionTypes.SET_CELL_LETTER;
      cellKey: string;
      letter: string;
    }
  | {
      type: SessionActionTypes.HANDLE_BACKSPACE;
    }
  | {
      type: SessionActionTypes.HANDLE_CELL_CLICKED;
      cellKey: string;
    }
  | { type: SessionActionTypes.TOGGLE_ORIENTATION }
  | { type: SessionActionTypes.SET_CELL_SELECTED; cellKey: string }
  | { type: SessionActionTypes.SELECT_NEXT_CELL }
  | { type: SessionActionTypes.SELECT_PREVIOUS_CELL }
  | {
      type: SessionActionTypes.MOVE_TO_CLUE;
      nextClueIndex: number;
    };

// #endregion

// #region Private Functions

// Shared functions only affect shared state, because they don't set the state locally
// (that happens in the snapshot handler using the special SET_SHARED_STATE action).
// They shouldn't return anything, so it's clear that the modified state can't be used immedietely.

// #region Shared Functions

const _updateBoardState = (sessionID: string, boardState: BoardState): void => {
  const sessionRef = doc(db, PUZZLE_SESSIONS_COLLECTION, sessionID);
  updateDoc(sessionRef, {
    boardState,
  });
};

const _updateCellLetter = (
  sessionID: string,
  boardState: BoardState,
  cellKey: string,
  letter: string
): void => {
  const newCell: CellState = {
    ...boardState[cellKey],
    currentLetter: letter,
  };

  const newBoardState: BoardState = {
    ...boardState,
    [cellKey]: newCell,
  };

  _updateBoardState(sessionID, newBoardState);
};

const _startSession = (sessionID: string, puzzle: Puzzle, user: User): void => {
  const sessionRef = doc(db, PUZZLE_SESSIONS_COLLECTION, sessionID);

  const session = {
    sessionID,
    puzzle,
    participantIDs: [user.userID],
    ownerID: user.userID,
    startTime: Timestamp.now(),
    boardState: getBoardStateFromSolutions(puzzle.solutions),
  };

  setDoc(sessionRef, session);
};

const _joinSessionParticpants = (sessionID: string, userID: string): void => {
  const sessionRef = doc(db, PUZZLE_SESSIONS_COLLECTION, sessionID);

  updateDoc(sessionRef, {
    participantIDs: arrayUnion(userID),
  });
};

// #endregion

// Local functions only affect local state, their returned value should always be the new state after the change.
// #region Local Functions

const _toggleOrientation = (currentState: SessionState): SessionState => {
  const currentOrientation = currentState.localState.orientation;
  return {
    ...currentState,
    localState: {
      ...currentState.localState,
      orientation:
        currentOrientation == OrientationType.HORIZONTAL
          ? OrientationType.VERTICAL
          : OrientationType.HORIZONTAL,
    },
  };
};

const _selectCell = (
  currentState: SessionState,
  cellKey: string
): SessionState => {
  return {
    ...currentState,
    localState: {
      ...currentState.localState,
      selectedCellKey: cellKey,
    },
  };
};

// #endregion

// #endregion

export const sessionReducer: Reducer<SessionState, SessionActions> = (
  state,
  action
) => {
  const {
    localState: { orientation, selectedCellKey },
    session,
  } = state;

  if (!session) {
    console.log("No session found");
    return state;
  }

  const { boardState, puzzle, sessionID } = session;

  const combinedBoardState = getCombinedBoardState(state);

  switch (action.type) {
    case SessionActionTypes.SET_SHARED_STATE: {
      const { session: nextSession } = action;
      return {
        ...state,
        session: nextSession,
      };
    }
    case SessionActionTypes.SET_CELL_LETTER: {
      const { cellKey, letter } = action;
      _updateCellLetter(sessionID, boardState, cellKey, letter);
      return state;
    }
    case SessionActionTypes.HANDLE_BACKSPACE: {
      const previousCellKey = getPreviousCellKey(
        selectedCellKey,
        puzzle,
        orientation
      );

      if (boardState[selectedCellKey].currentLetter) {
        _updateCellLetter(session.sessionID, boardState, selectedCellKey, "");
      } else if (boardState[previousCellKey].currentLetter) {
        _updateCellLetter(sessionID, boardState, previousCellKey, "");
      }

      return _selectCell(state, previousCellKey);
    }
    case SessionActionTypes.HANDLE_CELL_CLICKED: {
      const { cellKey } = action;
      if (
        combinedBoardState[selectedCellKey].cellSelectionState ==
        CellSelectionState.UNSELECTABLE
      )
        return state;

      if (cellKey == selectedCellKey) {
        return _toggleOrientation(state);
      } else {
        return _selectCell(state, cellKey);
      }
    }
    case SessionActionTypes.JOIN_SESSION_PARTICIPANTS: {
      _joinSessionParticpants(sessionID, action.userID);
      return state;
    }
    case SessionActionTypes.START_SESSION: {
      const { sessionID, user } = action;
      _startSession(sessionID, puzzle, user);
      return state;
    }
    case SessionActionTypes.TOGGLE_ORIENTATION: {
      return _toggleOrientation(state);
    }
    case SessionActionTypes.SET_CELL_SELECTED: {
      return _selectCell(state, action.cellKey);
    }
    case SessionActionTypes.SELECT_NEXT_CELL: {
      const nextCellKey = getNextCellKey(selectedCellKey, puzzle, orientation);
      return _selectCell(state, nextCellKey);
    }
    case SessionActionTypes.SELECT_PREVIOUS_CELL: {
      const previousCellKey = getPreviousCellKey(
        selectedCellKey,
        puzzle,
        orientation
      );
      return _selectCell(state, previousCellKey);
    }
    case SessionActionTypes.MOVE_TO_CLUE: {
      const { nextClueIndex } = action;
      if (nextClueIndex >= puzzle.clues[orientation].length) {
        throw new Error("Clue index is out of bounds");
      }

      const nextClue = puzzle.clues[orientation][nextClueIndex];
      const newSelectedCellKey = getCellKeysForClueAndOrientation(
        nextClue,
        orientation
      )[0];

      return _selectCell(state, newSelectedCellKey);
    }
  }
};
