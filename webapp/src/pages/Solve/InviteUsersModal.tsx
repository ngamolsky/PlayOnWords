import React from "react";

import Modal from "../../components/Modal";
import { User } from "../../models/User";
import { Session } from "../../models/Session";
import { BASE_URL } from "../../constants";

const InviteUsersModal = ({
  modalShowing,
  session,
  setModalShowing,
}: {
  modalShowing: boolean;
  session: Session;
  user: User;
  setModalShowing: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  return (
    <Modal
      isOpen={modalShowing}
      setIsOpen={setModalShowing}
      title="Invite Users"
    >
      <p>Invite Users to this session with the following URL:</p>
      <p>{`${BASE_URL}/solve/${session.sessionID}`}</p>
    </Modal>
  );
};

export default InviteUsersModal;
