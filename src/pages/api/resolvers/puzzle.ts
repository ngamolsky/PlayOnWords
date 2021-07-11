import { Arg, Ctx, Query, Resolver } from "type-graphql";
import { Puzzle } from "../models/Puzzle";
import { PUZZLES_COLLECTION } from "../../../constants";
import { MyContext } from "../../../types";

@Resolver()
export class PuzzleResolver {
  @Query(() => [Puzzle])
  async recentPuzzles(
    @Arg("limit") limit: number,
    @Ctx() { fs }: MyContext
  ): Promise<Puzzle[]> {
    const results = await fs
      .collection(PUZZLES_COLLECTION)
      .withConverter(puzzleConverter)
      .orderBy("date", "desc")
      .limit(limit)
      .get();

    const puzzles = results.docs.map((result) => result.data());
    return puzzles;
  }

  @Query(() => Puzzle)
  async getPuzzle(
    @Arg("puzzleID") puzzleID: string,
    @Ctx() { fs }: MyContext
  ): Promise<Puzzle> {
    return await getPuzzle(fs, puzzleID);
  }
}

export const addPuzzle = async (
  fs: FirebaseFirestore.Firestore,
  puzzle: Puzzle
): Promise<boolean> => {
  await fs
    .collection(PUZZLES_COLLECTION)
    .withConverter(puzzleConverter)
    .doc(puzzle.puzzleID)
    .set(puzzle);
  return true;
};

export const getPuzzle = async (
  db: FirebaseFirestore.Firestore,
  puzzleID: string
): Promise<Puzzle> => {
  const result = await db
    .collection(PUZZLES_COLLECTION)
    .withConverter(puzzleConverter)
    .doc(puzzleID)
    .get();
  return result.data()!;
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
