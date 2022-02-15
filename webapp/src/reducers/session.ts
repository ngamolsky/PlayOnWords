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
  SharedActionTypes,
  SelectionActionTypes,
  ClueActionTypes,
  OrientationType,
  CellState,
  BoardState,
  SessionActions,
} from "../models/Session";
import { User } from "../models/User";
import {
  getNextCellKey,
  getPreviousCellKey,
  getBoardStateFromSolutions,
  getCellKeysForClueAndOrientation,
} from "../utils/sessionUtils";

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
    case SharedActionTypes.SET_SHARED_STATE: {
      const { session } = action;
      return {
        ...prevState,
        session,
      };
    }
    case SharedActionTypes.SET_CELL_LETTER: {
      const { sessionID, boardState, cellKey, letter } = action;
      _updateCellLetter(sessionID, boardState, cellKey, letter);
      return prevState;
    }
    case SharedActionTypes.JOIN_SESSION_PARTICIPANTS: {
      _joinSessionParticpants(action.sessionID, action.userID);
      return prevState;
    }
    case SharedActionTypes.START_SESSION: {
      const { sessionID, puzzle, user } = action;
      _startSession(sessionID, puzzle, user);
      return prevState;
    }
    case SelectionActionTypes.TOGGLE_ORIENTATION: {
      return _toggleOrientation(prevState);
    }
    case SelectionActionTypes.SET_CELL_SELECTED: {
      return _selectCell(prevState, action.cellKey);
    }
    case SelectionActionTypes.SELECT_NEXT_CELL: {
      const { puzzle } = action;
      const nextCellKey = getNextCellKey(
        prevSelectedCellKey,
        puzzle,
        prevOrientation
      );
      return _selectCell(prevState, nextCellKey);
    }
    case SelectionActionTypes.SELECT_PREVIOUS_CELL: {
      const { puzzle } = action;
      const previousCellKey = getPreviousCellKey(
        prevSelectedCellKey,
        puzzle,
        prevOrientation
      );
      return _selectCell(prevState, previousCellKey);
    }
    case ClueActionTypes.MOVE_TO_CLUE: {
      const { puzzle, nextClueIndex } = action;

      if (nextClueIndex >= puzzle.clues[prevOrientation].length) {
        throw new Error("Clue index is out of bounds");
      }

      const nextClue = puzzle.clues[prevOrientation][nextClueIndex];
      const newSelectedCellKey = getCellKeysForClueAndOrientation(
        nextClue,
        prevOrientation
      )[0];

      return _selectCell(prevState, newSelectedCellKey);
    }
  }
};
