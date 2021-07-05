import { Solutions } from "../pages/api/models/Puzzle";
import {
  BoardState,
  CellSolutionState,
} from "../pages/api/models/PuzzleSession";

export const getBoardStateFromSolutions = (
  solutions: Solutions
): BoardState => {
  const newBoardState = Object.fromEntries(
    Object.entries(solutions).map(([cellKey, solution]) => [
      cellKey,
      {
        currentLetter: solution ? "" : null,
        solutionState: CellSolutionState.NONE,
      },
    ])
  );

  return newBoardState;
};

export const getCellCoordinatesFromKey = (
  cellKey: string
): {
  x: number;
  y: number;
} => {
  const [xString, yString] = cellKey.split(",");
  return {
    x: parseInt(xString),
    y: parseInt(yString),
  };
};
