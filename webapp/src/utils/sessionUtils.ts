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
  const matchingUser = session.participants.find(
    (currentUser) => currentUser.userID === userID
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

export const getSortedCellKeyArray = (cellKeys: string[]): string[] => {
  return cellKeys.sort((cellKeyA, cellKeyB) => {
    const { x: xA, y: yA } = getCellCoordinatesFromKey(cellKeyA);
    const { x: xB, y: yB } = getCellCoordinatesFromKey(cellKeyB);

    return yA - yB || xA - xB;
  });
};

export const getFirstSelectableCellKey = (puzzle: Puzzle): string => {
  const sortedKeys = getSortedCellKeyArray(Object.keys(puzzle.solutions));
  const cellKey = sortedKeys.find((cellKey) => {
    const cellSelectable = puzzle.solutions[cellKey] != null;
    if (cellSelectable) {
      return cellKey;
    }
  });
  if (!cellKey) {
    throw Error("No selectable key found!");
  }
  return cellKey;
};

export const getLastSelectableCellKey = (puzzle: Puzzle): string => {
  const sortedKeys = getSortedCellKeyArray(
    Object.keys(puzzle.solutions)
  ).reverse();
  const cellKey = sortedKeys.find((cellKey) => {
    const cellSelectable = puzzle.solutions[cellKey] != null;
    if (cellSelectable) {
      return cellKey;
    }
  });
  if (!cellKey) {
    throw Error("No selectable key found!");
  }

  return cellKey;
};

export const getPercentageComplete = (
  boardState: BoardState,
  solutions: Solutions
): number => {
  const filledCellCount = Object.values(boardState).filter(
    (each) => !!each.currentLetter
  ).length;
  const totalFillableCellCount = Object.values(solutions).filter(
    (each) => !!each
  ).length;

  return (filledCellCount / totalFillableCellCount) * 100;
};

export const checkPuzzle = (
  boardState: BoardState,
  solutions: Solutions
): boolean => {
  for (const cellKey of Object.keys(solutions)) {
    const cellSolution = solutions[cellKey];
    const currentLetter = boardState[cellKey].currentLetter;

    if (!currentLetter) continue;
    if (Array.isArray(cellSolution)) {
      if (!cellSolution.includes(currentLetter)) {
        return false;
      }
    } else if (cellSolution !== currentLetter) {
      return false;
    }
  }

  return true;
};

export const getSessionCompletionPercentages = (
  session: Session
): Record<string, number> => {
  const userPercentages: Record<string, number> = {};
  const { puzzle } = session;

  const totalSelectableCellCount = Object.values(puzzle.solutions).filter(
    (each) => !!each
  ).length;

  session.participants.forEach((participant) => {
    const participantCellCount = Object.values(session.boardState).filter(
      (each) => each.lastEditedBy == participant.userID
    ).length;

    console.log();

    userPercentages[participant.username] =
      participantCellCount / totalSelectableCellCount;
  });

  return userPercentages;
};