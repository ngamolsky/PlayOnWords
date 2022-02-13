import React from "react";
import { Clue } from "../../models/Puzzle";
import ChevronLeft from "../icons/ChevronLeft";
import ChevronRight from "../icons/ChevronRight";

type ClueSelectorProps = {
  clue: Clue;
  onNextClue: () => void;
  onPreviousClue: () => void;
};

export const ClueSelector: React.FC<ClueSelectorProps> = ({
  clue,
  onPreviousClue,
  onNextClue,
}) => {
  return (
    <div className="flex flex-row  py-2 ">
      <button onClick={onPreviousClue}>
        <ChevronLeft />
      </button>
      <p className="text-center grow">{clue.hint}</p>
      <button onClick={onNextClue}>
        <ChevronRight />
      </button>
    </div>
  );
};
