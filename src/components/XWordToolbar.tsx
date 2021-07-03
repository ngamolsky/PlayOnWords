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
import Link from "next/link";
import axios from "axios";
import React from "react";
import { User } from "../pages/api/models/User";
import useUser from "../pages/api/hooks";

interface XWordToolbarProps {
  user: User;
}

export const XWordToolbar: React.FC<XWordToolbarProps> = ({ user }) => {
  const { refetch } = useUser({
    redirectTo: "/login",
  });
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
    >
      <Link href="/" passHref>
        <Heading my="auto" ml={4} textAlign="start" as="a">
          XWord
        </Heading>
      </Link>
      <Box ml="auto">
        <Menu>
          <MenuButton my={2} mr={2}>
            <Avatar
              name={user.displayName ? user.displayName : user.username}
            />
          </MenuButton>
          <MenuList>
            <MenuItem
              onClick={async () => {
                await axios.post("/api/auth/logout");
                await refetch();
                return;
              }}
            >
              Logout
            </MenuItem>
          </MenuList>
        </Menu>
      </Box>
    </Box>
  );
};
