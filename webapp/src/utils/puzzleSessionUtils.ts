import { Clue, Puzzle, Solutions } from "../models/Puzzle";
import {
  BoardState,
  CellSelectionState,
  CellSolutionState,
  CellState,
  OrientationType,
  SharedBoardState,
} from "../models/PuzzleSession";

export const getSharedBoardStateFromSolutions = (
  solutions: Solutions
): SharedBoardState => {
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

export const getNextCellKey = (
  currentCellKey: string,
  puzzle: Puzzle,
  orientation: OrientationType
): string => {
  const { x: oldX, y: oldY } = getCellCoordinatesFromKey(currentCellKey);
  const size = Math.sqrt(Object.keys(puzzle.solutions).length);
  let newX = oldX;
  let newY = oldY;
  if (orientation === OrientationType.HORIZONTAL) {
    if ((oldX + 1) % size === 0) {
      newX = 0;
      newY++;
      if (newY % size === 0) {
        newY = 0;
      }
    } else {
      newX++;
    }
  } else if (orientation === OrientationType.VERTICAL) {
    if ((oldY + 1) % size === 0) {
      newX++;
      newY = 0;
      if (newX % size === 0) {
        newX = 0;
      }
    } else {
      newY++;
    }
  }
  const newCellKey = [newX, newY].toString();
  if (!puzzle.solutions[newCellKey]) {
    return getNextCellKey(newCellKey, puzzle, orientation);
  }
  return newCellKey;
};

export const getPreviousCellKey = (
  currentCellKey: string,
  puzzle: Puzzle,
  orientation: OrientationType
): string => {
  const { x: oldX, y: oldY } = getCellCoordinatesFromKey(currentCellKey);
  const size = Math.sqrt(Object.keys(puzzle).length);
  let newX = oldX;
  let newY = oldY;

  if (orientation === OrientationType.HORIZONTAL) {
    if (oldX === 0) {
      newX = size - 1;
      newY--;
    } else {
      newX--;
    }

    if (newY < 0) {
      newY = size - 1;
    }
  } else if (orientation === OrientationType.VERTICAL) {
    if (oldY === 0) {
      newY = size - 1;
      newX--;
    } else {
      newY--;
    }

    if (newX < 0) {
      newX = size - 1;
    }
  }

  const newCellKey = [newX, newY].toString();
  if (!puzzle.solutions[newCellKey]) {
    return getPreviousCellKey(newCellKey, puzzle, orientation);
  }

  return newCellKey;
};

export const getClueFromCellKeyOrientationAndPuzzle = (
  cellKey: string,
  orientation: OrientationType,
  { clues }: Puzzle
): Clue => {
  const { x, y } = getCellCoordinatesFromKey(cellKey);

  const horizontalClueIndex = clues[OrientationType.HORIZONTAL].findIndex(
    (clue) => x < clue.x + clue.length && x >= clue.x && y === clue.y
  );

  const verticalClueIndex = clues[OrientationType.VERTICAL].findIndex(
    (clue) => y < clue.y + clue.length && y >= clue.y && x === clue.x
  );

  const clueIndex =
    orientation === OrientationType.HORIZONTAL
      ? horizontalClueIndex
      : verticalClueIndex;
  return clues[orientation][clueIndex];
};

export const getClueNumberForCellKeyAndPuzzle = (
  cellKey: string,
  puzzle: Puzzle
): number | null => {
  const { x, y } = getCellCoordinatesFromKey(cellKey);
  const horizontalClue = getClueFromCellKeyOrientationAndPuzzle(
    cellKey,
    OrientationType.HORIZONTAL,
    puzzle
  );

  const verticalClue = getClueFromCellKeyOrientationAndPuzzle(
    cellKey,
    OrientationType.VERTICAL,
    puzzle
  );

  return horizontalClue && horizontalClue.x === x && horizontalClue.y === y
    ? horizontalClue.number
    : verticalClue && verticalClue.x === x && verticalClue.y === y
    ? verticalClue.number
    : null;
};

export const getCellKeysForClueAndOrientation = (
  clue: Clue,
  orientation: OrientationType
): string[] => {
  const cellKeys: string[] = [];
  if (orientation === OrientationType.HORIZONTAL) {
    const cellY = clue.y;
    let cellX;
    for (cellX = clue.x; cellX < clue.x + clue.length; cellX++) {
      cellKeys.push([cellX, cellY].toString());
    }
  } else {
    const cellX = clue.x;
    let cellY;
    for (cellY = clue.y; cellY < clue.y + clue.length; cellY++) {
      cellKeys.push([cellX, cellY].toString());
    }
  }

  return cellKeys;
};

export const getSortedKeyArrayFromKeyObject = (keyObject: {
  [cellKey: string]: any;
}): string[] => {
  return Object.keys(keyObject).sort((keyA, keyB) => {
    const { x: aX, y: aY } = getCellCoordinatesFromKey(keyA);
    const { x: bX, y: bY } = getCellCoordinatesFromKey(keyB);
    if (bY === aY && aX === bX) return 0;
    if (bY > aY || (bY === aY && bX > aX)) return -1;
    return 1;
  });
};

export const getResetBoardStateFromCurrentBoardState = (
  boardState: BoardState
): BoardState => {
  let newBoardState: BoardState = {};
  newBoardState = Object.entries(boardState).reduce(
    (newBoardState, [cellKey, cellState]) => {
      if (cellState) {
        newBoardState[cellKey] = {
          ...cellState,
          currentLetter: "",
          solutionState: CellSolutionState.NONE,
        };
      }

      return newBoardState;
    },
    newBoardState
  );
  return newBoardState;
};

export const getCombinedBoardState = (
  sharedBoardState: SharedBoardState,
  solutions: Solutions,
  selectedCellKey: string,
  activeCellKeys: string[]
): BoardState => {
  // This combines the local and shared state for each cellKey.
  // Probably could be done cleaner with a reduce method.
  const boardState: BoardState = {};
  Object.keys(sharedBoardState).forEach((cellKey) => {
    const sharedCellState = sharedBoardState[cellKey];
    const cellState: CellState = {
      ...sharedCellState,
      cellSelectionState:
        solutions[cellKey] == null
          ? CellSelectionState.UNSELECTABLE
          : selectedCellKey == cellKey
          ? CellSelectionState.SELECTED_CELL
          : activeCellKeys.includes(cellKey)
          ? CellSelectionState.SELECTED_WORD
          : CellSelectionState.UNSELECTED,
    };

    boardState[cellKey] = cellState;
  });

  return boardState;
};
