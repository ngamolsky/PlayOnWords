import React, { useEffect, useState } from "react";
import { secondsToTimeString } from "../utils/timeAndDateUtils";

const calcDiffInSeconds = (dateA: Date, dateB: Date) => {
  return Math.max(
    Math.floor((dateA.getTime() - dateB.getTime()) / 1000 + 1),
    0
  );
};

const Timer = ({ sessionStartDate }: { sessionStartDate: Date }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [secondsDiff, setSecondsDiff] = useState(
    calcDiffInSeconds(currentDate, sessionStartDate)
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentDate(new Date());
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [currentDate]);

  useEffect(() => {
    setSecondsDiff(calcDiffInSeconds(currentDate, sessionStartDate));
  }, [currentDate, sessionStartDate]);

  const timerString = secondsToTimeString(secondsDiff);
  return <>{timerString}</>;
};

export default Timer;
