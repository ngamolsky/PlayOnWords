import { Link } from "react-router-dom";
import React from "react";

export const XWordToolbar: React.FC = ({ children }) => {
  return (
    <header className="flex min-w-full shadow-sm shadow-black dark:shadow-white sticky top-0 z-10 bg-white dark:bg-slate-800">
      <p className="mx-4 my-4 flex-0 font-alfa font-xl hover:bg-slate-500 active:bg-slate-100 hover:bg-opacity-95 active:bg-opacity-95 p-2 rounded-lg">
        <Link to="/">X WORD</Link>
      </p>
      <div className="flex-1 my-auto flex mx-4 justify-end">{children}</div>
    </header>
  );
};
