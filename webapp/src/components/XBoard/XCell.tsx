import { useTheme } from "@chakra-ui/react";
import React from "react";
import { CellState } from "../../models/PuzzleSession";
import { getCellCoordinatesFromKey } from "../../utils/puzzleSessionUtils";

type XCellProps = {
  cellKey: string;
  cellState: CellState;
  cellSize: number;
  solution: string | null;
};

export const XCell = ({ cellKey, cellSize, solution }: XCellProps) => {
  const theme = useTheme();

  const { x, y } = getCellCoordinatesFromKey(cellKey);

  return (
    <g>
      <rect
        width={cellSize}
        height={cellSize}
        x={cellSize * x}
        y={cellSize * y}
        fill={solution ? theme.colors.white : theme.colors.black}
        strokeWidth={0.1}
        stroke={theme.colors.gray[600]}
      />
    </g>
  );
};
