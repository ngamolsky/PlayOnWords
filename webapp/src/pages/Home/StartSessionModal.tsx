import React from "react";

import { v4 } from "uuid";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import { Puzzle } from "../../models/Puzzle";
import { User } from "../../models/User";
import Tabs from "../../components/Tabs";
import { PuzzleCard } from "./PuzzleCard";
import {
  startSession,
  useRecentSessionsForUserAndPuzzle,
} from "../../models/Session";
import { SessionCard } from "./SessionCard";
import { toXWordDate } from "../../utils/timeAndDateUtils";
import { NUM_PUZZLES_TO_SHOW_ON_HOME } from "../../utils/constants";
import id from "uuid-readable";

const StartSessionModal = ({
  modalShowing,
  selectedPuzzle,
  user,
  setSessionLoading,
  setSessionID,
  setModalShowing,
}: {
  modalShowing: boolean;
  selectedPuzzle: Puzzle;
  user: User;
  setSessionLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setModalShowing: React.Dispatch<React.SetStateAction<boolean>>;
  setSessionID: (sessionID: string) => void;
}) => {
  return (
    <Modal isOpen={modalShowing} setIsOpen={setModalShowing} className="h-full">
      <Tabs
        tabArray={[
          {
            title: "New",
            content: NewTab(
              selectedPuzzle,
              user,
              setSessionLoading,
              setModalShowing,
              setSessionID
            ),
          },
          {
            title: "In Progress",
            content: InProgressTab(user, selectedPuzzle, setSessionID),
          },
          {
            title: "Completed",
            content: CompletedTab(user, selectedPuzzle, setSessionID),
          },
        ]}
      />
    </Modal>
  );
};

const NewTab = (
  selectedPuzzle: Puzzle,
  user: User,
  setSessionLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setModalShowing: React.Dispatch<React.SetStateAction<boolean>>,
  setSessionID: (sessionID: string) => void
) => {
  return (
    <div className="flex flex-col justify-between h-full p-4 space-y-4">
      <p className="w-full mx-auto text-lg">Start a Session for the puzzle:</p>
      <PuzzleCard
        className="w-4/5"
        puzzle={selectedPuzzle}
        onClick={async () => {
          setSessionLoading(true);
          setModalShowing(false);

          const sessionID = id.short(v4()).split(" ").join("-");

          const session = await startSession(sessionID, selectedPuzzle, user);
          setSessionID(session.sessionID);
        }}
      />
      <Button
        type="button"
        className="w-full mx-auto"
        onClick={async () => {
          setSessionLoading(true);
          setModalShowing(false);

          const sessionID = `session.${v4()}`;

          const session = await startSession(sessionID, selectedPuzzle, user);
          setSessionID(session.sessionID);
        }}
      >
        Start Session
      </Button>
    </div>
  );
};

const InProgressTab = (
  user: User,
  puzzle: Puzzle,
  setSessionID: (sessionID: string) => void
) => {
  const [sessions, loadingMessage] = useRecentSessionsForUserAndPuzzle(
    NUM_PUZZLES_TO_SHOW_ON_HOME,
    user,
    puzzle
  );

  return (
    <div className="h-full">
      {loadingMessage ? (
        <div className="flex items-center justify-center min-w-full min-h-full grow motion-safe:animate-pulse-fast">
          {loadingMessage}
        </div>
      ) : (
        <div className="flex flex-col min-h-full p-4 space-y-4">
          <p className="text-lg text-ellipsis">
            {toXWordDate(puzzle.puzzleTimestamp.toDate())}
          </p>
          {sessions && sessions.length > 0 ? (
            sessions.map((session) => (
              <SessionCard
                key={session.sessionID}
                session={session}
                onClick={() => {
                  setSessionID(session.sessionID);
                }}
              />
            ))
          ) : (
            <div className="flex grow">
              <p className="mx-auto my-auto">No Active Sessions</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const CompletedTab = (
  user: User,
  puzzle: Puzzle,
  setSessionID: (sessionID: string) => void
) => {
  const [sessions, loadingMessage] = useRecentSessionsForUserAndPuzzle(
    NUM_PUZZLES_TO_SHOW_ON_HOME,
    user,
    puzzle,
    true
  );

  return (
    <div className="h-full">
      {loadingMessage ? (
        <div className="flex items-center justify-center min-w-full min-h-full grow motion-safe:animate-pulse-fast">
          {loadingMessage}
        </div>
      ) : (
        <div className="flex flex-col min-h-full p-4 space-y-4">
          <p className="text-lg text-ellipsis">
            {toXWordDate(puzzle.puzzleTimestamp.toDate())}
          </p>
          {sessions && sessions.length > 0 ? (
            sessions.map((session) => (
              <SessionCard
                key={session.sessionID}
                session={session}
                onClick={() => {
                  setSessionID(session.sessionID);
                }}
              />
            ))
          ) : (
            <div className="flex grow">
              <p className="mx-auto my-auto">No Completed Sessions</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};




export default StartSessionModal;
