import {
  Box,
  theme,
  Heading,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorMode,
} from "@chakra-ui/react";
import React from "react";
import useUser from "../hooks/useUser";

interface XWordToolbarProps {
  puzzleStartTime?: Date;
}

export const XWordToolbar: React.FC<XWordToolbarProps> = () => {
  const { colorMode } = useColorMode();
  const [user, { signOut }] = useUser();
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
    >
      <Heading my="auto" ml={4} textAlign="start" as="a" href="/">
        XWord
      </Heading>
      <Box ml="auto">
        {user && (
          <Menu>
            <MenuButton my={2} mr={2}>
              <Avatar name={user.displayName ? user.displayName : user.email} />
            </MenuButton>
            <MenuList>
              <MenuItem
                onClick={() => {
                  return signOut();
                }}
              >
                Logout
              </MenuItem>
            </MenuList>
          </Menu>
        )}
      </Box>
    </Box>
  );
};
