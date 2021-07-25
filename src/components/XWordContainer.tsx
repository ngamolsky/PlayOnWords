import React from "react";
import { Flex, FlexProps } from "@chakra-ui/react";

export const XWordContainer: React.FC<FlexProps> = (props) => {
  return (
    <Flex
      direction="column"
      alignItems="center"
      justifyContent="flex-start"
      h="100vh"
      w="100%"
      mx="auto"
      overflow="auto"
      {...props}
    />
  );
};
