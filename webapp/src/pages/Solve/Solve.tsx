import React, { MutableRefObject, useEffect, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { SimpleKeyboard } from "react-simple-keyboard";

import { XWordContainer } from "../../components/XWordContainer";
import { CellSolutionState, SessionStatus } from "../../models/Session";
import { XBoard } from "../../components/XBoard/XBoard";
import { Keyboard } from "../../components/mobile/Keyboard";
import { ClueSelector } from "../../components/mobile/ClueSelector";
import {
  checkPuzzle,
  getClueFromCellKeyOrientationAndPuzzle,
  getCombinedBoardState,
  isUserInSession,
} from "../../utils/sessionUtils";
import { ACTION_KEYS } from "../../utils/keyboardUtils";
import { useLoggedInUser } from "../../models/User";
import { useSessionState } from "../../hooks/useSessionState";
import { SessionActionTypes } from "../../reducers/session";
import EndSessionModal from "./EndSessionModal";
import InviteUsersModal from "./InviteUsersModal";
import SolveToolbarItems from "./SolveToolbarItems";

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
  const location = useLocation();

  const [sessionState, dispatch] = useSessionState(sessionID);

  const [endSessionModalOpen, setEndSessionModalOpen] =
    useState<boolean>(false);
  const [inviteUsersModalOpen, setInviteUsersModalOpen] =
    useState<boolean>(false);

  const {
    session,
    localState: { selectedCellKey, orientation, pencilMode, rebus, autocheck },
    loadingMessage,
  } = sessionState;

  const keyboardRef: MutableRefObject<SimpleKeyboard | null> =
    useRef<SimpleKeyboard>(null);

  // Join puzzle session if the user isn't already in it when joining
  useEffect(() => {
    const joinPuzzleSessionIfNeeded = async () => {
      if (user && session) {
        if (!isUserInSession(session, user.username)) {
          dispatch({
            type: SessionActionTypes.JOIN_SESSION_PARTICIPANTS,
            username: user.username,
          });
        }
      }
    };

    joinPuzzleSessionIfNeeded();
  }, [user, session]);

  useEffect(() => {
    if (session?.sessionStatus == SessionStatus.COMPLETE) {
      setEndSessionModalOpen(true);
    }
  }, [session?.sessionStatus]);

  useEffect(() => {
    setInviteUsersModalOpen(true);
  }, []);

  if (!session) {
    return <XWordContainer loadingMessage={loadingMessage} showToolbar />;
  }

  const currentSelectedClue = getClueFromCellKeyOrientationAndPuzzle(
    selectedCellKey,
    orientation,
    session.puzzle
  );

  const boardState = getCombinedBoardState(sessionState);

  return (
    <XWordContainer
      showToolbar
      toolbarChildren={
        <SolveToolbarItems
          session={session}
          user={user}
          autocheck={autocheck}
          pencilMode={pencilMode}
          dispatch={dispatch}
        />
      }
    >
      <InviteUsersModal
        modalShowing={inviteUsersModalOpen}
        session={session}
        user={user}
        setModalShowing={setInviteUsersModalOpen}
      />
      <EndSessionModal
        onClickResetButton={() => {
          setEndSessionModalOpen(false);
          dispatch({
            type: SessionActionTypes.RESET_PUZZLE,
            username: user.username,
          });
        }}
        isOpen={endSessionModalOpen}
        setIsOpen={setEndSessionModalOpen}
        isCorrect={checkPuzzle(session.boardState, session.puzzle.solutions)}
        session={session}
      />

      <XBoard
        boardState={boardState}
        puzzle={session.puzzle}
        onCellClicked={(cellKey) => {
          dispatch({ type: SessionActionTypes.CELL_CLICKED, cellKey });
        }}
      />
      <div className="flex-grow" />
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
                username: user.username,
              });

              return;
            case ACTION_KEYS.REBUS:
              dispatch({
                type: SessionActionTypes.REBUS_CLICKED,
              });
              return;
            default: {
              dispatch({
                type: SessionActionTypes.LETTER_PRESSED,
                username: user.username,
                letter: key,
                solutionState: pencilMode
                  ? CellSolutionState.PENCIL
                  : CellSolutionState.NONE,
              });
            }
          }
        }}
        rebus={rebus}
        keyboardRef={keyboardRef}
      />
    </XWordContainer>
  );
};

export default Solve;
