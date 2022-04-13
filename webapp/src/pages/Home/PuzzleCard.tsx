import React from "react";
import { toXWordDate } from "../../utils/timeAndDateUtils";
import { Puzzle } from "../../models/Puzzle";
import XWordIcon from "../../images/XWordIcon";
import classNames from "classnames";

interface PuzzleCardProps {
  className?: string;
  puzzle: Puzzle;
  onClick?: () => void;
}

export enum PuzzleCardAction {
  NEW_GAME = "new_game",
  CONTINUE_GAME = "continue_game",
  END_GAME = "end_game",
}

export const PuzzleCard: React.FC<PuzzleCardProps> = ({
  puzzle,
  onClick,
  className,
}) => {
  return (
    <button
      className={classNames(
        "m-4 mx-auto p-4 w-full text-left dark:bg-slate-900 rounded-lg bg-slate-300 active:scale-[1.01] outline-none select-none cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <XWordIcon className="w-full pointer-events-none" />
      <p className="mt-2 ml-1 text-lg text-ellipsis">
        {toXWordDate(puzzle.puzzleTimestamp.toDate())}
      </p>
      <p className="ml-1 opacity-50">New York Times</p>
    </button>
  );
};
