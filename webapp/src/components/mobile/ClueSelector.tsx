import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/solid";
import React from "react";
import { Clue } from "../../models/Puzzle";
type ClueSelectorProps = {
  clue: Clue;
  onNextClue: () => void;
  onPreviousClue: () => void;
  onCluePressed: () => void;
};

export const ClueSelector: React.FC<ClueSelectorProps> = ({
  clue,
  onPreviousClue,
  onNextClue,
  onCluePressed,
}) => {
  return (
    <div className="flex h-16">
      <ChevronLeftIcon
        onClick={onPreviousClue}
        className="w-8 dark:bg-slate-700 active:dark:bg-slate-800 active:bg-slate-200 bg-slate-300 shrink-0"
      />
      <div className="flex h-full grow dark:bg-slate-700 dark:text-white active:dark:bg-slate-800 active:bg-slate-200 bg-slate-300">
        <p
          className="self-center text-sm text-left select-none "
          onClick={onCluePressed}
        >
          {clue.hint}
        </p>
      </div>
      <ChevronRightIcon
        onClick={onNextClue}
        className="w-8 dark:bg-slate-700 active:dark:bg-slate-800 active:bg-slate-200 bg-slate-300 shrink-0"
      />
    </div>
  );
};
