import { Timestamp } from "firebase-admin/firestore";
import db from "../config/firebase";

export type Puzzle = {
  puzzleID: string;
  title?: string;
  clues: ClueList;
  puzzleTimestamp: Timestamp;
  dayOfWeek: number;
  solutions: Solutions;
  nytID: string;
  collection: string;
  specialCells?: SpecialCells;
  isRebusPuzzle: boolean;
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
  relatedClueNumbers?: {
    horizontal: number[];
    vertical: number[];
  };
};

export type Solutions = Record<string, string | string[] | null>;

export enum SpecialCellType {
  SHADED = "SHADED",
  CIRCLE = "CIRCLE",
}

export type SpecialCells = Record<string, SpecialCellType>;

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

export const updatePuzzle = async (
  puzzleID: string,
  fieldName: string,
  fieldValue: any
): Promise<boolean> => {
  const update: Record<string, any> = {};

  update[fieldName] = fieldValue;
  await db
    .collection(PUZZLES_COLLECTION)
    .withConverter(puzzleConverter)
    .doc(puzzleID)
    .update(update);

  console.log(
    `Update puzzle to db with id: ${puzzleID}, with fieldName: ${fieldName} and fieldValue: ${fieldValue}`
  );
  return true;
};

export const deletePuzzle = async (puzzleID: string): Promise<boolean> => {
  await db
    .collection(PUZZLES_COLLECTION)
    .withConverter(puzzleConverter)
    .doc(puzzleID)
    .delete();

  console.log(`Deleted puzzle from db with id: ${puzzleID}`);
  return true;
};

export const getPuzzleByDate = async (date: Date): Promise<Puzzle | null> => {
  let puzzle = null;
  const results = (
    await db
      .collection("puzzles")
      .withConverter(puzzleConverter)
      .where("puzzleTimestamp", "==", Timestamp.fromDate(date))
      .get()
  ).docs;

  puzzle = results[0].data();
  return puzzle;
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
    console.log(
      "FOUND PUZZLES: ",
      results.map(async (each) => {
        await deletePuzzle(each.data().puzzleID);
      })
    );

    throw new Error(
      `Found more than one result for nytID ${nytID}. Num results: ${results.length}`
    );
  } else if (results.length == 1) {
    puzzle = results[0].data();
    console.log(`Found puzzle with ID ${puzzle.puzzleID} for nytID: ${nytID}`);
  }

  return puzzle;
};

export const loadAllPuzzles = async (
  puzzleCallback?: (puzzle: Puzzle) => Promise<void>
): Promise<Puzzle[]> => {
  const puzzles: Puzzle[] = [];
  const results = (
    await db
      .collection("puzzles")
      .withConverter(puzzleConverter)
      .orderBy("puzzleTimestamp")
      .get()
  ).docs;

  results.map(async (each) => {
    const puzzle = each.data();

    if (puzzleCallback) {
      puzzleCallback(puzzle);
    }

    puzzles.push(puzzle);
  });

  return puzzles;
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
