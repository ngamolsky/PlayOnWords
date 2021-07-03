import nextConnect from "next-connect";
import { buildSchema } from "type-graphql";
import { UserResolver } from "./resolvers/user";
import { ApolloServer } from "apollo-server-micro";
import { NextApiRequest, NextApiResponse } from "next";
import { MyContext } from "../../types";
import fs from "./config/firebase";
import { PuzzleResolver } from "./resolvers/puzzle";
import { withPassport } from "./middleware/withPassport";
import { PuzzleSessionResolver } from "./resolvers/puzzleSession";

export const config = {
  api: {
    bodyParser: false,
  },
};

const apolloServerHandler = nextConnect<NextApiRequest, NextApiResponse>();
apolloServerHandler.use(withPassport);
apolloServerHandler.use(async (req, res, _) => {
  const schema = await buildSchema({
    resolvers: [UserResolver, PuzzleResolver, PuzzleSessionResolver],
  });
  const apolloServer = new ApolloServer({
    schema,
    context: ({ req, res }): MyContext => ({
      fs,
      req,
      res,
    }),
    playground: {
      settings: {
        "request.credentials": "include",
        "schema.polling.enable": false,
      },
    },
  }).createHandler({
    path: "/api/graphql",
  });

  apolloServer(req, res);
});

export default apolloServerHandler;
