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
};

export const convertPuzzleDataToPuzzle = async ({
  clues: nytClues,
  answers,
  title,
  date,
  nytID,
}: NYTPuzzleData): Promise<Puzzle> => {
  const size = Math.sqrt(answers.length);
  console.log("Puzzle size is:", size);
  const solutions: Solutions = answers.reduce<Solutions>((result, each, i) => {
    const x = i % size;
    const y = Math.floor(i / size);
    const cellKey = [x, y].toString();
    result[cellKey] = each;

    return result;
  }, {});

  const clues: ClueList = {
    horizontal: nytClues.A.map((clue) => ({
      number: clue.clueNum,
      hint: clue.value,
      x: clue.clueStart % size,
      y: Math.floor(clue.clueStart / size),
      length: clue.clueEnd - clue.clueStart + 1,
    })),
    vertical: nytClues.D.map((clue) => ({
      number: clue.clueNum,
      hint: clue.value,
      x: clue.clueStart % size,
      y: Math.floor(clue.clueStart / size),
      length:
        Math.floor(clue.clueEnd / size) - Math.floor(clue.clueStart / size) + 1,
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
