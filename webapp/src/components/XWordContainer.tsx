import React, { ReactNode } from "react";
import Spinner from "./Spinner";
import { XWordToolbar } from "./XWordToolbar";

type XWordContainerProps = {
  isLoading: boolean;
  toolbarChildren?: ReactNode;
};

export const XWordContainer: React.FC<XWordContainerProps> = (props) => {
  const { isLoading, children, toolbarChildren } = props;
  const content = isLoading ? (
    <div className="grow flex justify-center items-center">
      <Spinner />
    </div>
  ) : (
    children
  );
  return (
    <div className="min-h-screen flex flex-col">
      <XWordToolbar>{toolbarChildren}</XWordToolbar>
      {content}
    </div>
  );
};
