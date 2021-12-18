import { User } from "./User";
import { Puzzle } from "./Puzzle";
import { PUZZLE_SESSIONS_COLLECTION, USERS_COLLECTION } from "../constants";
import { getBoardStateFromSolutions } from "../utils/puzzleSessionUtils";
import { v4 } from "uuid";
import {
  onSnapshot,
  doc,
  FirestoreDataConverter,
  setDoc,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { useState, useEffect } from "react";

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

export type PuzzleSession = {
  puzzleSessionID: string;
  puzzle: Puzzle;
  participantIDs: string[];
  ownerID: string;
  startTime: Date;
  boardState: BoardState;
};

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
    startTime: new Date(),
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
        console.log(`usePuzzleSession: Snapshot: ${doc.data()}`);
        setSessionState({
          session: doc.data(),
          loading: false,
        });
      }
    );

    return unsub();
  });

  return [sessionState.session, sessionState.loading];
};

// #endregion

const sessionConverter: FirestoreDataConverter<PuzzleSession> = {
  fromFirestore: (snapshot) => {
    const sessionData = snapshot.data();
    const session = {
      puzzleSessionID: sessionData.puzzleSessionID,
      puzzle: sessionData.puzzle,
      participantIDs: sessionData.participantIDs,
      ownerID: sessionData.ownerID,
      startTime: sessionData.startTime.toDate(),
      boardState: sessionData.boardState,
    };

    return session;
  },
  toFirestore: (session) => session,
};

export const isUserInSession = (
  session: PuzzleSession,
  user: User
): boolean => {
  const matchingUser = session.participantIDs.find(
    (currentUserID) => currentUserID === user.userID
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
