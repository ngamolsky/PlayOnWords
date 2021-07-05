import React from "react";
import { BOARD_VIEWBOX_SIZE } from "../../constants";
import { BoardState } from "../../pages/api/models/PuzzleSession";
import { getCellCoordinatesFromKey } from "../../utils/puzzleSessionUtils";
import { Cell } from "./Cell";

export const Board: React.FC<{
  boardState: BoardState;
}> = ({ boardState }) => {
  const cellKeys = Object.keys(boardState);
  const size = Math.sqrt(cellKeys.length);
  const cellSize = BOARD_VIEWBOX_SIZE / size;
  return (
    <svg viewBox={`0 0 ${BOARD_VIEWBOX_SIZE} ${BOARD_VIEWBOX_SIZE}`}>
      {Object.entries(boardState).map(([cellKey, cellState]) => {
        const { x, y } = getCellCoordinatesFromKey(cellKey);
        return (
          <Cell
            key={cellKey}
            size={cellSize}
            x={x * cellSize}
            y={y * cellSize}
            selectable={cellState.currentLetter != null}
          />
        );
      })}
    </svg>
  );
};
