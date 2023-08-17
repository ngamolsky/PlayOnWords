/* eslint-disable @typescript-eslint/no-explicit-any */
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
  hasRebus: boolean;
  type: "daily" | "mini";
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

  return true;
};

export const deletePuzzle = async (puzzleID: string): Promise<boolean> => {
  await db
    .collection(PUZZLES_COLLECTION)
    .withConverter(puzzleConverter)
    .doc(puzzleID)
    .delete();

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
    throw new Error(
      `Found more than one result for nytID ${nytID}. Num results: ${results.length}`
    );
  } else if (results.length == 1) {
    puzzle = results[0].data();
  }

  return puzzle;
};

export const loadAllPuzzles = async (
  puzzleCallback: (puzzle: Puzzle) => Promise<string>,
  limit?: number,
  loadUntil?: Date
): Promise<string[]> => {
  const query = db
    .collection("puzzles")
    .withConverter(puzzleConverter)
    .orderBy("puzzleTimestamp");

  if (limit) {
    query.limit(limit);
  }

  if (loadUntil) {
    query.endAt(loadUntil);
  }

  const results = (await query.get()).docs;

  const promises = results.map((each) => {
    const puzzle = each.data();
    return puzzleCallback(puzzle);
  });

  const updatedPuzzleIDs = await Promise.all(promises);
  return updatedPuzzleIDs;
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
