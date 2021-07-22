export const __prod__ = process.env.NODE_ENV === "production";
export const COOKIE_NAME = "cookieBook";

export const MIN_USERNAME_LENGTH = 3;
export const MIN_PASSWORD_LENGTH = 6;

export const PUZZLES_COLLECTION = "puzzles";
export const PUZZLE_SESSIONS_COLLECTION = "puzzleSessions";
export const USERS_COLLECTION = "users";

export const NUM_PUZZLES_TO_SHOW_ON_HOME = 10;

export const BOARD_VIEWBOX_SIZE = 100;

export const BASE_URL = __prod__
  ? "https://x-word.vercel.app"
  : "http://localhost:3000";
