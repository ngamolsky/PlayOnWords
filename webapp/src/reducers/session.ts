import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  Timestamp,
  setDoc,
  deleteField,
} from "firebase/firestore";
import { Reducer } from "react";
import { db } from "../config/firebase";
import { PUZZLE_SESSIONS_COLLECTION } from "../constants";
import { Puzzle } from "../models/Puzzle";
import {
  CellState,
  BoardState,
  Session,
  CellSelectionState,
  CellSolutionState,
  sessionConverter,
  SessionStatus,
} from "../models/Session";
import { User } from "../models/User";
import { LOG_LEVEL, LOG_LEVEL_TYPES } from "../settings";
import {
  getNextCellKey,
  getPreviousCellKey,
  getBoardStateFromSolutions,
  getCellKeysForClueAndOrientation,
  getCombinedBoardState,
  getClueFromCellKeyOrientationAndPuzzle,
  getSizeFromCellKeys,
  getFirstSelectableCellKey,
  getPercentageComplete,
} from "../utils/sessionUtils";

// #region State
export type SessionState = {
  session?: Session;
  loadingMessage?: string;
  localState: LocalSessionState;
};

export enum OrientationType {
  HORIZONTAL = "horizontal",
  VERTICAL = "vertical",
}

export type LocalSessionState = {
  orientation: OrientationType;
  selectedCellKey: string;
  pencilMode: boolean;
  rebus: boolean;
  autocheck: boolean;
};

// #endregion

// #region Actions

export enum SessionActionTypes {
  SET_ORIGINAL_STATE = "SET_ORIGINAL_STATE",
  SET_SHARED_STATE = "SET_SHARED_STATE",
  SET_SESSION_LOADING = "SET_SESSION_LOADING",
  JOIN_SESSION_PARTICIPANTS = "JOIN_SESSION_PARTICIPANTS",
  LETTER_PRESSED = "LETTER_PRESSED",
  BACKSPACE = "BACKSPACE",
  CELL_CLICKED = "CELL_CLICKED",
  TOGGLE_ORIENTATION = "TOGGLE_ORIENTATION",
  NEXT_CLUE = "NEXT_CLUE",
  PREVIOUS_CLUE = "PREVIOUS_CLUE",
  PENCIL_CLICKED = "PENCIL_CLICKED",
  REBUS_CLICKED = "REBUS_CLICKED",
  AUTOCHECK_CLICKED = "AUTOCHECK_CLICKED",
  CHECK_PUZZLE = "CHECK_PUZZLE",
  CHECK_WORD = "CHECK_WORD",
  CHECK_SQUARE = "CHECK_SQUARE",
  REVEAL_PUZZLE = "REVEAL_PUZZLE",
  REVEAL_WORD = "REVEAL_WORD",
  REVEAL_SQUARE = "REVEAL_SQUARE",
  RESET_PUZZLE = "RESET_PUZZLE",
}

