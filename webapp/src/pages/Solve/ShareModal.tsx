import React, { useEffect, useState } from "react";

import Modal from "../../components/Modal";
import { User } from "../../models/User";
import { Session } from "../../models/Session";
import { BASE_URL } from "../../constants";
import { Transition } from "@headlessui/react";
import { ClipboardCopyIcon } from "@heroicons/react/outline";
import {
  getPercentageComplete,
  getSessionCompletionPercentages,
} from "../../utils/sessionUtils";

const ShareModal = ({
  modalShowing,
  session,
  setModalShowing,
}: {
  modalShowing: boolean;
  session: Session;
  user: User;
  setModalShowing: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [showCopied, setShowCopied] = useState<boolean>(false);

  useEffect(() => {
    if (showCopied) {
      const timer = setTimeout(() => setShowCopied(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [showCopied]);

  const shareURL = `${BASE_URL}/solve/${session.sessionID}`;
  const sessionResults = getSessionCompletionPercentages(session);

  return (
    <Modal
      isOpen={modalShowing}
      setIsOpen={setModalShowing}
      title="Invite Users"
      className="p-4"
    >
      <p>Invite Users to this session with the following URL:</p>
      <div className="flex p-4 mt-2 overflow-auto rounded-md bg-slate-200 dark:bg-slate-700">
        <ClipboardCopyIcon
          className="w-8 h-8 p-1 rounded-md outline-none stroke-1 active:bg-slate-300 dark:active:bg-slate-800 shrink-0"
          onClick={() => {
            navigator.clipboard.writeText(shareURL);
            setShowCopied(true);
          }}
          tabIndex={0}
        />
        <p className="my-auto ml-3 font-mono whitespace-nowrap">{shareURL}</p>
      </div>
      <div className="flex-col p-4 mt-8 rounded-md bg-slate-200 dark:bg-slate-700">
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
            <tr key={"total"} className="font-bold">
              <td className="py-2">Total</td>
              <td className="py-2">{`${getPercentageComplete(
                session.boardState,
                session.puzzle.solutions
              ).toFixed(2)}%`}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <Transition
        show={showCopied}
        enter="transition-opacity duration-75"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-150"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <Modal
          isOpen={showCopied}
          setIsOpen={setShowCopied}
          className="p-4 mt-20 w-fit"
        >
          Copied!
        </Modal>
      </Transition>
    </Modal>
  );
};

export default ShareModal;
