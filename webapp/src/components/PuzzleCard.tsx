import React, { Fragment } from "react";
import { toXWordDate } from "../utils/timeAndDateUtils";
import puzzleSVG from "../images/XWordSquare.svg";
import { Puzzle } from "../models/Puzzle";
import { Menu, Transition } from "@headlessui/react";

interface PuzzleCardProps {
  puzzle: Puzzle;
  onClick: (action: PuzzleCardAction) => void;
}

export enum PuzzleCardAction {
  NEW_GAME = "new_game",
  CONTINUE_GAME = "continue_game",
  END_GAME = "end_game",
}

export const PuzzleCard: React.FC<PuzzleCardProps> = ({ puzzle, onClick }) => {
  return (
    <Menu as="div" className="relative inline-block text-center ">
      <Menu.Button
        className="mx-auto p-4 w-4/5 text-left hover:bg-slate-500 
                            active:bg-slate-500 hover:bg-opacity-95 
                            active:bg-opacity-95 rounded-lg"
      >
        <img src={puzzleSVG} className="w-full" />
        <p className="mt-2 ml-1 text-lg text-ellipsis">
          {toXWordDate(puzzle.puzzleTimestamp.toDate())}
        </p>
        <p className="ml-1 opacity-50">New York Times</p>
      </Menu.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-50"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-50"
      >
        <Menu.Items
          className="absolute p-2 px-8 mt-2 left-1/2 -translate-x-1/2
                   divide-y divide-gray-100 rounded-md 
                     shadow-lg ring-1 ring-black ring-opacity-5 
                     focus:outline-none z-10 "
        >
          <Menu.Item>
            <button
              onClick={() => {
                onClick(PuzzleCardAction.NEW_GAME);
              }}
            >
              Start Game
            </button>
          </Menu.Item>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};
