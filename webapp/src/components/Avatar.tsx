import { Menu, Transition } from "@headlessui/react";
import React, { Fragment } from "react";
import { User } from "../models/User";

type AvatarProps = {
  user: User;
  onClick?: () => void;
};

const Avatar: React.FC<AvatarProps> = ({ user, onClick }) => {

  return (
    <Menu as="div" className="inline-block text-center">
      <Menu.Button
        className="rounded-full aspect-square h-8 w-8 dark:bg-slate-600  active:bg-slate-200 active:bg-opacity-95
                   flex justify-center items-center p-5 dark:active:bg-slate-500 dark:active:bg-opacity-95 outline-none"
      >
        {user.username[0].toUpperCase()}
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
          className="absolute p-2 px-8 mt-2 right-2
                     bg-white dark:bg-slate-800 divide-y rounded-md 
                     shadow-lg
                     active:bg-slate-200 active:bg-opacity-95
                     dark:active:bg-slate-500 dark:active:bg-opacity-95
                     outline-none"
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
