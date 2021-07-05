import db from "../config/firebase";
import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { v4 } from "uuid";
import { PUZZLE_SESSIONS_COLLECTION } from "../../../constants";
import { MyContext } from "../../../types";
import { getBoardStateFromSolutions } from "../../../utils/puzzleSessionUtils";
import { PuzzleSession } from "../models/PuzzleSession";
import { User } from "../models/User";
import { getPuzzle, firebaseResultToPuzzle } from "./puzzle";
import { firebaseResultToUser } from "./user";

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

export const startPuzzleSession = async (
  owner: User,
  puzzleID: string
): Promise<PuzzleSession> => {
  const puzzle = await getPuzzle(puzzleID);
  const session: PuzzleSession = {
    sessionID: `puzzleSession.${v4()}`,
    owner,
    puzzle,
    participants: [owner],
    startTime: new Date(),
    boardState: getBoardStateFromSolutions(puzzle.solutions),
  };
  await db
    .collection(PUZZLE_SESSIONS_COLLECTION)
    .withConverter(puzzleSessionConverter)
    .doc(session.sessionID)
    .set(session);
  return session;
};

export const getPuzzleSession = async (
  sessionID: string
): Promise<PuzzleSession> => {
  const result = await db
    .collection(PUZZLE_SESSIONS_COLLECTION)
    .withConverter(puzzleSessionConverter)
    .doc(sessionID)
    .get();
  return result.data()!;
};

export const puzzleSessionConverter = {
  toFirestore(puzzleSession: PuzzleSession) {
    return puzzleSession;
  },
  fromFirestore(
    snapshot: FirebaseFirestore.QueryDocumentSnapshot
  ): PuzzleSession {
    const results = snapshot.data();
    return firebaseResultToPuzzleSession(results);
  },
};

export const firebaseResultToPuzzleSession = (
  data: FirebaseFirestore.DocumentData
): PuzzleSession => {
  return {
    sessionID: data.sessionID,
    owner: firebaseResultToUser(data.owner),
    participants: data.participants.map((participant: any) =>
      firebaseResultToUser(participant)
    ),
    puzzle: firebaseResultToPuzzle(data.puzzle),
    startTime: data.startTime.toDate(),
    boardState: data.boardState,
  };
};
