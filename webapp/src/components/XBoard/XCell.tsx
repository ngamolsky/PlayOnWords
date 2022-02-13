import React from "react";
import {
  CellSelectionState,
  CellSolutionState,
  CombinedCellState,
} from "../../models/PuzzleSession";
import { getCellCoordinatesFromKey } from "../../utils/puzzleSessionUtils";

type XCellProps = {
  cellKey: string;
  cellState: CombinedCellState;
  clueNumber: number | null;
  cellSize: number;
  onCellClicked: (cellKey: string) => void;
};

export const XCell = ({
  cellKey,
  cellState,
  clueNumber,
  cellSize,
  onCellClicked,
}: XCellProps) => {
  const { x, y } = getCellCoordinatesFromKey(cellKey);
  const { solutionState, currentLetter, cellSelectionState } = cellState;

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
          onCellClicked(cellKey);
        }}
        className={
          cellSelectionState == CellSelectionState.SELECTED_CELL
            ? "fill-yellow-300"
            : cellSelectionState == CellSelectionState.SELECTED_WORD
            ? "fill-blue-300"
            : cellSelectionState == CellSelectionState.UNSELECTABLE
            ? "fill-black"
            : "fill-white"
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
