import React, { useEffect, useState } from "react";
import { XWordContainer } from "../../components/XWordContainer";
import { useHistory } from "react-router-dom";
import { Puzzle, usePuzzlesBySearch } from "../../models/Puzzle";
import { useLoggedInUser } from "../../models/User";
import Avatar from "../../components/Avatar";
import { PuzzleCard } from "./PuzzleCard";
import StartSessionModal from "./StartSessionModal";
import { DAYS } from "../../utils/timeAndDateUtils";
import "react-datepicker/dist/react-datepicker.css";
import { Listbox, Transition } from "@headlessui/react";
import { SelectorIcon } from "@heroicons/react/solid";
import { AdjustmentsIcon } from "@heroicons/react/outline";
import IconButton from "../../components/IconButton";

const Home: React.FC = () => {
  const history = useHistory();

  const [sessionLoading, setSessionLoading] = useState<boolean>(false);
  const [modalShowing, setModalShowing] = useState<boolean>(false);
  const [isFilterShowing, setIsFilterShowing] = useState<boolean>(false);

  const [selectedPuzzle, setSelectedPuzzle] = useState<Puzzle>();
  const [dayOfWeek, setDayOfWeek] = useState<number>();

  console.log(dayOfWeek);

  const [puzzles, puzzleLoadingMessage] = usePuzzlesBySearch(dayOfWeek);

  useEffect(() => {
    setModalShowing(!!selectedPuzzle);
  }, [selectedPuzzle]);

  const user = useLoggedInUser();

  return (
    <XWordContainer
      showToolbar
      loadingMessage={
        puzzleLoadingMessage
          ? puzzleLoadingMessage
          : sessionLoading
          ? "Loading your session..."
          : undefined
      }
      toolbarContent={
        <>
          <IconButton
            selected={isFilterShowing}
            className="w-8 h-8 my-auto mr-4 rounded-md"
          >
            <AdjustmentsIcon
              onClick={() => {
                setIsFilterShowing(!isFilterShowing);
              }}
            />
          </IconButton>
          <Avatar
            user={user}
            onClick={() => {
              history.push("/signOut");
            }}
          />
        </>
      }
      belowToolbarContent={
        <Transition
          show={isFilterShowing}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-y-50 origin-top"
          enterTo="transform opacity-100 scale-y-100 origin-top"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-y-100 origin-top"
          leaveTo="transform opacity-0 scale-y-50 origin-top"
        >
          <Listbox
            value={dayOfWeek && DAYS[dayOfWeek]}
            onChange={(dayOfWeekStr) => {
              setDayOfWeek(
                dayOfWeekStr ? DAYS.indexOf(dayOfWeekStr as string) : undefined
              );
            }}
          >
            <Listbox.Button
              className={"bg-slate-300 dark:bg-slate-600 py-2 flex"}
            >
              <span className="mx-2 grow">
                {dayOfWeek ? DAYS[dayOfWeek] : "Any Weekday"}
              </span>
              <span className="my-auto">
                <SelectorIcon
                  className="w-5 h-5 text-gray-400"
                  aria-hidden="true"
                />
              </span>
            </Listbox.Button>
            <Listbox.Options className="absolute px-4 py-1 mt-1 space-y-2 overflow-auto rounded-md shadow-lg dark:bg-slate-800 ring-1">
              <Listbox.Option value={undefined}>{"Any Weekday"}</Listbox.Option>
              {DAYS.map((day, index) => (
                <Listbox.Option key={index} value={day}>
                  {day}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Listbox>
        </Transition>
      }
    >
      {selectedPuzzle && (
        <StartSessionModal
          modalShowing={modalShowing}
          selectedPuzzle={selectedPuzzle}
          user={user}
          setSessionLoading={setSessionLoading}
          setModalShowing={(isOpen) => {
            if (!isOpen) {
              setSelectedPuzzle(undefined);
            }
          }}
          setSessionID={(sessionID) => {
            history.push(`/solve/${sessionID}`);
          }}
        />
      )}
      <div className="flex flex-col justify-center max-w-md mx-auto">
        {puzzles &&
          puzzles.map((puzzle) => (
            <PuzzleCard
              key={puzzle.puzzleID}
              puzzle={puzzle}
              onClick={async () => {
                setSelectedPuzzle(puzzle);
              }}
            />
          ))}
      </div>
    </XWordContainer>
  );
};

export default Home;
