import React, { useState } from "react";

const XWordIcon = ({
  className,
  isMini,
}: {
  className?: string;
  isMini?: boolean;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);

  return isLoading ? (
    <svg
      viewBox="0 0 97 97"
      xmlns="http://www.w3.org/2000/svg"
      ref={(ref) => {
        if (ref) {
          setIsLoading(false);
        }
      }}
      className={className}
    >
      <rect className="w-full h-full fill-black animate-pulse-fast" />
    </svg>
  ) : isMini ? (
    <svg
      viewBox="0 0 152 152"
      xmlns="http://www.w3.org/2000/svg"
      ref={(ref) => {
        if (ref) {
          setIsLoading(false);
        }
      }}
      className={className}
      fill="none"
    >
      <rect x="2" y="2" width="148" height="148" fill="white" />
      <rect x="101" y="51" width="50" height="50" fill="black" />
      <rect x="1" y="1" width="50" height="50" fill="black" />
      <rect
        x="1.25"
        y="1.25"
        width="49.5"
        height="49.5"
        stroke="#626262"
        strokeWidth="0.5"
      />
      <rect
        x="51.25"
        y="1.25"
        width="49.5"
        height="49.5"
        stroke="#626262"
        strokeWidth="0.5"
      />
      <rect
        x="101.25"
        y="1.25"
        width="49.5"
        height="49.5"
        stroke="#626262"
        strokeWidth="0.5"
      />
      <rect
        x="101.25"
        y="51.25"
        width="49.5"
        height="49.5"
        stroke="#626262"
        strokeWidth="0.5"
      />
      <rect
        x="51.25"
        y="51.25"
        width="49.5"
        height="49.5"
        stroke="#626262"
        strokeWidth="0.5"
      />
      <rect
        x="1.25"
        y="51.25"
        width="49.5"
        height="49.5"
        stroke="#626262"
        strokeWidth="0.5"
      />
      <rect
        x="1.25"
        y="101.25"
        width="49.5"
        height="49.5"
        stroke="#626262"
        strokeWidth="0.5"
      />
      <rect
        x="51.25"
        y="101.25"
        width="49.5"
        height="49.5"
        stroke="#626262"
        strokeWidth="0.5"
      />
      <rect
        x="101.25"
        y="101.25"
        width="49.5"
        height="49.5"
        stroke="#626262"
        strokeWidth="0.5"
      />
      <rect
        x="2.5"
        y="2.5"
        width="147"
        height="147"
        stroke="black"
        strokeWidth="5"
      />
    </svg>
  ) : (
    <svg
      viewBox="0 0 97 97"
      xmlns="http://www.w3.org/2000/svg"
      ref={(ref) => {
        if (ref) {
          setIsLoading(false);
        }
      }}
      className={className}
    >
      <g fillRule="nonzero" fill="none">
        <path fill="#797987" d="M2.5 2.5h92v92h-92z" />
        <path d="M92 5v87H5V5h87m5-5H0v97h97V0z" fill="#000" />
        <path
          d="M5 5h21v21H5V5zm22 0h21v21H27V5zm22 0h21v21H49V5z"
          fill="#FFF"
        />
        <path fill="#000" d="M71 5h21v21H71z" />
        <path fill="#FFF" d="M5 27h21v21H5z" />
        <path fill="#000" d="M27 27h21v21H27z" />
        <path
          d="M49 27h21v21H49V27zm22 0h21v21H71V27zM5 49h21v21H5V49zm22 0h21v21H27V49z"
          fill="#FFF"
        />
        <path fill="#000" d="M49 49h21v21H49z" />
        <path fill="#FFF" d="M71 49h21v21H71z" />
        <path fill="#000" d="M5 71h21v21H5z" />
        <path
          d="M27 71h21v21H27V71zm22 0h21v21H49V71zm22 0h21v21H71V71z"
          fill="#FFF"
        />
      </g>
    </svg>
  );
};

export default XWordIcon;
