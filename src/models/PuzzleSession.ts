import firebase from "firebase/app";
import { User } from "./User";
import { Puzzle } from "./Puzzle";
import { PUZZLE_SESSIONS_COLLECTION, USERS_COLLECTION } from "../constants";
import { getBoardStateFromSolutions } from "../utils/puzzleSessionUtils";
import { v4 } from "uuid";

export type BoardState = {
  [key: string]: CellState;
};

export type CellState = {
  solutionState: CellSolutionState;
  currentLetter: string | null;
};

export enum CellSolutionState {
  REVEALED = "revealed",
  WRONG = "wrong",
  NONE = "none",
}

export type PuzzleSession = {
  puzzleSessionID: string;
  puzzle: Puzzle;
  participants: User[];
  owner: User;
  startTime: Date;
  boardState: BoardState;
};

export const startPuzzleSession = async (
  puzzle: Puzzle,
  user: User
): Promise<PuzzleSession> => {
  const puzzleSessionID = `puzzleSession.${v4()}`;

  const updatedUser: User = {
    ...user,
    activeSessionIDs: user.activeSessionIDs.concat(puzzleSessionID),
  };

  await firebase
    .firestore()
    .collection(USERS_COLLECTION)
    .doc(updatedUser.userID)
    .set(updatedUser);

  const session = {
    puzzleSessionID,
    puzzle,
    participants: [updatedUser],
    owner: updatedUser,
    startTime: new Date(),
    boardState: getBoardStateFromSolutions(puzzle.solutions),
  };

  await firebase
    .firestore()
    .collection(PUZZLE_SESSIONS_COLLECTION)
    .doc(puzzleSessionID)
    .set(session);

  return session;
};

export const joinPuzzleSessionParticipants = async (
  puzzleSessionID: string,
  user: User
) => {
  const updatedUser: User = {
    ...user,
    activeSessionIDs: user.activeSessionIDs.concat(puzzleSessionID),
  };
  return firebase
    .firestore()
    .collection(PUZZLE_SESSIONS_COLLECTION)
    .doc(puzzleSessionID)
    .update({
      participants: firebase.firestore.FieldValue.arrayUnion(updatedUser),
    });
};

export const addSessionToUserActiveSessions = async (
  puzzleSessionID: string,
  user: User
) => {
  const updatedUser: User = {
    ...user,
    activeSessionIDs: user.activeSessionIDs.concat(puzzleSessionID),
  };

  return await firebase
    .firestore()
    .collection(USERS_COLLECTION)
    .doc(updatedUser.userID)
    .set(updatedUser);
};

export const removeSessionFromUserActiveSessions = async (
  puzzleSessionID: string,
  user: User
) => {
  const updatedUser: User = {
    ...user,
    activeSessionIDs: user.activeSessionIDs.filter(
      (sessionID) => sessionID !== puzzleSessionID
    ),
  };

  return await firebase
    .firestore()
    .collection(USERS_COLLECTION)
    .doc(updatedUser.userID)
    .set(updatedUser);
};

export const isUserInSession = (
  session: PuzzleSession,
  user: User
): boolean => {
  const matchingUser = session.participants.find(
    (currentUser) => currentUser.userID === user.userID
  );
  return !!matchingUser;
};

export const isSessionActiveForUser = (
  session: PuzzleSession,
  user: User
): boolean => {
  const matchingSession = user.activeSessionIDs.find(
    (sessionID) => sessionID === session.puzzleSessionID
  );

  return !!matchingSession;
};
