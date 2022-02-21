import React from "react";
import {
  CellSelectionState,
  CellSolutionState,
  CombinedCellState,
} from "../../models/Session";
import { getCellCoordinatesFromKey } from "../../utils/sessionUtils";

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
          d={`m ${cellSize * x} ${cellSize * y} l ${cellSize} ${cellSize}`}
          strokeWidth={0.4}
          strokeLinecap="butt"
          className="stroke-red-500 stroke-[.4]"
        />
      )}
      <text
        className="select-none"
        x={cellSize * x + 0.3}
        y={cellSize * y + cellSize / 3.8}
        fontSize={cellSize / 3.5}
        textAnchor="start"
        pointerEvents="none"
        letterSpacing="0"
      >
        {clueNumber}
      </text>
      {currentLetter && (
        <text
          x={cellSize * x + cellSize / 2}
          y={cellSize * y + cellSize - 0.7}
          fontSize={cellSize - cellSize * (0.2 * currentLetter.length)}
          fontFamily="arial,sans-serif"
          textAnchor="middle"
          pointerEvents="none"
          letterSpacing="0"
          className={`select-none ${
            solutionState == CellSolutionState.REVEALED
              ? "fill-blue-600"
              : solutionState == CellSolutionState.PENCIL
              ? "fill-slate-500"
              : "fill-black"
          } `}
        >
          {currentLetter}
        </text>
      )}
    </g>
  );
};
