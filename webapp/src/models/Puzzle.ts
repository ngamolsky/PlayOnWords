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
  hasRebus: boolean;
  type: PuzzleType;
};

export type PuzzleType = "daily" | "mini";

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

export const usePuzzlesBySearch = (
  type: PuzzleType,
  dayOfWeek?: number,
  date?: Date,
  title?: string
): [Puzzle[] | undefined, string | undefined] => {
  const [puzzleState, setPuzzleState] = useState<{
    puzzles: Puzzle[];
    loadingMessage?: string;
  }>({
    puzzles: [],
    loadingMessage: "Loading puzzles...",
  });

  useEffect(() => {
    const whereConstraints = [where("type", "==", type)];
    const orderConstraints = [orderBy("puzzleTimestamp", "desc")];
    if (dayOfWeek != null)
      whereConstraints.push(where("dayOfWeek", "==", dayOfWeek));
    if (date != null) {
      whereConstraints.push(
        where("puzzleTimestamp", "==", Timestamp.fromDate(date))
      );

      orderConstraints.pop();
    }

    if (title != null) whereConstraints.push(where("title", "==", title));

    const q = query(
      collection(db, PUZZLES_COLLECTION).withConverter(puzzleConverter),
      ...whereConstraints,
      ...orderConstraints,
      limit(NUM_PUZZLES_TO_SHOW_ON_HOME)
    );

    const unsub = onSnapshot(q, (querySnapshot) => {
      const puzzles: Puzzle[] = [];
      querySnapshot.forEach((doc) => {

        puzzles.push(doc.data());
      });


      console.log(
        "Loaded Puzzles",
        puzzles.map((puzzle) => puzzle.puzzleID)
      );
      

      setPuzzleState({
        puzzles,
        loadingMessage: undefined,
      });
    });
    return unsub;
  }, [dayOfWeek, date, title, type]);

  return [puzzleState.puzzles, puzzleState.loadingMessage];
};

const puzzleConverter: FirestoreDataConverter<Puzzle> = {
  fromFirestore: (snapshot) => snapshot.data() as Puzzle,
  toFirestore: (puzzle: Puzzle) => puzzle,
};
