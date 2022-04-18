import React, { useEffect, useState } from "react";

import Modal from "../../components/Modal";
import { User } from "../../models/User";
import { Session } from "../../models/Session";
import { BASE_URL } from "../../constants";
import { Transition } from "@headlessui/react";
import { ClipboardCopyIcon } from "@heroicons/react/outline";

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

  return (
    <Modal
      isOpen={modalShowing}
      setIsOpen={setModalShowing}
      title="Invite Users"
      className="p-4"
    >
      <p>Invite Users to this session with the following URL:</p>
      <div className="flex p-4 mt-2 overflow-auto rounded-md bg-slate-200 dark:bg-slate-700">
        <div
          className="w-8 h-8 p-1 rounded-md outline-none active:bg-slate-300 dark:active:bg-slate-800 "
          onClick={() => {
            navigator.clipboard.writeText(shareURL);
            setShowCopied(true);
          }}
          tabIndex={0}
        >
          <ClipboardCopyIcon />
        </div>
        <p className="my-auto ml-3 font-mono whitespace-nowrap">{shareURL}</p>
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
