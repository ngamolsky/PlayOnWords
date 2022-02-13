import { HttpFunction } from "@google-cloud/functions-framework/build/src/functions";
import axios from "axios";
import { addPuzzle, getPuzzleByNYTPuzzleID, Puzzle } from "./models/Puzzle";
import { convertPuzzleDataToPuzzle } from "./puzzleParser";

const LATEST_PUZZLE_URL =
  "https://nyt-games-prd.appspot.com/svc/crosswords/v3/36569100/puzzles.json?publish_type=daily&sort_order=desc&sort_by=print_date&limit=2";
const LATEST_PUZZLE_DATA_BASE_URL =
  "https://www.nytimes.com/svc/crosswords/v2/puzzle/";

export const XWordScraper: HttpFunction = async (_, response) => {
  try {
    console.log("Starting XWordeScraper function");

    console.log("Loading latest puzzle metadata");
    const latestPuzzleMetadata = (await axios.get(LATEST_PUZZLE_URL)).data
      .results[0];

    console.log(latestPuzzleMetadata);
    const latestPuzzleID = latestPuzzleMetadata.puzzle_id;
    const latestPuzzleTitle = latestPuzzleMetadata.title;
    const latestPuzzleDate = new Date(
      Date.parse(`${latestPuzzleMetadata.print_date}`)
    );

    console.log("Latest Puzzle Metadata: ");
    console.log("NYT Puzzle ID: ", latestPuzzleID);
    console.log("Date: ", latestPuzzleDate);
    if (latestPuzzleTitle) {
      console.log("Title: ", latestPuzzleTitle);
    }

    console.log(`Checking for existing puzzle for nytID ${latestPuzzleID}`);
    const existingPuzzle = await getPuzzleByNYTPuzzleID(latestPuzzleID);
    if (!existingPuzzle) {
      const latestPuzzleData = (
        await axios.get(
          `${LATEST_PUZZLE_DATA_BASE_URL}/${latestPuzzleID}.json`,
          {
            headers: {
              Cookie: process.env.NYT_COOKIE,
            },
          }
        )
      ).data.results[0].puzzle_data;

      console.log(`Loaded latest puzzle data for puzzle ID: ${latestPuzzleID}`);

      const puzzle: Puzzle = await convertPuzzleDataToPuzzle({
        ...latestPuzzleData,
        title: latestPuzzleTitle,
        date: latestPuzzleDate,
        nytID: latestPuzzleID,
      });

      await addPuzzle(puzzle);
      response.send(puzzle.puzzleID);
    } else {
      throw new Error(
        `Found existing puzzle with id ${existingPuzzle.puzzleID}`
      );
    }
  } catch (err) {
    console.error(err);
    response.send(`${err}`);
  }
};
