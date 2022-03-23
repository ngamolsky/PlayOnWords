import { Link } from "react-router-dom";
import React from "react";

export const XWordToolbar: React.FC = ({ children }) => {
  return (
    <header className="flex min-w-full shadow-sm sticky top-0 z-10 bg-white shadow-black dark:bg-slate-800 dark:shadow-white ">
      <p className="mx-4 my-4 flex-0 font-alfa font-xl dark:active:bg-slate-500 dark:active:bg-opacity-95 active:bg-slate-200 active:bg-opacity-95 p-2 rounded-lg">
        <Link to="/">X WORD</Link>
      </p>
      <div className="flex-1 my-auto flex mx-4 justify-end">{children}</div>
    </header>
  );
};
