import classNames from "classnames";
import React, { ReactNode } from "react";
import { XWordToolbar } from "./XWordToolbar";

type XWordContainerProps = {
  showToolbar?: boolean;
  loadingMessage?: string;
  toolbarChildren?: ReactNode;
  className?: string;
};

export const XWordContainer: React.FC<XWordContainerProps> = ({
  loadingMessage,
  children,
  toolbarChildren,
  showToolbar,
  className,
}) => {
  return (
    <div className="flex flex-col min-h-full dark:bg-slate-800 dark:text-white grow">
      {showToolbar && <XWordToolbar>{toolbarChildren}</XWordToolbar>}
      {loadingMessage ? (
        <div className="absolute top-0 left-0 flex items-center justify-center min-w-full min-h-screen grow motion-safe:animate-pulse-fast">
          {loadingMessage}
        </div>
      ) : (
        <div
          className={classNames(
            "flex flex-col w-full h-full mx-auto grow",
            className
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
};
