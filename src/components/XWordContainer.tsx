import { Flex, FlexProps, useColorMode } from "@chakra-ui/react";

export const XWordContainer: React.FC<FlexProps> = (props) => {
  const { colorMode } = useColorMode();

  const bgColor = { light: "gray.50", dark: "gray.900" };
  const color = { light: "black", dark: "white" };
  return (
    <Flex
      direction="column"
      alignItems="center"
      justifyContent="flex-start"
      bg={bgColor[colorMode]}
      color={color[colorMode]}
      h="100vh"
      w="100%"
      mx="auto"
      {...props}
    />
  );
};
