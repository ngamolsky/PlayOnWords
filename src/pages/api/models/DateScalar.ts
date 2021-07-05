import { GraphQLScalarType, Kind } from "graphql";

export const DateScalar = new GraphQLScalarType({
  name: "Date",
  serialize(value: unknown): string {
    if (!(value instanceof Date)) {
      throw new Error(`DateScalar can only serialize Date values`);
    }
    return value.toISOString();
  },
  parseValue(value: unknown): Date {
    // check the type of received value
    if (typeof value !== "string") {
      throw new Error("DateScalar can only parse string values");
    }
    return new Date(value);
  },
  parseLiteral(ast): Date {
    // check the type of received value
    if (ast.kind !== Kind.STRING) {
      throw new Error("DateScalar can only parse string values");
    }
    return new Date(ast.value);
  },
});
