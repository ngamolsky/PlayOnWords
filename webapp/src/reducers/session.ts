import { diff } from "deep-object-diff";
import { Reducer } from "react";
import { FIRST_CELL_KEY } from "../constants";
import {
  BoardState,
  Session,
  CellSelectionState,
  CellSolutionState,
  SessionStatus,
  updateBoardState,
  updateSessionStatus,
  updateCellState,
  joinSessionParticipants,
  CellState,
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
  getPercentageComplete,
  checkPuzzle,
  getNextEmptyCellKey,
  isLastCellInClue,
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
  NEXT_CELL = "NEXT_CELL",
  PREVIOUS_CELL = "PREVIOUS_CELL",
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
      currentUserID: string;
    }
  | {
      type: SessionActionTypes.SET_SESSION_LOADING;
      sessionLoading: boolean;
    }
  | {
      type: SessionActionTypes.JOIN_SESSION_PARTICIPANTS;
      user: User;
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
  | { type: SessionActionTypes.NEXT_CELL }
  | { type: SessionActionTypes.PREVIOUS_CELL }
  | { type: SessionActionTypes.PENCIL_CLICKED }
  | { type: SessionActionTypes.REBUS_CLICKED }
  | { type: SessionActionTypes.AUTOCHECK_CLICKED }
  | { type: SessionActionTypes.CHECK_SQUARE }
  | { type: SessionActionTypes.CHECK_WORD }
  | { type: SessionActionTypes.CHECK_PUZZLE }
  | { type: SessionActionTypes.REVEAL_SQUARE }
  | { type: SessionActionTypes.REVEAL_WORD }
  | { type: SessionActionTypes.REVEAL_PUZZLE }
  | { type: SessionActionTypes.RESET_PUZZLE };

// #endregion

// #region Private Functions

// Shared functions only affect shared state, because they don't set the state locally
// (that happens in the snapshot handler using the special SET_SHARED_STATE action).
// They shouldn't return anything, so it's clear that the modified state can't be used immediately.

// #region Shared Functions

const _updateBoardState = (sessionID: string, boardState: BoardState): void => {
  updateBoardState(sessionID, boardState);
};

const _updateSessionStatus = (
  sessionID: string,
  sessionStatus: SessionStatus
): void => {
  updateSessionStatus(sessionID, sessionStatus);
};

const _updateCellState = (
  sessionID: string,
  cellKey: string,
  cellState: CellState
): void => {
  updateCellState(sessionID, cellKey, cellState);
};

export const _joinSessionParticipants = (
  sessionID: string,
  user: User
): void => {
  joinSessionParticipants(sessionID, user);
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

      if (nextSession.sessionStatus == SessionStatus.COMPLETE) {
        return _selectCell(state, FIRST_CELL_KEY);
      }

      const firstSelectedKey = getNextEmptyCellKey(
        FIRST_CELL_KEY,
        nextSession.puzzle,
        nextSession.boardState,
        OrientationType.HORIZONTAL
      )[0];

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

      if (session) {
        const sessionDiff = diff(session, nextSession);

        console.log("difference!", sessionDiff);
      }

      const percentComplete = getPercentageComplete(
        boardState,
        puzzle.solutions
      );
      if (
        percentComplete == 100 &&
        sessionStatus !== SessionStatus.COMPLETE &&
        checkPuzzle(boardState, puzzle.solutions)
      ) {
        _updateSessionStatus(nextSession.sessionID, SessionStatus.COMPLETE);
      }

      return {
        ...state,
        session: {
          ...nextSession,
          boardState: nextSession.boardState,
        },
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
      _joinSessionParticipants(sessionID, action.user);
      return state;
    }
    case SessionActionTypes.LETTER_PRESSED: {
      const { boardState, sessionID, puzzle, sessionStatus } =
        _requireSession(session);
      const { letter, userID, solutionState } = action;
      const cellSolution = puzzle.solutions[selectedCellKey];
      const cellState = boardState[selectedCellKey];

      if (!cellSolution) return state;

      const [, didCycle] = getNextEmptyCellKey(
        selectedCellKey,
        puzzle,
        boardState,
        orientation
      );

      console.log(didCycle);

      let newState = { ...state };
      if (didCycle) {
        newState = _toggleOrientation(newState);
      }

      const { orientation: newOrientation } = newState.localState;

      if (cellState.solutionState == CellSolutionState.REVEALED)
        return _selectCell(
          newState,
          getNextCellKey(selectedCellKey, puzzle, newOrientation)[0]
        );

      const newLetters = !cellState.currentLetter
        ? letter
        : rebus
        ? cellState.currentLetter.concat(letter)
        : letter;

      const newBoardState = { ...boardState };

      if (sessionStatus != SessionStatus.COMPLETE) {
        const newCell: CellState = {
          solutionState: autocheck
            ? _checkCell(cellSolution, letter)
            : solutionState,
          currentLetter: newLetters,
          lastEditedBy: userID,
        };

        _updateCellState(sessionID, selectedCellKey, newCell);
        newBoardState[selectedCellKey] = newCell;
      }

      const currentCellFull = !!newBoardState[selectedCellKey].currentLetter;
      const currentClue = getClueFromCellKeyOrientationAndPuzzle(
        selectedCellKey,
        newOrientation,
        puzzle
      );
      const nextCellKey = rebus
        ? selectedCellKey
        : currentCellFull &&
          !isLastCellInClue(selectedCellKey, currentClue, newOrientation)
        ? getNextCellKey(selectedCellKey, puzzle, newOrientation)[0]
        : getNextEmptyCellKey(
            selectedCellKey,
            puzzle,
            newBoardState,
            newOrientation
          )[0];

      return _selectCell(newState, nextCellKey);
    }
    case SessionActionTypes.BACKSPACE: {
      const { boardState, puzzle, sessionID } = _requireSession(session);

      let newState = { ...state };
      if (rebus) {
        newState = _toggleRebus(newState);
      }

      const previousCellKey = getPreviousCellKey(
        selectedCellKey,
        puzzle,
        orientation
      )[0];

      const isCurrentCellEmpty =
        boardState[selectedCellKey].currentLetter == "";

      const nextCellKey = isCurrentCellEmpty
        ? previousCellKey
        : selectedCellKey;

      if (boardState[nextCellKey].solutionState != CellSolutionState.REVEALED) {
        const newCell: CellState = {
          solutionState: CellSolutionState.NONE,
          currentLetter: "",
        };

        _updateCellState(sessionID, nextCellKey, newCell);
      }

      if (selectedCellKey == FIRST_CELL_KEY) return newState;

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
      const newSession = _requireSession(session);
      const { boardState, puzzle } = newSession;

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

      let newState = { ...state };
      if (isLastClue) {
        const firstSelectedKey = getNextEmptyCellKey(
          FIRST_CELL_KEY,
          newSession.puzzle,
          newSession.boardState,
          OrientationType.HORIZONTAL
        )[0];
        newState = _toggleOrientation(newState);
        newState = _selectCell(newState, firstSelectedKey);
      } else {
        const nextClue = puzzle.clues[orientation][currentClueIndex + 1];
        const firstClueKey = [nextClue.x, nextClue.y].toString();
        const newSelectedCellKey = getNextEmptyCellKey(
          firstClueKey,
          puzzle,
          boardState,
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
        newState = _toggleOrientation(newState);

        const lastClue =
          puzzle.clues[newState.localState.orientation][
            puzzle.clues[newState.localState.orientation].length - 1
          ];
        const newSelectedCellKey = getCellKeysForClueAndOrientation(
          lastClue,
          orientation
        )[0];

        newState = _selectCell(newState, newSelectedCellKey);
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
    case SessionActionTypes.NEXT_CELL: {
      const { puzzle } = _requireSession(session);
      return _selectCell(
        state,
        getNextCellKey(selectedCellKey, puzzle, orientation)[0]
      );
    }
    case SessionActionTypes.PREVIOUS_CELL: {
      if (selectedCellKey == FIRST_CELL_KEY) return state;

      const { puzzle } = _requireSession(session);
      return _selectCell(
        state,
        getPreviousCellKey(selectedCellKey, puzzle, orientation)[0]
      );
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
      let newState = state;
      if (rebus) {
        const session = _requireSession(state.session);
        const nextCellKey = getNextEmptyCellKey(
          selectedCellKey,
          session.puzzle,
          session.boardState,
          orientation
        )[0];

        newState = _selectCell(state, nextCellKey);
      }

      return _toggleRebus(newState);
    }
    case SessionActionTypes.AUTOCHECK_CLICKED: {
      return _toggleAutocheck(state);
    }
    case SessionActionTypes.CHECK_SQUARE: {
      const { sessionID, boardState, puzzle } = _requireSession(session);
      const currentCellValue = boardState[selectedCellKey].currentLetter;
      const cellSolution = puzzle.solutions[selectedCellKey];

      if (!currentCellValue || !cellSolution) return state;

      const solutionState = _checkCell(cellSolution, currentCellValue);

      const newCell: CellState = {
        ...boardState[selectedCellKey],
        solutionState,
      };

      _updateCellState(sessionID, selectedCellKey, newCell);

      return state;
    }
    case SessionActionTypes.CHECK_WORD: {
      const { sessionID, boardState, puzzle } = _requireSession(session);

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
        };
      });

      _updateBoardState(sessionID, newBoardState);
      return state;
    }
    case SessionActionTypes.CHECK_PUZZLE: {
      const { sessionID, boardState, puzzle } = _requireSession(session);

      const newBoardState = boardState;
      Object.keys(boardState).forEach((cellKey) => {
        const cellSolution = puzzle.solutions[cellKey];
        const cellLetter = boardState[cellKey].currentLetter;

        if (!cellSolution || !cellLetter) return;

        const solutionState = _checkCell(cellSolution, cellLetter);

        newBoardState[cellKey] = {
          ...newBoardState[cellKey],
          solutionState,
        };
      });

      _updateBoardState(sessionID, newBoardState);
      return state;
    }
    case SessionActionTypes.REVEAL_SQUARE: {
      const { sessionID, boardState, puzzle } = _requireSession(session);
      const cellSolution = puzzle.solutions[selectedCellKey];

      if (!cellSolution) return state;

      const newCell: CellState = {
        ...boardState[selectedCellKey],
        solutionState: CellSolutionState.REVEALED,
        currentLetter: Array.isArray(cellSolution)
          ? cellSolution.join("")
          : cellSolution,
      };
      _updateCellState(sessionID, selectedCellKey, newCell);

      return state;
    }
    case SessionActionTypes.REVEAL_WORD: {
      const { sessionID, boardState, puzzle } = _requireSession(session);
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
        };
      });

      _updateBoardState(sessionID, newBoardState);
      return state;
    }
    case SessionActionTypes.REVEAL_PUZZLE: {
      const { sessionID, boardState, puzzle } = _requireSession(session);
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
        };
      });

      _updateBoardState(sessionID, newBoardState);
      return state;
    }
    case SessionActionTypes.RESET_PUZZLE: {
      const { sessionID, puzzle } = _requireSession(session);
      const newBoardState = getBoardStateFromSolutions(puzzle.solutions);

      _updateBoardState(sessionID, newBoardState);
      _updateSessionStatus(sessionID, SessionStatus.STARTED);
      return state;
    }
  }
};
