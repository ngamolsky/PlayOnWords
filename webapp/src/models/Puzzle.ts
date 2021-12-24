import {
  collection,
  FirestoreDataConverter,
  limit,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../config/firebase";
import { PUZZLES_COLLECTION } from "../constants";

export type Puzzle = {
  puzzleID: string;
  title?: string;
  clues: ClueList;
  date: Date;
  solutions: Solutions;
  nytID: string;
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

export const useRecentPuzzles = (
  num_puzzles: number
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
      orderBy("date", "desc"),
      limit(num_puzzles)
    );

    console.log(
      `useRecentPuzzles: Querying Puzzles Collection for most recent puzzles`
    );

    const unsub = onSnapshot(
      q,
      (querySnapshot) => {
        const puzzles: Puzzle[] = [];
        querySnapshot.forEach((doc) => {
          puzzles.push(doc.data());
          console.log(`useRecentPuzzles: Setting puzzleState: ${puzzles}`);
        });
        console.log(`useRecentPuzzles: Setting puzzleState: ${puzzles}`);
        setPuzzleState({
          puzzles,
          loading: false,
        });
      },
      (error) => {
        console.log(error);
      }
    );
    return unsub();
  }, [num_puzzles, puzzleState]);

  return [puzzleState.puzzles, puzzleState.loading];
};

const puzzleConverter: FirestoreDataConverter<Puzzle> = {
  fromFirestore: (snapshot) => {
    const puzzleData = snapshot.data();
    const puzzle: Puzzle = {
      puzzleID: puzzleData.puzzleID,
      clues: puzzleData.clues,
      date: puzzleData.date.toDate(),
      solutions: puzzleData.solutions,
      nytID: puzzleData.nytID,
    };

    if (puzzleData.title) {
      puzzle.title = puzzleData.title;
    }

    return puzzle;
  },
  toFirestore: (puzzle) => puzzle,
};
