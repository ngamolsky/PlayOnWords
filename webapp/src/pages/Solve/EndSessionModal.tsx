import React from "react";
import Modal from "../../components/Modal";
import { Session } from "../../models/Session";
import {
  checkPuzzle,
  getSessionCompletionPercentages,
  getSessionRevealedPercentage,
} from "../../utils/sessionUtils";
import { secondsToTimeString } from "../../utils/timeAndDateUtils";

type EndSessionModalProps = {
  setIsOpen: (isOpen: boolean) => void;
  session: Session;
};

const EndSessionModal: React.FC<EndSessionModalProps> = ({
  setIsOpen,
  session,
}) => {
  const isCorrect = checkPuzzle(session.boardState, session.puzzle.solutions);

  return session.endTime && isCorrect ? (
    <SessionCompleteModal session={session} setIsOpen={setIsOpen} />
  ) : (
    <IncorrectModal setIsOpen={setIsOpen} />
  );
};

const SessionCompleteModal = ({ session, setIsOpen }: EndSessionModalProps) => {
  const sessionResults = getSessionCompletionPercentages(session);
  const sessionPercentRevealed = getSessionRevealedPercentage(session);
  if (!session.endTime)
    throw new Error(
      "Tried to show SessionCompleteModal without session end time"
    );

  return (
    <Modal
      isOpen
      title={"Puzzle Complete!"}
      setIsOpen={setIsOpen}
      className="p-4"
    >
      <>
        <div className="flex-col p-4 rounded-md bg-slate-200 dark:bg-slate-700 ">
          <table className="w-full table-fixed">
            <thead>
              <tr>
                <th className="py-2">Participants</th>
                <th className="py-2">Percent Complete</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(sessionResults).map(
                ([username, percentComplete], index) => (
                  <tr key={index}>
                    <td className="py-2">{username}</td>
                    <td className="py-2">{`${(percentComplete * 100).toFixed(
                      2
                    )}%`}</td>
                  </tr>
                )
              )}
              {sessionPercentRevealed > 0 && (
                <tr key={"revealed"} className="text-red-600 dark:text-red-400">
                  <td className="py-2">Revealed</td>
                  <td className="py-2">{`${sessionPercentRevealed.toFixed(
                    2
                  )}%`}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex p-4 mt-2 rounded-md bg-slate-200 dark:bg-slate-700">
          <table className="w-full table-fixed">
            <tbody>
              <tr>
                <td className="font-bold">Duration</td>
                <td>
                  {secondsToTimeString(
                    session.endTime.seconds - session.startTime.seconds
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="flex flex-row justify-end mt-2 space-y-2">
          <button
            className="p-2 rounded-md outline-none bg-slate-200 dark:bg-slate-700"
            onClick={() => {
              setIsOpen(false);
            }}
          >
            Close
          </button>
        </div>
      </>
    </Modal>
  );
};

const IncorrectModal = ({
  setIsOpen,
}: {
  setIsOpen: (isOpen: boolean) => void;
}) => (
  <Modal
    isOpen={true}
    title={"Almost There!"}
    setIsOpen={setIsOpen}
    className="p-4"
  >
    <button
      className="p-2 rounded-md outline-none bg-slate-200 dark:bg-slate-700"
      onClick={() => {
        setIsOpen(false);
      }}
    >
      Close
    </button>
  </Modal>
);

export default EndSessionModal;
