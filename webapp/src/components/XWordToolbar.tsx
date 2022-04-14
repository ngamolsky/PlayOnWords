import { Link } from "react-router-dom";
import React, { ReactNode } from "react";
import { APP_NAME } from "../constants";

export const XWordToolbar: React.FC<{ belowToolbarContent?: ReactNode }> = ({
  children,
  belowToolbarContent,
}) => {
  return (
    <header className="sticky top-0 flex min-w-full bg-white dark:bg-slate-800 dark:shadow-white">
      <div className="flex flex-col w-full ">
        <div className="z-10 flex w-full p-1 shadow-sm shadow-black dark:shadow-white ">
          <Link to="/">
            <p className="mx-4 my-2 rounded-lg flex-0 font-alfa font-xl dark:active:bg-slate-500 dark:active:bg-opacity-95 active:bg-slate-200 active:bg-opacity-95">
              {APP_NAME}
            </p>
          </Link>
          <div className="flex justify-end flex-1 mx-4 my-auto">{children}</div>
        </div>
        {belowToolbarContent && (
          <div className="w-full">{belowToolbarContent}</div>
        )}
      </div>
    </header>
  );
};
