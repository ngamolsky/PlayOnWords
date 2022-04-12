import { copyNYTPuzzle, getRecentNYTPuzzles } from "..";
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

export const backfillPuzzlesUsingNewAPI = async (): Promise<string[]> => {
  const nytPuzzles = await getRecentNYTPuzzles(365);
  const puzzledIDs: string[] = [];
  nytPuzzles.forEach(async (nytPuzzle) => {
    const puzzleID = await copyNYTPuzzle(nytPuzzle.puzzle_id);
    puzzledIDs.push(puzzleID);
  });
  return puzzledIDs;
};
