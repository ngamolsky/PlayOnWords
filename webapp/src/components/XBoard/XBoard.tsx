import React from "react";
import { Puzzle } from "../../models/Puzzle";
import {
  BoardState,
  CellSelectionState,
  CellSolutionState,
} from "../../models/PuzzleSession";
import { SelectionState } from "../../pages/Solve";
import {
  getCellKeysForClueAndOrientation,
  getClueFromCellKeyOrientationAndPuzzle,
  getClueNumberForCellKeyAndPuzzle,
} from "../../utils/puzzleSessionUtils";
import { XCell } from "./XCell";

type XBoardProps = {
  boardState: BoardState;
  selectionState: SelectionState;
  puzzle: Puzzle;
};

export const XBoard = ({ boardState, puzzle, selectionState }: XBoardProps) => {
  const boardStateKeys = Object.keys(boardState);
  const puzzleSize = Math.sqrt(boardStateKeys.length);
  const { orientation, selectedCellKey } = selectionState;

  return (
    <svg viewBox={`0 0 101 101`}>
      <rect width="101" height="101" fill="black" />
      <svg x={0.5} y={0.5} width="100" height="100">
        {boardStateKeys.map((cellKey) => {
          const cellState = boardState[cellKey];

          const clueNumber = getClueNumberForCellKeyAndPuzzle(cellKey, puzzle);
          const currentSelectedClue = getClueFromCellKeyOrientationAndPuzzle(
            selectedCellKey,
            orientation,
            puzzle
          );
          const activeCellKeys = getCellKeysForClueAndOrientation(
            currentSelectedClue,
            selectionState.orientation
          );

          return (
            <XCell
              solution={puzzle.solutions[cellKey]}
              key={cellKey}
              cellKey={cellKey}
              cellSize={100 / puzzleSize}
              cellState={cellState}
              clueNumber={clueNumber}
              localCellState={{
                cellSelectionState:
                  selectionState.selectedCellKey == cellKey
                    ? CellSelectionState.SELECTED_CELL
                    : activeCellKeys.includes(cellKey)
                    ? CellSelectionState.SELECTED_WORD
                    : CellSelectionState.UNSELECTED,
              }}
            />
          );
        })}
      </svg>
    </svg>
  );
};
