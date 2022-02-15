import React from "react";
import { Puzzle } from "../../models/Puzzle";
import { CombinedBoardState } from "../../models/Session";
import { getClueNumberForCellKeyAndPuzzle } from "../../utils/sessionUtils";
import { XCell } from "./XCell";

type XBoardProps = {
  boardState: CombinedBoardState;
  puzzle: Puzzle;
  onCellClicked: (cellKey: string) => void;
};

const XBOARD_SIZE = 100;
const XBOARD_BORDER_WIDTH = 1;
const XBOARD_SIZE_WITH_BORDER = XBOARD_SIZE + XBOARD_BORDER_WIDTH;

export const XBoard = ({ boardState, puzzle, onCellClicked }: XBoardProps) => {
  const boardStateKeys = Object.keys(boardState);
  const puzzleSize = Math.sqrt(boardStateKeys.length);

  return (
    <svg viewBox={`0 0 ${XBOARD_SIZE_WITH_BORDER} ${XBOARD_SIZE_WITH_BORDER}`}>
      <rect
        width={`${XBOARD_SIZE_WITH_BORDER}`}
        height={`${XBOARD_SIZE_WITH_BORDER}`}
        className="fill-black"
      />
      <svg
        x={XBOARD_BORDER_WIDTH / 2}
        y={XBOARD_BORDER_WIDTH / 2}
        width={XBOARD_SIZE}
        height={XBOARD_SIZE}
      >
        {boardStateKeys.map((cellKey) => {
          const cellState = boardState[cellKey];

          const clueNumber = getClueNumberForCellKeyAndPuzzle(cellKey, puzzle);

          return (
            <XCell
              onCellClicked={onCellClicked}
              cellSize={XBOARD_SIZE / puzzleSize}
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
