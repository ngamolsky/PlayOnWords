import { Link } from "react-router-dom";
import { APP_NAME } from "../constants";
import React from "react";

export const XWordToolbar: React.FC = ({ children }) => {
  return (
    <header className="flex min-w-full shadow-sm shadow-black sticky top-0 z-10 bg-white">
      <p className="mx-4 my-4 flex-0">
        <Link to="/">{APP_NAME}</Link>
      </p>
      <div className="flex-1 my-auto flex mx-4 justify-end">{children}</div>
    </header>
  );
};
