import React, { MutableRefObject, useContext, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { SimpleKeyboard } from "react-simple-keyboard";

import { XWordContainer } from "../components/XWordContainer";
import {
  CellSelectionState,
  isUserInSession,
  OrientationType,
  PuzzleSessionActionTypes,
  usePuzzleSession,
} from "../models/PuzzleSession";
import { UserContext } from "../contexts/UserContext";
import { XBoard } from "../components/XBoard/XBoard";
import { Keyboard } from "../components/mobile/Keyboard";
import { ClueSelector } from "../components/mobile/ClueSelector";
import Avatar from "../components/Avatar";
import {
  getClueFromCellKeyOrientationAndPuzzle,
  getCellKeysForClueAndOrientation,
  getCombinedBoardState,
  getCellCoordinatesFromKey,
} from "../utils/puzzleSessionUtils";
import { signOut } from "../models/User";

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
  const [session, sessionLoading, { selectedCellKey, orientation }, dispatch] =
    usePuzzleSession(puzzleSessionID);

  // const sessionUsers = useUsersByID(session?.participantIDs);

  const keyboardRef: MutableRefObject<SimpleKeyboard | null> =
    useRef<SimpleKeyboard>(null);

  // Join puzzle session if the user isn't already in it when joining
  useEffect(() => {
    const joinPuzzleSessionIfNeeded = async () => {
      if (user && session) {
        if (!isUserInSession(session, user.userID)) {
          dispatch({
            type: PuzzleSessionActionTypes.JOIN_SESSION_PARTICIPANTS,
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
        isLoading={sessionLoading}
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

  return (
    <XWordContainer
      isLoading={sessionLoading}
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
                type: PuzzleSessionActionTypes.TOGGLE_ORIENTATION,
              });
            } else {
              dispatch({
                type: PuzzleSessionActionTypes.SET_CELL_SELECTED,
                cellKey: cellKey,
              });
            }
          }}
        />
        <div className="grow" />
        <ClueSelector clue={currentSelectedClue} />
        <Keyboard
          onChange={(letter: string): void => {
            dispatch({
              type: PuzzleSessionActionTypes.SET_CELL_LETTER,
              cellKey: selectedCellKey,
              letter,
              sessionID: puzzleSessionID,
            });
            if (keyboardRef.current) {
              keyboardRef.current.setInput("");
            }
            dispatch({
              type: PuzzleSessionActionTypes.SELECT_NEXT_CELL,
              puzzle: session.puzzle,
            });

            if (isLastKeySelected) {
              dispatch({
                type: PuzzleSessionActionTypes.TOGGLE_ORIENTATION,
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
