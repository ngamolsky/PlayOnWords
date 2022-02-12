import React from "react";
import {
  CellSelectionState,
  CellSolutionState,
  CellState,
  LocalCellState,
} from "../../models/PuzzleSession";
import { getCellCoordinatesFromKey } from "../../utils/puzzleSessionUtils";

type XCellProps = {
  cellKey: string;
  cellState: CellState;
  localCellState: LocalCellState;
  cellSize: number;
  solution: string | null;
  clueNumber: number | null;
};

export const XCell = ({
  cellKey,
  cellSize,
  solution,
  cellState,
  clueNumber,
  localCellState,
}: XCellProps) => {
  const { x, y } = getCellCoordinatesFromKey(cellKey);
  const { solutionState, currentLetter } = cellState;
  const { cellSelectionState } = localCellState;

  return (
    <g>
      <rect
        width={cellSize}
        height={cellSize}
        x={cellSize * x}
        y={cellSize * y}
        strokeWidth={0.1}
        stroke={"grey"}
        onMouseDown={(event: React.MouseEvent) => {
          event.preventDefault();
        }}
        onPointerUp={() => {
          console.log(cellKey);
        }}
        className={
          cellSelectionState == CellSelectionState.SELECTED_CELL
            ? "fill-yellow-300"
            : cellSelectionState == CellSelectionState.SELECTED_WORD
            ? "fill-blue-300"
            : solution
            ? "fill-white"
            : "fill-black"
        }
      />
      {solutionState === CellSolutionState.WRONG && (
        <path
          d={`m ${x} ${y} l ${cellSize} ${cellSize}`}
          strokeWidth={0.4}
          strokeLinecap="butt"
          className="stroke-red-500 stroke-[.4]"
        />
      )}
      <text
        x={cellSize * x + 0.3}
        y={cellSize * y + cellSize / 3.8}
        fontSize={cellSize / 3.5}
        textAnchor="start"
        pointerEvents="none"
        letterSpacing="0"
      >
        {clueNumber}
      </text>
      <text
        x={cellSize * x + cellSize / 2}
        y={cellSize * y + cellSize - 0.7}
        fontSize={cellSize - cellSize * 0.2}
        fontFamily="arial,sans-serif"
        textAnchor="middle"
        pointerEvents="none"
        letterSpacing="0"
        className={`${
          solutionState == CellSolutionState.REVEALED
            ? "fill-blue-600"
            : "fill-black"
        } `}
      >
        {currentLetter}
      </text>
    </g>
  );
};
