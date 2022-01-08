import React from "react";
import { Solutions } from "../../models/Puzzle";
import { BoardState } from "../../models/PuzzleSession";
import { XCell } from "./XCell";

type ХBoardProps = {
  boardState: BoardState;
  solutions: Solutions;
};

export const XBoard = ({ boardState, solutions }: ХBoardProps) => {
  const boardStateKeys = Object.keys(boardState);
  const puzzleSize = Math.sqrt(boardStateKeys.length);

  return (
    <svg viewBox={`0 0 101 101`}>
      <rect width="101" height="101" fill="black" />
      <svg x={0.5} y={0.5} width="100" height="100">
        {boardStateKeys.map((cellKey) => {
          const cellState = boardState[cellKey];
          return (
            <XCell
              solution={solutions[cellKey]}
              key={cellKey}
              cellKey={cellKey}
              cellSize={100 / puzzleSize}
              cellState={cellState}
            />
          );
        })}
      </svg>
    </svg>
  );
};
