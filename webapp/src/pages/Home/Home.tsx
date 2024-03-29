import React, { useEffect, useState } from "react";
import { XWordContainer } from "../../components/XWordContainer";
import { useHistory } from "react-router-dom";
import { Puzzle, PuzzleType, usePuzzlesBySearch } from "../../models/Puzzle";
import { useLoggedInUser } from "../../models/User";
import Avatar from "../../components/Avatar";
import { PuzzleCard } from "./PuzzleCard";
import StartSessionModal from "./StartSessionModal";
import { AdjustmentsIcon } from "@heroicons/react/outline";
import IconButton from "../../components/IconButton";
import PuzzleSearchToolbar from "./PuzzleSearchToolbar";

const Home: React.FC = () => {
  const history = useHistory();

  const [sessionLoading, setSessionLoading] = useState<boolean>(false);
  const [modalShowing, setModalShowing] = useState<boolean>(false);
  const [isFilterShowing, setIsFilterShowing] = useState<boolean>(false);

  const [selectedPuzzle, setSelectedPuzzle] = useState<Puzzle>();
  const [dayOfWeek, setDayOfWeek] = useState<number>();
  const [date, setDate] = useState<Date>();
  const [puzzleType, setPuzzleType] = useState<PuzzleType>("daily");

  const user = useLoggedInUser();
  const [puzzles, puzzleLoadingMessage] = usePuzzlesBySearch(
    puzzleType,
    dayOfWeek,
    date
  );

  useEffect(() => {
    setModalShowing(!!selectedPuzzle);
  }, [selectedPuzzle]);

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
              className="stroke-1"
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
        isFilterShowing && (
          <PuzzleSearchToolbar
            puzzleType={puzzleType}
            setPuzzleType={setPuzzleType}
            setDayOfWeek={setDayOfWeek}
            dayOfWeek={dayOfWeek}
            setDate={setDate}
            date={date}
            mostRecentPuzzleDate={
              puzzles && puzzles.length > 0
                ? puzzles[0].puzzleTimestamp.toDate()
                : undefined
            }
          />
        )
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
          puzzles.map((puzzle) => {
            return (
              <PuzzleCard
                key={puzzle.puzzleID}
                puzzle={puzzle}
                onClick={async () => {
                  setSelectedPuzzle(puzzle);
                }}
              />
            );
          })}
      </div>
      <div className="mx-auto my-8 dark:text-slate-500">
        Created by{" "}
        <a
          href="https://gamolsky.net"
          target={"_blank"}
          className=" hover:underline"
        >
          Nikita Gamolsky
        </a>{" "}
        - Copyright 2022 ©
      </div>
    </XWordContainer>
  );
};

export default Home;
