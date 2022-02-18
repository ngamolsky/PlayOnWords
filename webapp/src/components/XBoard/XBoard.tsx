import React from "react";
import { Puzzle } from "../../models/Puzzle";
import { CombinedBoardState } from "../../models/Session";
import {
  getCellCoordinatesFromKey,
  getClueNumberForCellKeyAndPuzzle,
} from "../../utils/sessionUtils";
import { XCell } from "./XCell";

type XBoardProps = {
  boardState: CombinedBoardState;
  puzzle: Puzzle;
  onCellClicked: (cellKey: string) => void;
};

const XBOARD_WIDTH = 100;
const XBOARD_BORDER_WIDTH = 1;

export const XBoard = ({ boardState, puzzle, onCellClicked }: XBoardProps) => {
  const boardStateKeys = Object.keys(boardState);
  const width =
    Math.max(
      ...boardStateKeys.map((cellKey) => getCellCoordinatesFromKey(cellKey).x)
    ) + 1;
  const height =
    Math.max(
      ...boardStateKeys.map((cellKey) => getCellCoordinatesFromKey(cellKey).y)
    ) + 1;

  const xBoardHeight = (15 * XBOARD_WIDTH) / 16;
  console.log(xBoardHeight);

  console.log(width, height);

  return (
    <svg
      viewBox={`0 0 ${XBOARD_WIDTH + XBOARD_BORDER_WIDTH} ${
        xBoardHeight + XBOARD_BORDER_WIDTH
      }`}
    >
      <rect
        width={XBOARD_WIDTH + XBOARD_BORDER_WIDTH}
        height={xBoardHeight + XBOARD_BORDER_WIDTH}
        className="fill-black"
      />
      <svg
        x={XBOARD_BORDER_WIDTH / 2}
        y={XBOARD_BORDER_WIDTH / 2}
        width={XBOARD_WIDTH}
        height={xBoardHeight}
      >
        {boardStateKeys.map((cellKey) => {
          const cellState = boardState[cellKey];

          const clueNumber = getClueNumberForCellKeyAndPuzzle(cellKey, puzzle);

          return (
            <XCell
              onCellClicked={onCellClicked}
              cellSize={XBOARD_WIDTH / width}
              key={cellKey}
              cellKey={cellKey}
              cellState={cellState}
              clueNumber={clueNumber}
            />
          );
        })}
      </svg>
    </svg>
  );
};
