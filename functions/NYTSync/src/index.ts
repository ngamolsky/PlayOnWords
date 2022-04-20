import { HttpFunction } from "@google-cloud/functions-framework";
import axios from "axios";
import {
  addPuzzle,
  deletePuzzle,
  getPuzzleByNYTPuzzleID,
  Puzzle,
} from "./models/Puzzle";
import { convertPuzzleDataToPuzzle } from "./puzzleParser";

const LATEST_PUZZLE_URL =
  "https://nyt-games-prd.appspot.com/svc/crosswords/v3/36569100/puzzles.json?sort_order=desc&sort_by=print_date";

const LATEST_PUZZLE_DATA_BASE_URL =
  "https://www.nytimes.com/svc/crosswords/v6/puzzle/";

export const NYTSync: HttpFunction = async (_, response) => {
  console.log("Starting NYTSync function");
  let nytPuzzleID: string;
  if (process.env.OVERWRITE_PUZZLE_ID) {
    nytPuzzleID = process.env.OVERWRITE_PUZZLE_ID;
    console.log(
      "Overwrite latest puzzle ID: ",
      process.env.OVERWRITE_PUZZLE_ID
    );
  } else {
    console.log("Loading latest daily puzzle metadata");
    const latestPuzzleMetadata = (await getRecentNYTPuzzles(2, "daily"))[0];

    console.log(latestPuzzleMetadata);
    nytPuzzleID = latestPuzzleMetadata.puzzle_id.toString();
  }

  const puzzleID = await copyNYTPuzzle(nytPuzzleID, "daily");

  let nytMiniPuzzleID: string;
  if (process.env.OVERWRITE_MINI_PUZZLE_ID) {
    nytMiniPuzzleID = process.env.OVERWRITE_MINI_PUZZLE_ID;
    console.log(
      "Overwrite latest puzzle ID: ",
      process.env.OVERWRITE_MINI_PUZZLE_ID
    );
  } else {
    console.log("Loading latest mini puzzle metadata");
    const latestPuzzleMetadata = (await getRecentNYTPuzzles(2, "mini"))[0];

    console.log(latestPuzzleMetadata);
    nytMiniPuzzleID = latestPuzzleMetadata.puzzle_id.toString();
  }

  const miniPuzzleID = await copyNYTPuzzle(nytMiniPuzzleID, "mini");

  response.send({
    daily: puzzleID,
    mini: miniPuzzleID,
  });
};

export const copyNYTPuzzle = async (
  nytPuzzleID: string,
  type: "mini" | "daily"
): Promise<string> => {
  try {
    const existingPuzzle = await getPuzzleByNYTPuzzleID(nytPuzzleID);

    const replacePuzzleIfExists =
      process.env.REPLACE_EXISTING_PUZZLE === "true";

    console.log("Replace existing puzzle: ", replacePuzzleIfExists);

    if (replacePuzzleIfExists && existingPuzzle) {
      console.log("Deleting existing puzzle", existingPuzzle.puzzleID);
      await deletePuzzle(existingPuzzle.puzzleID);
    } else if (existingPuzzle) {
      throw new Error(
        `Found existing puzzle with id ${existingPuzzle.puzzleID}`
      );
    }
    const puzzle = await loadPuzzleFromNYTPuzzle(nytPuzzleID, type);

    await addPuzzle(puzzle);

    return puzzle.puzzleID;
  } catch (err) {
    console.error(err);
    return err as string;
  }
};

export const getRecentNYTPuzzles = async (
  limit: number,
  type: "mini" | "daily"
): Promise<any[]> => {
  const latestPuzzleMetadata = await axios.get(
    `${LATEST_PUZZLE_URL}&limit=${limit}&publish_type=${type}`
  );
  return latestPuzzleMetadata.data.results;
};

export const loadPuzzleFromNYTPuzzle = async (
  latestPuzzleID: any,
  type: "mini" | "daily"
) => {
  const puzzleResults = (
    await axios.get(`${LATEST_PUZZLE_DATA_BASE_URL}/${latestPuzzleID}.json`, {
      headers: {
        Cookie: process.env.NYT_COOKIE,
      },
    })
  ).data;

  const puzzleBody = puzzleResults.body[0];

  const latestPuzzleTitle = puzzleResults.title;
  const latestPuzzleDate = new Date(Date.parse(puzzleResults.publicationDate));
  const latestPuzzleWidth = puzzleBody.dimensions.width;
  const latestPuzzleHeight = puzzleBody.dimensions.height;

  console.log("NYT Puzzle ID: ", latestPuzzleID);
  console.log("Date: ", latestPuzzleDate);
  if (latestPuzzleTitle) {
    console.log("Title: ", latestPuzzleTitle);
  }
  console.log("Height: ", latestPuzzleHeight);
  console.log("Width: ", latestPuzzleWidth);

  console.log(`Loaded latest puzzle data for puzzle ID: ${latestPuzzleID}`);

  const puzzle: Puzzle = await convertPuzzleDataToPuzzle({
    ...puzzleBody,
    title: latestPuzzleTitle,
    date: latestPuzzleDate,
    nytID: latestPuzzleID,
    width: latestPuzzleWidth,
    height: latestPuzzleHeight,
    type: type,
  });
  return puzzle;
};
