import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { XWordContainer } from "../../components/XWordContainer";
import { CellSolutionState, useSessionState } from "../../models/Session";
import { XBoard } from "../../components/XBoard/XBoard";
import { ACTION_KEYS, Keyboard } from "../../components/mobile/Keyboard";
import { ClueSelector } from "../../components/mobile/ClueSelector";
import {
  getClueFromCellKeyOrientationAndPuzzle,
  getCombinedBoardState,
  getPercentageComplete,
  isUserInSession,
} from "../../utils/sessionUtils";
import { useLoggedInUser } from "../../models/User";
import { SessionActionTypes } from "../../reducers/session";
import EndSessionModal from "./EndSessionModal";
import ShareUserModal from "./ShareModal";
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

  const [sessionState, dispatch] = useSessionState(sessionID, user.userID);

  const [endSessionModalOpen, setEndSessionModalOpen] =
    useState<boolean>(false);
  const [inviteUsersModalOpen, setInviteUsersModalOpen] =
    useState<boolean>(false);

  const {
    session,
    localState: { selectedCellKey, orientation, pencilMode, rebus, autocheck },
    loadingMessage,
  } = sessionState;

  // Join puzzle session if the user isn't already in it when joining
  useEffect(() => {
    const joinPuzzleSessionIfNeeded = async () => {
      if (user && session) {
        if (!isUserInSession(session, user.userID)) {
          dispatch({
            type: SessionActionTypes.JOIN_SESSION_PARTICIPANTS,
            user: user,
          });
        }
      }
    };

    joinPuzzleSessionIfNeeded();
  }, [user, session]);

  useEffect(() => {
    if (
      session &&
      getPercentageComplete(session.boardState, session.puzzle.solutions) == 100
    ) {
      setEndSessionModalOpen(true);
    }
  }, [session]);

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
      className="max-w-md mx-auto"
      showToolbar
      toolbarContent={
        <SolveToolbarItems
          session={session}
          user={user}
          autocheck={autocheck}
          pencilMode={pencilMode}
          dispatch={dispatch}
          showShareModal={setInviteUsersModalOpen}
        />
      }
    >
      {inviteUsersModalOpen && (
        <ShareUserModal
          modalShowing={inviteUsersModalOpen}
          session={session}
          user={user}
          setModalShowing={setInviteUsersModalOpen}
        />
      )}
      {endSessionModalOpen && (
        <EndSessionModal setIsOpen={setEndSessionModalOpen} session={session} />
      )}

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
        rebus={rebus}
        pencilMode={pencilMode}
        onKeyPress={(key, newPencilMode) => {
          switch (key) {
            case ACTION_KEYS.TAB:
              dispatch({
                type: SessionActionTypes.TOGGLE_ORIENTATION,
              });

              return;
            case ACTION_KEYS.BACKSPACE:
              dispatch({
                type: SessionActionTypes.BACKSPACE,
                userID: user.userID,
              });

              return;
            case ACTION_KEYS.REBUS:
              dispatch({
                type: SessionActionTypes.REBUS_CLICKED,
              });
              return;
            case ACTION_KEYS.ENTER:
              dispatch({
                type: SessionActionTypes.NEXT_CLUE,
              });
              return;
            case ACTION_KEYS.RIGHT:
              dispatch({
                type: SessionActionTypes.RIGHT_KEY,
              });
              return;
            case ACTION_KEYS.LEFT:
              dispatch({
                type: SessionActionTypes.LEFT_KEY,
              });
              return;
            case ACTION_KEYS.UP:
              dispatch({
                type: SessionActionTypes.UP_KEY,
              });
              return;
            case ACTION_KEYS.DOWN:
              dispatch({
                type: SessionActionTypes.DOWN_KEY,
              });
              return;
            default: {
              dispatch({
                type: SessionActionTypes.LETTER_PRESSED,
                userID: user.userID,
                letter: key,
                solutionState: newPencilMode
                  ? CellSolutionState.PENCIL
                  : CellSolutionState.NONE,
              });
            }
          }
        }}
      />
    </XWordContainer>
  );
};

export default Solve;
