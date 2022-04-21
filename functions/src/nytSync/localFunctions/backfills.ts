import { loadAllPuzzles, updatePuzzle } from "../../models/Puzzle";

export const backfillPuzzleDayOfWeek = async (): Promise<string[]> => {
  const puzzleIDs = await loadAllPuzzles(async (puzzle) => {
    await updatePuzzle(
      puzzle.puzzleID,
      "dayOfWeek",
      puzzle.puzzleTimestamp.toDate().getUTCDay()
    );

    return puzzle.puzzleID;
  });
  console.log(puzzleIDs);

  return puzzleIDs;
};
