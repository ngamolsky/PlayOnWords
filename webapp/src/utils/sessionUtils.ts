import { FIRST_CELL_KEY } from "./constants";
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
  solutions: Solutions
): BoardState => {
  const newBoardState = Object.fromEntries(
    Object.entries(solutions).map(([cellKey, solution]) => {
      const cellState: CellState = {
        currentLetter: Array.isArray(solution) || solution ? "" : null,
        solutionState: CellSolutionState.NONE,
      };

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

export const isLastCellInClue = (
  cellKey: string,
  currentClue: Clue,
  orientation: OrientationType
): boolean => {
  const { x, y } = getCellCoordinatesFromKey(cellKey);

  return orientation == OrientationType.HORIZONTAL
    ? x == currentClue.x + currentClue.length - 1
    : y == currentClue.y + currentClue.length - 1;
};

export const isFirstCellInClue = (
  cellKey: string,
  currentClue: Clue,
  orientation: OrientationType
): boolean => {
  const { x, y } = getCellCoordinatesFromKey(cellKey);

  return orientation == OrientationType.HORIZONTAL
    ? x == currentClue.x
    : y == currentClue.y;
};

export const getFirstSelectableCellKey = (puzzle: Puzzle): string => {
  const sortedKeys = getSortedCellKeyArray(Object.keys(puzzle.solutions));
  for (const cellKey of sortedKeys) {
    if (puzzle.solutions[cellKey]) return cellKey;
  }
  throw new Error(`No Selectable Key found for puzzle ${puzzle.puzzleID}`);
};

export const getNextCellKey = (
  currentCellKey: string,
  puzzle: Puzzle,
  orientation: OrientationType
): {
  nextCellKey: string;
  didChangeClues: boolean;
  didLoopPuzzle: boolean;
} => {
  const { x: oldX, y: oldY } = getCellCoordinatesFromKey(currentCellKey);

  const currentClue = getClueFromCellKeyOrientationAndPuzzle(
    currentCellKey,
    orientation,
    puzzle
  );

  if (isLastCellInClue(currentCellKey, currentClue, orientation)) {
    const { nextClue, didLoopPuzzle } = getNextClue(
      puzzle,
      currentClue,
      orientation
    );
    return {
      nextCellKey: [nextClue.x, nextClue.y].toString(),
      didChangeClues: true,
      didLoopPuzzle,
    };
  } else {
    const newX = orientation == OrientationType.HORIZONTAL ? oldX + 1 : oldX;
    const newY = orientation == OrientationType.HORIZONTAL ? oldY : oldY + 1;
    return {
      nextCellKey: [newX, newY].toString(),
      didChangeClues: false,
      didLoopPuzzle: false,
    };
  }
};

export const getPreviousCellKey = (
  currentCellKey: string,
  puzzle: Puzzle,
  orientation: OrientationType
): {
  previousCellKey: string;
  didChangeClues: boolean;
  didLoopPuzzle: boolean;
} => {
  const { x: oldX, y: oldY } = getCellCoordinatesFromKey(currentCellKey);

  const currentClue = getClueFromCellKeyOrientationAndPuzzle(
    currentCellKey,
    orientation,
    puzzle
  );

  if (isFirstCellInClue(currentCellKey, currentClue, orientation)) {
    const { previousClue, didLoopPuzzle } = getPreviousClue(
      puzzle,
      currentClue,
      orientation
    );

    const newOrientation = didLoopPuzzle
      ? orientation == OrientationType.HORIZONTAL
        ? OrientationType.VERTICAL
        : OrientationType.HORIZONTAL
      : orientation;

    const newX =
      newOrientation == OrientationType.HORIZONTAL
        ? previousClue.x + previousClue.length - 1
        : previousClue.x;
    const newY =
      newOrientation == OrientationType.HORIZONTAL
        ? previousClue.y
        : previousClue.y + previousClue.length - 1;

    return {
      previousCellKey: [newX, newY].toString(),
      didChangeClues: true,
      didLoopPuzzle,
    };
  } else {
    const newX = orientation == OrientationType.HORIZONTAL ? oldX - 1 : oldX;
    const newY = orientation == OrientationType.HORIZONTAL ? oldY : oldY - 1;
    return {
      previousCellKey: [newX, newY].toString(),
      didChangeClues: false,
      didLoopPuzzle: false,
    };
  }
};

export const getNextEmptyCellKey = (
  currentCellKey: string,
  puzzle: Puzzle,
  boardState: BoardState,
  orientation: OrientationType
): {
  nextEmptyCellKey: string;
  didChangeClues: boolean;
  didLoopPuzzle: boolean;
} => {
  if (isPuzzleComplete(boardState, puzzle.solutions)) {
    return {
      nextEmptyCellKey: FIRST_CELL_KEY,
      didChangeClues: false,
      didLoopPuzzle: false,
    };
  }

  let { nextCellKey, didChangeClues, didLoopPuzzle } = getNextCellKey(
    currentCellKey,
    puzzle,
    orientation
  );

  let hasLoopedPuzzle = false;
  let currentOrientation = orientation;
  while (nextCellKey && boardState[nextCellKey].currentLetter) {
    ({ nextCellKey, didChangeClues, didLoopPuzzle } = getNextCellKey(
      nextCellKey,
      puzzle,
      currentOrientation
    ));

    if (didLoopPuzzle) {
      hasLoopedPuzzle = true;
      currentOrientation =
        orientation == OrientationType.HORIZONTAL
          ? OrientationType.VERTICAL
          : OrientationType.HORIZONTAL;
    }
  }

  return {
    nextEmptyCellKey: nextCellKey,
    didChangeClues,
    didLoopPuzzle: hasLoopedPuzzle,
  };
};

export const getPreviousEmptyCellKey = (
  currentCellKey: string,
  puzzle: Puzzle,
  boardState: BoardState,
  orientation: OrientationType
): {
  previousEmptyCellKey: string;
  didChangeClues: boolean;
  didLoopPuzzle: boolean;
} => {
  if (isPuzzleComplete(boardState, puzzle.solutions)) {
    throw new Error("Tried to get previous empty cell on complete puzzle");
  }

  let { previousCellKey, didChangeClues, didLoopPuzzle } = getPreviousCellKey(
    currentCellKey,
    puzzle,
    orientation
  );

  while (previousCellKey && boardState[previousCellKey].currentLetter) {
    ({ previousCellKey, didChangeClues, didLoopPuzzle } = getPreviousCellKey(
      previousCellKey,
      puzzle,
      orientation
    ));
  }

  return {
    previousEmptyCellKey: previousCellKey,
    didChangeClues,
    didLoopPuzzle,
  };
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
): {
  nextClue: Clue;
  didLoopPuzzle: boolean;
} => {
  const currentClueIndex = clues[orientation].findIndex(
    (clue) => clue == currentClue
  );

  const isLastClue = currentClueIndex == clues[orientation].length - 1;
  if (isLastClue)
    return {
      nextClue:
        orientation == OrientationType.HORIZONTAL
          ? clues.vertical[0]
          : clues.horizontal[0],
      didLoopPuzzle: true,
    };

  return {
    nextClue: clues[orientation][currentClueIndex + 1],
    didLoopPuzzle: false,
  };
};

export const getPreviousClue = (
  { clues }: Puzzle,
  currentClue: Clue,
  orientation: OrientationType
): {
  previousClue: Clue;
  didLoopPuzzle: boolean;
} => {
  const currentClueIndex = clues[orientation].findIndex(
    (clue) => clue == currentClue
  );

  const isFirstClue = currentClueIndex == 0;

  if (isFirstClue)
    return {
      previousClue:
        orientation == OrientationType.HORIZONTAL
          ? clues.vertical[clues.vertical.length - 1]
          : clues.horizontal[clues.horizontal.length - 1],
      didLoopPuzzle: true,
    };

  return {
    previousClue: clues[orientation][currentClueIndex - 1],
    didLoopPuzzle: false,
  };
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
    puzzle: { solutions, specialCells, clues },
  } = session;

  const currentSelectedClue = getClueFromCellKeyOrientationAndPuzzle(
    selectedCellKey,
    orientation,
    session.puzzle
  );

  const relatedCellKeys: string[] = [];

  if (currentSelectedClue.relatedClueNumbers) {
    const horizontalClues =
      currentSelectedClue.relatedClueNumbers.horizontal.map((clueNumber) => {
        return clues.horizontal.find((clue) => clue.number == clueNumber);
      });

    const verticalClues = currentSelectedClue.relatedClueNumbers.vertical.map(
      (clueNumber) => {
        return clues.vertical.find((clue) => clue.number == clueNumber);
      }
    );

    horizontalClues
      .filter((clue): clue is Clue => !!clue)
      .forEach((clue) => {
        relatedCellKeys.push(
          ...getCellKeysForClueAndOrientation(clue, OrientationType.HORIZONTAL)
        );
      });

    verticalClues
      .filter((clue): clue is Clue => !!clue)
      .forEach((clue) => {
        relatedCellKeys.push(
          ...getCellKeysForClueAndOrientation(clue, OrientationType.VERTICAL)
        );
      });
  }

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
          : relatedCellKeys.includes(cellKey)
          ? CellSelectionState.RELATED_CLUE_SELECTED
          : CellSelectionState.UNSELECTED,
    };

    if (specialCells && specialCells[cellKey]) {
      cellState.specialCellType = specialCells[cellKey];
    }

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

export const getSortedCellKeyArray = (cellKeys: string[]): string[] => {
  return cellKeys.sort((cellKeyA, cellKeyB) => {
    const { x: xA, y: yA } = getCellCoordinatesFromKey(cellKeyA);
    const { x: xB, y: yB } = getCellCoordinatesFromKey(cellKeyB);

    return yA - yB || xA - xB;
  });
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

export const isPuzzleComplete = (
  boardState: BoardState,
  solutions: Solutions
): boolean => {
  return getPercentageComplete(boardState, solutions) == 100;
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

  session.participantData.forEach((userData) => {
    const participantCellCount = Object.values(session.boardState).filter(
      (each) => each.lastEditedBy == userData.userID
    ).length;

    const userID = userData.userID;
    userPercentages[userID] = participantCellCount / totalSelectableCellCount;
  });

  return userPercentages;
};

export const getSessionRevealedPercentage = (session: Session): number => {
  const { puzzle } = session;

  const totalSelectableCellCount = Object.values(puzzle.solutions).filter(
    (each) => !!each
  ).length;

  const revealed = Object.values(session.boardState).filter(
    (each) => each.solutionState == CellSolutionState.REVEALED
  ).length;

  return (100 * revealed) / totalSelectableCellCount;
};

export const getBoardStateDifferences = (
  oldBoardState: BoardState,
  newBoardState: BoardState
): Record<
  string,
  {
    newLetter: string | null;
    editedBy: string | undefined;
  }
> => {
  const differences: Record<
    string,
    {
      newLetter: string | null;
      editedBy: string | undefined;
    }
  > = {};
  Object.entries(oldBoardState).forEach(([cellKey, oldCellState]) => {
    const newCellState = newBoardState[cellKey];

    if (oldCellState.currentLetter != newCellState.currentLetter) {
      differences[cellKey] = {
        newLetter: newCellState.currentLetter,
        editedBy: newCellState.lastEditedBy,
      };
    }
  });

  return differences;
};

export const getMostlyFinishedBoardState = (
  boardState: BoardState,
  puzzle: Puzzle
): BoardState => {
  const approxPercentComplete = 95;
  const newBoardState = { ...boardState };
  Object.keys(boardState).forEach((cellKey) => {
    if (Math.random() < approxPercentComplete / 100) {
      const cellSolution = puzzle.solutions[cellKey];
      newBoardState[cellKey].currentLetter = Array.isArray(cellSolution)
        ? cellSolution[0]
        : (puzzle.solutions[cellKey] as string | null);
    }
  });

  return newBoardState;
};
