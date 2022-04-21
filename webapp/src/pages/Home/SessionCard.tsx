import React from "react";
import { toXWordTime } from "../../utils/timeAndDateUtils";
import { deleteSession, Session, SessionStatus } from "../../models/Session";
import classNames from "classnames";
import XWordIcon from "../../images/XWordIcon";
import { getPercentageComplete } from "../../utils/sessionUtils";
import { TrashIcon } from "@heroicons/react/outline";
import IconButton from "../../components/IconButton";

interface SessionCardProps {
  session: Session;
  onClick?: () => void;
}

export const SessionCard: React.FC<SessionCardProps> = ({
  session,
  onClick,
}) => {
  const { sessionStatus, participantData, boardState, puzzle } = session;
  const completed = sessionStatus == SessionStatus.COMPLETE;

  const percentComplete = getPercentageComplete(boardState, puzzle.solutions);

  return (
    <div
      className={classNames(
        "w-full text-left p-4 dark:bg-slate-900 rounded-lg outline-none select-none bg-slate-200  cursor-pointer",
        { "border-2 border-yellow-300": completed }
      )}
      onClick={onClick}
    >
      <div className="flex flex-row">
        <XWordIcon className="w-2/5 my-auto pointer-events-none" />
        <div className="flex flex-col px-4 grow">
          <p className="mt-2 text-md text-ellipsis">
            {participantData.map((userData) => userData.username).join(", ")}
          </p>
          <p className="text-sm opacity-50 ">
            {completed ? "Completed On: " : "Last Updated: "}
          </p>
          <p className="text-sm opacity-50">
            {toXWordTime(session.lastUpdatedTime.toDate())}
          </p>
          <p className="text-sm opacity-50">
            Percent complete: {percentComplete.toFixed(2)}%
          </p>
          <div className="flex items-end justify-end grow">
            <IconButton
              className="rounded-full"
              onClick={(event) => {
                deleteSession(session.sessionID);
                event.stopPropagation();
              }}
            >
              <TrashIcon className="h-6" />
            </IconButton>
          </div>
        </div>
      </div>
    </div>
  );
};
