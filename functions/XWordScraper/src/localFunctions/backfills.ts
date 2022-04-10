import { loadAllPuzzles, Puzzle, updatePuzzle } from "../models/Puzzle";

export const backfillPuzzleDayOfWeek = async (): Promise<Puzzle[]> => {
  const puzzles = await loadAllPuzzles(async (puzzle) => {
    await updatePuzzle(
      puzzle.puzzleID,
      "dayOfWeek",
      puzzle.puzzleTimestamp.toDate().getUTCDay()
    );
  });
  return puzzles;
};
