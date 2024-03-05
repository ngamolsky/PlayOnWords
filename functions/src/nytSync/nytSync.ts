import axios from "axios";
import { runWith } from "firebase-functions";
import { addPuzzle, getPuzzleByNYTPuzzleID, Puzzle } from "../models/Puzzle";
import {
  LATEST_PUZZLE_DATA_BASE_URL,
  LATEST_PUZZLE_URL,
  PUZZLE_URL,
} from "./constants";
import { convertPuzzleDataToPuzzle } from "./puzzleParser";
import { sendEmail } from "../email";

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const syncDailyNYTPuzzles = runWith({
  secrets: ["NYT_COOKIE", "SENDGRID_API_KEY"],
})
  .pubsub.schedule("25 22 * * *")
  .timeZone("America/New_York")
  .onRun(async () => {
    const result = {
      puzzleDate: "",
      daily: {
        puzzleID: "",
        nytID: "",
        error: "",
      },
      mini: {
        puzzleID: "",
        nytID: "",
        error: "",
      },
    };

    const developerEmail = process.env.DEVELOPER_EMAIL;

    if (!developerEmail) {
      throw new Error("Developer email not set");
    }

    let hasError = false;
    let puzzleDate;

    // Sync daily puzzle
    try {
      const latestPuzzleMetadata = (await getRecentNYTPuzzles("daily", 1))[0];

      puzzleDate = new Date(Date.parse(latestPuzzleMetadata.print_date));
      const nytPuzzleID = latestPuzzleMetadata.puzzle_id.toString();
      const puzzleID = await copyNYTPuzzle(nytPuzzleID, "daily");
      result.daily.puzzleID = puzzleID;
      result.daily.nytID = nytPuzzleID;
    } catch (err) {
      if (err instanceof Error) {
        result.daily.error = err.toString();
      } else {
        result.daily.error = JSON.stringify(err);
      }
      hasError = true;
    }

    // Sync mini puzzle
    try {
      const latestMiniMetadata = (await getRecentNYTPuzzles("mini", 1))[0];

      if (!puzzleDate) {
        puzzleDate = new Date(Date.parse(latestMiniMetadata.print_date));
      }
      const nytMiniID = latestMiniMetadata.puzzle_id.toString();
      const miniPuzzleID = await copyNYTPuzzle(nytMiniID, "mini");
      result.mini.puzzleID = miniPuzzleID;
      result.mini.nytID = nytMiniID;
    } catch (err) {
      if (err instanceof Error) {
        result.mini.error = err.toString();
      } else {
        result.mini.error = JSON.stringify(err);
      }
      hasError = true;
    }
    let dateString;
    if (puzzleDate) {
      const year = puzzleDate.getFullYear();
      const month = String(puzzleDate.getMonth() + 1).padStart(2, "0"); // Month is zero-based
      const day = String(puzzleDate.getDate()).padStart(2, "0");
      const dayOfWeek = puzzleDate.getDay();

      dateString = `${DAYS_OF_WEEK[dayOfWeek]}: ${year}-${month}-${day}`;
      result.puzzleDate = dateString;
    } else {
      hasError = true;
      result.puzzleDate = "Unknown";
      dateString = "Unknown";
    }

    // Email results
    const subject = hasError
      ? `🤖 [PlayOnWords]: ⚠️ ${dateString}`
      : `🤖 [PlayOnWords]: ✅ ${dateString}`;

    let html = `
        <h1>${subject}</h1>
        <h2>Daily</h2>
    `;

    if (result.daily.error) {
      html += `<p>${result.daily.error}</p>`;
    } else {
      html += `<p>Puzzle ID: ${result.daily.puzzleID}</p>`;
      html += `<p>NYT ID: ${result.daily.nytID}</p>`;
    }

    html += `
        <h2>Mini</h2>
    `;

    if (result.mini.error) {
      html += `<p>${result.mini.error}</p>`;
    } else {
      html += `<p>Puzzle ID: ${result.mini.puzzleID}</p>`;
      html += `<p>NYT ID: ${result.mini.nytID}</p>`;
    }

    console.log(JSON.stringify(result, null, 2));
    await sendEmail(developerEmail, subject, html);
    return result;
  });

export const syncNYTPuzzleByDate = runWith({
  secrets: ["NYT_COOKIE", "SENDGRID_API_KEY"],
}).https.onRequest(async (req, res): Promise<void> => {
  const result = {
    puzzleDate: "",
    puzzleID: "",
    nytID: "",
    error: "",
    type: "",
  };

  try {
    const dateString = req.query.date as string | undefined;
    const type = (req.query.type || "daily") as "mini" | "daily";

    if (!dateString) {
      res.status(400).send("Date is required");
      return;
    }

    const date = new Date(dateString);
    const nytPuzzle = await getNYTPuzzleByDate(date, type as "mini" | "daily");

    if (!nytPuzzle) {
      res.status(404).send("Puzzle not found");
      return;
    }

    const puzzleID = await copyNYTPuzzle(
      nytPuzzle.puzzle_id.toString(),
      type as "mini" | "daily"
    );

    result.puzzleDate = dateString;
    result.puzzleID = puzzleID;
    result.nytID = nytPuzzle.puzzle_id.toString();
    result.type = type;
  } catch (err) {
    if (err instanceof Error) {
      result.error = err.toString();
    } else {
      result.error = JSON.stringify(err);
    }
  }

  const status = result.error ? 500 : 200;
  res.status(status).send(result);
});

const copyNYTPuzzle = async (
  nytPuzzleID: string,
  type: "mini" | "daily"
): Promise<string> => {
  const existingPuzzle = await getPuzzleByNYTPuzzleID(nytPuzzleID);

  if (existingPuzzle) {
    throw new Error(`Found existing puzzle with id ${existingPuzzle.puzzleID}`);
  }

  const puzzle = await loadPuzzleFromNYTPuzzle(nytPuzzleID, type);

  await addPuzzle(puzzle);
  return puzzle.puzzleID;
};

const getNYTPuzzleByDate = async (
  date: Date,
  type: "mini" | "daily"
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> => {
  // Get date in format YYYY-MM-DD
  const dateString = date.toISOString().split("T")[0];

  const url = `${PUZZLE_URL}?publish_type=${type}&date_end=${dateString}&limit=1`;

  const puzzleData = await axios.get(url);
  const results = puzzleData.data.results;

  if (results.length === 0) {
    return undefined;
  }
  return puzzleData.data.results[0];
};

const getRecentNYTPuzzles = async (
  type: "mini" | "daily",
  limit?: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any[]> => {
  let url = `${LATEST_PUZZLE_URL}&publish_type=${type}`;

  if (limit) {
    url += `&limit=${limit}`;
  }

  const latestPuzzleMetadata = await axios.get(url);
  return latestPuzzleMetadata.data.results;
};

const loadPuzzleFromNYTPuzzle = async (
  latestPuzzleID: string,
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
