import { diff } from "deep-object-diff";
import { Reducer } from "react";
import { FIRST_CELL_KEY } from "../constants";
import {
  BoardState,
  Session,
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
  getClueFromCellKeyOrientationAndPuzzle,
  getPercentageComplete,
  checkPuzzle,
  getNextEmptyCellKey,
  getNextClue,
  isPuzzleComplete,
  getCellCoordinatesFromKey,
  getSizeFromCellKeys,
  getPreviousEmptyCellKey,
  getFirstSelectableCellKey,
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
  RIGHT_KEY = "RIGHT_KEY",
  LEFT_KEY = "LEFT_KEY",
  UP_KEY = "UP_KEY",
  DOWN_KEY = "DOWN_KEY",
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
  REVEAL_MOST_SQUARES = "REVEAL_MOST_SQUARES",
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
  | { type: SessionActionTypes.RIGHT_KEY }
  | { type: SessionActionTypes.LEFT_KEY }
  | { type: SessionActionTypes.UP_KEY }
  | { type: SessionActionTypes.DOWN_KEY }
  | { type: SessionActionTypes.PENCIL_CLICKED }
  | { type: SessionActionTypes.REBUS_CLICKED }
  | { type: SessionActionTypes.AUTOCHECK_CLICKED }
  | { type: SessionActionTypes.CHECK_SQUARE }
  | { type: SessionActionTypes.CHECK_WORD }
  | { type: SessionActionTypes.CHECK_PUZZLE }
  | { type: SessionActionTypes.REVEAL_SQUARE }
  | { type: SessionActionTypes.REVEAL_WORD }
  | { type: SessionActionTypes.REVEAL_MOST_SQUARES }
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
  cellState: CellState,
  deleteFieldName?: keyof CellState
): void => {
  updateCellState(sessionID, cellKey, cellState), deleteFieldName;
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
      const { boardState, puzzle } = nextSession;

      const firstCellKey = getFirstSelectableCellKey(puzzle);

      if (isPuzzleComplete(boardState, nextSession.puzzle.solutions)) {
        return _selectCell(state, firstCellKey);
      }

      const firstCell = boardState[firstCellKey];

      const firstSelectedKey = firstCell.currentLetter
        ? getNextEmptyCellKey(firstCellKey, puzzle, boardState, orientation)
            .nextEmptyCellKey
        : firstCellKey;

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
        const oldSession = { ...session };
        const boardStateDifference = diff(
          oldSession.boardState,
          nextSession.boardState
        );

        const newBoardState = { ...boardState };

        Object.entries(boardStateDifference).forEach(
          ([cellKey, difference]) => {
            Object.entries(difference).forEach(([fieldName, fieldValue]) => {
              switch (fieldName) {
                case "solutionState":
                  newBoardState[cellKey][fieldName] =
                    fieldValue as CellSolutionState;
                  break;
                case "currentLetter":
                case "lastEditedBy":
                  newBoardState[cellKey][fieldName] = fieldValue as string;
                  break;
              }
            });
          }
        );

        const percentComplete = getPercentageComplete(
          newBoardState,
          puzzle.solutions
        );
        if (
          percentComplete == 100 &&
          sessionStatus !== SessionStatus.COMPLETE &&
          checkPuzzle(newBoardState, puzzle.solutions)
        ) {
          _updateSessionStatus(nextSession.sessionID, SessionStatus.COMPLETE);
        }

        return {
          ...state,
          session: {
            ...nextSession,
            boardState: newBoardState,
          },
          loadingMessage: undefined,
        };
      } else {
        return {
          ...state,
          session: nextSession,
        };
      }
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

      if (!cellSolution || sessionStatus == SessionStatus.COMPLETE)
        return state;

      const isCellFull = !!cellState.currentLetter;
      const {
        nextCellKey,
        didChangeClues: wouldChangeClues,
        didLoopPuzzle: wouldLoopPuzzleIfNextCell,
      } = getNextCellKey(selectedCellKey, puzzle, orientation);
      const {
        nextEmptyCellKey,
        didLoopPuzzle: wouldLoopPuzzleIfNextEmptyCell,
      } = getNextEmptyCellKey(selectedCellKey, puzzle, boardState, orientation);

      const shouldSelectNextCell = isCellFull && !wouldChangeClues;

      const nextSelectedCellKey = shouldSelectNextCell
        ? nextCellKey
        : nextEmptyCellKey;
      const willLoopPuzzle = shouldSelectNextCell
        ? wouldLoopPuzzleIfNextCell
        : wouldLoopPuzzleIfNextEmptyCell;

      let newState = { ...state };
      if (willLoopPuzzle) {
        newState = _toggleOrientation(newState);
      }

      if (cellState.solutionState == CellSolutionState.REVEALED)
        return _selectCell(newState, nextSelectedCellKey);

      const newLetters =
        cellState.currentLetter && rebus
          ? cellState.currentLetter.concat(letter)
          : letter;

      const newBoardState = { ...boardState };

      const newCell: CellState = {
        solutionState: autocheck
          ? _checkCell(cellSolution, newLetters)
          : solutionState,
        currentLetter: newLetters,
        lastEditedBy: userID,
      };

      _updateCellState(sessionID, selectedCellKey, newCell);
      newBoardState[selectedCellKey] = newCell;

      return _selectCell(
        newState,
        rebus ? selectedCellKey : nextSelectedCellKey
      );
    }
    case SessionActionTypes.BACKSPACE: {
      const { boardState, puzzle, sessionID, sessionStatus } =
        _requireSession(session);

      if (sessionStatus == SessionStatus.COMPLETE) {
        return state;
      }
      let newState = { ...state };
      if (rebus) {
        newState = _toggleRebus(newState);
      }

      const previousCellKey = getPreviousCellKey(
        selectedCellKey,
        puzzle,
        orientation
      ).previousCellKey;

      const isCurrentCellEmpty = !!!boardState[selectedCellKey].currentLetter;

      const nextCellKey = isCurrentCellEmpty
        ? previousCellKey
        : selectedCellKey;

      if (boardState[nextCellKey].solutionState != CellSolutionState.REVEALED) {
        const newCell: CellState = {
          solutionState: CellSolutionState.NONE,
          currentLetter: "",
        };

        _updateCellState(sessionID, nextCellKey, newCell, "lastEditedBy");
      }

      if (selectedCellKey == FIRST_CELL_KEY) return newState;

      return _selectCell(newState, previousCellKey);
    }
    case SessionActionTypes.CELL_CLICKED: {
      const { puzzle } = _requireSession(session);
      const { cellKey } = action;
      let newState = state;
      if (rebus) {
        newState = _toggleRebus(newState);
      }

      if (puzzle.solutions[cellKey] == null) {
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
      const { puzzle, boardState } = newSession;

      const currentSelectedClue = getClueFromCellKeyOrientationAndPuzzle(
        selectedCellKey,
        orientation,
        puzzle
      );

      const { nextClue, didLoopPuzzle } = getNextClue(
        puzzle,
        currentSelectedClue,
        orientation
      );

      let newState = { ...state };
      if (didLoopPuzzle) {
        newState = _toggleOrientation(newState);
      }

      if (isPuzzleComplete(boardState, puzzle.solutions)) {
        return _selectCell(newState, [nextClue.x, nextClue.y].toString());
      }

      const firstCellKeyInClue = [nextClue.x, nextClue.y].toString();
      const isCellFull = !!boardState[firstCellKeyInClue].currentLetter;
      const {
        nextEmptyCellKey,
        didLoopPuzzle: didLoopPuzzleFromFindingEmptyCell,
      } = getNextEmptyCellKey(
        firstCellKeyInClue,
        puzzle,
        boardState,
        newState.localState.orientation
      );

      if (didLoopPuzzleFromFindingEmptyCell) {
        newState = _toggleOrientation(newState);
      }

      return _selectCell(
        newState,
        isCellFull ? nextEmptyCellKey : firstCellKeyInClue
      );
    }
    case SessionActionTypes.PREVIOUS_CLUE: {
      const { puzzle, boardState } = _requireSession(session);

      const { previousEmptyCellKey, didLoopPuzzle } = getPreviousEmptyCellKey(
        selectedCellKey,
        puzzle,
        boardState,
        orientation
      );

      let newState = { ...state };
      if (didLoopPuzzle) {
        newState = _toggleOrientation(newState);
      }

      const newSelectedClue = getClueFromCellKeyOrientationAndPuzzle(
        previousEmptyCellKey,
        newState.localState.orientation,
        puzzle
      );

      const firstCellKeyInClue = [
        newSelectedClue.x,
        newSelectedClue.y,
      ].toString();
      const isCellFull = !!boardState[firstCellKeyInClue].currentLetter;

      const nextCellKey = getNextEmptyCellKey(
        firstCellKeyInClue,
        puzzle,
        boardState,
        newState.localState.orientation
      ).nextEmptyCellKey;

      return _selectCell(
        newState,
        isCellFull ? nextCellKey : firstCellKeyInClue
      );
    }
    case SessionActionTypes.RIGHT_KEY: {
      const { puzzle } = _requireSession(session);
      if (orientation == OrientationType.VERTICAL) {
        return _toggleOrientation(state);
      } else {
        const { x, y } = getCellCoordinatesFromKey(selectedCellKey);
        let nextCellKey = [x + 1, y].toString();

        const isLastCellInRow =
          getCellCoordinatesFromKey(selectedCellKey).x ==
          getSizeFromCellKeys(Object.keys(puzzle.solutions)).width - 1;

        if (isLastCellInRow) return state;

        while (!puzzle.solutions[nextCellKey]) {
          const { x: newX } = getCellCoordinatesFromKey(nextCellKey);
          nextCellKey = [newX + 1, y].toString();
        }

        return _selectCell(state, nextCellKey);
      }
    }
    case SessionActionTypes.LEFT_KEY: {
      const { puzzle } = _requireSession(session);
      if (orientation == OrientationType.VERTICAL) {
        return _toggleOrientation(state);
      } else {
        const { x, y } = getCellCoordinatesFromKey(selectedCellKey);
        let previousCellKey = [x - 1, y].toString();

        const isFirstCellInRow =
          getCellCoordinatesFromKey(selectedCellKey).x == 0;

        if (isFirstCellInRow) return state;

        while (!puzzle.solutions[previousCellKey]) {
          const { x: newX } = getCellCoordinatesFromKey(previousCellKey);
          previousCellKey = [newX - 1, y].toString();
        }

        return _selectCell(state, previousCellKey);
      }
    }
    case SessionActionTypes.DOWN_KEY: {
      const { puzzle } = _requireSession(session);
      if (orientation == OrientationType.HORIZONTAL) {
        return _toggleOrientation(state);
      } else {
        const { x, y } = getCellCoordinatesFromKey(selectedCellKey);
        let nextCellKey = [x, y + 1].toString();
        const isLastCellInRow =
          getCellCoordinatesFromKey(selectedCellKey).y ==
          getSizeFromCellKeys(Object.keys(puzzle.solutions)).height - 1;

        if (isLastCellInRow) return state;

        while (!puzzle.solutions[nextCellKey]) {
          const { y: newY } = getCellCoordinatesFromKey(nextCellKey);
          nextCellKey = [x, newY + 1].toString();
        }

        return _selectCell(state, nextCellKey);
      }
    }
    case SessionActionTypes.UP_KEY: {
      const { puzzle } = _requireSession(session);
      if (orientation == OrientationType.HORIZONTAL) {
        return _toggleOrientation(state);
      } else {
        const { x, y } = getCellCoordinatesFromKey(selectedCellKey);
        let previousCellKey = [x, y - 1].toString();
        const isFirstCellInRow =
          getCellCoordinatesFromKey(selectedCellKey).y == 0;

        if (isFirstCellInRow) return state;

        while (!puzzle.solutions[previousCellKey]) {
          const { y: newY } = getCellCoordinatesFromKey(previousCellKey);
          previousCellKey = [x, newY - 1].toString();
        }

        return _selectCell(state, previousCellKey);
      }
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
        ).nextEmptyCellKey;

        newState = _selectCell(
          state,
          nextCellKey ? nextCellKey : selectedCellKey
        );
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

      _updateCellState(sessionID, selectedCellKey, newCell, "lastEditedBy");

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
        delete newBoardState[cellKey].lastEditedBy;

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
        delete newBoardState[cellKey].lastEditedBy;

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
          ? cellSolution[0]
          : cellSolution,
      };
      _updateCellState(sessionID, selectedCellKey, newCell, "lastEditedBy");

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
        delete newBoardState[cellKey].lastEditedBy;

        newBoardState[cellKey] = {
          ...newBoardState[cellKey],
          currentLetter: cellSolution[0],
          solutionState: CellSolutionState.REVEALED,
        };
      });

      _updateBoardState(sessionID, newBoardState);
      return state;
    }
    case SessionActionTypes.REVEAL_MOST_SQUARES: {
      const percentToReveal = 98;
      const { sessionID, boardState, puzzle } = _requireSession(session);
      const cellSolution = puzzle.solutions[selectedCellKey];

      if (!cellSolution) return state;

      const newBoardState = boardState;
      Object.keys(boardState).forEach((cellKey) => {
        const cellSolution = puzzle.solutions[cellKey];

        if (!cellSolution) return;

        if (Math.random() < percentToReveal / 100) {
          delete newBoardState[cellKey].lastEditedBy;

          newBoardState[cellKey] = {
            ...newBoardState[cellKey],
            currentLetter: cellSolution[0],
            solutionState: CellSolutionState.REVEALED,
          };
        }
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
        delete newBoardState[cellKey].lastEditedBy;

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
