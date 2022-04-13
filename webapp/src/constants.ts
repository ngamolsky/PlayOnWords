import { OrientationType } from "./reducers/session";

export const APP_NAME = "Play On Words";

export const __prod__ = process.env.NODE_ENV === "production";

export const MIN_PASSWORD_LENGTH = 6;

export const PUZZLES_COLLECTION = "puzzles";
export const SESSIONS_COLLECTION = "sessions";
export const USERS_COLLECTION = "users";

export const NUM_PUZZLES_TO_SHOW_ON_HOME = 10;

export const BASE_URL = __prod__
  ? "https://xword.gamolsky.net"
  : "http://localhost:3000";

export const FIRST_CELL_KEY = "0,0";
export const STARTING_ORIENTATION = OrientationType.HORIZONTAL;

export const FIRST_PUZZLE_DATE = new Date(Date.parse("2022-01-01"));