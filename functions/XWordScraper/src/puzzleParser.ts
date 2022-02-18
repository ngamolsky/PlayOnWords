import { v4 } from "uuid";
import { Timestamp } from "firebase-admin/firestore";
import { ClueList, Puzzle, Solutions } from "./models/Puzzle";

type NYTClue = {
  clueNum: number;
  clueStart: number;
  clueEnd: number;
  value: string;
};

type NYTPuzzleData = {
  clues: {
    A: NYTClue[];
    D: NYTClue[];
  };
  answers: (string | null)[];
  title: string;
  date: Date;
  nytID: string;
  height: number;
  width: number;
};

export const convertPuzzleDataToPuzzle = async ({
  clues: nytClues,
  answers,
  title,
  date,
  nytID,
  height,
  width,
}: NYTPuzzleData): Promise<Puzzle> => {
  console.log("NYT Puzzle answers: ", answers);
  console.log("NYT Puzzle clues: ", nytClues);

  const solutions: Solutions = answers.reduce<Solutions>((result, each, i) => {
    const x = i % width;
    const y = Math.floor(i / width);

    const cellKey = [x, y].toString();
    result[cellKey] = each;

    return result;
  }, {});

  const clues: ClueList = {
    horizontal: nytClues.A.map((clue) => ({
      number: clue.clueNum,
      hint: clue.value,
      x: clue.clueStart % width,
      y: Math.floor(clue.clueStart / width),
      length: clue.clueEnd - clue.clueStart + 1,
    })),
    vertical: nytClues.D.map((clue) => ({
      number: clue.clueNum,
      hint: clue.value,
      x: clue.clueStart % width,
      y: Math.floor(clue.clueStart / width),
      length:
        Math.floor(clue.clueEnd / width) -
        Math.floor(clue.clueStart / width) +
        1,
    })),
  };

  console.log(
    `Puzzle has ${clues.horizontal.length + clues.vertical.length} clues`
  );

  const puzzle: Puzzle = {
    puzzleID: `puzzle.${v4()}`,
    puzzleTimestamp: Timestamp.fromDate(date),
    clues,
    solutions,
    nytID,
    collection: "nyt",
  };

  if (title) {
    puzzle.title = title;
  }

  return puzzle;
};
