import React from "react";
import { User } from "../models/User";

type AvatarProps = {
  user: User;
};

const Avatar: React.FC<AvatarProps> = ({ user }) => {
  const nameParts = user.displayName ? user.displayName.split(" ") : user.email;
  const inits =
    nameParts.length > 1
      ? nameParts[0][0].concat(nameParts[1][0]).toUpperCase()
      : nameParts[0][0].toUpperCase();
  return (
    <div
      className="border-black border rounded-full 
                bg-slate-300 aspect-square h-8 w-8 
                flex justify-center items-center p-5"
    >
      {inits}
    </div>
  );
};

export default Avatar;
