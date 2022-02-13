import React, { ReactNode } from "react";
import Spinner from "./Spinner";
import { XWordToolbar } from "./XWordToolbar";

type XWordContainerProps = {
  isLoading: boolean;
  showToolbar: boolean;
  toolbarChildren?: ReactNode;
};

export const XWordContainer: React.FC<XWordContainerProps> = ({
  isLoading,
  children,
  toolbarChildren,
  showToolbar,
}) => {
  const content = isLoading ? (
    <div className="grow flex justify-center items-center">
      <Spinner />
    </div>
  ) : (
    children
  );
  return (
    <div className="h-full flex flex-col">
      {showToolbar && <XWordToolbar>{toolbarChildren}</XWordToolbar>}
      {content}
    </div>
  );
};
