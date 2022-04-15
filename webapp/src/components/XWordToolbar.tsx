import { Link } from "react-router-dom";
import React, { Fragment, ReactNode } from "react";
import { APP_NAME } from "../constants";
import { Transition } from "@headlessui/react";

export const XWordToolbar: React.FC<{ belowToolbarContent?: ReactNode }> = ({
  children,
  belowToolbarContent,
}) => {
  return (
    <header className="sticky top-0 flex min-w-full bg-white dark:bg-slate-800 dark:shadow-white">
      <div className="flex flex-col w-full ">
        <div className="z-10 flex w-full p-1 shadow-sm shadow-black dark:shadow-white ">
          <Link to="/">
            <p className="mx-4 my-2 font-bold rounded-lg flex-0 dark:active:bg-slate-500 dark:active:bg-opacity-95 active:bg-slate-200 active:bg-opacity-95">
              {APP_NAME}
            </p>
          </Link>
          <div className="flex justify-end flex-1 mx-4 my-auto">{children}</div>
        </div>
        <Transition
          as={Fragment}
          show={!!belowToolbarContent}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-y-50 origin-top"
          enterTo="transform opacity-100 scale-y-100 origin-top"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-y-100 origin-top"
          leaveTo="transform opacity-0 scale-y-50 origin-top"
        >
          <div className="flex w-full p-2 bg-slate-700">
            {belowToolbarContent}
          </div>
        </Transition>
      </div>
    </header>
  );
};
