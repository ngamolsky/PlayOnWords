import React, { ReactNode } from "react";

const Button = ({
  children,
  type,
  onClick,
}: {
  children?: ReactNode;
  type: "submit" | "button";
  onClick?: () => void;
}) => {
  return (
    <button
      type={type}
      className="py-2 mx-2 text-white bg-teal-600 rounded-lg active:bg-teal-700"
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;
