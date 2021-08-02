import firebase from "firebase/app";
import { User } from "./User";
import { Puzzle } from "./Puzzle";
import { PUZZLE_SESSIONS_COLLECTION } from "../constants";
import { getBoardStateFromSolutions } from "../utils/puzzleSessionUtils";
import { v4 } from "uuid";

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
  participants: User[];
  owner: User;
  startTime: Date;
  boardState: BoardState;
};

export const fromFirebasePuzzleSession = (
  sessionData: firebase.firestore.DocumentData
): PuzzleSession => {
  return {
    puzzleSessionID: sessionData.puzzleSessionID,
    puzzle: sessionData.puzzle,
    participants: sessionData.participants,
    owner: sessionData.owner,
    startTime: sessionData.startTime.toDate(),
    boardState: sessionData.boardState,
  };
};

export const puzzleSessionActions = {
  startPuzzleSession: async (
    puzzle: Puzzle,
    user: User
  ): Promise<PuzzleSession> => {
    const puzzleSessionID = `puzzleSession.${v4()}`;
    const session = {
      puzzleSessionID,
      puzzle,
      participants: [user],
      owner: user,
      startTime: new Date(),
      boardState: getBoardStateFromSolutions(puzzle.solutions),
    };
    await firebase
      .firestore()
      .collection(PUZZLE_SESSIONS_COLLECTION)
      .doc(puzzleSessionID)
      .set(session);

    return session;
  },
};
