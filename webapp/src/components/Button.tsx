import React, { ReactNode } from "react";
import classNames from "classnames";

const Button = ({
  children,
  type,
  onClick,
  className,
}: {
  children?: ReactNode;
  type: "submit" | "button";
  onClick?: () => void;
  className?: string;
}) => {
  const classStr = classNames(
    "py-2 text-white bg-teal-600 rounded-lg active:bg-teal-700",
    className
  );
  return (
    <button type={type} className={classStr} onClick={onClick}>
      {children}
    </button>
  );
};

export default Button;
