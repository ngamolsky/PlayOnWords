import {
  doc,
  updateDoc,
  arrayUnion,
  Timestamp,
  setDoc,
} from "firebase/firestore";
import { Reducer } from "react";
import { db } from "../config/firebase";
import {
  PUZZLE_SESSIONS_COLLECTION,
  STARTING_SELECTED_CELL,
} from "../constants";
import { Puzzle } from "../models/Puzzle";
import {
  SessionState,
  OrientationType,
  CellState,
  BoardState,
  Session,
  CellSelectionState,
  CellSolutionState,
} from "../models/Session";
import { User } from "../models/User";
import {
  getNextCellKey,
  getPreviousCellKey,
  getBoardStateFromSolutions,
  getCellKeysForClueAndOrientation,
  getCombinedBoardState,
  getClueFromCellKeyOrientationAndPuzzle,
  getSizeFromCellKeys,
} from "../utils/sessionUtils";

// #region Actions

export enum SessionActionTypes {
  SET_SHARED_STATE = "SET_SHARED_STATE",
  START_SESSION = "START_SESSION",
  JOIN_SESSION_PARTICIPANTS = "JOIN_SESSION_PARTICIPANTS",
  LETTER_PRESSED = "LETTER_PRESSED",
  BACKSPACE = "BACKSPACE",
  CELL_CLICKED = "CELL_CLICKED",
  TOGGLE_ORIENTATION = "TOGGLE_ORIENTATION",
  MOVE_TO_CLUE = "MOVE_TO_CLUE",
  NEXT_CLUE = "NEXT_CLUE",
  PREVIOUS_CLUE = "PREVIOUS_CLUE",
  PENCIL_CLICKED = "PENCIL_CLICKED",
}

export type SessionActions =
  | {
      type: SessionActionTypes.SET_SHARED_STATE;
      session: Session;
    }
  | {
      type: SessionActionTypes.START_SESSION;
      sessionID: string;
      puzzle: Puzzle;
      user: User;
    }
  | {
      type: SessionActionTypes.JOIN_SESSION_PARTICIPANTS;
      userID: string;
    }
  | {
      type: SessionActionTypes.LETTER_PRESSED;
      letter: string;
      userID: string;
      solutionState: CellSolutionState;
    }
  | {
      type: SessionActionTypes.BACKSPACE;
      userID: string;
    }
  | {
      type: SessionActionTypes.CELL_CLICKED;
      cellKey: string;
    }
  | { type: SessionActionTypes.TOGGLE_ORIENTATION }
  | {
      type: SessionActionTypes.MOVE_TO_CLUE;
      nextClueIndex: number;
    }
  | { type: SessionActionTypes.NEXT_CLUE }
  | { type: SessionActionTypes.PREVIOUS_CLUE }
  | { type: SessionActionTypes.PENCIL_CLICKED };

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
  userID: string,
  boardState: BoardState,
  cellKey: string,
  solutionState: CellSolutionState,
  letter: string
): void => {
  const newCell: CellState = {
    solutionState,
    currentLetter: letter,
    lastEditedBy: userID,
  };

  const newBoardState: BoardState = {
    ...boardState,
    [cellKey]: newCell,
  };

  _updateBoardState(sessionID, newBoardState);
};

