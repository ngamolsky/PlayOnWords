import React, { MutableRefObject, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { SimpleKeyboard } from "react-simple-keyboard";

import { XWordContainer } from "../components/XWordContainer";
import { CellSolutionState, OrientationType } from "../models/Session";
import { XBoard } from "../components/XBoard/XBoard";
import { Keyboard } from "../components/mobile/Keyboard";
import { ClueSelector } from "../components/mobile/ClueSelector";
import {
  getClueFromCellKeyOrientationAndPuzzle,
  getCombinedBoardState,
  isUserInSession,
} from "../utils/sessionUtils";
import { useLoggedInUser } from "../models/User";
import { ACTION_KEYS } from "../utils/keyboardUtils";
import { useSessionState } from "../hooks/useSessionState";
import { SessionActionTypes } from "../reducers/session";
import Pencil from "../components/icons/Pencil";
import Help from "../components/icons/Help";
import VerticalDots from "../components/icons/VerticalDots";

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
    localState: { selectedCellKey, orientation, isPencilModeOn },
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
    return <XWordContainer isLoading={true} showToolbar />;
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
      toolbarChildren={
        <div className="space-x-2 flex-row flex h-8">
          <div
            className={`h-8 w-8 rounded-md ${
              isPencilModeOn ? "bg-slate-300" : "bg-white"
            } p-1`}
            onClick={() => {
              dispatch({
                type: SessionActionTypes.PENCIL_CLICKED,
              });
            }}
          >
            <Pencil />
          </div>
          <div className="h-8 w-8 rounded-md bg-slate-300 p-1">
            <Help />
          </div>
          <div className="h-8 w-8 rounded-md bg-slate-300 p-1">
            <VerticalDots />
          </div>
        </div>
      }
    >
      <>
        <XBoard
          boardState={boardState}
          puzzle={session.puzzle}
          onCellClicked={(cellKey) => {
            dispatch({ type: SessionActionTypes.CELL_CLICKED, cellKey });
          }}
        />
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
                  userID: user.userID,
                });

                return;
              case ACTION_KEYS.REBUS:
                console.log("REBUS");
                return;
            }
          }}
          onChange={(letter): void => {
            const cellState = boardState[selectedCellKey];
            dispatch({
              type: SessionActionTypes.LETTER_PRESSED,
              userID: user.userID,
              letter,
              solutionState: isPencilModeOn
                ? CellSolutionState.PENCIL
                : cellState.solutionState,
            });
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
