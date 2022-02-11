import React, { Fragment, useState } from "react";
import { toXWordDate } from "../utils/timeAndDateUtils";
import puzzleSVG from "../images/XWordSquare.svg";
import { Puzzle } from "../models/Puzzle";
import { Menu, Transition } from "@headlessui/react";
import { Link } from "react-router-dom";

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
    <Menu as="div" className="relative inline-block text-center">
      <Menu.Button className="mx-auto p-4">
        {toXWordDate(puzzle.puzzleTimestamp.toDate())}
      </Menu.Button>

      <Menu.Items
        className="absolute p-2 px-8 mt-2 left-1/2 -translate-x-1/2
                   bg-white divide-y divide-gray-100 rounded-md 
                     shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10 hover:bg-zinc-200"
      >
        <Menu.Item>
          {({ active }) => (
            <Link className={`${active && "bg-blue-500 "}`} to={`/solve/{}`}>
              Start Game
            </Link>
          )}
        </Menu.Item>
      </Menu.Items>
    </Menu>
  );
};
