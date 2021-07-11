import { theme } from "@chakra-ui/react";
import React from "react";
import { CellSolutionState } from "../../pages/api/models/PuzzleSession";

export type CellProps = {
  cellLetter?: string;
  x?: number;
  y?: number;
  size: number;
  solutionState?: CellSolutionState;
  selectable: boolean;
};

export const Cell: React.FC<CellProps> = ({
  x,
  y,
  size,
  solutionState = CellSolutionState.NONE,
  selectable,
}) => {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={size}
        height={size}
        fill={selectable ? theme.colors.white : theme.colors.black}
        stroke={theme.colors.gray[400]}
        strokeWidth={selectable ? 0.2 : 0}
      />
      {solutionState == CellSolutionState.WRONG && (
        <path
          d={`m ${x} ${y} l ${size} ${size}`}
          stroke={theme.colors.red[500]}
          strokeWidth={0.4}
          strokeLinecap="butt"
        />
      )}
    </g>
  );
};
