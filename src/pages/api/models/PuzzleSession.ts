import db from "../config/firebase";
import "reflect-metadata";
import { Field, ID, ObjectType } from "type-graphql";
import { v4 } from "uuid";
import { PUZZLE_SESSIONS_COLLECTION } from "../../../constants";
import { firebaseResultToUser, User } from "./User";
import { firebaseResultToPuzzle, getPuzzle, Puzzle } from "./Puzzle";
import { DateScalar } from "./DateScalar";

@ObjectType()
export class PuzzleSession {
  @Field(() => ID)
  sessionID: string;

  @Field(() => Puzzle)
  puzzle: Puzzle;

  @Field(() => [User])
  participants: User[];

  @Field()
  owner: User;

  @Field(() => DateScalar)
  startTime: Date;
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
  };
};
