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
    <div className="grow flex justify-center items-center">
      {loadingMessage}
    </div>
  ) : (
    children
  );
  return (
    <div className="min-h-full flex flex-col">
      {showToolbar && <XWordToolbar>{toolbarChildren}</XWordToolbar>}
      <div className="max-w-sm flex flex-col mx-auto h-full grow">
        {content}
      </div>
    </div>
  );
};
