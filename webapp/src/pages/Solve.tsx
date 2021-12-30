import React, { useContext, useEffect } from "react";

import { XWordContainer } from "../components/XWordContainer";
import { useParams } from "react-router-dom";
import {
  addSessionToUserActiveSessions,
  isSessionActiveForUser,
  isUserInSession,
  joinPuzzleSessionParticipants,
  removeSessionFromUserActiveSessions,
  usePuzzleSession,
} from "../models/PuzzleSession";
import { UserContext } from "../contexts/UserContext";
import { XWordToolbar } from "../components/XWordToolbar";
import { useUsersByID } from "../models/User";
import { UserGroup } from "../components/UserGroup";

const Solve: React.FC = () => {
  const { puzzleSessionID } = useParams<{ puzzleSessionID?: string }>();

  if (!puzzleSessionID) {
    throw new Error("Puzzle Session ID not found");
  }

  const [user] = useContext(UserContext);
  const [session, sessionLoading] = usePuzzleSession(puzzleSessionID);
  const sessionUsers = useUsersByID(session?.participantIDs);

  // Join puzzle session if the user isn't already in it when joining
  useEffect(() => {
    const joinPuzzleSessionIfNeeded = async () => {
      if (user && session) {
        if (!isUserInSession(session, user.userID)) {
          await joinPuzzleSessionParticipants(
            session.puzzleSessionID,
            user.userID
          );
        }
      }
    };

    joinPuzzleSessionIfNeeded();
  }, [user, session]);

  // Add puzzle session to user active sessions and remove it when leaving the page
  useEffect(() => {
    if (
      !sessionLoading &&
      user &&
      session &&
      !isSessionActiveForUser(session, user)
    ) {
      addSessionToUserActiveSessions(session.puzzleSessionID, user.userID);
    }

    return () => {
      if (
        !sessionLoading &&
        user &&
        session &&
        isSessionActiveForUser(session, user)
      ) {
        removeSessionFromUserActiveSessions(
          session.puzzleSessionID,
          user.userID
        );
      }
    };
  }, [sessionLoading]);

  window.onunload = async () => {
    if (
      !sessionLoading &&
      user &&
      session &&
      isSessionActiveForUser(session, user)
    ) {
      await removeSessionFromUserActiveSessions(
        session.puzzleSessionID,
        user.userID
      );
    }
  };

  return (
    <XWordContainer isLoading={sessionLoading}>
      <XWordToolbar>
        {user && sessionUsers && (
          <UserGroup
            currentUser={user}
            users={sessionUsers}
            currentSessionID={session?.puzzleSessionID}
          />
        )}
      </XWordToolbar>
    </XWordContainer>
  );
};

export default Solve;
