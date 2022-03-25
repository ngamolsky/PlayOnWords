import React, { useState } from "react";
import { v4 } from "uuid";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import { Puzzle } from "../../models/Puzzle";
import { User } from "../../models/User";
import { startSession } from "../../reducers/session";
import HomeTabs from "./HomeTabs";

const StartSessionModal = ({
  modalShowing,
  selectedPuzzle,
  user,
  setSessionLoading,
  setModalShowing,
}: {
  modalShowing: boolean;
  selectedPuzzle: Puzzle;
  user: User;
  setSessionLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setModalShowing: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [invitedUsernames, setInvitedUsernames] = useState<Set<string>>(
    new Set()
  );
  const [usernameToInvite, setUsernameToInvite] = useState<string>("");

  return (
    <Modal
      isOpen={modalShowing}
      setIsOpen={setModalShowing}
      title="Sessions"
      content={
        <HomeTabs
          tabArray={[
            <div className="flex flex-col justify-center h-full space-y-4">
              <p className="mt-4">
                Invite friends by username and start your session:
              </p>
              <div className="flex mb-4">
                <input
                  className="p-2 border border-black rounded-lg outline-none dark:border-white focus:border-teal-600 dark:bg-slate-500 grow"
                  value={usernameToInvite}
                  onChange={(event) => {
                    setUsernameToInvite(event.target.value);
                  }}
                />
                <Button
                  type="button"
                  onClick={() => {
                    if (usernameToInvite) {
                      setInvitedUsernames(
                        invitedUsernames.add(usernameToInvite)
                      );
                      setUsernameToInvite("");
                    }
                  }}
                >
                  <div className="mx-4">+</div>
                </Button>
              </div>
              <div className="flex-col divide-y grow divide-solid divide-slate-400">
                {[user.username]
                  .concat(Array.from(invitedUsernames))
                  .map((username, index) => (
                    <div key={index}>{username}</div>
                  ))}
              </div>
              <Button
                type="button"
                onClick={async () => {
                  setSessionLoading(true);
                  const sessionID = `session.${v4()}`;

                  await startSession(
                    sessionID,
                    selectedPuzzle,
                    user,
                    Array.from(invitedUsernames)
                  );
                  setModalShowing(true);
                }}
              >
                Start Session
              </Button>
            </div>,
          ]}
        />
      }
    />
  );
};

export default StartSessionModal;
