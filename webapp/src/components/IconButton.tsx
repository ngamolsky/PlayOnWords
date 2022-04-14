import React, { MutableRefObject, ReactNode } from "react";
import classNames from "classnames";

const IconButton = ({
  children,
  onClick,
  className,
  disabled,
  selected,
  ref,
}: {
  children?: ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  selected?: boolean;
  ref?: MutableRefObject<HTMLButtonElement>;
}) => {
  return (
    <button
      ref={ref}
      className={classNames(
        "p-1",
        className,
        {
          "opacity-50": disabled,
        },
        {
          "dark:bg-slate-600": selected,
        }
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default IconButton;
