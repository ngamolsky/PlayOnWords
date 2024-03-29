import classNames from "classnames";
import React from "react";
import { Puzzle } from "../../../models/Puzzle";
import { CombinedBoardState } from "../../../models/Session";
import {
  getClueNumberForCellKeyAndPuzzle,
  getSizeFromCellKeys,
} from "../../../utils/sessionUtils";
import { XCell } from "./XCell";

type XBoardProps = {
  className?: string;
  boardState: CombinedBoardState;
  puzzle: Puzzle;
  onCellClicked: (cellKey: string) => void;
};

const XBOARD_WIDTH = 100;
const XBOARD_BORDER_WIDTH = 1;

export const XBoard = ({
  boardState,
  puzzle,
  onCellClicked,
  className,
}: XBoardProps) => {
  const boardStateKeys = Object.keys(boardState);
  const { width, height } = getSizeFromCellKeys(boardStateKeys);
  const xBoardHeight = (height * XBOARD_WIDTH) / width;

  return (
    <svg
      className={classNames(className)}
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
