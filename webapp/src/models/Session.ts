import { User } from "./User";
import { Puzzle } from "./Puzzle";
import { Timestamp } from "firebase/firestore";

// #region Model Types

export type Session = {
  sessionID: string;
  puzzle: Puzzle;
  participantIDs: string[];
  ownerID: string;
  startTime: Timestamp;
  boardState: BoardState;
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
}

export type SessionState = {
  session?: Session;
  localState: LocalSessionState;
};

export enum OrientationType {
  HORIZONTAL = "horizontal",
  VERTICAL = "vertical",
}

export type LocalSessionState = {
  orientation: OrientationType;
  selectedCellKey: string;
};

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

// #endregion

// #region Actions

export enum SharedActionTypes {
  START_SESSION = "START_SESSION",
  JOIN_SESSION_PARTICIPANTS = "JOIN_SESSION_PARTICIPANTS",
  SET_CELL_LETTER = "SET_CELL_LETTER",
  SET_SHARED_STATE = "SET_SHARED_STATE",
}

export enum SelectionActionTypes {
  TOGGLE_ORIENTATION = "TOGGLE_ORIENTATION",
  SET_CELL_SELECTED = "SET_CELL_SELECTED",
  SELECT_NEXT_CELL = "SELECT_NEXT_CELL",
  SELECT_PREVIOUS_CELL = "SELECT_PREVIOUS_CELL",
}

export enum ClueActionTypes {
  MOVE_TO_CLUE = "MOVE_TO_CLUE",
  NEXT_CLUE = "NEXT_CLUE",
  PREVIOUS_CLUE = "PREVIOUS_CLUE",
}

export const SessionActionTypes = {
  ...SharedActionTypes,
  ...SelectionActionTypes,
  ...ClueActionTypes,
};

type SharedActions =
  | {
      type: SharedActionTypes.SET_SHARED_STATE;
      session: Session;
    }
  | {
      type: SharedActionTypes.START_SESSION;
      sessionID: string;
      puzzle: Puzzle;
      user: User;
    }
  | {
      type: SharedActionTypes.JOIN_SESSION_PARTICIPANTS;
      sessionID: string;
      userID: string;
    }
  | {
      type: SharedActionTypes.SET_CELL_LETTER;
      boardState: BoardState;
      sessionID: string;
      cellKey: string;
      letter: string;
    };

type SelectionActions =
  | { type: SelectionActionTypes.TOGGLE_ORIENTATION }
  | { type: SelectionActionTypes.SET_CELL_SELECTED; cellKey: string }
  | { type: SelectionActionTypes.SELECT_NEXT_CELL; puzzle: Puzzle }
  | { type: SelectionActionTypes.SELECT_PREVIOUS_CELL; puzzle: Puzzle };

type ClueActions = {
  type: ClueActionTypes.MOVE_TO_CLUE;
  puzzle: Puzzle;
  nextClueIndex: number;
};

export type SessionActions = SharedActions | SelectionActions | ClueActions;

// #endregion
