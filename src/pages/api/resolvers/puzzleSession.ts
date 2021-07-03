import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { MyContext } from "../../../types";
import {
  getPuzzleSession,
  PuzzleSession,
  startPuzzleSession,
} from "../models/PuzzleSession";

@Resolver()
export class PuzzleSessionResolver {
  @Mutation(() => PuzzleSession)
  async startPuzzleSession(
    @Ctx() { req }: MyContext,
    @Arg("puzzleID") puzzleID: string
  ): Promise<PuzzleSession> {
    return await startPuzzleSession(req.user!, puzzleID);
  }

  @Query(() => PuzzleSession)
  async getPuzzleSession(
    @Arg("sessionID") sessionID: string
  ): Promise<PuzzleSession> {
    return await getPuzzleSession(sessionID);
  }
}
