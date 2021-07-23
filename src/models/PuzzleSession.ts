import firebase from "firebase/app";
import { User } from "./User";
import { Puzzle } from "./Puzzle";
import { PUZZLE_SESSIONS_COLLECTION } from "../constants";
import { v4 } from "uuid";
import { getBoardStateFromSolutions } from "../utils/puzzleSessionUtils";

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
    puzzle: sessionData.puzzle,
    participants: sessionData.participants,
    owner: sessionData.owner,
    startTime: sessionData.startTime.toDate(),
    boardState: sessionData.boardState,
  };
};

export type PuzzleSessionActions = {
  startPuzzleSession(puzzle: Puzzle, user: User): Promise<PuzzleSession>;
};

export const puzzleSessionActions: PuzzleSessionActions = {
  startPuzzleSession: async (puzzle, user) => {
    const session = {
      puzzle: puzzle,
      participants: [user],
      owner: user,
      startTime: new Date(),
      boardState: getBoardStateFromSolutions(puzzle.solutions),
    };
    await firebase
      .firestore()
      .collection(PUZZLE_SESSIONS_COLLECTION)
      .doc(`puzzleSession.${v4()}`)
      .set(session);

    return session;
  },
};
