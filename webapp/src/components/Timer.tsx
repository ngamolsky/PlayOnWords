import React, { useEffect, useState } from "react";
import {
  calcDiffInSeconds,
  secondsToTimeString,
} from "../utils/timeAndDateUtils";


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
