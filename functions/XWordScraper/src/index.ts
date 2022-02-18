import { HttpFunction } from "@google-cloud/functions-framework/build/src/functions";
import axios from "axios";
import {
  addPuzzle,
  deletePuzzle,
  getPuzzleByNYTPuzzleID,
  Puzzle,
} from "./models/Puzzle";
import { convertPuzzleDataToPuzzle } from "./puzzleParser";

const LATEST_PUZZLE_URL =
  "https://nyt-games-prd.appspot.com/svc/crosswords/v3/36569100/puzzles.json?publish_type=daily&sort_order=desc&sort_by=print_date&limit=2";
const LATEST_PUZZLE_DATA_BASE_URL =
  "https://www.nytimes.com/svc/crosswords/v2/puzzle/";

export const XWordScraper: HttpFunction = async (_, response) => {
  try {
    console.log("Starting XWordScraper function");

    let puzzleID: number;
    if (process.env.OVERWRITE_PUZZLE_ID) {
      puzzleID = parseInt(process.env.OVERWRITE_PUZZLE_ID);
    } else {
      console.log("Loading latest puzzle metadata");
      const latestPuzzleMetadata = (await axios.get(LATEST_PUZZLE_URL)).data
        .results[0];

      console.log(latestPuzzleMetadata);
      puzzleID = latestPuzzleMetadata.puzzle_id;
    }

    const existingPuzzle = await getPuzzleByNYTPuzzleID(puzzleID);

    const replacePuzzleIfExists =
      process.env.REPLACE_EXISTING_PUZZLE === "true";

    console.log("Replace existing puzzle: ", replacePuzzleIfExists);
    console.log(
      "Overwrite latest puzzle ID: ",
      process.env.OVERWRITE_PUZZLE_ID
    );

    if (replacePuzzleIfExists && existingPuzzle) {
      console.log("Deleting existing puzzle", existingPuzzle.puzzleID);
      await deletePuzzle(existingPuzzle.puzzleID);
    } else if (existingPuzzle) {
      throw new Error(
        `Found existing puzzle with id ${existingPuzzle.puzzleID}`
      );
    }

    const puzzle: Puzzle = await loadPuzzleFromNYTPuzzle(puzzleID);
    await addPuzzle(puzzle);

    response.send(puzzle.puzzleID);
  } catch (err) {
    console.error(err);
    response.send(`${err}`);
  }
};

export async function loadPuzzleFromNYTPuzzle(latestPuzzleID: any) {
  const puzzleResults = (
    await axios.get(`${LATEST_PUZZLE_DATA_BASE_URL}/${latestPuzzleID}.json`, {
      headers: {
        Cookie: process.env.NYT_COOKIE,
      },
    })
  ).data.results[0];

  const puzzleMetadata = puzzleResults.puzzle_meta;
  const puzzleData = puzzleResults.puzzle_data;
  const latestPuzzleTitle = puzzleMetadata.title;
  const latestPuzzleDate = new Date(Date.parse(puzzleMetadata.printDate));
  const latestPuzzleWidth = puzzleMetadata.width;
  const latestPuzzleHeight = puzzleMetadata.height;

  console.log("Latest Puzzle Metadata: ", puzzleMetadata);
  console.log("NYT Puzzle ID: ", latestPuzzleID);
  console.log("Date: ", latestPuzzleDate);
  if (latestPuzzleTitle) {
    console.log("Title: ", latestPuzzleTitle);
  }
  console.log("Height: ", latestPuzzleHeight);
  console.log("Width: ", latestPuzzleWidth);

  console.log(`Loaded latest puzzle data for puzzle ID: ${latestPuzzleID}`);

  const puzzle: Puzzle = await convertPuzzleDataToPuzzle({
    ...puzzleData,
    title: latestPuzzleTitle,
    date: latestPuzzleDate,
    nytID: latestPuzzleID,
    width: latestPuzzleWidth,
    height: latestPuzzleHeight,
  });
  return puzzle;
}