export type SessionActions =
  | {
      type: SessionActionTypes.SET_ORIGINAL_STATE;
      session: Session;
    }
  | {
      type: SessionActionTypes.SET_SHARED_STATE;
      session: Session;
    }
  | {
      type: SessionActionTypes.SET_SESSION_LOADING;
      sessionLoading: boolean;
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
  | { type: SessionActionTypes.NEXT_CLUE }
  | { type: SessionActionTypes.PREVIOUS_CLUE }
  | { type: SessionActionTypes.PENCIL_CLICKED }
  | { type: SessionActionTypes.REBUS_CLICKED }
  | { type: SessionActionTypes.AUTOCHECK_CLICKED }
  | { type: SessionActionTypes.CHECK_SQUARE; userID: string }
  | { type: SessionActionTypes.CHECK_WORD; userID: string }
  | { type: SessionActionTypes.CHECK_PUZZLE; userID: string }
  | { type: SessionActionTypes.REVEAL_SQUARE; userID: string }
  | { type: SessionActionTypes.REVEAL_WORD; userID: string }
  | { type: SessionActionTypes.REVEAL_PUZZLE; userID: string }
  | { type: SessionActionTypes.RESET_PUZZLE; userID: string };

// #endregion

// #region Private Functions

// Shared functions only affect shared state, because they don't set the state locally
// (that happens in the snapshot handler using the special SET_SHARED_STATE action).
// They shouldn't return anything, so it's clear that the modified state can't be used immediately.

// #region Shared Functions

const _updateBoardState = (sessionID: string, boardState: BoardState): void => {
  const sessionRef = doc(db, PUZZLE_SESSIONS_COLLECTION, sessionID);
  updateDoc(sessionRef, {
    boardState,
  });
};

const _updateSessionStatus = (
  sessionID: string,
  sessionStatus: SessionStatus
): void => {
  const sessionRef = doc(db, PUZZLE_SESSIONS_COLLECTION, sessionID);

  if (sessionStatus == SessionStatus.COMPLETE) {
    updateDoc(sessionRef, {
      sessionStatus,
      endTime: Timestamp.now(),
    });
  } else {
    updateDoc(sessionRef, {
      sessionStatus,
      endTime: deleteField(),
      startTime: Timestamp.now(),
    });
  }
};

const _updateCellState = (
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

const _toggleRebus = (currentState: SessionState): SessionState => {
  return {
    ...currentState,
    localState: {
      ...currentState.localState,
      rebus: !currentState.localState.rebus,
    },
  };
};

const _toggleAutocheck = (currentState: SessionState): SessionState => {
  return {
    ...currentState,
    localState: {
      ...currentState.localState,
      autocheck: !currentState.localState.autocheck,
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

// #region Utilities

const _requireSession = (session: Session | undefined): Session => {
  if (!session) {
    throw new Error("Session required for this action!");
  }

  return session;
};

const _checkCell = (
  cellSolution: string | string[],
  currentCellValue: string
): CellSolutionState => {
  let isCorrect = false;
  if (Array.isArray(cellSolution)) {
    isCorrect = cellSolution.includes(currentCellValue);
  } else if (typeof cellSolution == "string") {
    isCorrect = cellSolution == currentCellValue;
  }

  return isCorrect ? CellSolutionState.REVEALED : CellSolutionState.WRONG;
};

// #endregion

// #endregion

// #region Public

export const startSession = async (
  sessionID: string,
  puzzle: Puzzle,
  user: User
): Promise<void> => {
  const sessionRef = doc(
    db,
    PUZZLE_SESSIONS_COLLECTION,
    sessionID
  ).withConverter(sessionConverter);

  const session: Session = {
    sessionID,
    puzzle,
    participantIDs: [user.userID],
    ownerID: user.userID,
    startTime: Timestamp.now(),
    boardState: getBoardStateFromSolutions(puzzle.solutions),
    sessionStatus: SessionStatus.STARTED,
  };

  console.log("Starting Session:", sessionID);
  await setDoc(sessionRef, session);
};

export const getSession = async (sessionID: string): Promise<Session> => {
  const sessionRef = doc(
    db,
    PUZZLE_SESSIONS_COLLECTION,
    sessionID
  ).withConverter(sessionConverter);

  console.log("Getting Session:", sessionID);

  const session = (await getDoc(sessionRef)).data();

  if (!session) {
    throw Error("No session found");
  }
  return session;
};

// #endregion

export const sessionReducer: Reducer<SessionState, SessionActions> = (
  state,
  action
) => {
  const {
    localState: { orientation, selectedCellKey, pencilMode, rebus, autocheck },
    session,
  } = state;

  if (LOG_LEVEL == LOG_LEVEL_TYPES.DEBUG) {
    console.log("Session Action:", action);
  }

  switch (action.type) {
    case SessionActionTypes.SET_ORIGINAL_STATE: {
      const { session: nextSession } = action;
      const firstSelectedKey = getFirstSelectableCellKey(nextSession.puzzle);
      return {
        ...state,
        localState: {
          ...state.localState,
          selectedCellKey: firstSelectedKey,
        },
        session: nextSession,
        loadingMessage: undefined,
      };
    }
    case SessionActionTypes.SET_SHARED_STATE: {
      const { session: nextSession } = action;
      const { boardState, puzzle, sessionStatus } = nextSession;

      const percentComplete = getPercentageComplete(
        boardState,
        puzzle.solutions
      );
      if (percentComplete == 100 && sessionStatus !== SessionStatus.COMPLETE) {
        _updateSessionStatus(nextSession.sessionID, SessionStatus.COMPLETE);
      }

      return {
        ...state,
        session: nextSession,
        loadingMessage: undefined,
      };
    }
    case SessionActionTypes.SET_SESSION_LOADING: {
      const { sessionLoading } = action;
      return {
        ...state,
        sessionLoading,
      };
    }
    case SessionActionTypes.JOIN_SESSION_PARTICIPANTS: {
      const { sessionID } = _requireSession(session);
      _joinSessionParticpants(sessionID, action.userID);
      return state;
    }
    case SessionActionTypes.LETTER_PRESSED: {
      const { boardState, sessionID, puzzle, sessionStatus } =
        _requireSession(session);
      const { letter, userID, solutionState } = action;
      const cellSolution = puzzle.solutions[selectedCellKey];

      if (!cellSolution) return state;

      if (sessionStatus != SessionStatus.COMPLETE) {
        _updateCellState(
          sessionID,
          userID,
          boardState,
          selectedCellKey,
          autocheck ? _checkCell(cellSolution, letter) : solutionState,
          letter
        );
      }

      const nextCellKey = getNextCellKey(selectedCellKey, puzzle, orientation);
      return _selectCell(state, nextCellKey);
    }
    case SessionActionTypes.BACKSPACE: {
      const { boardState, puzzle, sessionID } = _requireSession(session);
      const { userID } = action;

      let newState = state;

      if (rebus) {
        newState = _toggleRebus(newState);
      }

      const previousCellKey = getPreviousCellKey(
        selectedCellKey,
        puzzle,
        orientation
      );

      if (boardState[selectedCellKey].currentLetter) {
        _updateCellState(
          sessionID,
          userID,
          boardState,
          selectedCellKey,
          CellSolutionState.NONE,
          ""
        );
      } else if (boardState[previousCellKey].currentLetter) {
        _updateCellState(
          sessionID,
          userID,
          boardState,
          previousCellKey,
          CellSolutionState.NONE,
          ""
        );
      }

      return _selectCell(newState, previousCellKey);
    }
    case SessionActionTypes.CELL_CLICKED: {
      _requireSession(session);
      const { cellKey } = action;
      const combinedBoardState = getCombinedBoardState(state);
      let newState = state;
      if (rebus) {
        newState = _toggleRebus(newState);
      }

      if (
        combinedBoardState[cellKey].cellSelectionState ==
        CellSelectionState.UNSELECTABLE
      ) {
        return newState;
      }

      if (cellKey == selectedCellKey) {
        return _toggleOrientation(newState);
      } else {
        return _selectCell(newState, cellKey);
      }
    }
    case SessionActionTypes.TOGGLE_ORIENTATION: {
      return _toggleOrientation(state);
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
        const firstSelectableCellKey = getFirstSelectableCellKey(puzzle);
        newState = _toggleOrientation(newState);
        newState = _selectCell(newState, firstSelectableCellKey);
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
    case SessionActionTypes.PENCIL_CLICKED: {
      return {
        ...state,
        localState: {
          ...state.localState,
          pencilMode: !pencilMode,
        },
      };
    }
    case SessionActionTypes.REBUS_CLICKED: {
      return _toggleRebus(state);
    }
    case SessionActionTypes.AUTOCHECK_CLICKED: {
      return _toggleAutocheck(state);
    }
    case SessionActionTypes.CHECK_SQUARE: {
      const { sessionID, boardState, puzzle } = _requireSession(session);
      const { userID } = action;
      const currentCellValue = boardState[selectedCellKey].currentLetter;
      const cellSolution = puzzle.solutions[selectedCellKey];

      if (!currentCellValue || !cellSolution) return state;

      const solutionState = _checkCell(cellSolution, currentCellValue);

      _updateCellState(
        sessionID,
        userID,
        boardState,
        selectedCellKey,
        solutionState,
        currentCellValue
      );

      return state;
    }
    case SessionActionTypes.CHECK_WORD: {
      const { sessionID, boardState, puzzle } = _requireSession(session);
      const { userID } = action;
      const currentCellValue = boardState[selectedCellKey].currentLetter;
      const cellSolution = puzzle.solutions[selectedCellKey];

      if (!currentCellValue || !cellSolution) return state;

      const currentClue = getClueFromCellKeyOrientationAndPuzzle(
        selectedCellKey,
        orientation,
        puzzle
      );
      const activeCellKeys = getCellKeysForClueAndOrientation(
        currentClue,
        orientation
      );

      const newBoardState = boardState;
      activeCellKeys.forEach((cellKey) => {
        const cellSolution = puzzle.solutions[cellKey];
        const cellLetter = boardState[cellKey].currentLetter;

        if (!cellSolution || !cellLetter) return;

        const solutionState = _checkCell(cellSolution, cellLetter);

        newBoardState[cellKey] = {
          ...newBoardState[cellKey],
          solutionState,
          lastEditedBy: userID,
        };
      });

      _updateBoardState(sessionID, newBoardState);
      return state;
    }
    case SessionActionTypes.CHECK_PUZZLE: {
      const { sessionID, boardState, puzzle } = _requireSession(session);
      const { userID } = action;
      const currentCellValue = boardState[selectedCellKey].currentLetter;
      const cellSolution = puzzle.solutions[selectedCellKey];

      if (!currentCellValue || !cellSolution) return state;

      const newBoardState = boardState;
      Object.keys(boardState).forEach((cellKey) => {
        const cellSolution = puzzle.solutions[cellKey];
        const cellLetter = boardState[cellKey].currentLetter;

        if (!cellSolution || !cellLetter) return;

        const solutionState = _checkCell(cellSolution, cellLetter);

        newBoardState[cellKey] = {
          ...newBoardState[cellKey],
          solutionState,
          lastEditedBy: userID,
        };
      });

      _updateBoardState(sessionID, newBoardState);
      return state;
    }
    case SessionActionTypes.REVEAL_SQUARE: {
      const { sessionID, boardState, puzzle } = _requireSession(session);
      const { userID } = action;
      const cellSolution = puzzle.solutions[selectedCellKey];

      if (!cellSolution) return state;

      _updateCellState(
        sessionID,
        userID,
        boardState,
        selectedCellKey,
        CellSolutionState.REVEALED,
        cellSolution[0]
      );

      return state;
    }
    case SessionActionTypes.REVEAL_WORD: {
      const { sessionID, boardState, puzzle } = _requireSession(session);
      const { userID } = action;
      const cellSolution = puzzle.solutions[selectedCellKey];

      if (!cellSolution) return state;

      const currentClue = getClueFromCellKeyOrientationAndPuzzle(
        selectedCellKey,
        orientation,
        puzzle
      );
      const activeCellKeys = getCellKeysForClueAndOrientation(
        currentClue,
        orientation
      );

      const newBoardState = boardState;
      activeCellKeys.forEach((cellKey) => {
        const cellSolution = puzzle.solutions[cellKey];

        if (!cellSolution) return;

        newBoardState[cellKey] = {
          ...newBoardState[cellKey],
          currentLetter: cellSolution[0],
          solutionState: CellSolutionState.REVEALED,
          lastEditedBy: userID,
        };
      });

      _updateBoardState(sessionID, newBoardState);
      return state;
    }
    case SessionActionTypes.REVEAL_PUZZLE: {
      const { sessionID, boardState, puzzle } = _requireSession(session);
      const { userID } = action;
      const cellSolution = puzzle.solutions[selectedCellKey];

      if (!cellSolution) return state;

      const newBoardState = boardState;
      Object.keys(boardState).forEach((cellKey) => {
        const cellSolution = puzzle.solutions[cellKey];

        if (!cellSolution) return;

        newBoardState[cellKey] = {
          ...newBoardState[cellKey],
          currentLetter: cellSolution[0],
          solutionState: CellSolutionState.REVEALED,
          lastEditedBy: userID,
        };
      });

      _updateBoardState(sessionID, newBoardState);
      return state;
    }
    case SessionActionTypes.RESET_PUZZLE: {
      const { sessionID, puzzle } = _requireSession(session);
      const { userID } = action;
      const newBoardState = getBoardStateFromSolutions(
        puzzle.solutions,
        userID
      );

      _updateBoardState(sessionID, newBoardState);
      _updateSessionStatus(sessionID, SessionStatus.STARTED);
      return state;
    }
  }
};
