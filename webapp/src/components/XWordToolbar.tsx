import { Box, theme, Heading, useColorMode } from "@chakra-ui/react";
import React from "react";
import { Link } from "react-router-dom";
import { APP_NAME } from "../constants";

export const XWordToolbar: React.FC = ({ children }) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  return (
    <Box
      w="100%"
      display="flex"
      bgColor={isDark ? theme.colors.gray[700] : theme.colors.gray[400]}
      boxShadow="lg"
      zIndex={2}
      pos="sticky"
      top={0}
      minH="64px"
    >
      <Heading my="auto" ml={4} textAlign="start">
        <Link to="/">{APP_NAME}</Link>
      </Heading>
      <Box ml="auto">{children}</Box>
    </Box>
  );
};
