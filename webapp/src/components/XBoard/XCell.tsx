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
  const { x, y } = getCellCoordinatesFromKey(cellKey);

  return (
    <g>
      <rect
        width={cellSize}
        height={cellSize}
        x={cellSize * x}
        y={cellSize * y}
        fill={solution ? "white" : "black"}
        strokeWidth={0.1}
        stroke={"grey"}
      />
    </g>
  );
};
