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
import { signOut, useLoggedInUser } from "../../models/User";
import { useSessionState } from "../../hooks/useSessionState";
import { SessionActionTypes } from "../../reducers/session";
import Pencil from "../../components/icons/Pencil";
import Help from "../../components/icons/Help";
import VerticalDots from "../../components/icons/VerticalDots";
import Timer from "../../components/Timer";
import DropdownMenu from "../../components/DropdownMenu";
import EndSessionModal from "./EndSessionModal";
import { secondsToTimeString } from "../../utils/timeAndDateUtils";

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

  const [modalOpen, setModalOpen] = useState<boolean>(false);

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
      setModalOpen(true);
    }
  }, [session?.sessionStatus]);

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
            {session && session.endTime ? (
              secondsToTimeString(
                session.endTime.seconds - session.startTime.seconds
              )
            ) : (
              <Timer sessionStartDate={session.startTime.toDate()} />
            )}
          </div>
          <div
            className={`h-8 w-8 rounded-md ${
              pencilMode ? "dark:bg-slate-500 dark:bg-opacity-95" : "bg-inherit"
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
              <div className="h-8 w-8 rounded-md p-1 hover:bg-slate-500 hover:bg-opacity-95">
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
                    username: user.username,
                  });
                },
              },
              {
                node: <p>Check Word</p>,
                onClick: () => {
                  dispatch({
                    type: SessionActionTypes.CHECK_WORD,
                    username: user.username,
                  });
                },
              },
              {
                node: <p>Check Puzzle</p>,
                onClick: () => {
                  dispatch({
                    type: SessionActionTypes.CHECK_PUZZLE,
                    username: user.username,
                  });
                },
              },
              {
                node: <p>Reveal Square</p>,
                onClick: () => {
                  dispatch({
                    type: SessionActionTypes.REVEAL_SQUARE,
                    username: user.username,
                  });
                },
              },
              {
                node: <p>Reveal Word</p>,
                onClick: () => {
                  dispatch({
                    type: SessionActionTypes.REVEAL_WORD,
                    username: user.username,
                  });
                },
              },
              {
                node: <p>Reveal Puzzle</p>,
                onClick: () => {
                  dispatch({
                    type: SessionActionTypes.REVEAL_PUZZLE,
                    username: user.username,
                  });
                },
              },
              {
                node: <p>Reset Puzzle</p>,
                onClick: () => {
                  dispatch({
                    type: SessionActionTypes.RESET_PUZZLE,
                    username: user.username,
                  });
                },
              },
            ]}
          />
          <DropdownMenu
            buttonContent={
              <div className="h-8 w-8 rounded-md p-1 hover:bg-slate-300">
                <VerticalDots />
              </div>
            }
            items={[
              {
                node: <p>Sign Out</p>,
                onClick: () => {
                  signOut(user.username);
                },
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
      {session.endTime && (
        <EndSessionModal
          onClickResetButton={() => {
            setModalOpen(false);
            dispatch({
              type: SessionActionTypes.RESET_PUZZLE,
              username: user.username,
            });
          }}
          isOpen={modalOpen}
          setIsOpen={setModalOpen}
          isCorrect={checkPuzzle(session.boardState, session.puzzle.solutions)}
          session={session}
        />
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
