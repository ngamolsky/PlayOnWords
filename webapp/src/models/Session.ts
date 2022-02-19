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
  PENCIL = "pencil",
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
  pencilMode: boolean;
  rebus: boolean;
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
