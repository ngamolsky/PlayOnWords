import React, { MutableRefObject, useContext, useEffect, useRef } from "react";

import { XWordContainer } from "../components/XWordContainer";
import { useParams } from "react-router-dom";
import {
  isUserInSession,
  joinPuzzleSessionParticipants,
  usePuzzleSession,
} from "../models/PuzzleSession";
import { UserContext } from "../contexts/UserContext";
import { XWordToolbar } from "../components/XWordToolbar";
import { useUsersByID } from "../models/User";
import { UserGroup } from "../components/UserGroup";
import { XBoard } from "../components/XBoard/XBoard";
import { Box, Flex, Spacer } from "@chakra-ui/react";
import { Keyboard } from "../components/mobile/Keyboard";
import { SimpleKeyboard } from "react-simple-keyboard";
import { ClueSelector } from "../components/mobile/ClueSelector";

const Solve: React.FC = () => {
  const { puzzleSessionID } = useParams<{ puzzleSessionID?: string }>();

  if (!puzzleSessionID) {
    throw new Error("Puzzle Session ID not found");
  }

  const [user] = useContext(UserContext);
  const [session, sessionLoading] = usePuzzleSession(puzzleSessionID);
  const keyboardRef: MutableRefObject<SimpleKeyboard | null> =
    useRef<SimpleKeyboard>(null);
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
      {session && (
        <Flex w="100%" h="100%" direction="column">
          <Box w="100%">
            <XBoard
              boardState={session.boardState}
              solutions={session.puzzle.solutions}
            />
          </Box>
          <Spacer />
          <ClueSelector clue={session.puzzle.clues.horizontal[0]} />
          <Keyboard
            onChange={(input: string): void => {
              console.log(input, keyboardRef.current);
            }}
            keyboardRef={keyboardRef}
          />
        </Flex>
      )}
    </XWordContainer>
  );
};

export default Solve;
