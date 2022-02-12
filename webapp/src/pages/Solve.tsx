import React, {
  MutableRefObject,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useParams } from "react-router-dom";
import { SimpleKeyboard } from "react-simple-keyboard";

import { XWordContainer } from "../components/XWordContainer";
import {
  isUserInSession,
  joinPuzzleSessionParticipants,
  OrientationType,
  usePuzzleSession,
} from "../models/PuzzleSession";
import { UserContext } from "../contexts/UserContext";
import { useUsersByID } from "../models/User";
import { UserGroup } from "../components/UserGroup";
import { XBoard } from "../components/XBoard/XBoard";
import { Keyboard } from "../components/mobile/Keyboard";
import { ClueSelector } from "../components/mobile/ClueSelector";
import Avatar from "../components/Avatar";

export type SelectionState = {
  orientation: OrientationType;
  selectedCellKey: string;
};

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
  const [selectionState, setSelectionState] = useState<SelectionState>({
    orientation: OrientationType.HORIZONTAL,
    selectedCellKey: "1,2",
  });

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
    <XWordContainer
      isLoading={sessionLoading}
      showToolbar
      toolbarChildren={user && <Avatar user={user}></Avatar>}
    >
      {session && (
        <>
          <XBoard
            boardState={session?.boardState}
            puzzle={session?.puzzle}
            selectionState={selectionState}
          />
          <div className="grow" />
          <ClueSelector clue={session?.puzzle.clues.horizontal[0]} />
          <Keyboard
            onChange={(input: string): void => {
              console.log(input, keyboardRef.current);
            }}
            keyboardRef={keyboardRef}
          />
        </>
      )}
    </XWordContainer>
  );
};

export default Solve;
