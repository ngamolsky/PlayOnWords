import React from "react";
import { Clue } from "../../models/Puzzle";
import { OrientationType } from "../../models/PuzzleSession";
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
    <div className="flex flex-row">
      <button
        onClick={onPreviousClue}
        className="bg-slate-300 active:bg-slate-400 p-4"
      >
        <ChevronLeft />
      </button>
      <button
        className="text-center grow bg-slate-300 active:bg-slate-400 p-4 overflow-hidden"
        onClick={onCluePressed}
      >
        <p className="truncate">
          {clue.number}
          {orientation == OrientationType.HORIZONTAL ? "A" : "D"}: {clue.hint}
        </p>
      </button>
      <button
        onClick={onNextClue}
        className="bg-slate-300 active:bg-slate-400 p-4"
      >
        <ChevronRight />
      </button>
    </div>
  );
};
