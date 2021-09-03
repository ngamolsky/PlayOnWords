import React, { useEffect } from "react";

import { XWordContainer } from "../components/XWordContainer";
import { XWordToolbar } from "../components/XWordToolbar";
import { Spinner } from "@chakra-ui/react";
import usePuzzleSession from "../hooks/usePuzzleSession";
import { useParams } from "react-router-dom";
import useUser from "../hooks/useUser";
import {
  isUserInSession,
  joinPuzzleSession,
  leavePuzzleSession,
} from "../models/PuzzleSession";
import { UserGroup } from "../components/UserGroup";

const Solve: React.FC = () => {
  const { puzzleSessionID } = useParams<{ puzzleSessionID?: string }>();
  const [user] = useUser();
  const [session] = usePuzzleSession(puzzleSessionID!);

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
          await joinPuzzleSession(session.puzzleSessionID, user);
        } else {
          console.log("in session", user, session);
        }
      }
    };

    const leavePuzzleSessionIfNeeded = () => {
      if (user && session) {
        console.log("leaving", user, session);

        leavePuzzleSession(session.puzzleSessionID, user);
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