export const _startSession = (
  sessionID: string,
  puzzle: Puzzle,
  user: User
): void => {
  const sessionRef = doc(db, PUZZLE_SESSIONS_COLLECTION, sessionID);

  const session = {
    sessionID,
    puzzle,
    participantIDs: [user.userID],
    ownerID: user.userID,
    startTime: Timestamp.now(),
    boardState: getBoardStateFromSolutions(puzzle.solutions),
  };

  console.log("Starting Session:", sessionID);
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

const _requireSession = (session: Session | undefined): Session => {
  if (!session) {
    throw new Error("Session required for this action!");
  }

  return session;
};

// #endregion

export const sessionReducer: Reducer<SessionState, SessionActions> = (
  state,
  action
) => {
  const {
    localState: { orientation, selectedCellKey, isPencilModeOn },
    session,
  } = state;

  switch (action.type) {
    case SessionActionTypes.SET_SHARED_STATE: {
      const { session: nextSession } = action;
      return {
        ...state,
        session: nextSession,
      };
    }
    case SessionActionTypes.START_SESSION: {
      const { sessionID, puzzle, user } = action;

      _startSession(sessionID, puzzle, user);
      return state;
    }
    case SessionActionTypes.JOIN_SESSION_PARTICIPANTS: {
      const { sessionID } = _requireSession(session);
      _joinSessionParticpants(sessionID, action.userID);
      return state;
    }
    case SessionActionTypes.LETTER_PRESSED: {
      const { boardState, sessionID, puzzle } = _requireSession(session);
      const { letter, userID, solutionState } = action;

      _updateCellLetter(
        sessionID,
        userID,
        boardState,
        selectedCellKey,
        solutionState,
        letter
      );

      const nextCellKey = getNextCellKey(selectedCellKey, puzzle, orientation);
      return _selectCell(state, nextCellKey);
    }
    case SessionActionTypes.BACKSPACE: {
      const { boardState, puzzle, sessionID } = _requireSession(session);
      const { userID } = action;

      const previousCellKey = getPreviousCellKey(
        selectedCellKey,
        puzzle,
        orientation
      );

      if (boardState[selectedCellKey].currentLetter) {
        _updateCellLetter(
          sessionID,
          userID,
          boardState,
          selectedCellKey,
          CellSolutionState.NONE,
          ""
        );
      } else if (boardState[previousCellKey].currentLetter) {
        _updateCellLetter(
          sessionID,
          userID,
          boardState,
          previousCellKey,
          CellSolutionState.NONE,
          ""
        );
      }

      return _selectCell(state, previousCellKey);
    }
    case SessionActionTypes.CELL_CLICKED: {
      _requireSession(session);
      const { cellKey } = action;
      const combinedBoardState = getCombinedBoardState(state);

      if (
        combinedBoardState[cellKey].cellSelectionState ==
        CellSelectionState.UNSELECTABLE
      ) {
        return state;
      }

      if (cellKey == selectedCellKey) {
        return _toggleOrientation(state);
      } else {
        return _selectCell(state, cellKey);
      }
    }

    case SessionActionTypes.TOGGLE_ORIENTATION: {
      return _toggleOrientation(state);
    }
    case SessionActionTypes.MOVE_TO_CLUE: {
      const { nextClueIndex } = action;
      const { puzzle } = _requireSession(session);

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
    case SessionActionTypes.NEXT_CLUE: {
      const { puzzle } = _requireSession(session);

      const currentSelectedClue = getClueFromCellKeyOrientationAndPuzzle(
        selectedCellKey,
        orientation,
        puzzle
      );

      const currentClueIndex = puzzle.clues[orientation].findIndex(
        (clue) => clue == currentSelectedClue
      );

      const isLastClue =
        currentClueIndex == puzzle.clues[orientation].length - 1;
      let newState: SessionState = state;
      if (isLastClue) {
        newState = _toggleOrientation(newState);
        newState = _selectCell(newState, STARTING_SELECTED_CELL);
      } else {
        const nextClue = puzzle.clues[orientation][currentClueIndex + 1];
        const newSelectedCellKey = getCellKeysForClueAndOrientation(
          nextClue,
          orientation
        )[0];

        newState = _selectCell(newState, newSelectedCellKey);
      }

      return newState;
    }
    case SessionActionTypes.PREVIOUS_CLUE: {
      const { puzzle } = _requireSession(session);

      const currentSelectedClue = getClueFromCellKeyOrientationAndPuzzle(
        selectedCellKey,
        orientation,
        puzzle
      );

      const currentClueIndex = puzzle.clues[orientation].findIndex(
        (clue) => clue == currentSelectedClue
      );

      const isFirstClue = currentClueIndex == 0;
      let newState: SessionState = state;
      if (isFirstClue) {
        const { width, height } = getSizeFromCellKeys(
          Object.keys(puzzle.solutions)
        );
        const lastCellKey = `${width - 1},${height - 1}`;
        newState = _toggleOrientation(newState);
        newState = _selectCell(newState, lastCellKey);
      } else {
        const nextClue = puzzle.clues[orientation][currentClueIndex - 1];
        const newSelectedCellKey = getCellKeysForClueAndOrientation(
          nextClue,
          orientation
        )[0];

        newState = _selectCell(newState, newSelectedCellKey);
      }

      return newState;
    }
    case SessionActionTypes.MOVE_TO_CLUE: {
      const { nextClueIndex } = action;
      const { puzzle } = _requireSession(session);

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
    case SessionActionTypes.PENCIL_CLICKED:
      return {
        ...state,
        localState: {
          ...state.localState,
          isPencilModeOn: !isPencilModeOn,
        },
      };
  }
};
