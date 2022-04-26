import { Link } from "react-router-dom";
import React, { ReactNode } from "react";
import { APP_NAME } from "../utils/constants";
import { Transition } from "@headlessui/react";
import { XIcon } from "@heroicons/react/solid";
import IconButton from "./IconButton";

export const XWordToolbar: React.FC<{
  belowToolbarContent?: ReactNode;
  homeMode?: "icon" | "text";
}> = ({ children, belowToolbarContent, homeMode }) => {
  return (
    <header className="sticky top-0 flex min-w-full bg-white dark:bg-slate-800 dark:shadow-white">
      <div className="flex flex-col w-full ">
        <div className="z-10 flex w-full h-12 p-1 shadow-sm shadow-black dark:shadow-white ">
          {homeMode == "icon" ? (
            <Link to="/" className="my-auto ">
              <IconButton className="w-8 h-8 ml-2 rounded-full">
                <XIcon />
              </IconButton>
            </Link>
          ) : (
            <p className="px-2 mx-4 my-2 font-bold rounded-lg cursor-pointer flex-0 dark:active:bg-slate-500 dark:active:bg-opacity-95 active:bg-slate-200 active:bg-opacity-95">
              {APP_NAME}
            </p>
          )}
          <div className="flex justify-end flex-1 mx-2 my-auto">{children}</div>
        </div>
        <Transition
          show={!!belowToolbarContent}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-y-50 origin-top"
          enterTo="transform opacity-100 scale-y-100 origin-top"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-y-100 origin-top"
          leaveTo="transform opacity-0 scale-y-50 origin-top"
        >
          <div className="flex w-full p-2 ">{belowToolbarContent}</div>
          <hr className="" />
        </Transition>
      </div>
    </header>
  );
};
