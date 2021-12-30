import {
  Menu,
  MenuButton,
  AvatarGroup,
  Avatar,
  theme,
  MenuList,
  MenuItem,
  AvatarBadge,
} from "@chakra-ui/react";
import React from "react";
import { signOut, User } from "../models/User";

interface UserGroupProps {
  currentUser: User;
  users?: User[];
  currentSessionID?: string;
}

export const UserGroup: React.FC<UserGroupProps> = ({
  currentUser,
  users,
  currentSessionID,
}) => {
  const orderedUsers: User[] = [currentUser];

  users?.forEach((user) => {
    if (user.userID !== currentUser.userID) {
      orderedUsers.push(user);
    }
  });

  return (
    orderedUsers && (
      <Menu>
        <MenuButton my={2} mr={2}>
          <AvatarGroup size="md" max={4}>
            {orderedUsers.map((user) => (
              <Avatar
                border={
                  user.userID === currentUser?.userID
                    ? `2px  solid ${theme.colors.green[500]}`
                    : "0px"
                }
                key={user.userID}
                name={user.displayName ? user.displayName : user.email}
              >
                {currentSessionID &&
                  user.activeSessionIDs.includes(currentSessionID) && (
                    <AvatarBadge boxSize=".8em" bg="green.500" />
                  )}
              </Avatar>
            ))}
          </AvatarGroup>
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
    )
  );
};
