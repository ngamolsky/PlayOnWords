import React, { MutableRefObject, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { SimpleKeyboard } from "react-simple-keyboard";

import { XWordContainer } from "../components/XWordContainer";
import { OrientationType } from "../models/Session";
import { XBoard } from "../components/XBoard/XBoard";
import { Keyboard } from "../components/mobile/Keyboard";
import { ClueSelector } from "../components/mobile/ClueSelector";
import Avatar from "../components/Avatar";
import {
  getClueFromCellKeyOrientationAndPuzzle,
  getCombinedBoardState,
  isUserInSession,
} from "../utils/sessionUtils";
import { signOut, useLoggedInUser } from "../models/User";
import { ACTION_KEYS } from "../utils/keyboardUtils";
import { useSessionState } from "../hooks/useSessionState";
import { SessionActionTypes } from "../reducers/session";

export type SelectionState = {
  orientation: OrientationType;
  selectedCellKey: string;
};

const Solve: React.FC = () => {
  const { sessionID } = useParams<{ sessionID?: string }>();

  if (!sessionID) {
    throw new Error("Puzzle Session ID not found");
  }

  const user = useLoggedInUser();

  const [sessionState, dispatch] = useSessionState(sessionID);

  const {
    session,
    localState: { selectedCellKey, orientation },
  } = sessionState;

  // const sessionUsers = useUsersByID(session?.participantIDs);

  const keyboardRef: MutableRefObject<SimpleKeyboard | null> =
    useRef<SimpleKeyboard>(null);

  // Join puzzle session if the user isn't already in it when joining
  useEffect(() => {
    const joinPuzzleSessionIfNeeded = async () => {
      if (user && session) {
        if (!isUserInSession(session, user.userID)) {
          dispatch({
            type: SessionActionTypes.JOIN_SESSION_PARTICIPANTS,
            userID: user.userID,
          });
        }
      }
    };

    joinPuzzleSessionIfNeeded();
  }, [user, session]);

  if (!session) {
    return (
      <XWordContainer
        isLoading={true}
        showToolbar
        toolbarChildren={user && <Avatar user={user}></Avatar>}
      />
    );
  }

  const currentSelectedClue = getClueFromCellKeyOrientationAndPuzzle(
    selectedCellKey,
    orientation,
    session.puzzle
  );

  const boardState = getCombinedBoardState(sessionState);

  return (
    <XWordContainer
      isLoading={false}
      showToolbar
      toolbarChildren={user && <Avatar user={user} onClick={signOut} />}
    >
      <>
        <XBoard
          boardState={boardState}
          puzzle={session.puzzle}
          onCellClicked={(cellKey) => {
            dispatch({ type: SessionActionTypes.CELL_CLICKED, cellKey });
          }}
        />
        <div className="grow" />
        <ClueSelector
          clue={currentSelectedClue}
          orientation={orientation}
          onNextClue={() => {
            dispatch({
              type: SessionActionTypes.NEXT_CLUE,
            });
          }}
          onPreviousClue={() => {
            dispatch({
              type: SessionActionTypes.PREVIOUS_CLUE,
            });
          }}
          onCluePressed={() => {
            dispatch({
              type: SessionActionTypes.TOGGLE_ORIENTATION,
            });
          }}
        />
        <Keyboard
          onKeyPress={(key) => {
            switch (key) {
              case ACTION_KEYS.BACKSPACE:
                dispatch({
                  type: SessionActionTypes.BACKSPACE,
                });

                return;
              case ACTION_KEYS.REBUS:
                console.log("REBUS");
                return;
            }
          }}
          onChange={(letter): void => {
            dispatch({ type: SessionActionTypes.LETTER_PRESSED, letter });
            if (keyboardRef.current) {
              keyboardRef.current.setInput("");
            }
          }}
          keyboardRef={keyboardRef}
        />
      </>
    </XWordContainer>
  );
};

export default Solve;
