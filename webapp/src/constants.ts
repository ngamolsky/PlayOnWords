import { OrientationType } from "./reducers/session";

export const APP_NAME = "WeWord";

export const __prod__ = process.env.NODE_ENV === "production";

export const MIN_PASSWORD_LENGTH = 6;

export const PUZZLES_COLLECTION = "puzzles";
export const SESSIONS_COLLECTION = "sessions";
export const USERS_COLLECTION = "users";

export const NUM_PUZZLES_TO_SHOW_ON_HOME = 20;

export const BASE_URL = __prod__
  ? "https://xword.gamolsky.net"
  : "http://localhost:3000";

export const FIRST_CELL_KEY = "0,0";
export const STARTING_ORIENTATION = OrientationType.HORIZONTAL;
