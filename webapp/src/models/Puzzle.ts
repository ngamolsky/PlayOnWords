import {
  collection,
  FirestoreDataConverter,
  limit,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../config/firebase";
import { NUM_PUZZLES_TO_SHOW_ON_HOME, PUZZLES_COLLECTION } from "../constants";

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


export const useRecentPuzzles = (
  numPuzzles: number
): [Puzzle[] | undefined, string | undefined] => {
  const [puzzleState, setPuzzleState] = useState<{
    puzzles: Puzzle[];
    loadingMessage?: string;
  }>({
    puzzles: [],
    loadingMessage: "Loading recent puzzles...",
  });

  useEffect(() => {
    const q = query(
      collection(db, PUZZLES_COLLECTION).withConverter(puzzleConverter),
      orderBy("puzzleTimestamp", "desc"),
      limit(NUM_PUZZLES_TO_SHOW_ON_HOME)
    );

    const unsub = onSnapshot(q, (querySnapshot) => {
      const puzzles: Puzzle[] = [];
      querySnapshot.forEach((doc) => {
        puzzles.push(doc.data());
      });

      setPuzzleState({
        puzzles,
        loadingMessage: undefined,
      });
    });
    return unsub;
  }, [numPuzzles]);

  return [puzzleState.puzzles, puzzleState.loadingMessage];
};

export const usePuzzlesBySearch = (
  dayOfWeek?: number,
  date?: Date,
  title?: string
): [Puzzle[] | undefined, string | undefined] => {
  const [puzzleState, setPuzzleState] = useState<{
    puzzles: Puzzle[];
    loadingMessage?: string;
  }>({
    puzzles: [],
    loadingMessage: "Loading puzzles by day of week...",
  });

  useEffect(() => {
    const whereConstraints = [];
    
    if (dayOfWeek != null)
      whereConstraints.push(where("dayOfWeek", "==", dayOfWeek));
    if (date != null)
      whereConstraints.push(
        where("puzzleTimestamp", "==", Timestamp.fromDate(date))
      );
    if (title != null) whereConstraints.push(where("title", "==", title));

    const q = query(
      collection(db, PUZZLES_COLLECTION).withConverter(puzzleConverter),
      ...whereConstraints,
      orderBy("puzzleTimestamp", "desc"),
      limit(NUM_PUZZLES_TO_SHOW_ON_HOME)
    );

    const unsub = onSnapshot(q, (querySnapshot) => {
      const puzzles: Puzzle[] = [];
      querySnapshot.forEach((doc) => {
        puzzles.push(doc.data());
      });

      setPuzzleState({
        puzzles,
        loadingMessage: undefined,
      });
    });
    return unsub;
   
  }, [dayOfWeek, date, title]);

  return [puzzleState.puzzles, puzzleState.loadingMessage];
};

const puzzleConverter: FirestoreDataConverter<Puzzle> = {
  fromFirestore: (snapshot) => snapshot.data() as Puzzle,
  toFirestore: (puzzle: Puzzle) => puzzle,
};
