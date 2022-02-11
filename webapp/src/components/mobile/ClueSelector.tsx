import React from "react";
import { Clue } from "../../models/Puzzle";

type ClueSelectorProps = {
  clue: Clue;
};

export const ClueSelector: React.FC<ClueSelectorProps> = ({ clue }) => {
  return <p>{clue.hint}</p>;
};
