/* eslint-disable @typescript-eslint/no-explicit-any */
import { Timestamp } from "@google-cloud/firestore";
import { Puzzle } from "./Puzzle";
import { User } from "./User";
import db from "../config/firebase";

export type Session = {
  sessionID: string;
  puzzle: Puzzle;
  participantData: SessionParticipantData[];
  startedBy: User;
  startTime: Timestamp;
  boardState: BoardState;
  sessionStatus: SessionStatus;
  endTime?: Timestamp;
  lastUpdatedTime: Timestamp;
};

export type SessionParticipantData = {
  username: string;
  userID: string;
  isOnline: boolean;
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

export const getSessionByID = async (sessionID: string): Promise<Session> => {
  const snapshot = await db
    .collection(SESSIONS_COLLECTION)
    .withConverter(sessionConverter)
    .doc(sessionID)
    .get();

  const session = snapshot.data();

  if (!session) {
    throw new Error(`No session found for ID: ${sessionID}`);
  }

  return session;
};

export const setUserOnlineForSession = async (
  sessionID: string,
  user: User,
  isOnline: boolean
): Promise<void> => {
  const existingSession = await getSessionByID(sessionID);

  const newParticipantData = existingSession.participantData.reduce<
    SessionParticipantData[]
  >((result, userData) => {
    if (userData.userID == user.userID) {
      result.push({
        ...userData,
        isOnline,
      });
    } else {
      result.push({
        ...userData,
      });
    }

    return result;
  }, []);

  console.log(newParticipantData);

  await db
    .collection(SESSIONS_COLLECTION)
    .withConverter(sessionConverter)
    .doc(sessionID)
    .update({
      participantData: newParticipantData,
    });
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
