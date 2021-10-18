import React, { useContext, useEffect } from "react";

import { XWordContainer } from "../components/XWordContainer";
import { XWordToolbar } from "../components/XWordToolbar";
import { Spinner } from "@chakra-ui/react";
import usePuzzleSession from "../hooks/usePuzzleSession";
import { useParams } from "react-router-dom";
import {
  addSessionToUserActiveSessions,
  isSessionActiveForUser,
  isUserInSession,
  joinPuzzleSessionParticipants,
  removeSessionFromUserActiveSessions,
} from "../models/PuzzleSession";
import { UserGroup } from "../components/UserGroup";
import UserContext from "../contexts/UserContext";

const Solve: React.FC = () => {
  const { puzzleSessionID } = useParams<{ puzzleSessionID?: string }>();
  const [user] = useContext(UserContext);
  const [session] = usePuzzleSession(puzzleSessionID!);

  console.log("Rendering solve for parc", session?.participants);

  useEffect(() => {
    const joinPuzzleSessionIfNeeded = async () => {
      if (user && session) {
        if (!isUserInSession(session, user)) {
          console.log(
            "joining session: ",
            session.puzzleSessionID,
            "for user: ",
            user.userID
          );
          await joinPuzzleSessionParticipants(session.puzzleSessionID, user);
        } else {
          console.log(
            "in session: ",
            session.puzzleSessionID,
            "for user: ",
            user.userID
          );
        }

        if (!isSessionActiveForUser(session, user)) {
          addSessionToUserActiveSessions(session.puzzleSessionID, user);
        } else {
          console.log("session is active");
        }
      }
    };

    const leavePuzzleSessionIfNeeded = () => {
      if (user && session) {
        if (isUserInSession(session, user)) {
          if (isSessionActiveForUser(session, user)) {
            console.log("leaving", user, session);

            removeSessionFromUserActiveSessions(session.puzzleSessionID, user);
          }
        }
      }
    };

    joinPuzzleSessionIfNeeded();

    return leavePuzzleSessionIfNeeded;
  });

  return (
    <XWordContainer>
      <XWordToolbar>
        {user && session?.participants && (
          <UserGroup
            currentUser={user}
            users={session?.participants}
            currentSessionID={session.puzzleSessionID}
          />
        )}
      </XWordToolbar>
      <Spinner size="xl" m="auto" />
    </XWordContainer>
  );
};

export default Solve;
