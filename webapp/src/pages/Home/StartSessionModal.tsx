import React from "react";

import { v4 } from "uuid";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import { Puzzle } from "../../models/Puzzle";
import { User } from "../../models/User";
import { startSession } from "../../reducers/session";
import HomeTabs from "./HomeTabs";
import { PuzzleCard } from "../../components/PuzzleCard";

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
    <Modal isOpen={modalShowing} setIsOpen={setModalShowing} title="Session">
      <HomeTabs
        tabArray={[
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
          </div>,
        ]}
      />
    </Modal>
  );
};

export default StartSessionModal;
