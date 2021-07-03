import { Box, Spinner } from "@chakra-ui/react";
import React from "react";
import { XWordContainer } from "../../components/XWordContainer";
import { NextApiResponse } from "next";
import { XWordRequest } from "../../types";
import { User } from "../api/models/User";
import { XWordToolbar } from "../../components/XWordToolbar";
import { withServerSidePropsProtect } from "../api/middleware/withServerSidePropsProtect";
import { useGetPuzzleSessionQuery } from "../../generated/graphql";
import { useRouter } from "next/router";

export const getServerSideProps = async ({
  req,
  res,
}: {
  req: XWordRequest;
  res: NextApiResponse;
}) => {
  return withServerSidePropsProtect(req, res);
};

const Index: React.FC<{ user: User }> = ({ user }) => {
  const router = useRouter();
  const { puzzleSessionID } = router.query;

  const { data, loading } = useGetPuzzleSessionQuery({
    variables: {
      sessionID: puzzleSessionID as string,
    },
  });

  const screen =
    loading && data?.getPuzzleSession ? (
      <Spinner size="xl" m="auto" />
    ) : (
      <Box w="80%" h="100vh">
        {data?.getPuzzleSession.puzzle.date}
      </Box>
    );

  return (
    <XWordContainer>
      <XWordToolbar user={user} />
      {screen}
    </XWordContainer>
  );
};
export default Index;
