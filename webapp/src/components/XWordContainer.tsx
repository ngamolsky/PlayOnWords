import React from "react";
import { Flex, FlexProps, Spinner } from "@chakra-ui/react";

type XWordContainerProps = FlexProps & {
  isLoading: boolean;
};

export const XWordContainer = (props: XWordContainerProps) => {
  const { isLoading, children, ...rest } = props;
  return (
    <Flex
      direction="column"
      alignItems="center"
      justifyContent="flex-start"
      h="100vh"
      w="100%"
      mx="auto"
      {...rest}
    >
      {isLoading ? <Spinner size="xl" m="auto" /> : children}
    </Flex>
  );
};
