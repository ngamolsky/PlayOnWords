import { Menu, Transition } from "@headlessui/react";
import React, { Fragment } from "react";
import { User } from "../models/User";

type AvatarProps = {
  user: User;
  onClick?: () => void;
};

const Avatar: React.FC<AvatarProps> = ({ user, onClick }) => {
  const nameParts = user.displayName ? user.displayName.split(" ") : user.email;
  const inits =
    nameParts.length > 1
      ? nameParts[0][0].concat(nameParts[1][0]).toUpperCase()
      : nameParts[0][0].toUpperCase();
  return (
    <Menu as="div" className="inline-block text-center">
      <Menu.Button
        className="border-black border rounded-full 
                bg-slate-300 aspect-square h-8 w-8 
                flex justify-center items-center p-5"
      >
        {inits}
      </Menu.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-50"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-50"
      >
        <Menu.Items
          className="absolute p-2 px-8 mt-2 right-0
                   bg-white divide-y divide-gray-100 rounded-md 
                     shadow-lg ring-1 ring-black ring-opacity-5 
                     hover:bg-zinc-200 mr-2"
        >
          <Menu.Item>
            <button onClick={onClick}>Sign Out</button>
          </Menu.Item>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default Avatar;