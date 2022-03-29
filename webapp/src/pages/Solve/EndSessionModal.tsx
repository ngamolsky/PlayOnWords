import React from "react";
import Modal from "../../components/Modal";
import { Session } from "../../models/Session";
import { getSessionCompletionPercentages } from "../../utils/sessionUtils";
import { secondsToTimeString } from "../../utils/timeAndDateUtils";

type EndSessionModalProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  session: Session;
};

const EndSessionModal: React.FC<EndSessionModalProps> = ({
  isOpen,
  setIsOpen,
  session,
}) => {
  const sessionResults = getSessionCompletionPercentages(session);
  console.log(session.boardState);

  return session.endTime ? (
    <Modal isOpen={isOpen} title={"Puzzle Complete!"} setIsOpen={setIsOpen}>
      <>
        <div className="flex-col p-4 rounded-md bg-slate-200 dark:bg-slate-700">
          <table className="w-full table-fixed">
            <tr>
              <th className="py-2">Participants</th>
              <th className="py-2">Percent Complete</th>
            </tr>
            <tbody>
              {Object.entries(sessionResults).map(
                ([username, percentComplete]) => (
                  <tr>
                    <td className="py-2">{username}</td>
                    <td className="py-2">{`${(percentComplete * 100).toFixed(
                      2
                    )}%`}</td>
                  </tr>
                )
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
            className="p-2 rounded-md bg-slate-200 dark:bg-slate-700"
            onClick={() => {
              setIsOpen(false);
            }}
          >
            Close
          </button>
        </div>
      </>
    </Modal>
  ) : null;
};

export default EndSessionModal;
