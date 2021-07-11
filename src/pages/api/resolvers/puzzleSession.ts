import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { PUZZLE_SESSIONS_COLLECTION } from "../../../constants";
import { MyContext } from "../../../types";
import { PuzzleSession } from "../models/PuzzleSession";
import { User } from "../models/User";
import { getPuzzle, firebaseResultToPuzzle } from "./puzzle";
import { firebaseResultToUser } from "./user";

@Resolver()
export class PuzzleSessionResolver {
  @Mutation(() => PuzzleSession)
  async startPuzzleSession(
    @Ctx() { req, fs }: MyContext,
    @Arg("puzzleID") puzzleID: string,
    @Arg("sessionID", { nullable: true }) sessionID?: string
  ): Promise<PuzzleSession> {
    return await startPuzzleSession(fs, req.user!, puzzleID, sessionID);
  }

  @Mutation(() => Boolean)
  async endPuzzleSession(
    @Ctx() { fs }: MyContext,
    @Arg("sessionID") sessionID: string
  ): Promise<Boolean> {
    return await deletePuzzleSession(fs, sessionID);
  }

  @Query(() => PuzzleSession)
  async getPuzzleSession(
    @Arg("sessionID") sessionID: string,
    @Ctx() { fs }: MyContext
  ): Promise<PuzzleSession> {
    return await getPuzzleSession(fs, sessionID);
  }

  @Query(() => [PuzzleSession])
  async getPuzzleSessionsForUser(
    @Arg("userID") userID: string,
    @Ctx() { fs }: MyContext
  ): Promise<PuzzleSession[]> {
    const results = await fs
      .collection(PUZZLE_SESSIONS_COLLECTION)
      .withConverter(puzzleSessionConverter)
      .where("owner.userID", "==", userID)
      .get();
    const sessions = results.docs.map((result) => result.data());

    return sessions;
  }
}

export const startPuzzleSession = async (
  fs: FirebaseFirestore.Firestore,
  owner: User,
  puzzleID: string,
  sessionID?: string
): Promise<PuzzleSession> => {
  const puzzle = await getPuzzle(fs, puzzleID);
  const session = new PuzzleSession(puzzle, owner, sessionID);
  await fs
    .collection(PUZZLE_SESSIONS_COLLECTION)
    .withConverter(puzzleSessionConverter)
    .doc(session.sessionID)
    .set(session);
  return session;
};

export const deletePuzzleSession = async (
  fs: FirebaseFirestore.Firestore,
  sessionID: string
): Promise<boolean> => {
  await fs
    .collection(PUZZLE_SESSIONS_COLLECTION)
    .withConverter(puzzleSessionConverter)
    .doc(sessionID)
    .delete();
  return true;
};

export const getPuzzleSession = async (
  db: FirebaseFirestore.Firestore,
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
