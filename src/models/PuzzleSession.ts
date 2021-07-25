import firebase from "firebase/app";
import { User } from "./User";
import { Puzzle } from "./Puzzle";
import { PUZZLE_SESSIONS_COLLECTION } from "../constants";
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
  sessionID: string;
  puzzle: Puzzle;
  participants: User[];
  owner: User;
  startTime: Date;
  boardState: BoardState;
};

export const fromFirebasePuzzleSession = (
  sessionSnapshot: firebase.firestore.DocumentSnapshot
): PuzzleSession => {
  const sessionData = sessionSnapshot.data()!;
  return {
    sessionID: sessionSnapshot.id,
    puzzle: sessionData.puzzle,
    participants: sessionData.participants,
    owner: sessionData.owner,
    startTime: sessionData.startTime.toDate(),
    boardState: sessionData.boardState,
  };
};

export const puzzleSessionActions = {
  startPuzzleSession: async (puzzle: Puzzle, user: User) => {
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
      .add(session);

    return session;
  },
};
