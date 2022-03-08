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
        className="bg-slate-300 active:bg-slate-400 p-2 py-4 flex"
      >
        <ChevronLeft />
      </div>
      <div
        className="text-left grow bg-slate-300 active:bg-slate-400 p-2 flex select-none"
        onClick={onCluePressed}
      >
        <p className="text-sm self-center">
          {clue.number}
          {orientation == OrientationType.HORIZONTAL ? "A" : "D"}: {clue.hint}
        </p>
      </div>
      <div
        onClick={onNextClue}
        className="bg-slate-300 active:bg-slate-400 p-2 py-4 justify-center flex"
      >
        <ChevronRight />
      </div>
    </div>
  );
};
