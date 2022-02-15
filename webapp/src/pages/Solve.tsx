import React, { MutableRefObject, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { SimpleKeyboard } from "react-simple-keyboard";

import { XWordContainer } from "../components/XWordContainer";
import {
  CellSelectionState,
  OrientationType,
  SessionActionTypes,
} from "../models/Session";
import { XBoard } from "../components/XBoard/XBoard";
import { Keyboard } from "../components/mobile/Keyboard";
import { ClueSelector } from "../components/mobile/ClueSelector";
import Avatar from "../components/Avatar";
import {
  getClueFromCellKeyOrientationAndPuzzle,
  getCellKeysForClueAndOrientation,
  getCombinedBoardState,
  getCellCoordinatesFromKey,
  isUserInSession,
} from "../utils/sessionUtils";
import { signOut, useLoggedInUser } from "../models/User";
import { ACTION_KEYS } from "../utils/keyboardUtils";
import { useSessionState } from "../hooks/useSessionState";

export type SelectionState = {
  orientation: OrientationType;
  selectedCellKey: string;
};

const Solve: React.FC = () => {
  const { puzzleSessionID } = useParams<{ puzzleSessionID?: string }>();

  if (!puzzleSessionID) {
    throw new Error("Puzzle Session ID not found");
  }

  const user = useLoggedInUser();

  const [sessionState, dispatch] = useSessionState(puzzleSessionID);

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
            sessionID: puzzleSessionID,
          });
        }
      }
    };

    joinPuzzleSessionIfNeeded();
  }, [user, session]);

  if (!session) {
    return (
      <XWordContainer
        isLoading={false}
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
  const activeCellKeys = getCellKeysForClueAndOrientation(
    currentSelectedClue,
    orientation
  );

  const boardState = getCombinedBoardState(
    session.boardState,
    session.puzzle.solutions,
    selectedCellKey,
    activeCellKeys
  );

  const puzzleSize = Math.sqrt(Object.keys(session.puzzle.solutions).length);

  const { x, y } = getCellCoordinatesFromKey(selectedCellKey);
  const isLastKeySelected = x == puzzleSize - 1 && y == puzzleSize - 1;
  const isFirstKeySelected = x == 0 && y == 0;

  return (
    <XWordContainer
      isLoading={false}
      showToolbar
      toolbarChildren={user && <Avatar user={user} onClick={signOut} />}
    >
      <>
        <XBoard
          boardState={boardState}
          puzzle={session?.puzzle}
          onCellClicked={(cellKey) => {
            if (
              boardState[cellKey].cellSelectionState ==
              CellSelectionState.UNSELECTABLE
            )
              return;
            if (cellKey == selectedCellKey) {
              dispatch({
                type: SessionActionTypes.TOGGLE_ORIENTATION,
              });
            } else {
              dispatch({
                type: SessionActionTypes.SET_CELL_SELECTED,
                cellKey: cellKey,
              });
            }
          }}
        />
        <div className="grow" />
        <ClueSelector
          clue={currentSelectedClue}
          orientation={orientation}
          onNextClue={() => {
            const clues = session.puzzle.clues;
            const currentClueIndex = clues[orientation].findIndex(
              (clue) => clue == currentSelectedClue
            );

            const isLastClue =
              currentClueIndex == session.puzzle.clues[orientation].length - 1;

            if (isLastClue) {
              dispatch({
                type: SessionActionTypes.TOGGLE_ORIENTATION,
              });

              dispatch({
                type: SessionActionTypes.SET_CELL_SELECTED,
                cellKey: "0,0",
              });
            } else {
              dispatch({
                type: SessionActionTypes.MOVE_TO_CLUE,
                puzzle: session.puzzle,
                nextClueIndex: currentClueIndex + 1,
              });
            }
          }}
          onPreviousClue={() => {
            const clues = session.puzzle.clues;
            const currentClueIndex = clues[orientation].findIndex(
              (clue) => clue == currentSelectedClue
            );

            const isFirstClue = currentClueIndex == 0;
            if (isFirstClue) {
              dispatch({
                type: SessionActionTypes.TOGGLE_ORIENTATION,
              });

              dispatch({
                type: SessionActionTypes.SET_CELL_SELECTED,
                cellKey: `${puzzleSize - 1},${puzzleSize - 1}`,
              });
            } else {
              dispatch({
                type: SessionActionTypes.MOVE_TO_CLUE,
                puzzle: session.puzzle,
                nextClueIndex: currentClueIndex - 1,
              });
            }
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
                if (boardState[selectedCellKey].currentLetter) {
                  dispatch({
                    type: SessionActionTypes.SET_CELL_LETTER,
                    cellKey: selectedCellKey,
                    letter: "",
                    sessionID: puzzleSessionID,
                    boardState,
                  });
                } else {
                  dispatch({
                    type: SessionActionTypes.SELECT_PREVIOUS_CELL,
                    puzzle: session.puzzle,
                  });

                  if (isFirstKeySelected) {
                    dispatch({
                      type: SessionActionTypes.TOGGLE_ORIENTATION,
                    });
                  }
                }
                return;
              case ACTION_KEYS.REBUS:
                console.log("REBUS");
                return;
            }
          }}
          onChange={(letter): void => {
            dispatch({
              type: SessionActionTypes.SET_CELL_LETTER,
              cellKey: selectedCellKey,
              letter: letter,
              sessionID: puzzleSessionID,
              boardState,
            });

            dispatch({
              type: SessionActionTypes.SELECT_NEXT_CELL,
              puzzle: session.puzzle,
            });

            if (keyboardRef.current) {
              keyboardRef.current.setInput("");
            }

            if (isLastKeySelected) {
              dispatch({
                type: SessionActionTypes.TOGGLE_ORIENTATION,
              });
            }
          }}
          keyboardRef={keyboardRef}
        />
      </>
    </XWordContainer>
  );
};

export default Solve;
