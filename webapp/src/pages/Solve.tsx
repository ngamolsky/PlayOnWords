import React, { useContext, useEffect } from "react";

import { XWordContainer } from "../components/XWordContainer";
import { Spinner } from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import {
  isSessionActiveForUser,
  isUserInSession,
  usePuzzleSession,
} from "../models/PuzzleSession";
import { UserContext } from "../contexts/UserContext";

const Solve: React.FC = () => {
  const { puzzleSessionID } = useParams<{ puzzleSessionID?: string }>();
  const [user] = useContext(UserContext);
  const [session] = usePuzzleSession(puzzleSessionID);

  useEffect(() => {
    const joinPuzzleSessionIfNeeded = async () => {
      if (user && session) {
        // if (!isUserInSession(session, user)) {
        //   await joinPuzzleSessionParticipants(
        //     session.puzzleSessionID,
        //     user.userID
        //   );
        // }
        // if (!isSessionActiveForUser(session, user)) {
        //   addSessionToUserActiveSessions(session.puzzleSessionID, user);
        // }
      }
    };

    const leavePuzzleSessionIfNeeded = () => {
      if (user && session) {
        if (isUserInSession(session, user)) {
          if (isSessionActiveForUser(session, user)) {
            // removeSessionFromUserActiveSessions(session.puzzleSessionID, user);
          }
        }
      }
    };

    joinPuzzleSessionIfNeeded();

    return leavePuzzleSessionIfNeeded;
  }, [session, user]);

  return (
    <XWordContainer>
      {/* <XWordToolbar>
        {user && session?.participants && (
          <UserGroup
            currentUser={user}
            users={session?.participants}
            currentSessionID={session.puzzleSessionID}
          />
        )}
      </XWordToolbar> */}
      <Spinner size="xl" m="auto" />
    </XWordContainer>
  );
};

export default Solve;
