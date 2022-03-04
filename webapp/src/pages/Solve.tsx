import React, { MutableRefObject, useEffect, useRef } from "react";
import { useLocation, useParams } from "react-router-dom";
import { SimpleKeyboard } from "react-simple-keyboard";

import { XWordContainer } from "../components/XWordContainer";
import { CellSolutionState } from "../models/Session";
import { XBoard } from "../components/XBoard/XBoard";
import { Keyboard } from "../components/mobile/Keyboard";
import { ClueSelector } from "../components/mobile/ClueSelector";
import {
  getClueFromCellKeyOrientationAndPuzzle,
  getCombinedBoardState,
  isUserInSession,
} from "../utils/sessionUtils";
import { signOut, useLoggedInUser } from "../models/User";
import { ACTION_KEYS } from "../utils/keyboardUtils";
import { useSessionState } from "../hooks/useSessionState";
import { SessionActionTypes } from "../reducers/session";
import Pencil from "../components/icons/Pencil";
import Help from "../components/icons/Help";
import VerticalDots from "../components/icons/VerticalDots";
import Timer from "../components/Timer";
import DropdownMenu from "../components/DropdownMenu";

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
        <div className="space-x-2 flex-row flex h-8 relative">
          <div className="my-auto">
            <Timer sessionStartDate={session.startTime.toDate()} />
          </div>
          <div
            className={`h-8 w-8 rounded-md ${
              pencilMode ? "bg-slate-300" : "bg-white"
            } p-1`}
            onClick={() => {
              dispatch({
                type: SessionActionTypes.PENCIL_CLICKED,
              });
            }}
          >
            <Pencil />
          </div>
          <DropdownMenu
            selectedItemIndex={autocheck ? 0 : undefined}
            buttonContent={
              <div className="h-8 w-8 rounded-md p-1 active:bg-slate-300">
                <Help />
              </div>
            }
            items={[
              {
                node: <p>Autocheck</p>,
                onClick: () => {
                  dispatch({
                    type: SessionActionTypes.AUTOCHECK_CLICKED,
                  });
                },
              },
              {
                node: <p>Check Square</p>,
                onClick: () => {
                  dispatch({
                    type: SessionActionTypes.CHECK_SQUARE,
                    userID: user.userID,
                  });
                },
              },
              {
                node: <p>Check Word</p>,
                onClick: () => {
                  dispatch({
                    type: SessionActionTypes.CHECK_WORD,
                    userID: user.userID,
                  });
                },
              },
              {
                node: <p>Check Puzzle</p>,
                onClick: () => {
                  dispatch({
                    type: SessionActionTypes.CHECK_PUZZLE,
                    userID: user.userID,
                  });
                },
              },
              {
                node: <p>Reveal Square</p>,
                onClick: () => {
                  dispatch({
                    type: SessionActionTypes.REVEAL_SQUARE,
                    userID: user.userID,
                  });
                },
              },
              {
                node: <p>Reveal Word</p>,
                onClick: () => {
                  dispatch({
                    type: SessionActionTypes.REVEAL_WORD,
                    userID: user.userID,
                  });
                },
              },
              {
                node: <p>Reveal Puzzle</p>,
                onClick: () => {
                  dispatch({
                    type: SessionActionTypes.REVEAL_PUZZLE,
                    userID: user.userID,
                  });
                },
              },
              {
                node: <p>Reset Puzzle</p>,
                onClick: () => {
                  dispatch({
                    type: SessionActionTypes.RESET_PUZZLE,
                    userID: user.userID,
                  });
                },
              },
            ]}
          />
          <DropdownMenu
            buttonContent={
              <div className="h-8 w-8 rounded-md p-1 active:bg-slate-300">
                <VerticalDots />
              </div>
            }
            items={[
              {
                node: <p>Sign Out</p>,
                onClick: signOut,
              },
              {
                node: <p>Log Particpants</p>,
                onClick: () => {
                  console.log(session.participantIDs);
                },
              },
              {
                node: <p>Get Share Link</p>,
                onClick: () => {
                  console.log(location.pathname);
                },
              },
            ]}
          />
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
                dispatch({
                  type: SessionActionTypes.REBUS_CLICKED,
                });
                return;
              default: {
                dispatch({
                  type: SessionActionTypes.LETTER_PRESSED,
                  userID: user.userID,
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
      </>
    </XWordContainer>
  );
};

export default Solve;
