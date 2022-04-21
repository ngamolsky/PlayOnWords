/* eslint-disable @typescript-eslint/no-explicit-any */
import { Timestamp, FieldValue } from "@google-cloud/firestore";
import { Puzzle } from "./Puzzle";
import { User } from "./User";
import db from "../config/firebase";

export type Session = {
  sessionID: string;
  puzzle: Puzzle;
  participantUsernames: string[];
  participantIDs: string[];
  startedBy: User;
  startTime: Timestamp;
  boardState: BoardState;
  sessionStatus: SessionStatus;
  endTime?: Timestamp;
  lastUpdatedTime: Timestamp;
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
  RELATED_CLUE_SELECTED = "related_clue_selected",
}

export enum SessionStatus {
  STARTED = "started",
  COMPLETE = "complete",
}
const SESSIONS_COLLECTION = "sessions";

export const getUserSessions = async (user: User): Promise<Session[]> => {
  const snapshot = await db
    .collection(SESSIONS_COLLECTION)
    .withConverter(sessionConverter)
    .where("participantIDs", "array-contains", user.userID)
    .get();

  const sessions: Session[] = [];
  snapshot.forEach((doc) => {
    sessions.push(doc.data());
  });

  return sessions;
};

export const sessionConverter = {
  toFirestore(session: Session): Session {
    return session;
  },
  fromFirestore(
    snapshot: FirebaseFirestore.QueryDocumentSnapshot<Session>
  ): Session {
    const data = snapshot.data();
    return data;
  },
};
