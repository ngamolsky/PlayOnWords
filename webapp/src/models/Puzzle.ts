import {
  collection,
  FirestoreDataConverter,
  limit,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../config/firebase";
import { PUZZLES_COLLECTION } from "../constants";

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

export type Solutions = Record<string, string | null | string[]>;

export const useRecentPuzzles = (
  numPuzzles: number
): [Puzzle[] | undefined, boolean] => {
  const [puzzleState, setPuzzleState] = useState<{
    puzzles: Puzzle[];
    loading: boolean;
  }>({
    puzzles: [],
    loading: true,
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
        loading: false,
      });
    });
    return unsub;
  }, [numPuzzles]);

  return [puzzleState.puzzles, puzzleState.loading];
};

const puzzleConverter: FirestoreDataConverter<Puzzle> = {
  fromFirestore: (snapshot) => snapshot.data() as Puzzle,
  toFirestore: (puzzle: Puzzle) => puzzle,
};
