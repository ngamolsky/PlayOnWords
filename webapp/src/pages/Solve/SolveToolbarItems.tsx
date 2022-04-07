import classNames from "classnames";
import React, { Dispatch } from "react";
import { useHistory } from "react-router-dom";
import Dropdown from "../../components/Dropdown";
import Help from "../../components/icons/Help";
import Pencil from "../../components/icons/Pencil";
import Share from "../../components/icons/Share";
import VerticalDots from "../../components/icons/VerticalDots";
import Timer from "../../components/Timer";
import { Session } from "../../models/Session";
import { User } from "../../models/User";
import { SessionActions, SessionActionTypes } from "../../reducers/session";
import { secondsToTimeString } from "../../utils/timeAndDateUtils";

const SolveToolbarItems = ({
  session,
  pencilMode,
  autocheck,
  dispatch,
  showShareModal,
}: {
  session: Session;
  user: User;
  pencilMode: boolean;
  autocheck: boolean;
  dispatch: Dispatch<SessionActions>;
  showShareModal: (isOpen: boolean) => void;
}) => {
  const history = useHistory();
  return (
    <div className="relative flex flex-row h-8 space-x-2">
      <div className="my-auto">
        {session && session.endTime ? (
          secondsToTimeString(
            session.endTime.seconds - session.startTime.seconds
          )
        ) : (
          <Timer sessionStartDate={session.startTime.toDate()} />
        )}
      </div>
      <div
        className={classNames(
          "h-8 w-8 rounded-md p-1 active:dark:bg-slate-600 active:bg-slate-300 cursor-pointer"
        )}
        onClick={() => {
          showShareModal(true);
        }}
      >
        <Share />
      </div>
      <div
        className={classNames("h-8 w-8 rounded-md p-1 cursor-pointer", {
          "dark:bg-slate-600 bg-slate-300": pencilMode,
        })}
        onClick={() => {
          dispatch({
            type: SessionActionTypes.PENCIL_CLICKED,
          });
        }}
      >
        <Pencil />
      </div>

      <Dropdown
        selectedItemIndex={autocheck ? 0 : undefined}
        buttonContent={
          <div className="w-8 h-8 p-1 rounded-md active:bg-slate-300 active:dark:bg-slate-600">
            <Help />
          </div>
        }
        items={[
          {
            node: <p>Autocheck</p>,
            onClick: () => {
              dispatch({
                type: SessionActionTypes.AUTOCHECK_CLICKED,
              });
            },
          },
          {
            node: <p>Check Square</p>,
            onClick: () => {
              dispatch({
                type: SessionActionTypes.CHECK_SQUARE,
              });
            },
          },
          {
            node: <p>Check Word</p>,
            onClick: () => {
              dispatch({
                type: SessionActionTypes.CHECK_WORD,
              });
            },
          },
          {
            node: <p>Check Puzzle</p>,
            onClick: () => {
              dispatch({
                type: SessionActionTypes.CHECK_PUZZLE,
              });
            },
          },
          {
            node: <p>Reveal Square</p>,
            onClick: () => {
              dispatch({
                type: SessionActionTypes.REVEAL_SQUARE,
              });
            },
          },
          {
            node: <p>Reveal Word</p>,
            onClick: () => {
              dispatch({
                type: SessionActionTypes.REVEAL_WORD,
              });
            },
          },
          {
            node: <p>Reveal Puzzle</p>,
            onClick: () => {
              dispatch({
                type: SessionActionTypes.REVEAL_PUZZLE,
              });
            },
          },
          {
            node: <p>Reset Puzzle</p>,
            onClick: () => {
              dispatch({
                type: SessionActionTypes.RESET_PUZZLE,
              });
            },
          },
        ]}
      />
      <Dropdown
        buttonContent={
          <div className="w-8 h-8 p-1 rounded-md active:bg-slate-300">
            <VerticalDots />
          </div>
        }
        items={[
          {
            node: <p className="px-4">Sign Out</p>,
            onClick: () => {
              history.push("/signOut");
            },
          },
        ]}
      />
    </div>
  );
};

export default SolveToolbarItems;
