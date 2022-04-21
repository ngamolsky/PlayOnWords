import { Listbox, RadioGroup } from "@headlessui/react";
import { SelectorIcon, CheckIcon } from "@heroicons/react/solid";
import classNames from "classnames";
import React from "react";
import { DAYS } from "../../utils/timeAndDateUtils";
import { PuzzleType } from "../../models/Puzzle";

type PuzzleSearchToolbarProps = {
  puzzleType: PuzzleType;
  setPuzzleType: (puzzleType: PuzzleType) => void;
  dayOfWeek?: number;
  setDayOfWeek: (dayOfWeek: number | undefined) => void;
  date?: Date;
  setDate: (date: Date | undefined) => void;
  mostRecentPuzzleDate?: Date;
};

const PuzzleSearchToolbar: React.FC<PuzzleSearchToolbarProps> = ({
  dayOfWeek,
  setDayOfWeek,
  mostRecentPuzzleDate,
  puzzleType,
  setPuzzleType,
}) => {
  const maxPuzzleDate: Date = mostRecentPuzzleDate
    ? new Date(mostRecentPuzzleDate)
    : new Date();
  maxPuzzleDate.setDate(maxPuzzleDate.getDate() + 1);

  return (
    <>
      <Listbox
        value={dayOfWeek != undefined ? DAYS[dayOfWeek] : "Any Day"}
        onChange={(dayOfWeekStr) => {
          setDayOfWeek(
            DAYS.includes(dayOfWeekStr as string)
              ? DAYS.indexOf(dayOfWeekStr as string)
              : undefined
          );
        }}
      >
        <Listbox.Button
          className={
            "bg-white dark:bg-slate-800 p-2 flex rounded-md outline-none w-40 dark:ring-white ring-1 ring-slate-300 text-left"
          }
        >
          <span className="mx-2 grow">
            {dayOfWeek != undefined ? DAYS[dayOfWeek] : "Any Day"}
          </span>
          <span className="my-auto">
            <SelectorIcon
              className="w-5 h-5 text-gray-400"
              aria-hidden="true"
            />
          </span>
        </Listbox.Button>

        <Listbox.Options className="absolute w-40 overflow-auto bg-white divide-y rounded-md shadow-lg outline-none cursor-pointer dark:divide-slate-500 dark:bg-slate-800 ring-1 dark:ring-white ring-slate-200">
          {["Any Day"].concat(DAYS).map((day, index) => (
            <Listbox.Option
              key={index}
              value={day}
              className={({ active }) =>
                `w-full p-3 ${active ? "dark:bg-slate-700 bg-slate-200" : ""}`
              }
            >
              {({ selected }) => {
                return (
                  <div className="flex">
                    {selected && (
                      <CheckIcon
                        className="w-5 h-5 my-auto mr-2"
                        aria-hidden="true"
                      />
                    )}
                    <span
                      className={classNames("relative", {
                        "left-8": !selected,
                      })}
                    >
                      {day}
                    </span>
                  </div>
                );
              }}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </Listbox>
      <div className="flex justify-end grow">
        <RadioGroup
          value={puzzleType}
          onChange={setPuzzleType}
          className="flex my-auto overflow-hidden rounded-md cursor-pointer pace-x-2 ring-1 ring-slate-300"
        >
          <RadioGroup.Option value="mini">
            {({ checked }) => (
              <div
                className={classNames("px-4 p-2", {
                  "dark:bg-slate-600 bg-slate-200": checked,
                })}
              >
                Mini
              </div>
            )}
          </RadioGroup.Option>
          <RadioGroup.Option value="daily">
            {({ checked }) => (
              <div
                className={classNames("px-4 p-2", {
                  "dark:bg-slate-600 bg-slate-200": checked,
                })}
              >
                Daily
              </div>
            )}
          </RadioGroup.Option>
        </RadioGroup>
      </div>
    </>
  );
};

export default PuzzleSearchToolbar;
