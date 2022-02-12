import { User } from "./User";
import { Puzzle } from "./Puzzle";
import { PUZZLE_SESSIONS_COLLECTION } from "../constants";
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
} from "firebase/firestore";
import { db } from "../config/firebase";
import { useState, useEffect } from "react";

export enum OrientationType {
  HORIZONTAL = "horizontal",
  VERTICAL = "vertical",
}

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

export enum CellSelectionState {
  SELECTED_WORD = "selected_word",
  SELECTED_CELL = "selected_cell",
  UNSELECTED = "unselected",
  UNSELECTABLE = "unselectable",
}
export type LocalCellState = {
  cellSelectionState: CellSelectionState;
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

const sessionConverter: FirestoreDataConverter<PuzzleSession> = {
  fromFirestore: (snapshot) => snapshot.data() as PuzzleSession,
  toFirestore: (session: PuzzleSession) => session,
};
