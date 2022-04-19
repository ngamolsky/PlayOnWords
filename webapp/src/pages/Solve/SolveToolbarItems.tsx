import {
  PencilIcon,
  SupportIcon,
  DotsVerticalIcon,
  InformationCircleIcon,
  UserGroupIcon,
} from "@heroicons/react/outline";
import classNames from "classnames";
import React, { Dispatch, useState } from "react";
import { useHistory } from "react-router-dom";
import Dropdown from "../../components/Dropdown";
import Modal from "../../components/Modal";
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
  const [isTitleModalShowing, setIsTitleModalShowing] =
    useState<boolean>(false);

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
      {session.puzzle.title && (
        <InformationCircleIcon
          className="w-8 h-8 p-1 rounded-md outline-none cursor-pointer stroke-1 active:dark:bg-slate-600 active:bg-slate-300"
          onClick={() => {
            setIsTitleModalShowing(!isTitleModalShowing);
          }}
        />
      )}
      {isTitleModalShowing && (
        <Modal isOpen={isTitleModalShowing} setIsOpen={setIsTitleModalShowing}>
          <p className="p-4">
            <span className="font-bold text-center">Title: </span>
            {session.puzzle.title}
          </p>
        </Modal>
      )}
      <UserGroupIcon
        className={classNames(
          "h-8 w-8 rounded-md p-1 active:dark:bg-slate-600 active:bg-slate-300 cursor-pointer outline-none stroke-1"
        )}
        onClick={() => {
          showShareModal(true);
        }}
      />
      <PencilIcon
        className={classNames(
          "h-8 w-8 rounded-md p-1 cursor-pointer outline-none stroke-1",
          {
            "dark:bg-slate-600 bg-slate-300": pencilMode,
          }
        )}
        onClick={() => {
          dispatch({
            type: SessionActionTypes.PENCIL_CLICKED,
          });
        }}
      />
      <Dropdown
        selectedItemIndex={autocheck ? 0 : undefined}
        buttonContent={
          <SupportIcon className="w-8 h-8 p-1 rounded-md outline-none stroke-1 active:bg-slate-300 active:dark:bg-slate-600" />
        }
        items={[
          {
            node: <p className="cursor-pointer select-none">Autocheck</p>,
            onClick: () => {
              dispatch({
                type: SessionActionTypes.AUTOCHECK_CLICKED,
              });
            },
          },
          {
            node: <p className="cursor-pointer select-none">Check Square</p>,
            onClick: () => {
              dispatch({
                type: SessionActionTypes.CHECK_SQUARE,
              });
            },
          },
          {
            node: <p className="cursor-pointer select-none">Check Word</p>,
            onClick: () => {
              dispatch({
                type: SessionActionTypes.CHECK_WORD,
              });
            },
          },
          {
            node: <p className="cursor-pointer select-none">Check Puzzle</p>,
            onClick: () => {
              dispatch({
                type: SessionActionTypes.CHECK_PUZZLE,
              });
            },
          },
          {
            node: <p className="cursor-pointer select-none">Reveal Square</p>,
            onClick: () => {
              dispatch({
                type: SessionActionTypes.REVEAL_SQUARE,
              });
            },
          },
          {
            node: <p className="cursor-pointer select-none">Reveal Word</p>,
            onClick: () => {
              dispatch({
                type: SessionActionTypes.REVEAL_WORD,
              });
            },
          },
          {
            node: (
              <p className="cursor-pointer select-none">Reveal Most Squares</p>
            ),
            onClick: () => {
              dispatch({
                type: SessionActionTypes.REVEAL_MOST_SQUARES,
              });
            },
          },
          {
            node: <p className="cursor-pointer select-none">Reveal Puzzle</p>,
            onClick: () => {
              dispatch({
                type: SessionActionTypes.REVEAL_PUZZLE,
              });
            },
          },
          {
            node: <p className="cursor-pointer select-none">Reset Puzzle</p>,
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
          <DotsVerticalIcon className="w-8 h-8 p-1 rounded-md outline-none stroke-1 active:bg-slate-300" />
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
