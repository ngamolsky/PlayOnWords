import "reflect-metadata";
import { Field, ID, ObjectType, registerEnumType } from "type-graphql";
import { User } from "./User";
import { Puzzle } from "./Puzzle";
import { DateScalar } from "./DateScalar";
import { GraphQLScalarType, Kind } from "graphql";

export class BoardState {
  [key: string]: CellState;
}

export class CellState {
  solutionState: CellSolutionState;
  currentLetter: string | null;
}

export enum CellSolutionState {
  REVEALED = "revealed",
  WRONG = "wrong",
  NONE = "none",
}

registerEnumType(CellSolutionState, {
  name: "CellSolutionState",
});

const BoardStateScalar = new GraphQLScalarType({
  name: "BoardState",
  serialize(value: unknown): string {
    if (!(value instanceof Object)) {
      throw new Error("BoardStateScalar can only serialize Solutions values");
    }
    return JSON.stringify(value);
  },
  parseValue(value: unknown): BoardState {
    // check the type of received value
    if (typeof value !== "string") {
      throw new Error("BoardStateScalar can only parse string values");
    }
    const boardState = JSON.parse(value);
    return boardState;
  },
  parseLiteral(ast): BoardState {
    // check the type of received value
    if (ast.kind !== Kind.STRING) {
      throw new Error("BoardStateScalar can only parse string values");
    }
    return JSON.parse(ast.value);
  },
});

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

  @Field(() => BoardStateScalar)
  boardState: BoardState;
}
