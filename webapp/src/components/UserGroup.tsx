import React from "react";
import { User } from "../models/User";

interface UserGroupProps {
  currentUser: User;
  users?: User[];
  currentSessionID?: string;
}

export const UserGroup = ({ currentUser, users }: UserGroupProps) => {
  const orderedUsers: User[] = [currentUser];

  users?.forEach((user) => {
    if (user.username !== currentUser.username) {
      orderedUsers.push(user);
    }
  });

  return (
    orderedUsers && (
      <>
        {orderedUsers.map((user) => (
          <p>{user.displayName}</p>
        ))}
      </>
    )
  );
};
