import React, { useEffect } from "react";

import { XWordContainer } from "../components/XWordContainer";
import { XWordToolbar } from "../components/XWordToolbar";
import { Spinner } from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import {
  isSessionActiveForUser,
  isUserInSession,
  usePuzzleSession,
} from "../models/PuzzleSession";
import { UserGroup } from "../components/UserGroup";
import { useCurrentUser } from "../models/User";

const Solve: React.FC = () => {
  const { puzzleSessionID } = useParams<{ puzzleSessionID?: string }>();
  const [user] = useCurrentUser();
  const [session] = usePuzzleSession(puzzleSessionID!);

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