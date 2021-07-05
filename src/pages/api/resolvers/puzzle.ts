import db from "../config/firebase";
import { Arg, Query, Resolver } from "type-graphql";
import { Puzzle } from "../models/Puzzle";
import { PUZZLES_COLLECTION } from "../../../constants";

@Resolver()
export class PuzzleResolver {
  @Query(() => [Puzzle])
  async recentPuzzles(@Arg("limit") limit: number): Promise<Puzzle[]> {
    const puzzles = await getRecentPuzzles(limit);
    return puzzles;
  }

  @Query(() => Puzzle)
  async getPuzzle(@Arg("puzzleID") puzzleID: string): Promise<Puzzle> {
    return await getPuzzle(puzzleID);
  }
}

export const addPuzzle = async (puzzle: Puzzle): Promise<boolean> => {
  await db
    .collection(PUZZLES_COLLECTION)
    .withConverter(puzzleConverter)
    .doc(puzzle.puzzleID)
    .set(puzzle);
  return true;
};

export const getPuzzle = async (puzzleID: string): Promise<Puzzle> => {
  const result = await db
    .collection(PUZZLES_COLLECTION)
    .withConverter(puzzleConverter)
    .doc(puzzleID)
    .get();

  return result.data()!;
};

export const getRecentPuzzles = async (limit: number): Promise<Puzzle[]> => {
  const results = await db
    .collection(PUZZLES_COLLECTION)
    .withConverter(puzzleConverter)
    .orderBy("date", "desc")
    .limit(limit)
    .get();

  const puzzles = results.docs.map((result) => result.data());
  return puzzles;
};

export const puzzleConverter = {
  toFirestore(puzzle: Puzzle) {
    return puzzle;
  },
  fromFirestore(snapshot: FirebaseFirestore.QueryDocumentSnapshot): Puzzle {
    const results = snapshot.data();
    return firebaseResultToPuzzle(results);
  },
};

export const firebaseResultToPuzzle = (
  data: FirebaseFirestore.DocumentData
): Puzzle => {
  return {
    puzzleID: data.puzzleID,
    solutions: data.solutions,
    clues: data.clues,
    title: data.title ? data.title : "",
    date: data.date.toDate(),
  };
};
