import { Puzzle } from "./Puzzle";
import {
  collection,
  FirestoreDataConverter,
  limit,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import { useState, useEffect } from "react";
import { db } from "../config/firebase";
import { SESSIONS_COLLECTION } from "../constants";

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
}

export type CombinedCellState = CellState & {
  cellSelectionState: CellSelectionState;
};

export type CombinedBoardState = {
  [key: string]: CombinedCellState;
};

export const useRecentSessionsForUser = (
  numSessions: number,
  userID: string
): [Session[] | undefined, string | undefined] => {
  const [sessionsState, setSessionsState] = useState<{
    sessions: Session[];
    loadingMessage?: string;
  }>({
    sessions: [],
    loadingMessage: "Loading recent sessions...",
  });

  useEffect(() => {
    const q = query(
      collection(db, SESSIONS_COLLECTION).withConverter(sessionConverter),
      where("participantIDs", "array-contains", userID),
      orderBy("lastUpdatedTime", "desc"),
      limit(numSessions)
    );

    const unsub = onSnapshot(q, (querySnapshot) => {
      const sessions: Session[] = [];
      querySnapshot.forEach((doc) => {
        sessions.push(doc.data());
      });

      setSessionsState({
        sessions,
        loadingMessage: undefined,
      });
    });
    return unsub;
  }, [numSessions]);

  return [sessionsState.sessions, sessionsState.loadingMessage];
};

export const sessionConverter: FirestoreDataConverter<Session> = {
  fromFirestore: (snapshot) => snapshot.data() as Session,
  toFirestore: (session: Session) => session,
};
