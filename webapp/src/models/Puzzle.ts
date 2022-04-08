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
import { PUZZLES_COLLECTION } from "../constants";

export type Puzzle = {
  puzzleID: string;
  title?: string;
  clues: ClueList;
  puzzleTimestamp: Timestamp;
  dayOfWeek: number;
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

export type Solutions = Record<string, string | null | string[]>;

export const usePuzzleByDate = (
  date: Date
): [Puzzle | undefined, string | undefined] => {
  const [puzzleState, setPuzzleState] = useState<{
    puzzle?: Puzzle;
    loadingMessage?: string;
  }>({
    loadingMessage: "Loading puzzles by date...",
  });

  useEffect(() => {
    const q = query(
      collection(db, PUZZLES_COLLECTION).withConverter(puzzleConverter),
      where("puzzleTimestamp", "==", Timestamp.fromDate(date))
    );

    const unsub = onSnapshot(q, (querySnapshot) => {
      const puzzles: Puzzle[] = [];
      querySnapshot.forEach((doc) => {
        puzzles.push(doc.data());
      });

      if (puzzles.length !== 1) {
        throw new Error(
          `Found more than one puzzle for date: ${JSON.stringify(
            date
          )}, puzzles ${puzzles.map((puzzle) => puzzle.puzzleID)}`
        );
      }

      setPuzzleState({
        puzzle: puzzles[0],
        loadingMessage: undefined,
      });
    });
    return unsub;
  }, [date]);

  return [puzzleState.puzzle, puzzleState.loadingMessage];
};

export const usePuzzlesByDayOfWeek = (
  dayOfWeek: number
): [Puzzle[] | undefined, string | undefined] => {
  const [puzzleState, setPuzzleState] = useState<{
    puzzles: Puzzle[];
    loadingMessage?: string;
  }>({
    puzzles: [],
    loadingMessage: "Loading puzzles by day of week...",
  });

  useEffect(() => {
    const q = query(
      collection(db, PUZZLES_COLLECTION).withConverter(puzzleConverter),
      where("dayOfWeek", "==", dayOfWeek),
      orderBy("puzzleTimestamp", "desc")
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
  }, [dayOfWeek]);

  return [puzzleState.puzzles, puzzleState.loadingMessage];
};

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
      limit(numPuzzles)
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

const puzzleConverter: FirestoreDataConverter<Puzzle> = {
  fromFirestore: (snapshot) => snapshot.data() as Puzzle,
  toFirestore: (puzzle: Puzzle) => puzzle,
};
