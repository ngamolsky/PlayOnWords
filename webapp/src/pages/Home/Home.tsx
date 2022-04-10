import React, { useEffect, useState } from "react";
import { XWordContainer } from "../../components/XWordContainer";
import { useHistory } from "react-router-dom";
import {
  Puzzle,
  usePuzzleByDate,
  usePuzzlesByDayOfWeek,
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
            content: RecentPuzzlesTab(setSelectedPuzzle),
          },
          {
            title: "By Day Of Week",
            content: PuzzlesByDayOfWeek(setSelectedPuzzle),
          },
          {
            title: "By Date",
            content: PuzzleByDate(setSelectedPuzzle),
          },
        ]}
      />
    </XWordContainer>
  );
};

const RecentPuzzlesTab = (
  setSelectedPuzzle: React.Dispatch<React.SetStateAction<Puzzle | undefined>>
) => {
  const [puzzles, puzzleLoadingMessage] = useRecentPuzzles(
    NUM_PUZZLES_TO_SHOW_ON_HOME
  );

  return (
    <XWordContainer loadingMessage={puzzleLoadingMessage}>
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
    </XWordContainer>
  );
};

const PuzzlesByDayOfWeek = (
  setSelectedPuzzle: React.Dispatch<React.SetStateAction<Puzzle | undefined>>
) => {
  const [dayOfWeek, setDayOfWeek] = useState<number>();
  const [puzzles] = usePuzzlesByDayOfWeek(dayOfWeek);

  return (
    <XWordContainer className="p-4 justify-evenly">
      {DAYS.map((day, index) => (
        <button
          key={index}
          className="p-4 text-lg text-center rounded-md dark:bg-slate-700"
          onClick={() => {
            setDayOfWeek(index);
          }}
        >
          {day}
        </button>
      ))}
      {puzzles && puzzles.length > 0 && (
        <Modal
          className="h-full"
          isOpen={dayOfWeek != undefined}
          setIsOpen={(isOpen) => {
            if (!isOpen) {
              setDayOfWeek(undefined);
            }
          }}
        >
          <div className="flex flex-col h-full overflow-auto grow">
            {puzzles.map((puzzle) => (
              <PuzzleCard
                key={puzzle.puzzleID}
                puzzle={puzzle}
                onClick={async () => {
                  setSelectedPuzzle(puzzle);
                }}
              />
            ))}
          </div>
        </Modal>
      )}
    </XWordContainer>
  );
};

const PuzzleByDate = (
  setSelectedPuzzle: React.Dispatch<React.SetStateAction<Puzzle | undefined>>
) => {
  const [date, setDate] = useState<Date>();
  const [puzzle] = usePuzzleByDate(date);

  return (
    <XWordContainer>
      <DatePicker
        placeholderText="Click here to pick a date"
        className="w-full p-4 grow dark:bg-slate-600 bg-slate-100"
        selected={date}
        onChange={(date) => {
          if (date) {
            setDate(date);
          }
        }}
        minDate={FIRST_PUZZLE_DATE}
        maxDate={new Date()}
      />
      {puzzle && (
        <PuzzleCard
          key={puzzle.puzzleID}
          puzzle={puzzle}
          onClick={() => {
            setSelectedPuzzle(puzzle);
          }}
        />
      )}
    </XWordContainer>
  );
};
export default Home;
