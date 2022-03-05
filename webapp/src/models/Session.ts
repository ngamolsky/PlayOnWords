import { Puzzle } from "./Puzzle";
import { FirestoreDataConverter, Timestamp } from "firebase/firestore";

export enum SessionStatus {
  STARTED = "STARTED",
  COMPLETE = "COMPLETE",
}

export type Session = {
  sessionID: string;
  puzzle: Puzzle;
  participantIDs: string[];
  ownerID: string;
  startTime: Timestamp;
  boardState: BoardState;
  sessionStatus: SessionStatus;
  endTime?: Timestamp;
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

export const sessionConverter: FirestoreDataConverter<Session> = {
  fromFirestore: (snapshot) => snapshot.data() as Session,
  toFirestore: (session: Session) => session,
};
