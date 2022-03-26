import React from "react";
import Modal from "../../components/Modal";
import { Session } from "../../models/Session";
import { useUsersByID } from "../../models/User";
import { secondsToTimeString } from "../../utils/timeAndDateUtils";

type EndSessionModalProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  isCorrect: boolean;
  session: Session;
  onClickResetButton: () => void;
};

const EndSessionModal: React.FC<EndSessionModalProps> = ({
  isOpen,
  setIsOpen,
  isCorrect,
  session,
  onClickResetButton,
}) => {
  const participants = useUsersByID(session.participantIDs);
  if (isOpen && !session.endTime) {
    throw new Error("No Session End time found");
  }

  const title = isCorrect ? "Puzzle Complete!" : "Almost there!";
  return session.endTime ? (
    <Modal isOpen={isOpen} title={title} setIsOpen={setIsOpen}>
      <>
        <p>
          Duration:{" "}
          {secondsToTimeString(
            session.endTime.seconds - session.startTime.seconds
          )}
        </p>
        <p>People: {participants.map((each) => each.username)}</p>
        <button onClick={() => setIsOpen(false)}>Close</button>
        <button onClick={onClickResetButton}>Reset</button>
      </>
    </Modal>
  ) : null;
};

export default EndSessionModal;
