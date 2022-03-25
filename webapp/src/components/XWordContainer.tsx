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
    
 
  return (
    <div className="flex flex-col min-h-full dark:bg-slate-800 dark:text-white">
      {showToolbar && <XWordToolbar>{toolbarChildren}</XWordToolbar>}
      {loadingMessage && (
        <div className="flex items-center justify-center min-w-full min-h-screen grow motion-safe:animate-pulse-fast">
          {loadingMessage}
        </div>
      )}
      <div className="flex flex-col w-full h-full max-w-sm p-8 mx-auto grow">
        {children}
      </div>
    </div>
  );
};
