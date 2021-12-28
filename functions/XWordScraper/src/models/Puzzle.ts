import { Timestamp } from "firebase-admin/firestore";
import db from "../config/firebase";

export type Puzzle = {
  puzzleID: string;
  title?: string;
  clues: ClueList;
  puzzleTimestamp: Timestamp;
  solutions: Solutions;
  nytID: string;
  collection: string;
};

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

export type Solutions = Record<string, string | null>;

const PUZZLES_COLLECTION = "puzzles";

export const addPuzzle = async (puzzle: Puzzle): Promise<boolean> => {
  await db
    .collection(PUZZLES_COLLECTION)
    .withConverter(puzzleConverter)
    .doc(puzzle.puzzleID)
    .set(puzzle);

  console.log(`Wrote puzzle to db with id: ${puzzle.puzzleID}`);
  return true;
};

export const getPuzzleByNYTPuzzleID = async (
  nytID: string
): Promise<Puzzle | null> => {
  let puzzle = null;
  const results = (
    await db
      .collection("puzzles")
      .withConverter(puzzleConverter)
      .where("nytID", "==", nytID)
      .get()
  ).docs;

  if (results.length > 1) {
    throw new Error(
      `Found more than one result for nytID ${nytID}. Num results: ${results.length}`
    );
  } else if (results.length == 1) {
    puzzle = results[0].data();
    console.log(`Found puzzle with ID ${puzzle.puzzleID} for nytID: ${nytID}`);
  }

  return puzzle;
};

export const puzzleConverter = {
  toFirestore(puzzle: Puzzle): Puzzle {
    return puzzle;
  },
  fromFirestore(
    snapshot: FirebaseFirestore.QueryDocumentSnapshot<Puzzle>
  ): Puzzle {
    const data = snapshot.data();
    return data;
  },
};
