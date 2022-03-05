import { Dialog } from "@headlessui/react";
import React from "react";
import { secondsToTimeString } from "../../utils/timeAndDateUtils";

type EndSessionModalProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  isCorrect: boolean;
  sessionDuration: number;
  onClickResetButton: () => void;
};

const EndSessionModal: React.FC<EndSessionModalProps> = ({
  isOpen,
  setIsOpen,
  isCorrect,
  sessionDuration,
  onClickResetButton,
}) => {
  const title = isCorrect ? "Puzzle Complete!" : "Almost there!";
  return (
    <Dialog
      open={isOpen}
      onClose={() => setIsOpen(false)}
      className="fixed z-10 inset-0 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

        <div className="relative bg-white rounded max-w-sm mx-auto">
          <Dialog.Title>{title}</Dialog.Title>

          <Dialog.Description>Solving Statistics:</Dialog.Description>
          <p>Duration: {secondsToTimeString(sessionDuration)}</p>
          <button onClick={() => setIsOpen(false)}>Close</button>
          <button onClick={onClickResetButton}>Reset</button>
        </div>
      </div>
    </Dialog>
  );
};

export default EndSessionModal;
