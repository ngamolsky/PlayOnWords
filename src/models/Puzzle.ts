import firebase from "firebase/app";

export type ClueList = {
  horizontal: Clue[];
  vertical: Clue[];
};

export type Clue = {
  number: number;
  x: number;
  y: number;
  hint: string;
  length: number;
};

export type Solutions = {
  [key: string]: string | null;
};

export type Puzzle = {
  puzzleID: string;
  title?: string;
  clues: ClueList;
  date: Date;
  solutions: Solutions;
};

export const fromFirebasePuzzle = (
  puzzleSnapshot: firebase.firestore.DocumentSnapshot
): Puzzle => {
  const puzzleData = puzzleSnapshot.data()!;
  return {
    puzzleID: puzzleSnapshot.id,
    clues: puzzleData.clues,
    date: puzzleData.date.toDate(),
    solutions: puzzleData.solutions,
  };
};
