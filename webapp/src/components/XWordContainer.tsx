import React, { ReactNode } from "react";
import { XWordToolbar } from "./XWordToolbar";

type XWordContainerProps = {
  loadingMessage?: string;
  showToolbar: boolean;
  toolbarChildren?: ReactNode;
};

export const XWordContainer: React.FC<XWordContainerProps> = ({
  loadingMessage,
  children,
  toolbarChildren,
  showToolbar,
}) => {
  const content = loadingMessage ? (
    <div className="grow flex justify-center items-center motion-safe:animate-pulse-fast">
      {loadingMessage}
    </div>
  ) : (
    children
  );
  return (
    <div className="min-h-full flex flex-col dark:bg-slate-800 dark:text-white">
      {showToolbar && <XWordToolbar>{toolbarChildren}</XWordToolbar>}
      <div className="max-w-sm flex flex-col mx-auto h-full grow w-full">
        {content}
      </div>
    </div>
  );
};
