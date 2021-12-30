import { User, userConverter } from "./User";
import { Puzzle } from "./Puzzle";
import { PUZZLE_SESSIONS_COLLECTION, USERS_COLLECTION } from "../constants";
import { getBoardStateFromSolutions } from "../utils/puzzleSessionUtils";
import { v4 } from "uuid";
import {
  onSnapshot,
  doc,
  FirestoreDataConverter,
  setDoc,
  Timestamp,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { useState, useEffect } from "react";

export type PuzzleSession = {
  puzzleSessionID: string;
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
};

export enum CellSolutionState {
  REVEALED = "revealed",
  WRONG = "wrong",
  NONE = "none",
}

export const startPuzzleSession = async (
  puzzle: Puzzle,
  user: User
): Promise<PuzzleSession> => {
  const puzzleSessionID = `puzzleSession.${v4()}`;

  const session = {
    puzzleSessionID,
    puzzle,
    participantIDs: [user.userID],
    ownerID: user.userID,
    startTime: Timestamp.now(),
    boardState: getBoardStateFromSolutions(puzzle.solutions),
  };

  await setDoc(doc(db, PUZZLE_SESSIONS_COLLECTION, puzzleSessionID), session);
  console.log(`startPuzzleSession: Created session ${puzzleSessionID}`);

  const updatedUser: User = {
    ...user,
    activeSessionIDs: user.activeSessionIDs.concat(puzzleSessionID),
  };

  await setDoc(doc(db, USERS_COLLECTION, updatedUser.userID), updatedUser);
  console.log(
    `startPuzzleSession: Added sessionID ${puzzleSessionID} to users active sessions for user ${updatedUser.userID}`
  );

  return session;
};

export const joinPuzzleSessionParticipants = async (
  puzzleSessionID: string,
  userID: string
) => {
  console.log(puzzleSessionID);
  const sessionRef = doc(
    db,
    PUZZLE_SESSIONS_COLLECTION,
    puzzleSessionID
  ).withConverter(sessionConverter);
  await updateDoc(sessionRef, {
    participantIDs: arrayUnion(userID),
  });

  console.log(`Added user ${userID} to puzzle session ${puzzleSessionID} `);
};

export const addSessionToUserActiveSessions = async (
  puzzleSessionID: string,
  userID: string
) => {
  const userRef = doc(db, USERS_COLLECTION, userID).withConverter(
    userConverter
  );
  await updateDoc(userRef, {
    activeSessionIDs: arrayUnion(puzzleSessionID),
  });

  console.log(
    `Added session ${puzzleSessionID} to active sessions for user ${userID}`
  );
};

export const removeSessionFromUserActiveSessions = async (
  puzzleSessionID: string,
  userID: string
) => {
  console.log("removing", userID, puzzleSessionID);
  const userRef = doc(db, USERS_COLLECTION, userID).withConverter(
    userConverter
  );
  await updateDoc(userRef, {
    activeSessionIDs: arrayRemove(puzzleSessionID),
  });

  console.log(
    `Removed session ${puzzleSessionID} from active sessions for user ${userID}`
  );
};
// #region Hooks

export const usePuzzleSession = (
  puzzleSessionID: string
): [PuzzleSession | undefined, boolean] => {
  const [sessionState, setSessionState] = useState<{
    session: PuzzleSession | undefined;
    loading: boolean;
  }>({
    session: undefined,
    loading: true,
  });

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, PUZZLE_SESSIONS_COLLECTION, puzzleSessionID).withConverter(
        sessionConverter
      ),
      (doc) => {
        console.log(`usePuzzleSession: Snapshot`);
        setSessionState({
          session: doc.data(),
          loading: false,
        });
      }
    );

    return unsub;
  }, []);

  return [sessionState.session, sessionState.loading];
};

// #endregion

export const isUserInSession = (
  session: PuzzleSession,
  userID: string
): boolean => {
  const matchingUser = session.participantIDs.find(
    (currentUserID) => currentUserID === userID
  );
  return !!matchingUser;
};

export const isSessionActiveForUser = (
  session: PuzzleSession,
  user: User
): boolean => {
  const matchingSession = user.activeSessionIDs.find(
    (sessionID) => sessionID === session.puzzleSessionID
  );

  return !!matchingSession;
};

const sessionConverter: FirestoreDataConverter<PuzzleSession> = {
  fromFirestore: (snapshot) => snapshot.data() as PuzzleSession,
  toFirestore: (session: PuzzleSession) => session,
};
