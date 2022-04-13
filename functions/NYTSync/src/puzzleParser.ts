import { v4 } from "uuid";
import { Timestamp } from "firebase-admin/firestore";
import {
  Clue,
  ClueList,
  Puzzle,
  Solutions,
  SpecialCells,
  SpecialCellType,
} from "./models/Puzzle";

type NYTClue = {
  cells: number[];
  label: string;
  direction: "Across" | "Down";
  text: {
    plain: string;
  }[];
  relatives: number[];
};

type NYTPuzzleData = {
  clues: NYTClue[];
  cells: {
    answer: string;
    type: number;
    moreAnswers?: {
      valid: string[];
    };
  }[];
  title: string;
  date: Date;
  nytID: string;
  height: number;
  width: number;
};

export const convertPuzzleDataToPuzzle = async ({
  cells,
  clues: nytClues,
  title,
  date,
  nytID,
  width,
}: NYTPuzzleData): Promise<Puzzle> => {
  const specialCells: SpecialCells = {};
  const solutions: Solutions = cells.reduce<Solutions>((result, each, i) => {
    const x = i % width;
    const y = Math.floor(i / width);

    const cellKey = [x, y].toString();

    result[cellKey] =
      each.moreAnswers && each.moreAnswers.valid.length > 0
        ? [each.answer].concat(each.moreAnswers.valid)
        : each.answer
        ? each.answer
        : null;

    switch (each.type) {
      case 3:
        specialCells[cellKey] = SpecialCellType.SHADED;
        break;
      case 2:
        specialCells[cellKey] = SpecialCellType.CIRCLE;
        break;
      case 1:
      default:
        break;
    }

    return result;
  }, {});

  const clues: ClueList = {
    horizontal: nytClues
      .filter((nytClue) => nytClue.direction == "Across")
      .map((nytClue) => {
        const clueStart = Math.min(...nytClue.cells);
        const relatedClueNumbers: {
          horizontal: number[];
          vertical: number[];
        } = {
          horizontal: [],
          vertical: [],
        };
        if (nytClue.relatives) {
          nytClue.relatives.forEach((clueNumber) => {
            const nytClue = nytClues[clueNumber];
            if (nytClue.direction == "Across") {
              relatedClueNumbers.horizontal.push(parseInt(nytClue.label));
            } else {
              relatedClueNumbers.vertical.push(parseInt(nytClue.label));
            }
          });
        }

        const clue: Clue = {
          number: parseInt(nytClue.label),
          hint: nytClue.text[0].plain,
          x: clueStart % width,
          y: Math.floor(clueStart / width),
          length: nytClue.cells.length,
        };

        if (nytClue.relatives) {
          clue.relatedClueNumbers = relatedClueNumbers;
        }
        return clue;
      }),
    vertical: nytClues
      .filter((nytClue) => nytClue.direction == "Down")
      .map((nytClue) => {
        const clueStart = Math.min(...nytClue.cells);
        const relatedClueNumbers: {
          horizontal: number[];
          vertical: number[];
        } = {
          horizontal: [],
          vertical: [],
        };
        if (nytClue.relatives) {
          nytClue.relatives.forEach((clueNumber) => {
            const nytClue = nytClues[clueNumber];
            if (nytClue.direction == "Across") {
              relatedClueNumbers.horizontal.push(parseInt(nytClue.label));
            } else {
              relatedClueNumbers.vertical.push(parseInt(nytClue.label));
            }
          });
        }
        const clue: Clue = {
          number: parseInt(nytClue.label),
          hint: nytClue.text[0].plain,
          x: clueStart % width,
          y: Math.floor(clueStart / width),
          length: nytClue.cells.length,
        };

        if (nytClue.relatives) {
          clue.relatedClueNumbers = relatedClueNumbers;
        }
        return clue;
      }),
  };

  console.log(
    `Puzzle has ${clues.horizontal.length + clues.vertical.length} clues`
  );

  const hasRebus =
    Object.values(solutions).filter(
      (solution) => solution && solution.length > 1
    ).length > 0;

  if (hasRebus) {
    console.log("This puzzle has a rebus");
  }

  console.log(
    Object.values(solutions).filter((solution) => Array.isArray(solution))
  );

  const puzzle: Puzzle = {
    puzzleID: `puzzle.${v4()}`,
    puzzleTimestamp: Timestamp.fromDate(date),
    dayOfWeek: date.getUTCDay(),
    clues,
    solutions,
    nytID,
    collection: "nyt",
    isRebusPuzzle: hasRebus,
  };

  if (Object.keys(specialCells).length > 0) {
    puzzle.specialCells = specialCells;
    console.log("Puzzle has special cells");
  }

  if (title) {
    puzzle.title = title;
  }

  return puzzle;
};
