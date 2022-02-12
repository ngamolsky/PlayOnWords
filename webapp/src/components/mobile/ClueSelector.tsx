import React from "react";
import { Clue } from "../../models/Puzzle";

type ClueSelectorProps = {
  clue: Clue;
};

export const ClueSelector: React.FC<ClueSelectorProps> = ({ clue }) => {
  return <p className="text-center py-2">{clue.hint}</p>;
};
