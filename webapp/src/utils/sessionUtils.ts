import { Clue, Puzzle, Solutions } from "../models/Puzzle";
import {
  CellSelectionState,
  CellSolutionState,
  CombinedBoardState,
  CombinedCellState,
  BoardState,
  Session,
  CellState,
} from "../models/Session";
import { OrientationType, SessionState } from "../reducers/session";

export const getBoardStateFromSolutions = (
  solutions: Solutions,
  userID?: string
): BoardState => {
  const newBoardState = Object.fromEntries(
    Object.entries(solutions).map(([cellKey, solution]) => {
      const cellState: CellState = {
        currentLetter: solution ? "" : null,
        solutionState: CellSolutionState.NONE,
      };

      if (userID) {
        cellState.lastEditedBy = userID;
      }
      return [cellKey, cellState];
    })
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
  const cellKeys = Object.keys(puzzle.solutions);
  const width =
    Math.max(
      ...cellKeys.map((cellKey) => getCellCoordinatesFromKey(cellKey).x)
    ) + 1;
  const height =
    Math.max(
      ...cellKeys.map((cellKey) => getCellCoordinatesFromKey(cellKey).y)
    ) + 1;
  let newX = oldX;
  let newY = oldY;
  if (orientation === OrientationType.HORIZONTAL) {
    if ((oldX + 1) % width === 0) {
      newX = 0;
      newY++;
      if (newY % width === 0) {
        newY = 0;
      }
    } else {
      newX++;
    }
  } else if (orientation === OrientationType.VERTICAL) {
    if ((oldY + 1) % height === 0) {
      newX++;
      newY = 0;
      if (newX % height === 0) {
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
  const cellKeys = Object.keys(puzzle.solutions);
  const width =
    Math.max(
      ...cellKeys.map((cellKey) => getCellCoordinatesFromKey(cellKey).x)
    ) + 1;
  const height =
    Math.max(
      ...cellKeys.map((cellKey) => getCellCoordinatesFromKey(cellKey).y)
    ) + 1;
  let newX = oldX;
  let newY = oldY;

  if (orientation === OrientationType.HORIZONTAL) {
    if (oldX === 0) {
      newX = width - 1;
      newY--;
    } else {
      newX--;
    }

    if (newY < 0) {
      newY = width - 1;
    }
  } else if (orientation === OrientationType.VERTICAL) {
    if (oldY === 0) {
      newY = height - 1;
      newX--;
    } else {
      newY--;
    }

    if (newX < 0) {
      newX = height - 1;
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

export const getNextClue = (
  { clues }: Puzzle,
  currentClue: Clue,
  orientation: OrientationType
): Clue | null => {
  const currentClueIndex = clues[orientation].findIndex(
    (clue) => clue == currentClue
  );

  const isLastClue = currentClueIndex == clues[orientation].length;

  if (isLastClue) return null;

  return clues[orientation][currentClueIndex + 1];
};

export const getPreviousClue = (
  { clues }: Puzzle,
  currentClue: Clue,
  orientation: OrientationType
): Clue | null => {
  const currentClueIndex = clues[orientation].findIndex(
    (clue) => clue == currentClue
  );

  const isFirstClue = currentClueIndex == 0;
  if (isFirstClue) return null;

  return clues[orientation][currentClueIndex - 1];
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

export const getCombinedBoardState = (
  sessionState: SessionState
): CombinedBoardState => {
  // This combines the local and shared state for each cellKey.
  // Probably could be done cleaner with a reduce method.

  const {
    session,
    localState: { orientation, selectedCellKey },
  } = sessionState;

  if (!session) {
    throw new Error("No session not found");
  }

  const {
    boardState,
    puzzle: { solutions },
  } = session;

  const currentSelectedClue = getClueFromCellKeyOrientationAndPuzzle(
    selectedCellKey,
    orientation,
    session.puzzle
  );

  const activeCellKeys = getCellKeysForClueAndOrientation(
    currentSelectedClue,
    orientation
  );

  const combinedBoardState: CombinedBoardState = {};
  Object.keys(boardState).forEach((cellKey) => {
    const sharedCellState = boardState[cellKey];
    const cellState: CombinedCellState = {
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

    combinedBoardState[cellKey] = cellState;
  });

  return combinedBoardState;
};

export const isUserInSession = (session: Session, userID: string): boolean => {
  const matchingUser = session.participantIDs.find(
    (currentUserID) => currentUserID === userID
  );
  return !!matchingUser;
};


export const getSizeFromCellKeys = (
  cellKeys: string[]
): { width: number; height: number } => {
  const width =
    Math.max(
      ...cellKeys.map((cellKey) => getCellCoordinatesFromKey(cellKey).x)
    ) + 1;
  const height =
    Math.max(
      ...cellKeys.map((cellKey) => getCellCoordinatesFromKey(cellKey).y)
    ) + 1;

  return {
    width,
    height,
  };
};