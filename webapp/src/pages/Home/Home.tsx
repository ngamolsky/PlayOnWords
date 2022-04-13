import React, { useEffect, useState } from "react";
import { XWordContainer } from "../../components/XWordContainer";
import { useHistory } from "react-router-dom";
import {
  Puzzle,
  usePuzzlesBySearch,
  useRecentPuzzles,
} from "../../models/Puzzle";
import { useLoggedInUser } from "../../models/User";
import Avatar from "../../components/Avatar";
import { PuzzleCard } from "./PuzzleCard";
import StartSessionModal from "./StartSessionModal";
import Tabs from "../../components/Tabs";
import {
  FIRST_PUZZLE_DATE,
  NUM_PUZZLES_TO_SHOW_ON_HOME,
} from "../../constants";
import DatePicker from "react-datepicker";
import { DAYS } from "../../utils/timeAndDateUtils";
import Modal from "../../components/Modal";
import "react-datepicker/dist/react-datepicker.css";
import { Listbox } from "@headlessui/react";

const Home: React.FC = () => {
  const history = useHistory();

  const [sessionLoading, setSessionLoading] = useState<boolean>(false);
  const [modalShowing, setModalShowing] = useState<boolean>(false);
  const [selectedPuzzle, setSelectedPuzzle] = useState<Puzzle>();

  useEffect(() => {
    setModalShowing(!!selectedPuzzle);
  }, [selectedPuzzle]);

  const user = useLoggedInUser();

  return (
    <XWordContainer
      showToolbar
      loadingMessage={sessionLoading ? "Loading your session..." : undefined}
      toolbarChildren={
        <Avatar
          user={user}
          onClick={() => {
            history.push("/signOut");
          }}
        />
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
      <Tabs
        tabArray={[
          {
            title: "Recent",
            content: <RecentPuzzlesTab setSelectedPuzzle={setSelectedPuzzle} />,
          },
          {
            title: "Search",
            content: <PuzzlesBySearch setSelectedPuzzle={setSelectedPuzzle} />,
          },
        ]}
      />
    </XWordContainer>
  );
};

const RecentPuzzlesTab: React.FC<{
  setSelectedPuzzle: React.Dispatch<React.SetStateAction<Puzzle | undefined>>;
}> = ({ setSelectedPuzzle }) => {
  const [puzzles, puzzleLoadingMessage] = useRecentPuzzles(
    NUM_PUZZLES_TO_SHOW_ON_HOME
  );

  return (
    <XWordContainer loadingMessage={puzzleLoadingMessage}>
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

const PuzzlesBySearch: React.FC<{
  setSelectedPuzzle: React.Dispatch<React.SetStateAction<Puzzle | undefined>>;
}> = ({ setSelectedPuzzle }) => {
  const [dayOfWeek, setDayOfWeek] = useState<number>();
  const [date, setDate] = useState<Date>();

  const [puzzles] = usePuzzlesBySearch(dayOfWeek, date);

  return (
    <XWordContainer className="p-4">
      <div className="flex flex-col w-full h-full max-w-md mx-auto grow">
        <Listbox
          value={dayOfWeek && DAYS[dayOfWeek]}
          onChange={(dayOfWeekStr) => {
            setDayOfWeek(DAYS.indexOf(dayOfWeekStr as string));
          }}
        >
          <Listbox.Button className={"bg-slate-300 dark:bg-slate-900 py-2"}>
            {dayOfWeek ? DAYS[dayOfWeek] : DAYS[0]}
          </Listbox.Button>
          <Listbox.Options>
            {DAYS.map((day, index) => (
              <Listbox.Option key={index} value={day}>
                {day}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Listbox>
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
