import React from "react";
import { User } from "../models/User";
import Dropdown from "./Dropdown";

type AvatarProps = {
  user: User;
  onClick?: () => void;
};

const Avatar: React.FC<AvatarProps> = ({ user, onClick }) => {
  return (
    <Dropdown
      buttonContent={
        <div className="flex items-center justify-center w-8 h-8 rounded-full outline-none aspect-square dark:bg-slate-600 bg-slate-200 active:bg-slate-200 active:bg-opacity-95 dark:active:bg-slate-500 dark:active:bg-opacity-95">
          {user.username[0].toUpperCase()}
        </div>
      }
      items={[
        {
          node: <button className="px-4">Sign Out</button>,
          onClick: onClick,
        },
      ]}
    />
  );
};

export default Avatar;
