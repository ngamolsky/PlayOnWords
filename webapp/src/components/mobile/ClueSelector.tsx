import React from "react";
import { Text, Box, Center, theme, Button } from "@chakra-ui/react";
import { Clue } from "../../models/Puzzle";

type ClueSelectorProps = {
  clue: Clue;
};

export const ClueSelector: React.FC<ClueSelectorProps> = ({ clue }) => {
  return (
    <Box w="100%" bgColor={theme.colors.gray[700]}>
      <Center h={"100%"}>
        <Button w={"100%"} h={"100%"} display="inline" my={4}>
          {clue.hint}
        </Button>
      </Center>
    </Box>
  );
};
