import { Arg, Query, Resolver } from "type-graphql";
import { getPuzzle, getRecentPuzzles, Puzzle } from "../models/Puzzle";

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
