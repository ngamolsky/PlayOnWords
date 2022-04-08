import React from "react";

import { v4 } from "uuid";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import { Puzzle } from "../../models/Puzzle";
import { User } from "../../models/User";
import Tabs from "../../components/Tabs";
import { PuzzleCard } from "./PuzzleCard";
import { startSession, useRecentSessionsForUser } from "../../models/Session";
import { SessionCard } from "./SessionCard";
import { toXWordDate } from "../../utils/timeAndDateUtils";

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
            title: "New Session",
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
    <div className="flex flex-col justify-between h-full space-y-4">
      <p className="w-full mx-auto mt-4 text-lg">
        Start a Session for the puzzle:
      </p>
      <PuzzleCard
        puzzle={selectedPuzzle}
        onClick={async () => {
          setSessionLoading(true);
          setModalShowing(false);

          const sessionID = `session.${v4()}`;

          await startSession(sessionID, selectedPuzzle, user);
          setSessionID(sessionID);
        }}
      />
      <Button
        type="button"
        className="w-full mx-auto"
        onClick={async () => {
          setSessionLoading(true);
          setModalShowing(false);

          const sessionID = `session.${v4()}`;

          await startSession(sessionID, selectedPuzzle, user);
          setSessionID(sessionID);
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
  const [sessions, loadingMessage] = useRecentSessionsForUser(5, user, puzzle);

  return (
    <div className="h-full py-4">
      {loadingMessage ? (
        <div className="flex items-center justify-center min-w-full min-h-full grow motion-safe:animate-pulse-fast">
          {loadingMessage}
        </div>
      ) : (
        <div className="h-full space-y-4">
          <p className="mt-2 text-lg text-ellipsis">
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
            <div className="flex w-full h-full">
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
  const [sessions, loadingMessage] = useRecentSessionsForUser(
    5,
    user,
    puzzle,
    true
  );

  return (
    <div className="h-full py-4">
      {loadingMessage ? (
        <div className="flex items-center justify-center min-w-full min-h-full grow motion-safe:animate-pulse-fast">
          {loadingMessage}
        </div>
      ) : (
        <div className="h-full space-y-4">
          <p className="mt-2 text-lg text-ellipsis">
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
            <div className="flex w-full h-full">
              <p className="mx-auto my-auto">No Completed Sessions</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};




export default StartSessionModal;
