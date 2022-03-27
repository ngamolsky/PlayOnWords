import React from "react";

import { v4 } from "uuid";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import { Puzzle } from "../../models/Puzzle";
import { User } from "../../models/User";
import { startSession } from "../../reducers/session";
import StartSessionTabs from "./StartSessionTabs";
import { PuzzleCard } from "../../components/PuzzleCard";
import { useRecentSessionsForUser } from "../../models/Session";

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
      <StartSessionTabs
        tabArray={[
          NewTab(
            selectedPuzzle,
            user,
            setSessionLoading,
            setModalShowing,
            setSessionID
          ),
          InProgressTab(user.firebaseAuthID),
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
      <PuzzleCard puzzle={selectedPuzzle} />
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

const InProgressTab = (userID: string) => {
  const [sessions, loadingMessage] = useRecentSessionsForUser(5, userID);

  return (
    <>
      {loadingMessage && (
        <div className="flex items-center justify-center min-w-full min-h-screen grow motion-safe:animate-pulse-fast">
          {loadingMessage}
        </div>
      )}
      {sessions &&
        sessions.map((session) => (
          <PuzzleCard key={session.sessionID} puzzle={session.puzzle} />
        ))}
    </>
  );
};




export default StartSessionModal;
