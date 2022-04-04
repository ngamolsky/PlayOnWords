import React, { ReactNode } from "react";
import classNames from "classnames";

const Button = ({
  children,
  type,
  onClick,
  className,
  disabled,
}: {
  children?: ReactNode;
  type: "submit" | "button";
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}) => {
  const classStr = classNames(
    "py-2 text-white bg-teal-600 rounded-lg active:bg-teal-700",
    className,
    { "opacity-50": disabled }
  );
  return (
    <button
      type={type}
      className={classStr}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
