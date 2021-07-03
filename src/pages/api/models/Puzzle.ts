import db from "../config/firebase";
import "reflect-metadata";
import { Field, ID, ObjectType } from "type-graphql";
import { PUZZLES_COLLECTION } from "../../../constants";
import { GraphQLScalarType, Kind } from "graphql";
import { DateScalar } from "./DateScalar";

@ObjectType()
export class ClueList {
  @Field(() => [Clue])
  horizontal: Clue[];

  @Field(() => [Clue])
  vertical: Clue[];
}

@ObjectType()
export class Clue {
  @Field()
  number: number;

  @Field()
  x: number;

  @Field()
  y: number;

  @Field()
  hint: string;

  @Field()
  length: number;
}

export class Solutions {
  [key: string]: string | null;
}

const SolutionsScalar = new GraphQLScalarType({
  name: "Solutions",
  serialize(value: unknown): string {
    if (!(value instanceof Object)) {
      throw new Error("SolutionsScalar can only serialize Solutions values");
    }
    return JSON.stringify(value);
  },
  parseValue(value: unknown): Solutions {
    // check the type of received value
    if (typeof value !== "string") {
      throw new Error("SolutionsScalar can only parse string values");
    }
    const solutions = JSON.parse(value);
    return solutions;
  },
  parseLiteral(ast): Solutions {
    // check the type of received value
    if (ast.kind !== Kind.STRING) {
      throw new Error("Solutions can only parse string values");
    }
    return JSON.parse(ast.value);
  },
});

@ObjectType()
export class Puzzle {
  @Field(() => ID)
  puzzleID: string;

  @Field({ nullable: true })
  title?: string;

  @Field(() => ClueList)
  clues: ClueList;

  @Field(() => DateScalar)
  date: Date;

  @Field(() => SolutionsScalar)
  solutions: Solutions;
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
