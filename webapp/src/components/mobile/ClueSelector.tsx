import React from "react";
import { Clue } from "../../models/Puzzle";
import { OrientationType } from "../../reducers/session";
import ChevronLeft from "../icons/ChevronLeft";
import ChevronRight from "../icons/ChevronRight";

type ClueSelectorProps = {
  clue: Clue;
  orientation: OrientationType;
  onNextClue: () => void;
  onPreviousClue: () => void;
  onCluePressed: () => void;
};

export const ClueSelector: React.FC<ClueSelectorProps> = ({
  clue,
  orientation,
  onPreviousClue,
  onNextClue,
  onCluePressed,
}) => {
  return (
    <div className="flex flex-row max-h-16">
      <div
        onClick={onPreviousClue}
        className="flex p-2 py-4 dark:bg-slate-700 dark:text-white active:dark:bg-slate-800 active:bg-slate-200 bg-slate-300"
      >
        <ChevronLeft />
      </div>
      <div
        className="flex p-2 text-left select-none grow dark:bg-slate-700 dark:text-white active:dark:bg-slate-800 active:bg-slate-200 bg-slate-300"
        onClick={onCluePressed}
      >
        <p className="self-center text-sm">
          {clue.number}
          {orientation == OrientationType.HORIZONTAL ? "A" : "D"}: {clue.hint}
        </p>
      </div>
      <div
        onClick={onNextClue}
        className="flex justify-center p-2 py-4 dark:bg-slate-700 dark:text-white active:dark:bg-slate-800 active:bg-slate-200 bg-slate-300"
      >
        <ChevronRight />
      </div>
    </div>
  );
};
