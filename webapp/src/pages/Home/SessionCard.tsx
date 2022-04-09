import React from "react";
import { toXWordTime } from "../../utils/timeAndDateUtils";
import { Session, SessionStatus } from "../../models/Session";
import classNames from "classnames";
import XWordIcon from "../../images/XWordIcon";

interface SessionCardProps {
  session: Session;
  onClick?: () => void;
}

export const SessionCard: React.FC<SessionCardProps> = ({
  session,
  onClick,
}) => {
  const { sessionStatus, participants } = session;
  const completed = sessionStatus == SessionStatus.COMPLETE;
  return (
    <div
      className={classNames(
        "w-full text-left p-4 dark:bg-slate-900 rounded-lg active:scale-[1.01] outline-none select-none",
        { "border-2 border-yellow-300": completed }
      )}
      onClick={onClick}
    >
      <div className="flex flex-row">
        <XWordIcon className="w-3/5 my-auto pointer-events-none" />
        <div className="flex-col px-4">
          <p className="mt-2 text-md text-ellipsis">
            {participants.length > 0
              ? participants.map((user) => user.username).join(", ")
              : "Loading..."}
          </p>
          <p className="text-sm opacity-50 ">
            {completed ? "Completed On: " : "Last Updated: "}
          </p>
          <p className="text-sm opacity-50">
            {toXWordTime(session.lastUpdatedTime.toDate())}
          </p>
        </div>
      </div>
    </div>
  );
};
