export const __prod__ = process.env.NODE_ENV === "production";
export const COOKIE_NAME = "cookieBook";

export const MIN_USERNAME_LENGTH = 3;
export const MIN_PASSWORD_LENGTH = 3;

export const PUZZLES_COLLECTION = "puzzles";
export const PUZZLE_SESSIONS_COLLECTION = "puzzleSessions";
export const USERS_COLLECTION = "users";

export const NUM_SALT_ROUNDS = 10;

export const BASE_URL = __prod__
  ? "https://x-word.vercel.app"
  : "http://localhost:3000";

export const XWORD_THUMBNAIL_IMAGE =
  "https://storage.cloud.google.com/xword-b9f56.appspot.com/public/XWordSquare.jpg";
